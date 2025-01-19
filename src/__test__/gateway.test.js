const request = require('supertest');
const { app, startServer, stopServer } = require('../app');
const { sequelize } = require('../database/mysql');
const GatewayList = require('../models/entity/GatewayList');
const NDSList = require('../models/entity/NDSList');
const GatewayNDSMap = require('../models/entity/GatewayNDSMap');

describe('网关管理测试', () => {
    let server;

    // 在所有测试之前启动服务器并连接数据库
    beforeAll(async () => {
        server = await startServer();
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
    });

    // 在所有测试之后关闭服务器和数据库连接
    afterAll(async () => {
        await stopServer();
        await sequelize.close();
    });

    // 在每个测试之前清理数据
    beforeEach(async () => {
        // 先清理关联表，再清理主表
        await GatewayNDSMap.destroy({ where: {} });
        await GatewayList.destroy({ where: {} });
        await NDSList.destroy({ where: {} });
    });

    describe('POST /api/gateway/register', () => {
        it('应该成功注册新网关', async () => {
            const response = await request(server)
                .post('/api/gateway/register')
                .send({ port: 8080 })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.code).toBe(200);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.nodeName).toBe(`Gateway-${response.body.data.id}`);
            expect(response.body.data.status).toBe('online');
        });

        it('缺少端口号应该返回错误', async () => {
            const response = await request(server)
                .post('/api/gateway/register')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.code).toBe(400);
            expect(response.body.message).toBe('端口号不能为空');
        });
    });

    describe('GET /api/gateway', () => {
        it('应该成功获取网关列表', async () => {
            // 创建测试数据
            await GatewayList.bulkCreate([
                { nodeName: 'Gateway-1', host: '127.0.0.1', port: 8080, status: 'online' },
                { nodeName: 'Gateway-2', host: '127.0.0.1', port: 8081, status: 'online' }
            ]);

            const response = await request(server)
                .get('/api/gateway')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.code).toBe(200);
            expect(response.body.data.list).toHaveLength(2);
            expect(response.body.data.total).toBe(2);
        });

        it('应该支持关键字搜索', async () => {
            // 创建测试数据
            await GatewayList.bulkCreate([
                { nodeName: 'Gateway-1', host: '127.0.0.1', port: 8080, status: 'online' },
                { nodeName: 'Test-2', host: '127.0.0.1', port: 8081, status: 'online' }
            ]);

            const response = await request(server)
                .get('/api/gateway?keyword=Gateway')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.code).toBe(200);
            expect(response.body.data.list).toHaveLength(1);
            expect(response.body.data.list[0].nodeName).toBe('Gateway-1');
            expect(response.body.data.total).toBe(1);
        });
    });

    describe('PUT /api/gateway/:id', () => {
        it('应该成功更新网关配置', async () => {
            const gateway = await GatewayList.create({
                nodeName: 'Gateway-1',
                host: '127.0.0.1',
                port: 8080,
                status: 'online'
            });

            const response = await request(server)
                .put(`/api/gateway/${gateway.id}`)
                .send({
                    nodeName: 'Updated-Gateway',
                    port: 8081,
                    description: '测试网关'
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.code).toBe(200);
            expect(response.body.data.nodeName).toBe('Updated-Gateway');
            expect(response.body.data.port).toBe(8081);
            expect(response.body.data.description).toBe('测试网关');
        });

        it('更新不存在的网关应该返回404', async () => {
            const response = await request(server)
                .put('/api/gateway/999')
                .send({
                    nodeName: 'Updated-Gateway',
                    port: 8081
                })
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body.code).toBe(404);
            expect(response.body.message).toBe('网关不存在');
        });
    });

    describe('POST /api/gateway/:id/logout', () => {
        it('应该成功注销网关', async () => {
            const gateway = await GatewayList.create({
                nodeName: 'Gateway-1',
                host: '127.0.0.1',
                port: 8080,
                status: 'online'
            });

            const response = await request(server)
                .post(`/api/gateway/${gateway.id}/logout`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.code).toBe(200);
            expect(response.body.message).toBe('注销成功');

            const updatedGateway = await GatewayList.findByPk(gateway.id);
            expect(updatedGateway.status).toBe('offline');
        });
    });

    describe('网关-NDS关联测试', () => {
        let gateway;
        let nds1, nds2;

        beforeEach(async () => {
            // 创建测试网关
            gateway = await GatewayList.create({
                nodeName: 'TestGateway',
                host: '127.0.0.1',
                port: 8080,
                status: 'online'
            });

            // 创建测试NDS
            nds1 = await NDSList.create({
                Name: 'TestNDS1',
                Address: '192.168.1.1',
                Port: 2121,
                Protocol: 'SFTP',
                Account: 'test1',
                Password: 'password1',
                MRO_Path: '/MR/MRO/',
                MRO_Filter: '^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$',
                MDT_Path: '/MR/MDT/',
                MDT_Filter: '^/MR/MDT/[^/]+/[^/]+_MDT_[^/]+.zip$'
            });

            nds2 = await NDSList.create({
                Name: 'TestNDS2',
                Address: '192.168.1.2',
                Port: 2121,
                Protocol: 'SFTP',
                Account: 'test2',
                Password: 'password2',
                MRO_Path: '/MR/MRO/',
                MRO_Filter: '^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$',
                MDT_Path: '/MR/MDT/',
                MDT_Filter: '^/MR/MDT/[^/]+/[^/]+_MDT_[^/]+.zip$'
            });
        });

        describe('GET /api/gateway/:id/nds', () => {
            it('应该返回空的NDS列表', async () => {
                const res = await request(server)
                    .get(`/api/gateway/${gateway.id}/nds`)
                    .expect(200);

                expect(res.body.code).toBe(200);
                expect(res.body.data).toBeInstanceOf(Array);
                expect(res.body.data).toHaveLength(0);
            });

            it('应该返回关联的NDS列表', async () => {
                await GatewayNDSMap.create({
                    gatewayId: gateway.id,
                    ndsId: nds1.ID
                });
                await GatewayNDSMap.create({
                    gatewayId: gateway.id,
                    ndsId: nds2.ID
                });

                const res = await request(server)
                    .get(`/api/gateway/${gateway.id}/nds`)
                    .expect(200);

                expect(res.body.code).toBe(200);
                expect(res.body.data).toHaveLength(2);
                expect(res.body.data[0].Name).toBe('TestNDS1');
                expect(res.body.data[1].Name).toBe('TestNDS2');
            });

            it('网关不存在时应该返回404', async () => {
                const res = await request(server)
                    .get('/api/gateway/999/nds')
                    .expect(404);

                expect(res.body.code).toBe(404);
                expect(res.body.message).toBe('网关不存在');
            });
        });

        describe('PUT /api/gateway/:id/nds', () => {
            it('应该成功更新网关的NDS关联', async () => {
                const res = await request(server)
                    .put(`/api/gateway/${gateway.id}/nds`)
                    .send({ ndsIds: [nds1.ID, nds2.ID] })
                    .expect(200);

                expect(res.body.code).toBe(200);
                expect(res.body.data).toHaveLength(2);

                // 验证数据库中的关联
                const maps = await GatewayNDSMap.findAll({
                    where: { gatewayId: gateway.id }
                });
                expect(maps).toHaveLength(2);
            });

            it('ndsIds不是数组时应该返回400', async () => {
                const res = await request(server)
                    .put(`/api/gateway/${gateway.id}/nds`)
                    .send({ ndsIds: 'not-an-array' })
                    .expect(400);

                expect(res.body.code).toBe(400);
                expect(res.body.message).toBe('ndsIds必须是数组');
            });
        });

        describe('POST /api/gateway/:id/nds', () => {
            it('应该成功添加NDS关联', async () => {
                const res = await request(server)
                    .post(`/api/gateway/${gateway.id}/nds`)
                    .send({ ndsId: nds1.ID })
                    .expect(200);

                expect(res.body.code).toBe(200);
                expect(res.body.message).toBe('关联添加成功');

                // 验证数据库中的关联
                const map = await GatewayNDSMap.findOne({
                    where: { gatewayId: gateway.id, ndsId: nds1.ID }
                });
                expect(map).toBeTruthy();
            });

            it('重复添加相同关联时应该返回400', async () => {
                await GatewayNDSMap.create({
                    gatewayId: gateway.id,
                    ndsId: nds1.ID
                });

                const res = await request(server)
                    .post(`/api/gateway/${gateway.id}/nds`)
                    .send({ ndsId: nds1.ID })
                    .expect(400);

                expect(res.body.code).toBe(400);
                expect(res.body.message).toBe('该关联已存在');
            });
        });

        describe('DELETE /api/gateway/:id/nds/:ndsId', () => {
            it('应该成功删除NDS关联', async () => {
                await GatewayNDSMap.create({
                    gatewayId: gateway.id,
                    ndsId: nds1.ID
                });

                const res = await request(server)
                    .delete(`/api/gateway/${gateway.id}/nds/${nds1.ID}`)
                    .expect(200);

                expect(res.body.code).toBe(200);
                expect(res.body.message).toBe('关联删除成功');

                // 验证数据库中的关联已删除
                const map = await GatewayNDSMap.findOne({
                    where: { gatewayId: gateway.id, ndsId: nds1.ID }
                });
                expect(map).toBeNull();
            });

            it('删除不存在的关联时应该返回404', async () => {
                const res = await request(server)
                    .delete(`/api/gateway/${gateway.id}/nds/${nds1.ID}`)
                    .expect(404);

                expect(res.body.code).toBe(404);
                expect(res.body.message).toBe('关联不存在');
            });
        });
    });
});
