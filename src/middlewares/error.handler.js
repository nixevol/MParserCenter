/**
 * 统一错误处理中间件
 */
const { error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error('错误:', err.message);
  logger.debug('错误堆栈:', err.stack);
  
  // 区分开发环境和生产环境的错误信息
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;

  res.status(500).json(error(message));
};

module.exports = errorHandler;
