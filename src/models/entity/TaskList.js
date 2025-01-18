/**
 * 任务列表模型
 */
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../database/mysql');

class TaskList extends Model {}

TaskList.init({
  TaskID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '任务ID'
  },
  TaskName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '任务名称'
  },
  DataType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'MRO',
    validate: {
      isIn: [['MRO', 'MDT']]
    },
    comment: '解析数据类型(MRO/MDT)'
  },
  StartTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '任务数据开始时间'
  },
  EndTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '任务数据结束时间'
  }
}, {
  sequelize,
  modelName: 'TaskList',
  tableName: 'TaskList',
  timestamps: true,  // 启用 createdAt 和 updatedAt
  indexes: [
    {
      fields: ['TaskID']
    },
    {
      fields: ['TaskName']
    }
  ],
  comment: '任务列表'
});

module.exports = TaskList;
