/**
 * 统一响应处理工具
 */

/**
 * 格式化消息
 * @param {*} message 消息内容
 * @param {string} defaultMessage 默认消息
 * @returns {string} 格式化后的消息
 */
const formatMessage = (message, defaultMessage) => {
  if (message === undefined || message === null) {
    return defaultMessage;
  }
  return String(message);
};

/**
 * 格式化数据
 * @param {*} data 数据内容
 * @returns {*} 格式化后的数据
 */
const formatData = (data) => {
  if (data === undefined || data === null) {
    return null;
  }
  if (typeof data === 'number' && (isNaN(data) || !isFinite(data))) {
    return null;
  }
  return data;
};

/**
 * 成功响应
 * @param {Object} data 响应数据
 * @param {string} message 响应消息
 * @returns {Object} 统一格式的响应对象
 */
const success = (data = null, message = '操作成功') => ({
  code: 200,
  data: formatData(data),
  message: formatMessage(message, '操作成功'),
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
  message: formatMessage(message, '操作失败'),
  timestamp: Date.now()
});

module.exports = {
  success,
  error
};
