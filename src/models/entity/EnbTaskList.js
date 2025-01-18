/**
 * 基站任务列表模型
 */
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../database/mysql');
const TaskList = require('./TaskList');

class EnbTaskList extends Model {}

EnbTaskList.init({
  ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '记录ID'
  },
  TaskID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '任务ID',
    references: {
      model: TaskList,
      key: 'TaskID'
    },
    onDelete: 'CASCADE'
  },
  eNodeBID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '基站ID'
  },
  ScanStatus: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '扫描状态（0为扫描中，1为扫描完成）'
  },
  ParsedStatus: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '解析状态（0为解析中，1为解析完成）'
  }
}, {
  sequelize,
  modelName: 'EnbTaskList',
  tableName: 'EnbTaskList',
  timestamps: true,
  indexes: [
    {
      fields: ['TaskID']
    }
  ],
  comment: '基站任务列表'
});

// 设置与 TaskList 的关联关系
EnbTaskList.belongsTo(TaskList, {
  foreignKey: 'TaskID',
  as: 'task',
  onDelete: 'CASCADE'
});

TaskList.hasMany(EnbTaskList, {
  foreignKey: 'TaskID',
  as: 'enbTasks'
});

module.exports = EnbTaskList;
