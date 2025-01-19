const logger = require('../utils/logger');

// 模拟 config 模块
jest.mock('../config', () => ({
  env: {
    logLevel: 'info' // 默认日志级别
  }
}));

// 获取 config 模块的引用
const config = require('../config');

describe('日志工具测试', () => {
  // 在每个测试前重置所有的模拟
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置日志级别为默认值
    config.env.logLevel = 'info';
    // 模拟控制台方法
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    // 固定时间戳
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-19T05:04:56+08:00');
  });

  // 在所有测试后恢复所有的模拟
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('错误日志测试', () => {
    it('应该记录错误日志', () => {
      logger.error('测试错误消息');
      expect(console.error).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [ERROR] 测试错误消息'
      );
    });

    it('应该记录多参数错误日志', () => {
      logger.error('错误:', '数据库连接失败', 'Code: 500');
      expect(console.error).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [ERROR] 错误: 数据库连接失败 Code: 500'
      );
    });
  });

  describe('警告日志测试', () => {
    it('应该记录警告日志', () => {
      logger.warn('测试警告消息');
      expect(console.warn).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [WARN] 测试警告消息'
      );
    });

    it('在错误级别时不应该记录警告日志', () => {
      config.env.logLevel = 'error';
      logger.warn('测试警告消息');
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('信息日志测试', () => {
    beforeEach(() => {
      config.env.logLevel = 'info';
    });

    it('应该记录信息日志', () => {
      logger.info('测试信息消息');
      expect(console.info).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [INFO] 测试信息消息'
      );
    });

    it('在警告级别时不应该记录信息日志', () => {
      config.env.logLevel = 'warn';
      logger.info('测试信息消息');
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe('调试日志测试', () => {
    it('在调试级别时应该记录调试日志', () => {
      config.env.logLevel = 'debug';
      logger.debug('测试调试消息');
      expect(console.debug).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [DEBUG] 测试调试消息'
      );
    });

    it('在信息级别时不应该记录调试日志', () => {
      config.env.logLevel = 'info';
      logger.debug('测试调试消息');
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('日志级别测试', () => {
    it('在未设置日志级别时应该默认使用info级别', () => {
      config.env.logLevel = undefined;
      logger.info('测试信息消息');
      logger.debug('测试调试消息');
      expect(console.info).toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('应该处理无效的日志级别', () => {
      config.env.logLevel = 'invalid_level';
      logger.info('测试信息消息');
      logger.debug('测试调试消息');
      expect(console.info).toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('应该处理大写的日志级别', () => {
      config.env.logLevel = 'DEBUG';
      logger.debug('测试调试消息');
      expect(console.debug).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [DEBUG] 测试调试消息'
      );
    });

    it('应该处理空字符串的日志级别', () => {
      config.env.logLevel = '';
      logger.info('测试信息消息');
      logger.debug('测试调试消息');
      expect(console.info).toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('应该根据日志级别正确过滤日志', () => {
      // 设置为警告级别
      config.env.logLevel = 'warn';

      // 错误日志应该被记录（级别 0）
      logger.error('错误消息');
      expect(console.error).toHaveBeenCalled();

      // 警告日志应该被记录（级别 1）
      logger.warn('警告消息');
      expect(console.warn).toHaveBeenCalled();

      // 信息日志不应该被记录（级别 2）
      logger.info('信息消息');
      expect(console.info).not.toHaveBeenCalled();

      // 调试日志不应该被记录（级别 3）
      logger.debug('调试消息');
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('日志格式测试', () => {
    it('应该正确格式化日志消息', () => {
      const messages = [
        '测试消息',
        { id: 1, name: '测试对象' },
        ['数组项1', '数组项2'],
        123,
        true
      ];

      logger.info(...messages);
      expect(console.info).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [INFO] 测试消息 [object Object] 数组项1,数组项2 123 true'
      );
    });

    it('应该处理空消息', () => {
      logger.info();
      expect(console.info).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [INFO] '
      );
    });

    it('应该处理特殊字符', () => {
      logger.info('特殊字符: \n\t\r\b\f\v\\\'\"');
      expect(console.info).toHaveBeenCalledWith(
        `[2025-01-19T05:04:56+08:00] [INFO] 特殊字符: \n\t\r\b\f\v\\'\"`
      );
    });

    it('应该处理非字符串类型的参数', () => {
      logger.info(undefined, null, NaN, Infinity, -Infinity, Symbol('test'));
      expect(console.info).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [INFO] undefined null NaN Infinity -Infinity Symbol(test)'
      );
    });

    it('应该处理循环引用对象', () => {
      const circularObj = {};
      circularObj.self = circularObj;
      logger.info('循环引用:', circularObj);
      expect(console.info).toHaveBeenCalledWith(
        '[2025-01-19T05:04:56+08:00] [INFO] 循环引用: [object Object]'
      );
    });

    it('应该处理超长消息', () => {
      const longMessage = 'a'.repeat(10000);
      logger.info(longMessage);
      expect(console.info).toHaveBeenCalledWith(
        `[2025-01-19T05:04:56+08:00] [INFO] ${longMessage}`
      );
    });
  });
});
