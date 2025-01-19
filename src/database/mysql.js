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
    Host: config.database.Host,
    Port: config.database.Port,
    dialect: "mysql",
    timezone: "+08:00", // 设置东八区时区
    logging: config.env.isDev ? (sql) => logger.debug(sql) : false,
    pool: {
      max: parseInt((config.database.pool || {}).max || "200"),
      min: parseInt((config.database.pool || {}).min || "0"),
      acquire: parseInt((config.database.pool || {}).acquire || "30000"),
      idle: parseInt((config.database.pool || {}).idle || "10000")
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
      paranoid: false // 禁用软删除
    }
  }
);

/**
 * 测试数据库连接
 * @throws {Error} 如果连接失败
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    try {
      // 重置连接状态
      await sequelize.query("SET SESSION transaction_prealloc_size = 0;", {
        raw: true
      });
    } catch (err) {
      logger.warn("重置连接状态时出错（可忽略）:", err.message);
    }

    // 同步所有模型到数据库
    await sequelize.sync();
    logger.info('数据库表同步完成');

  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw new Error("连接失败");
  }
};

module.exports = {
  sequelize,
  testConnection
};
