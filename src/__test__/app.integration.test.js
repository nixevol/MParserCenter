const request = require('supertest');

// 模拟数据库连接模块
jest.mock('../database/mysql', () => {
  const mockDataTypes = {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE'
  };

  const sequelizeMock = {
    define: jest.fn().mockReturnValue({
      init: jest.fn(),
      associate: jest.fn(),
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
      belongsToMany: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    }),
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue(),
    transaction: jest.fn().mockImplementation(fn => fn()),
    DataTypes: mockDataTypes
  };
  return {
    sequelize: sequelizeMock,
    testConnection: jest.fn().mockResolvedValue()
  };
});

// 模拟数据库模型
const mockModelMethods = {
  init: jest.fn(),
  associate: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

jest.mock('../models/entity/CellData', () => mockModelMethods);
jest.mock('../models/entity/TaskList', () => mockModelMethods);
jest.mock('../models/entity/EnbTaskList', () => mockModelMethods);
jest.mock('../models/entity/NDSList', () => mockModelMethods);
jest.mock('../models/entity/GatewayList', () => mockModelMethods);
jest.mock('../models/entity/GatewayNDSMap', () => mockModelMethods);
jest.mock('../models/entity/ScannerList', () => mockModelMethods);
jest.mock('../models/entity/ScannerNDSMap', () => mockModelMethods);

// 模拟日志模块
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// 模拟 PM2 模块
jest.mock('pm2', () => ({
  connect: (callback) => callback(null),
  reload: (appName, callback) => {
    process.nextTick(() => callback(null));
  },
  disconnect: () => {}
}));

const { app, startServer, stopServer } = require('../app');
const { testConnection } = require('../database/mysql');

describe('应用集成测试', () => {
  beforeEach(() => {
    // 清除所有模拟的调用记录
    jest.clearAllMocks();
    // 设置测试环境
    process.env.NODE_ENV = 'test';
    // 设置测试环境的端口
    process.env.PORT = '0'; // 使用随机可用端口
  });

  afterEach(async () => {
    // 恢复环境变量
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    // 每个测试后关闭服务器
    await stopServer();
  });

  describe('应用配置测试', () => {
    it('应该正确配置CORS', async () => {
      const response = await request(app)
        .options('/')
        .set('Origin', 'http://example.com');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('应该提供Swagger文档访问', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect('Content-Type', /html/)
        .expect(200);
    });
  });

  describe('应用启动测试', () => {
    it('应该成功启动服务器', async () => {
      const server = await startServer();
      expect(server).toBeDefined();
      expect(testConnection).toHaveBeenCalled();
    });

    it('应该处理数据库连接失败', async () => {
      testConnection.mockRejectedValueOnce(new Error('数据库连接失败'));
      await expect(startServer()).rejects.toThrow('数据库连接失败');
    });
  });

  describe('基础路由测试', () => {
    it('应该返回程序运行状态', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty("Status", "程序运行中");
      expect(response.body).toHaveProperty('message', '操作成功');
    });

    it('应该处理重启请求', async () => {
      const response = await request(app)
        .post('/restart')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty("Status", "正在重启服务...");
      expect(response.body).toHaveProperty('message', '操作成功');

      // 等待重启操作完成
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  describe('错误处理测试', () => {
    it('应该处理404错误', async () => {
      const response = await request(app)
        .get('/non-existent-path')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty('message');
    });

    it('应该处理服务器错误', async () => {
      // 模拟一个会抛出错误的路由
      app.get('/error-test', () => {
        throw new Error('测试错误');
      });

      const response = await request(app)
        .get('/error-test')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message');
    });
  });
});
