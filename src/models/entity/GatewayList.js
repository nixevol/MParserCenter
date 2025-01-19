/**
 * 网关列表模型
 */
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../database/mysql");
const GatewayNDSMap = require("./GatewayNDSMap"); // 引入GatewayNDSMap模型

class GatewayList extends Model {
  /**
   * 注册网关
   * @param {Object} data 网关数据
   * @param {string} clientIp - 客户端IP
   * @returns {Promise<GatewayList>} 网关实例
   */
  static async registerGateway(data, clientIp) {
    const { ID, Port } = data;

    if (ID && ID !== -1) {
      const gateway = await this.findByPk(ID);
      if (!gateway) {
        throw new Error("网关不存在");
      }
      await gateway.update({
        Status: 1,
        Host: clientIp,
        Port
      });
      return gateway;
    }

    // 创建新网关
    const gateway = await this.create({
      NodeName: `Gateway-${Math.random().toString(36).substring(2, 9)}`,
      Status: 1,
      Host: clientIp,
      Port,
      Switch: 0
    });

    await gateway.update({
      NodeName: `Gateway-${gateway.ID}`
    });

    return gateway;
  }
}

GatewayList.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID", // 指定数据库中的字段名为大写的ID
      allowNull: false,
      comment: "网关ID"
    },
    NodeName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: "网关节点名称"
    },
    Host: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "网关主机地址"
    },
    Port: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 8080,
      comment: "网关端口"
    },
    Status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "网关状态：0-离线，1-在线"
    },
    Switch: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "网关开关：0-关闭，1-开启"
    }
  },
  {
    sequelize,
    modelName: "GatewayList",
    tableName: "GatewayList",
    timestamps: false,
    indexes: [
      {
        fields: ["NodeName"]
      },
      {
        fields: ["Status"]
      }
    ]
  }
);

// 添加与GatewayNDSMap的关联
GatewayList.hasMany(GatewayNDSMap, {
  foreignKey: "gatewayId",
  sourceKey: "ID",  // 使用模型中的ID字段
  as: "NDSMappings",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

module.exports = GatewayList;
