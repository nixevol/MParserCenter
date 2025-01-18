const request = require('supertest');
const express = require('express');
const appRouter = require('../routes/app.route');

// 创建测试用的express应用
const app = express();
app.use('/', appRouter);

describe('应用路由测试', () => {
  describe('GET /', () => {
    it('应该返回成功状态和程序运行信息', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      // 验证响应体的结构和内容
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', '程序运行中');
      expect(response.body).toHaveProperty('message', '操作成功');
    });
  });

  describe('POST /restart', () => {
    it('应该返回重启服务的状态信息', async () => {
      const response = await request(app)
        .post('/restart')
        .expect('Content-Type', /json/)
        .expect(200);

      // 验证响应体的结构和内容
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', '正在重启服务...');
      expect(response.body).toHaveProperty('message', '操作成功');
    });
  });
});
