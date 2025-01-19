// 模拟配置
const mockConfig = {
  database: {
    database: 'test_db',
    username: 'test_user',
    password: 'test_pass',
    host: 'localhost',
    port: 3306,
    pool: {
      max: '150',
      min: '5',
      acquire: '25000',
      idle: '8000'
    }
  },
  env: {
    isDev: true
  }
};

// 创建一个真实的 Sequelize 实例的模拟
const mockSequelizeInstance = {
  authenticate: jest.fn(),
  query: jest.fn(),
  sync: jest.fn()
};

// 创建 logger 模拟
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// 创建 Sequelize 构造函数模拟
const mockSequelizeConstructor = jest.fn().mockImplementation((database, username, password, options) => {
  expect(database).toBe(mockConfig.database.database);
  expect(username).toBe(mockConfig.database.username);
  expect(password).toBe(mockConfig.database.password);
  expect(options).toMatchObject({
    host: mockConfig.database.host,
    port: mockConfig.database.port,
    dialect: 'mysql',
    timezone: '+08:00',
    pool: {
      max: parseInt(((mockConfig.database.pool || {}).max) || "200"),
      min: parseInt(((mockConfig.database.pool || {}).min) || "0"),
      acquire: parseInt(((mockConfig.database.pool || {}).acquire) || "30000"),
      idle: parseInt(((mockConfig.database.pool || {}).idle) || "10000")
    },
    retry: {
      max: 3,
      timeout: 3000
    }
  });
  
  if (options.logging && typeof options.logging === 'function') {
    options.logging('test sql');
  }

  return mockSequelizeInstance;
});

// 模拟依赖
jest.mock('../config', () => mockConfig);
jest.mock('../utils/logger', () => mockLogger);
jest.mock('sequelize', () => ({
  Sequelize: mockSequelizeConstructor
}));

describe('MySQL Database', () => {
  let mysql;

  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    jest.resetModules();

    // 导入模块
    mysql = require('../database/mysql');
  });

  describe('testConnection', () => {
    it('成功连接数据库时应该完成所有初始化步骤', async () => {
      mockSequelizeInstance.authenticate.mockResolvedValue();
      mockSequelizeInstance.query.mockResolvedValue();
      mockSequelizeInstance.sync.mockResolvedValue();

      await mysql.testConnection();

      expect(mockSequelizeInstance.authenticate).toHaveBeenCalled();
      expect(mockSequelizeInstance.query).toHaveBeenCalledWith(
        'SET SESSION transaction_prealloc_size = 0;',
        { raw: true }
      );
      expect(mockSequelizeInstance.sync).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('数据库连接成功');
      expect(mockLogger.info).toHaveBeenCalledWith('数据库表同步完成');
      expect(mockLogger.debug).toHaveBeenCalledWith('test sql');
    });

    it('连接失败时应该抛出错误', async () => {
      const error = new Error('连接失败');
      mockSequelizeInstance.authenticate.mockRejectedValue(error);

      await expect(mysql.testConnection()).rejects.toThrow('连接失败');
      expect(mockLogger.error).toHaveBeenCalledWith('数据库连接失败:', error);
    });

    it('重置连接状态失败时应该继续执行但记录警告', async () => {
      const queryError = new Error('重置失败');
      mockSequelizeInstance.authenticate.mockResolvedValue();
      mockSequelizeInstance.query.mockRejectedValue(queryError);
      mockSequelizeInstance.sync.mockResolvedValue();

      await mysql.testConnection();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '重置连接状态时出错（可忽略）:',
        queryError.message
      );
      expect(mockSequelizeInstance.sync).toHaveBeenCalled();
    });

    it('应该使用默认值当连接池配置缺失时', async () => {
      // 临时修改配置以测试默认值
      const originalConfig = { ...mockConfig };
      delete mockConfig.database.pool;

      // 重新加载模块以使用新配置
      jest.resetModules();
      mysql = require('../database/mysql');

      expect(mockSequelizeConstructor).toHaveBeenCalledWith(
        mockConfig.database.database,
        mockConfig.database.username,
        mockConfig.database.password,
        expect.objectContaining({
          pool: {
            max: 200,
            min: 0,
            acquire: 30000,
            idle: 10000
          }
        })
      );

      // 恢复原始配置
      Object.assign(mockConfig, originalConfig);
    });
  });
});
