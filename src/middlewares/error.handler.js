/**
 * 统一错误处理中间件
 */
const { error: errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 获取错误消息
 * @param {*} err 错误对象
 * @returns {string} 错误消息
 */
const getErrorMessage = (err) => {
  if (err === undefined || err === null) {
    return '未知错误';
  }

  if (typeof err === 'string') {
    return err.trim() || '未知错误';
  }

  if (err instanceof Error) {
    return (err.message && err.message.trim()) || '未知错误';
  }

  if (err && typeof err === 'object' && 'message' in err) {
    return typeof err.message === 'string' ? err.message.trim() || '未知错误' : '未知错误';
  }

  try {
    if (typeof err !== 'object') {
      return String(err);
    }
    const jsonStr = JSON.stringify(err);
    return jsonStr === '{}' ? '未知错误' : jsonStr;
  } catch {
    return '无法序列化的错误';
  }
};

/**
 * 错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 获取错误消息
  const originalMessage = getErrorMessage(err);
  
  // 记录错误日志
  logger.error('错误:', originalMessage);
  logger.debug('错误堆栈:', err instanceof Error ? err.stack : '无堆栈信息');
  
  // 区分开发环境和生产环境的错误信息
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : originalMessage;

  // 返回错误响应
  const response = errorResponse(message);
  res.status(err.status || 500).json(response);
};

module.exports = {
  getErrorMessage,
  default: errorHandler
};
