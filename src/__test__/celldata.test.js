const request = require('supertest');
const express = require('express');
const { Op } = require('sequelize');
const celldataRouter = require('../routes/celldata.route');
const CellData = require('../models/entity/CellData');

// Mock CellData model
jest.mock('../models/entity/CellData');

// 创建测试用的express应用
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/cell', celldataRouter);

describe('小区数据管理接口测试', () => {
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
  });

  describe('GET /api/cell/list', () => {
    it('应该返回小区列表数据', async () => {
      const mockData = {
        count: 2,
        rows: [
          {
            CGI: '460-00-1234-5678',
            eNodeBID: 1234,
            PCI: 123,
            Azimuth: 90,
            Earfcn: 38400,
            Freq: 1800,
            eNBName: 'SZ_NS_001',
            userLabel: '深圳南山01',
            Longitude: 113.923456,
            Latitude: 22.123456,
            toJSON: function() { return this; }
          },
          {
            CGI: '460-00-1234-5679',
            eNodeBID: 1235,
            PCI: 124,
            Azimuth: 180,
            Earfcn: 38400,
            Freq: 1800,
            eNBName: 'SZ_NS_002',
            userLabel: '深圳南山02',
            Longitude: 113.923457,
            Latitude: 22.123457,
            toJSON: function() { return this; }
          }
        ]
      };

      CellData.findAndCountAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/api/cell/list')
        .query({ page: 1, pageSize: 10 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(response.body.data).toHaveProperty('total', 2);
      expect(response.body.data.list).toHaveLength(2);
      expect(CellData.findAndCountAll).toHaveBeenCalled();
    });

    it('应该支持关键字搜索', async () => {
      const mockData = {
        count: 1,
        rows: [
          {
            CGI: '460-00-1234-5678',
            eNBName: 'SZ_NS_001',
            userLabel: '深圳南山01',
            toJSON: function() { return this; }
          }
        ]
      };

      CellData.findAndCountAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/api/cell/list')
        .query({ page: 1, pageSize: 10, field: 'eNBName', keyword: 'SZ' })
        .expect(200);

      expect(response.body.data.list).toHaveLength(1);
      expect(response.body.data.list[0].eNBName).toBe('SZ_NS_001');
    });
  });

  describe('POST /api/cell/add', () => {
    it('应该成功添加新小区', async () => {
      const newCell = {
        CGI: '460-00-1234-5680',
        eNodeBID: 1236,
        PCI: 125,
        Earfcn: 38400
      };

      CellData.create.mockResolvedValue(newCell);

      const response = await request(app)
        .post('/api/cell/add')
        .send(newCell)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '新增成功');
      expect(CellData.create).toHaveBeenCalledWith(newCell);
    });
  });

  describe('POST /api/cell/update', () => {
    it('应该成功更新小区信息', async () => {
      const updateData = {
        CGI: '460-00-1234-5678',
        PCI: 126,
        Azimuth: 270
      };

      CellData.update.mockResolvedValue([1]);

      const response = await request(app)
        .post('/api/cell/update')
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '更新成功');
      expect(CellData.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/cell/remove/:cgi', () => {
    it('应该成功删除小区', async () => {
      const cgi = '460-00-1234-5678';
      CellData.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete(`/api/cell/remove/${cgi}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '删除成功');
      expect(CellData.destroy).toHaveBeenCalledWith({
        where: { CGI: cgi }
      });
    });
  });

  describe('POST /api/cell/batch-delete', () => {
    it('应该成功批量删除小区', async () => {
      const cgis = ['460-00-1234-5678', '460-00-1234-5679'];
      CellData.destroy.mockResolvedValue(2);

      const response = await request(app)
        .post('/api/cell/batch-delete')
        .send({ cgis })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '批量删除成功');
      expect(CellData.destroy).toHaveBeenCalledWith({
        where: { CGI: { [Op.in]: cgis } }
      });
    });
  });

  describe('GET /api/cell/check/:cgi', () => {
    it('应该正确检查CGI是否存在', async () => {
      const cgi = '460-00-1234-5678';
      CellData.findOne.mockResolvedValue({ CGI: cgi });

      const response = await request(app)
        .get(`/api/cell/check/${cgi}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(response.body.data).toHaveProperty('exists', true);
      expect(CellData.findOne).toHaveBeenCalledWith({
        where: { CGI: cgi }
      });
    });
  });
});
