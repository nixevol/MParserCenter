const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../database/mysql");

/**
 * 扫描器和NDS服务器映射表
 */

class ScannerNDSMap extends Model {}

ScannerNDSMap.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "主键ID"
    },
    scannerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "扫描器ID",
      references: {
        model: "ScannerList",
        key: "ID",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      }
    },
    ndsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "NDS服务器ID",
      references: {
        model: "NDSList",
        key: "ID",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      }
    }
  },
  {
    sequelize,
    tableName: "ScannerNDSMap",
    timestamps: false,
    comment: "扫描器和NDS服务器映射表",
    indexes: [
      {
        unique: true,
        fields: ["scannerId", "ndsId"],
        name: "unique_scanner_nds"
      }
    ]
  }
);

module.exports = ScannerNDSMap;
