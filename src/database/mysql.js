/**
 * 数据库配置
 */
const { Sequelize } = require('sequelize');
const config = require('../config');
const logger = require('../utils/logger');

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: "mysql",
    timezone: "+08:00",  // 设置东八区时区
    logging: (msg) => {
      if (config.env.isDev) {
        logger.debug(msg);
      }
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || "200"),
      min: parseInt(process.env.DB_POOL_MIN || "0"),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || "30000"),
      idle: parseInt(process.env.DB_POOL_IDLE || "10000")
    },
    retry: {
      max: 3,
      timeout: 3000
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      underscored: false, // 禁用下划线命名转换
      timestamps: true, // 自动添加 createdAt 和 updatedAt
      freezeTableName: true, // 禁止表名自动复数化
      paranoid: false, // 禁用软删除
    }
  }
);

/**
 * 测试数据库连接
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    // 重置连接状态
    await sequelize.query('SET SESSION transaction_prealloc_size = 0;', { raw: true })
      .catch(err => {
        logger.warn('重置连接状态时出错（可忽略）:', err.message);
      });

    // 同步所有模型到数据库
    await sequelize.sync();
    logger.info('数据库表同步完成');

  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection
};
