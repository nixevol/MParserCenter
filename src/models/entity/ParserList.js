/**
 * 解析器列表模型
 */
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../database/mysql");
const GatewayList = require("./GatewayList");

class ParserList extends Model {
  /**
   * 注册解析器
   * @param {Object} data 解析器数据
   * @param {string} clientIp - 客户端IP
   * @returns {Promise<ParserList>} 解析器实例
   */
  static async registerParser(data, clientIp) {
    const { ID, Port, Threads = 4 } = data;

    if (ID && ID !== -1) {
      const parser = await this.findOne({
        where: { ID }
      });
      if (!parser) {
        throw new Error("解析器不存在");
      }
      await parser.update({
        Status: 1,
        Host: clientIp,
        Port,
        Threads
      });
      return parser;
    }

    const parser = await this.create({
      NodeName: `Parser-${Math.random().toString(36).substring(2, 9)}`,
      GatewayID: null, // 初始不关联网关
      Status: 1,
      Host: clientIp,
      Port,
      Threads,
      Switch: 1
    });
    return parser;
  }
}

ParserList.init(
  {
    // 解析器ID
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "解析器ID"
    },
    // 网关ID
    GatewayID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "网关ID",
      references: {
        model: GatewayList,
        key: "ID"
      }
    },
    // 节点名称
    NodeName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "节点名称"
    },
    // IP地址
    Host: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "IP地址"
    },
    // 端口
    Port: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "端口"
    },
    // 线程数
    Threads: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 4,
      comment: "线程数"
    },
    // 状态：0=离线，1=在线
    Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "0=离线，1=在线"
    },
    // 开关：0=关闭，1=开启
    Switch: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "0=关闭, 1=开启"
    }
  },
  {
    sequelize,
    tableName: "ParserList",
    timestamps: false,
    comment: "解析器列表"
  }
);

// 建立与网关的关联关系
ParserList.belongsTo(GatewayList, {
  foreignKey: "GatewayID",
  as: "gateway"
});

module.exports = ParserList;
