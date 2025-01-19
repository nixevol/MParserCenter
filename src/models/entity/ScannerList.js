/**
 * 扫描器列表模型
 */
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../database/mysql");
const ScannerNDSMap = require("./ScannerNDSMap");
const NDSList = require("./NDSList");
const GatewayList = require("./GatewayList");

class ScannerList extends Model {
  /**
   * 注册扫描器
   * @param {Object} data 扫描器数据
   * @param {string} clientIp - 客户端IP
   * @returns {Promise<ScannerList>} 扫描器实例
   */
  static async registerScanner(data, clientIp) {
    const { ID, Port } = data;

    if (ID && ID !== -1) {
      const scanner = await this.findByPk(ID);
      if (!scanner) {
        throw new Error("扫描器不存在");
      }
      await scanner.update({
        Status: 1,
        Host: clientIp,
        Port
      });
      return scanner;
    }

    const scanner = await this.create({
      NodeName: `Scanner-${Math.random().toString(36).substring(2, 9)}`,
      GatewayID: null, // 初始不关联网关
      Status: 1,
      Host: clientIp,
      Port
    });
    return scanner;
  }
}

ScannerList.init(
  {
    // 扫描器ID
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "扫描器ID"
    },
    // 所属网关ID
    GatewayID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "所属网关ID",
      references: {
        model: "GatewayList",
        key: "ID",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      }
    },
    // 节点名称
    NodeName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "节点名称"
    },
    // 主机地址
    Host: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "主机地址"
    },
    // 端口
    Port: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "端口"
    },
    // 状态
    Status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "状态"
    },
    // 开关
    Switch: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "开关"
    }
  },
  {
    sequelize,
    modelName: "ScannerList",
    tableName: "ScannerList",
    timestamps: false, // 不使用时间戳
    indexes: [
      {
        name: "GatewayID",
        fields: ["GatewayID"]
      }
    ]
  }
);

// 建立与 NDSList 的多对多关联
ScannerList.belongsToMany(NDSList, {
  through: ScannerNDSMap,
  foreignKey: "scannerId",
  otherKey: "ndsId",
  as: "ndsList"
});

// NDSList 也需要建立反向关联
NDSList.belongsToMany(ScannerList, {
  through: ScannerNDSMap,
  foreignKey: "ndsId",
  otherKey: "scannerId",
  as: "scannerList"
});

// 建立与 GatewayList 的关联
ScannerList.belongsTo(GatewayList, {
  foreignKey: "GatewayID",
  as: "gateway"
});

// GatewayList 也需要建立反向关联
GatewayList.hasMany(ScannerList, {
  foreignKey: "GatewayID",
  as: "scanners"
});

// 添加与ScannerNDSMap的关联
ScannerList.hasMany(ScannerNDSMap, {
  foreignKey: "scannerId",
  sourceKey: "ID", // 使用模型中的ID字段
  as: "ScannerNDSMappings",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

module.exports = ScannerList;
