/**
 * NDS服务器配置模型
 */
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/mysql");
const GatewayNDSMap = require('./GatewayNDSMap'); // 引入GatewayNDSMap模型

const NDSList = sequelize.define(
  "NDSList",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "NDS ID"
    },
    Name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: "NDS服务器名称"
    },
    Address: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "NDS服务器地址"
    },
    Port: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2121,
      comment: "NDS服务器端口"
    },
    Protocol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "SFTP",
      validate: {
        isIn: [["FTP", "SFTP"]]
      },
      comment: "连接协议：FTP/SFTP"
    },
    Account: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "账号"
    },
    Password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "密码"
    },
    MRO_Path: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: "/MR/MRO/",
      comment: "MRO文件路径"
    },
    MRO_Filter: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: "^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$",
      comment: "MRO文件过滤规则"
    },
    MDT_Path: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: "/MDT/",
      comment: "MDT文件路径"
    },
    MDT_Filter: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: "^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$",
      comment: "MDT文件过滤规则"
    },
    Switch: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1]]
      },
      comment: "开关状态"
    }
  },
  {
    tableName: "NDSList",
    timestamps: false, // 禁用 createdAt 和 updatedAt
    comment: "NDS服务器配置表",
    engine: "InnoDB",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    rowFormat: "DYNAMIC"
  }
);

// 添加与GatewayNDSMap的关联
NDSList.hasMany(GatewayNDSMap, {
  foreignKey: 'ndsId',
  sourceKey: 'ID',
  as: 'GatewayNDSMaps',  // 添加关联别名
});

module.exports = NDSList;
