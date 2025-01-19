const { errorHandler, getErrorMessage, notFoundHandler } = require('../middlewares/error.handler');
const logger = require('../utils/logger');
const express = require('express');
const request = require('supertest');

// 模拟依赖
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  debug: jest.fn()
}));

describe('错误处理中间件测试', () => {
  let app;

  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();

    // 创建一个新的 Express 应用
    app = express();

    // 保存原始环境变量
    process.env.NODE_ENV = 'development';

    // 添加测试路由
    app.get("/error", (req, res, next) => {
      const error = req.query.error;
      if (error === undefined) {
        const err = new Error("未知错误");
        err.status = 500;
        next(err);
      } else if (error === "") {
        const err = new Error("未知错误");
        err.status = 500;
        next(err);
      } else if (error === "undefined" || error === "null") {
        next(error);
      } else {
        next(error);
      }
    });

    app.get("/error-object", (req, res, next) => {
      next(new Error("测试错误"));
    });

    app.get("/error-message-object", (req, res, next) => {
      next({ message: "测试错误" });
    });

    app.get("/error-empty-message", (req, res, next) => {
      next({ message: "" });
    });

    app.get("/error-whitespace-message", (req, res, next) => {
      next({ message: " \t\n" });
    });

    app.get("/error-plain-object", (req, res, next) => {
      const error = { code: 500, detail: "测试错误" };
      next(error);
    });

    app.get("/error-empty-object", (req, res, next) => {
      next({});
    });

    app.get("/error-circular-object", (req, res, next) => {
      const circularObj = {};
      circularObj.self = circularObj;
      next(circularObj);
    });

    app.get("/error-dev", (req, res, next) => {
      next(new Error("测试错误"));
    });

    app.get("/error-prod", (req, res, next) => {
      next(new Error("测试错误"));
    });

    app.get("/error-log", (req, res, next) => {
      next(new Error("测试错误"));
    });

    app.get("/error-no-stack", (req, res, next) => {
      next("测试错误");
    });

    app.get("/error-non-string-message", (req, res, next) => {
      next({ message: 123 }); // 数字类型的 message
    });

    app.get("/error-non-object", (req, res, next) => {
      next(123); // 数字类型的错误
    });

    app.get("/error-empty-error-message", (req, res, next) => {
      const err = new Error();
      err.message = "";
      next(err);
    });

    app.get("/error-whitespace-error-message", (req, res, next) => {
      const err = new Error(" \t\n");
      next(err);
    });

    app.get("/error-primitive", (req, res, next) => {
      next(true); // 布尔值
    });

    app.get("/error-null-message", (req, res, next) => {
      const err = new Error();
      err.message = null;
      next(err);
    });

    app.get("/error-undefined-message", (req, res, next) => {
      const err = new Error();
      err.message = undefined;
      next(err);
    });

    app.get("/error-undefined", (req, res, next) => {
      next(undefined);
    });

    app.get("/error-null", (req, res, next) => {
      next(null);
    });

    app.get("/error-false", (req, res, next) => {
      next(false);
    });

    app.get("/error-zero", (req, res, next) => {
      next(0);
    });

    // 添加 404 错误处理中间件
    app.use(notFoundHandler);

    // 添加错误处理中间件
    app.use(errorHandler);
  });

  describe('特殊错误场景测试', () => {
    it('应该处理空错误', async () => {
      const response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理字符串错误', async () => {
      const errorMessage = '测试错误';
      const response = await request(app)
        .get('/error')
        .query({ error: errorMessage })
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', errorMessage);
      expect(logger.error).toHaveBeenCalledWith('错误:', errorMessage);
    });

    it('应该处理字符串类型的 falsy 值', async () => {
      const response = await request(app)
        .get('/error')
        .query({ error: '\t' })  // 使用制表符作为 falsy 值
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理字符串类型的 undefined 或 null', async () => {
      const response = await request(app)
        .get('/error')
        .query({ error: 'undefined' })
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', 'undefined');
      expect(logger.error).toHaveBeenCalledWith('错误:', 'undefined');
    });

    it('应该处理空字符串错误', async () => {
      const response = await request(app)
        .get('/error')
        .query({ error: '' })
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理 Error 对象', async () => {
      const response = await request(app)
        .get('/error-object')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '测试错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '测试错误');
      expect(logger.debug).toHaveBeenCalled();
    });

    it('应该处理带有 message 属性的对象', async () => {
      const response = await request(app)
        .get('/error-message-object')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '测试错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '测试错误');
    });

    it('应该处理带有空 message 属性的对象', async () => {
      const response = await request(app)
        .get('/error-empty-message')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理带有空白字符 message 属性的对象', async () => {
      const response = await request(app)
        .get('/error-whitespace-message')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理带有非字符串 message 属性的对象', async () => {
      const response = await request(app)
        .get('/error-non-string-message')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理 Error 对象的 message 为空的情况', async () => {
      const response = await request(app)
        .get('/error-empty-error-message')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理 Error 对象的 message 为空白字符的情况', async () => {
      const response = await request(app)
        .get('/error-whitespace-error-message')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理基本类型的错误', async () => {
      const response = await request(app)
        .get('/error-primitive')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', 'true');
      expect(logger.error).toHaveBeenCalledWith('错误:', 'true');
    });

    it('应该处理 Error 对象的 message 为 null 的情况', async () => {
      const response = await request(app)
        .get('/error-null-message')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理 Error 对象的 message 为 undefined 的情况', async () => {
      const response = await request(app)
        .get('/error-undefined-message')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该直接处理 undefined 错误', () => {
      expect(getErrorMessage(undefined)).toBe('未知错误');
    });

    it('应该直接处理 null 错误', () => {
      expect(getErrorMessage(null)).toBe('未知错误');
    });

    it('应该直接处理 false 错误', () => {
      expect(getErrorMessage(false)).toBe('false');
    });

    it('应该直接处理数字 0 错误', () => {
      expect(getErrorMessage(0)).toBe('0');
    });

    it('应该处理非对象非字符串的错误', async () => {
      const response = await request(app)
        .get('/error-non-object')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '123');
      expect(logger.error).toHaveBeenCalledWith('错误:', '123');
    });

    it('应该处理普通对象', async () => {
      const error = { code: 500, detail: '测试错误' };
      const response = await request(app)
        .get('/error-plain-object')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', JSON.stringify(error));
      expect(logger.error).toHaveBeenCalledWith('错误:', JSON.stringify(error));
    });

    it('应该处理空对象', async () => {
      const response = await request(app)
        .get('/error-empty-object')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '未知错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '未知错误');
    });

    it('应该处理无法序列化的对象', async () => {
      const response = await request(app)
        .get('/error-circular-object')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '无法序列化的错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '无法序列化的错误');
    });
  });

  describe('环境相关的错误处理', () => {
    it('在开发环境应该返回详细错误信息', async () => {
      process.env.NODE_ENV = 'development';
      const response = await request(app)
        .get('/error-dev')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '测试错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '测试错误');
      expect(logger.debug).toHaveBeenCalled();
    });

    it('在生产环境应该返回通用错误信息', async () => {
      process.env.NODE_ENV = 'production';
      const response = await request(app)
        .get('/error-prod')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '服务器内部错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '测试错误');
      expect(logger.debug).toHaveBeenCalled();
    });
  });

  describe('错误日志记录', () => {
    it('应该记录错误消息和堆栈信息', async () => {
      const response = await request(app)
        .get('/error-log')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '测试错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '测试错误');
      expect(logger.debug).toHaveBeenCalled();
    });

    it('应该处理没有堆栈信息的错误', async () => {
      const response = await request(app)
        .get('/error-no-stack')
        .expect(500);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '测试错误');
      expect(logger.error).toHaveBeenCalledWith('错误:', '测试错误');
      expect(logger.debug).toHaveBeenCalledWith('错误堆栈:', '无堆栈信息');
    });
  });

  describe('404 错误处理', () => {
    it('应该处理 404 错误', async () => {
      const response = await request(app)
        .get('/not-exist')
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty('message', '未找到请求的资源');
    });
  });
});
