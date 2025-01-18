/**
 * 小区数据模型
 */
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../database/mysql');

class CellData extends Model {
    /**
     * 批量更新或插入数据
     * @param {Array} records - 要更新或插入的记录数组
     * @param {Object} options - 选项，包含transaction等
     * @returns {Promise<{total: number, inserted: number, updated: number}>} 处理结果统计
     */
    static async bulkUpsert(records, options = {}) {
        try {
            // 所有可更新的字段
            const updateFields = [
                'eNodeBID', 'PCI', 'Azimuth', 'Earfcn', 'Freq',
                'eNBName', 'UserLabel', 'Longitude', 'Latitude'
            ];

            // 使用bulkCreate进行批量插入或更新
            const result = await this.bulkCreate(records, {
                updateOnDuplicate: updateFields,
                transaction: options.transaction,
                // 返回更新的结果
                returning: true,
                // 设置较大的chunk size来减少数据库交互次数
                chunkSize: 1000
            });

            // 统计更新和插入的数量
            const stats = {
                total: records.length,
                inserted: 0,
                updated: 0
            };

            // 通过检查记录的isNewRecord属性来区分新插入和更新的记录
            result.forEach(record => {
                if (record.isNewRecord) {
                    stats.inserted++;
                } else {
                    stats.updated++;
                }
            });

            return stats;
        } catch (error) {
            console.error('批量更新失败:', error);
            throw error;
        }
    }
}

CellData.init({
    CGI: {
        type: DataTypes.STRING(128),
        primaryKey: true,
        allowNull: false,
        comment: '小区全局标识'
    },
    eNodeBID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '基站ID'
    },
    PCI: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '物理小区标识'
    },
    Azimuth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '方位角'
    },
    Earfcn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '频点编号'
    },
    Freq: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '频率'
    },
    eNBName: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: '基站名称'
    },
    UserLabel: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: '用户标签'
    },
    Longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        comment: '经度'
    },
    Latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        comment: '纬度'
    }
}, {
    sequelize,
    modelName: 'CellData',
    tableName: 'CellData',
    timestamps: true, // 启用 createdAt 和 updatedAt
    comment: '小区数据表',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = CellData;
