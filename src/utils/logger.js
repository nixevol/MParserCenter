/**
 * 日志工具
 * 统一的日志处理模块
 */

const config = require('../config');

// 日志级别定义
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// 获取当前配置的日志级别
const currentLevel = LOG_LEVELS[config.env.logLevel || 'info'];

/**
 * 检查是否应该记录该级别的日志
 * @param {string} level 日志级别
 * @returns {boolean} 是否应该记录
 */
const shouldLog = (level) => {
  return LOG_LEVELS[level] <= currentLevel;
};

/**
 * 格式化日志消息
 * @param {string} level 日志级别
 * @param {string} message 日志消息
 * @returns {string} 格式化后的日志
 */
const formatLog = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

// 日志接口
const logger = {
  error: (...args) => {
    if (shouldLog('error')) {
      console.error(formatLog('error', args.join(' ')));
    }
  },

  warn: (...args) => {
    if (shouldLog('warn')) {
      console.warn(formatLog('warn', args.join(' ')));
    }
  },

  info: (...args) => {
    if (shouldLog('info')) {
      console.info(formatLog('info', args.join(' ')));
    }
  },

  debug: (...args) => {
    if (shouldLog('debug')) {
      console.debug(formatLog('debug', args.join(' ')));
    }
  }
};

module.exports = logger;
