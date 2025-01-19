/**
 * 网关-NDS关联表模型
 */
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../database/mysql');

class GatewayNDSMap extends Model {}

GatewayNDSMap.init({
    ID: {  
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '映射ID'
    },
    gatewayId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'GatewayList',
            key: 'ID',  
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        comment: '网关ID'
    },
    ndsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'NDSList',
            key: 'ID',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        comment: 'NDS ID'
    }
}, {
    sequelize,
    modelName: 'GatewayNDSMap',
    tableName: 'GatewayNDSMap',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['gatewayId', 'ndsId'],
            name: 'uk_gateway_nds'
        }
    ]
});

module.exports = GatewayNDSMap;
