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

/**
 * 获取当前配置的日志级别
 * @returns {number} 日志级别数值
 */
const getLogLevel = () => {
  const configLevel = config.env.logLevel;
  if (!configLevel || typeof configLevel !== 'string') {
    return LOG_LEVELS.info;
  }
  const level = configLevel.toLowerCase();
  return LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.info;
};

/**
 * 检查是否应该记录该级别的日志
 * @param {string} level 日志级别
 * @returns {boolean} 是否应该记录
 */
const shouldLog = (level) => {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] <= currentLevel;
};

/**
 * 格式化参数为字符串
 * @param {*} arg 参数
 * @returns {string} 格式化后的字符串
 */
const formatArg = (arg) => {
  if (arg === undefined) return 'undefined';
  if (arg === null) return 'null';
  if (typeof arg === 'symbol') return arg.toString();
  return String(arg);
};

/**
 * 格式化日志消息
 * @param {string} level 日志级别
 * @param {Array} args 日志参数
 * @returns {string} 格式化后的日志
 */
const formatLog = (level, args) => {
  const timestamp = new Date().toISOString();
  const message = args.map(formatArg).join(' ');
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

// 日志接口
const logger = {
  error: (...args) => {
    if (shouldLog('error')) {
      console.error(formatLog('error', args));
    }
  },

  warn: (...args) => {
    if (shouldLog('warn')) {
      console.warn(formatLog('warn', args));
    }
  },

  info: (...args) => {
    if (shouldLog('info')) {
      console.info(formatLog('info', args));
    }
  },

  debug: (...args) => {
    if (shouldLog('debug')) {
      console.debug(formatLog('debug', args));
    }
  }
};

module.exports = logger;
