const request = require('supertest');
const express = require('express');
const { Op } = require('sequelize');
const ndsRouter = require('../routes/nds.route');
const NDSList = require('../models/entity/NDSList');
const { testConnection } = require('../utils/ftp');

// Mock NDSList model
jest.mock('../models/entity/NDSList');
// Mock FTP connection testing
jest.mock('../utils/ftp');

// 创建测试用的express应用
const app = express();
app.use(express.json());
app.use('/api/nds', ndsRouter);

describe('NDS服务器管理接口测试', () => {
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
  });

  describe('GET /api/nds/list', () => {
    it('应该返回NDS服务器列表', async () => {
      const mockData = {
        count: 2,
        rows: [
          {
            ID: 1,
            Name: 'NDS测试服务器1',
            Address: '192.168.1.100',
            Port: 2121,
            Protocol: 'SFTP',
            Account: 'test1',
            Password: '******',
            MRO_Path: '/MR/MRO/',
            MRO_Filter: '^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$'
          },
          {
            ID: 2,
            Name: 'NDS测试服务器2',
            Address: '192.168.1.101',
            Port: 2121,
            Protocol: 'FTP',
            Account: 'test2',
            Password: '******',
            MRO_Path: '/MR/MRO/',
            MRO_Filter: '^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$'
          }
        ]
      };

      NDSList.findAndCountAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/api/nds/list')
        .query({ page: 1, pageSize: 10 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(response.body.data).toHaveProperty('total', 2);
      expect(response.body.data.list).toHaveLength(2);
    });

    it('应该支持关键字搜索', async () => {
      const mockData = {
        count: 1,
        rows: [
          {
            ID: 1,
            Name: 'NDS测试服务器1',
            Address: '192.168.1.100'
          }
        ]
      };

      NDSList.findAndCountAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/api/nds/list')
        .query({ keyword: '测试' })
        .expect(200);

      expect(response.body.data.list).toHaveLength(1);
      expect(NDSList.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            [Op.or]: [
              { Name: { [Op.like]: '%测试%' } },
              { Address: { [Op.like]: '%测试%' } }
            ]
          }
        })
      );
    });
  });

  describe('GET /api/nds/:id', () => {
    it('应该返回单个NDS服务器详情', async () => {
      const mockNDS = {
        ID: 1,
        Name: 'NDS测试服务器1',
        Address: '192.168.1.100',
        Port: 2121,
        Protocol: 'SFTP'
      };

      NDSList.findByPk.mockResolvedValue(mockNDS);

      const response = await request(app)
        .get('/api/nds/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toMatchObject(mockNDS);
    });

    it('当服务器不存在时应该返回404', async () => {
      NDSList.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/nds/999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '服务器不存在');
    });
  });

  describe('POST /api/nds/add', () => {
    it('应该成功添加新NDS服务器', async () => {
      const newNDS = {
        Name: 'NDS新服务器',
        Address: '192.168.1.102',
        Port: 2121,
        Protocol: 'SFTP',
        Account: 'test3',
        Password: 'password123'
      };

      NDSList.create.mockResolvedValue({ ID: 3, ...newNDS });

      const response = await request(app)
        .post('/api/nds/add')
        .send(newNDS)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '添加成功');
      expect(NDSList.create).toHaveBeenCalledWith(newNDS);
    });
  });

  describe('PUT /api/nds/:id', () => {
    it('应该成功更新NDS服务器信息', async () => {
      const updateData = {
        Name: 'NDS更新服务器',
        Port: 2222
      };

      NDSList.findByPk.mockResolvedValue({ ID: 1, ...updateData });
      NDSList.update.mockResolvedValue([1]);

      const response = await request(app)
        .put('/api/nds/1')
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '更新成功');
      expect(NDSList.update).toHaveBeenCalledWith(
        updateData,
        { where: { ID: "1" } }
      );
    });
  });

  describe('DELETE /api/nds/:id', () => {
    it('应该成功删除NDS服务器', async () => {
      NDSList.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete('/api/nds/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '删除成功');
      expect(NDSList.destroy).toHaveBeenCalledWith({
        where: { ID: "1" }
      });
    });
  });

  describe('POST /api/nds/:id/test', () => {
    it('应该成功测试NDS服务器连接', async () => {
      const mockNDS = {
        ID: 1,
        Name: 'NDS测试服务器1',
        Address: '192.168.1.100',
        Port: 2121,
        Protocol: 'SFTP',
        Account: 'test1',
        Password: 'password123'
      };

      NDSList.findByPk.mockResolvedValue(mockNDS);
      testConnection.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/nds/1/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(testConnection).toHaveBeenCalledWith({
        ID: mockNDS.ID,
        Name: mockNDS.Name,
        Address: mockNDS.Address,
        Port: mockNDS.Port,
        Protocol: mockNDS.Protocol,
        Account: mockNDS.Account,
        Password: mockNDS.Password
      });
    });

    it('当连接失败时应该返回错误', async () => {
      const mockNDS = {
        ID: 1,
        Name: 'NDS测试服务器1',
        Address: '192.168.1.100'
      };

      NDSList.findByPk.mockResolvedValue(mockNDS);
      testConnection.mockRejectedValue(new Error('连接超时'));

      const response = await request(app)
        .post('/api/nds/1/test')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '连接超时');
    });
  });
});
