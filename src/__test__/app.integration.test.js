const request = require('supertest');

// 模拟数据库连接模块
jest.mock('../database/mysql', () => {
  const sequelizeMock = {
    define: jest.fn().mockReturnValue({
      init: jest.fn(),
      associate: jest.fn()
    }),
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue()
  };
  return {
    sequelize: sequelizeMock,
    testConnection: jest.fn()
  };
});

// 模拟数据库模型
jest.mock('../models/entity/CellData', () => ({
  init: jest.fn(),
  associate: jest.fn()
}));
jest.mock('../models/entity/TaskList', () => ({
  init: jest.fn(),
  associate: jest.fn()
}));
jest.mock('../models/entity/EnbTaskList', () => ({
  init: jest.fn(),
  associate: jest.fn()
}));
jest.mock('../models/entity/NDSList', () => ({
  init: jest.fn(),
  associate: jest.fn()
}));
jest.mock('../models/entity/GatewayList', () => ({
  init: jest.fn(),
  associate: jest.fn()
}));
jest.mock('../models/entity/GatewayNDSMap', () => ({
  init: jest.fn(),
  associate: jest.fn()
}));

// 模拟日志模块
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

const { app, startServer, stopServer } = require('../app');
const { testConnection } = require('../database/mysql');

describe('应用集成测试', () => {
  beforeEach(() => {
    // 清除所有模拟的调用记录
    jest.clearAllMocks();
    // 设置测试环境的端口
    process.env.PORT = '0'; // 使用随机可用端口
  });

  afterEach(async () => {
    // 恢复默认端口
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
