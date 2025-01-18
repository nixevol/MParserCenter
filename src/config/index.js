const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

/**
 * 获取环境变量，如果不存在则使用默认值
 * @param {string} key - 环境变量名
 * @param {any} defaultValue - 默认值
 * @returns {any} 环境变量值或默认值
 */
const getEnvVar = (key, defaultValue = undefined) => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`环境变量 ${key} 未定义`);
    }
    return defaultValue;
  }
  return value;
};

/**
 * 应用配置
 */
const config = {
  // 环境配置
  env: {
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL || "info"
  },

  // 服务器配置
  server: {
    port: parseInt(getEnvVar("PORT", "9002"))
  },

  // 日志配置
  log: {
    level: getEnvVar("LOG_LEVEL", "info"),
    dir: path.join(process.cwd(), "logs"),
    maxSize: "500m",
    maxFiles: "7d",
    rotationSize: "50m"
  },

  // 数据库配置
  database: {
    host: getEnvVar("DB_HOST", "127.0.0.1"),
    port: parseInt(getEnvVar("DB_PORT", "3306")),
    username: getEnvVar("DB_USER", "root"),
    password: getEnvVar("DB_PASSWORD"),
    database:
      getEnvVar("NODE_ENV") === "production"
        ? getEnvVar("DB_NAME_PROD")
        : getEnvVar("DB_NAME_DEV"),
    // 数据库连接配置
    options: {
      dialect: "mysql",
      timezone: "+08:00",
      logging: (msg) => {
        if (config.env.isDev && config.log.level === "debug") {
          logger.debug(msg);
        }
      },
      pool: {
        max: parseInt(getEnvVar("DB_POOL_MAX", "10")),
        min: parseInt(getEnvVar("DB_POOL_MIN", "0")),
        acquire: parseInt(getEnvVar("DB_POOL_ACQUIRE", "30000")),
        idle: parseInt(getEnvVar("DB_POOL_IDLE", "10000"))
      }
    }
  },

  // Clickhouse配置
  clickhouse: {
    host: getEnvVar("CLICKHOUSE_HOST", "127.0.0.1"),
    port: parseInt(getEnvVar("CLICKHOUSE_PORT", "9000")),
    user: getEnvVar("CLICKHOUSE_USER", "root"),
    password: getEnvVar("CLICKHOUSE_PASSWORD", ""),
    database: getEnvVar("CLICKHOUSE_DATABASE", "MParser")
  },

  // Redis配置
  redis: {
    host: getEnvVar("REDIS_HOST", "127.0.0.1"),
    port: parseInt(getEnvVar("REDIS_PORT", "6379")),
    password: getEnvVar("REDIS_PASSWORD", ""),
    db: parseInt(getEnvVar("REDIS_DB", "0")),
    options: {
      retryStrategy: (times) => {
        if (times > 3) {
          throw new Error("Redis连接重试次数过多，请检查配置");
        }
        return Math.min(times * 200, 1000);
      }
    }
  }
};

// 冻结配置对象，防止运行时被修改
module.exports = Object.freeze(config);
