const response = require('../utils/response');

describe('响应工具测试', () => {
  // 在每个测试前固定时间戳
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1705611600000); // 2025-01-19T05:08:05+08:00
  });

  // 在所有测试后恢复模拟
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('成功响应测试', () => {
    it('应该返回完整的成功响应', () => {
      const data = { id: 1, name: '测试数据' };
      const message = '创建成功';
      const result = response.success(data, message);

      expect(result).toEqual({
        code: 200,
        data: { id: 1, name: '测试数据' },
        message: '创建成功',
        timestamp: 1705611600000
      });
    });

    it('应该处理空数据的成功响应', () => {
      const result = response.success();

      expect(result).toEqual({
        code: 200,
        data: null,
        message: '操作成功',
        timestamp: 1705611600000
      });
    });

    it('应该处理只有数据的成功响应', () => {
      const data = ['item1', 'item2'];
      const result = response.success(data);

      expect(result).toEqual({
        code: 200,
        data: ['item1', 'item2'],
        message: '操作成功',
        timestamp: 1705611600000
      });
    });

    it('应该处理只有消息的成功响应', () => {
      const message = '处理完成';
      const result = response.success(null, message);

      expect(result).toEqual({
        code: 200,
        data: null,
        message: '处理完成',
        timestamp: 1705611600000
      });
    });

    it('应该处理各种类型的数据', () => {
      // 测试数字
      expect(response.success(123).data).toBe(123);

      // 测试字符串
      expect(response.success('test').data).toBe('test');

      // 测试布尔值
      expect(response.success(true).data).toBe(true);

      // 测试数组
      expect(response.success([1, 2, 3]).data).toEqual([1, 2, 3]);

      // 测试嵌套对象
      const complexData = {
        id: 1,
        details: {
          name: '测试',
          items: [1, 2, 3]
        }
      };
      expect(response.success(complexData).data).toEqual(complexData);

      // 测试 undefined
      expect(response.success(undefined).data).toBeNull();

      // 测试特殊字符
      expect(response.success('!@#$%^&*()').data).toBe('!@#$%^&*()');

      // 测试空格和换行符
      expect(response.success(' \n\t ').data).toBe(' \n\t ');

      // 测试大数字
      expect(response.success(Number.MAX_SAFE_INTEGER).data).toBe(Number.MAX_SAFE_INTEGER);
      expect(response.success(Number.MIN_SAFE_INTEGER).data).toBe(Number.MIN_SAFE_INTEGER);

      // 测试 NaN 和 Infinity
      expect(response.success(NaN).data).toBe(null);
      expect(response.success(Infinity).data).toBe(null);
      expect(response.success(-Infinity).data).toBe(null);
    });
  });

  describe('错误响应测试', () => {
    it('应该返回完整的错误响应', () => {
      const message = '数据库连接失败';
      const code = 500;
      const result = response.error(message, code);

      expect(result).toEqual({
        code: 500,
        data: null,
        message: '数据库连接失败',
        timestamp: 1705611600000
      });
    });

    it('应该处理默认的错误响应', () => {
      const result = response.error();

      expect(result).toEqual({
        code: 500,
        data: null,
        message: '操作失败',
        timestamp: 1705611600000
      });
    });

    it('应该处理只有消息的错误响应', () => {
      const message = '验证失败';
      const result = response.error(message);

      expect(result).toEqual({
        code: 500,
        data: null,
        message: '验证失败',
        timestamp: 1705611600000
      });
    });

    it('应该处理不同的错误码', () => {
      // 测试 400 Bad Request
      expect(response.error('参数无效', 400).code).toBe(400);

      // 测试 401 Unauthorized
      expect(response.error('未授权访问', 401).code).toBe(401);

      // 测试 403 Forbidden
      expect(response.error('禁止访问', 403).code).toBe(403);

      // 测试 404 Not Found
      expect(response.error('资源不存在', 404).code).toBe(404);

      // 测试 409 Conflict
      expect(response.error('资源冲突', 409).code).toBe(409);

      // 测试 500 Internal Server Error
      expect(response.error('服务器错误', 500).code).toBe(500);
    });

    it('应该处理各种类型的错误消息', () => {
      // 测试空字符串
      expect(response.error('').message).toBe('');

      // 测试数字作为消息
      expect(response.error(404).message).toBe('404');

      // 测试对象作为消息
      const errorObj = { code: 'ERR_001', detail: '发生错误' };
      expect(response.error(errorObj).message).toBe('[object Object]');

      // 测试 undefined 作为消息
      expect(response.error(undefined).message).toBe('操作失败');

      // 测试 null 作为消息
      expect(response.error(null).message).toBe('操作失败');

      // 测试特殊字符作为消息
      expect(response.error('!@#$%^&*()').message).toBe('!@#$%^&*()');

      // 测试空格和换行符作为消息
      expect(response.error(' \n\t ').message).toBe(' \n\t ');

      // 测试大数字作为消息
      expect(response.error(Number.MAX_SAFE_INTEGER).message).toBe(String(Number.MAX_SAFE_INTEGER));
      expect(response.error(Number.MIN_SAFE_INTEGER).message).toBe(String(Number.MIN_SAFE_INTEGER));

      // 测试 NaN 和 Infinity 作为消息
      expect(response.error(NaN).message).toBe('NaN');
      expect(response.error(Infinity).message).toBe('Infinity');
      expect(response.error(-Infinity).message).toBe('-Infinity');
    });
  });

  describe('时间戳测试', () => {
    it('应该生成正确的时间戳', () => {
      const successResponse = response.success();
      const errorResponse = response.error();

      expect(successResponse.timestamp).toBe(1705611600000);
      expect(errorResponse.timestamp).toBe(1705611600000);
    });

    it('应该在每次调用时更新时间戳', () => {
      // 第一次调用
      const firstResponse = response.success();
      
      // 模拟时间流逝
      jest.spyOn(Date, 'now').mockReturnValue(1705611601000); // +1 秒
      
      // 第二次调用
      const secondResponse = response.success();

      expect(secondResponse.timestamp).toBe(1705611601000);
      expect(secondResponse.timestamp).not.toBe(firstResponse.timestamp);
    });
  });
});
