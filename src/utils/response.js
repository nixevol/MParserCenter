/**
 * 统一响应处理工具
 */

/**
 * 成功响应
 * @param {Object} data 响应数据
 * @param {string} message 响应消息
 * @returns {Object} 统一格式的响应对象
 */
const success = (data = null, message = '操作成功') => ({
  code: 200,
  data,
  message,
  timestamp: Date.now()
});

/**
 * 错误响应
 * @param {string} message 错误消息
 * @param {number} code 错误码
 * @returns {Object} 统一格式的响应对象
 */
const error = (message = '操作失败', code = 500) => ({
  code,
  data: null,
  message,
  timestamp: Date.now()
});

module.exports = {
  success,
  error
};
