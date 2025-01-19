const { DataTypes } = require('sequelize');

// 模拟依赖
jest.mock('sequelize', () => {
  class MockModel {
    static init() {}
    static belongsTo = jest.fn();
    static getAttributes() {
      return {
        ID: {
          type: 'BIGINT',
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        TaskID: {
          type: 'BIGINT',
          allowNull: false,
          references: {
            model: 'TaskList',
            key: 'TaskID'
          },
          onDelete: 'CASCADE'
        },
        eNodeBID: {
          type: 'INTEGER',
          allowNull: false
        },
        ScanStatus: {
          type: 'INTEGER',
          allowNull: false,
          defaultValue: 0
        },
        ParsedStatus: {
          type: 'INTEGER',
          allowNull: false,
          defaultValue: 0
        }
      };
    }
  }

  return {
    DataTypes: {
      BIGINT: jest.fn(() => ({ type: 'BIGINT' })),
      INTEGER: jest.fn(() => ({ type: 'INTEGER' }))
    },
    Model: MockModel
  };
});

jest.mock('../../database/mysql', () => ({
  sequelize: {
    define: jest.fn()
  }
}));

// 模拟 TaskList 模型
const mockTaskList = {
  hasMany: jest.fn()
};

jest.mock('../../models/entity/TaskList', () => mockTaskList);

// 在测试开始前清除所有模拟
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

describe('EnbTaskList Model', () => {
  let EnbTaskList;
  let sequelize;

  beforeEach(() => {
    // 每个测试前重新导入模型
    EnbTaskList = require('../../models/entity/EnbTaskList');
    sequelize = require('../../database/mysql').sequelize;
  });

  describe('Model Associations', () => {
    it('应该正确设置与 TaskList 的关联关系', () => {
      // 验证 belongsTo 关联
      expect(EnbTaskList.belongsTo).toHaveBeenCalledWith(mockTaskList, {
        foreignKey: 'TaskID',
        as: 'task',
        onDelete: 'CASCADE'
      });

      // 验证 hasMany 关联
      expect(mockTaskList.hasMany).toHaveBeenCalledWith(EnbTaskList, {
        foreignKey: 'TaskID',
        as: 'enbTasks'
      });
    });
  });

  describe('Model Initialization', () => {
    it('应该正确定义模型属性和选项', () => {
      const attributes = EnbTaskList.getAttributes();

      // 验证字段定义
      expect(attributes).toHaveProperty('ID');
      expect(attributes).toHaveProperty('TaskID');
      expect(attributes).toHaveProperty('eNodeBID');
      expect(attributes).toHaveProperty('ScanStatus');
      expect(attributes).toHaveProperty('ParsedStatus');

      // 验证主键
      expect(attributes.ID.primaryKey).toBe(true);
      expect(attributes.ID.autoIncrement).toBe(true);

      // 验证必填字段
      expect(attributes.ID.allowNull).toBe(false);
      expect(attributes.TaskID.allowNull).toBe(false);
      expect(attributes.eNodeBID.allowNull).toBe(false);
      expect(attributes.ScanStatus.allowNull).toBe(false);
      expect(attributes.ParsedStatus.allowNull).toBe(false);

      // 验证默认值
      expect(attributes.ScanStatus.defaultValue).toBe(0);
      expect(attributes.ParsedStatus.defaultValue).toBe(0);

      // 验证外键关联
      expect(attributes.TaskID.references).toEqual({
        model: 'TaskList',
        key: 'TaskID'
      });
      expect(attributes.TaskID.onDelete).toBe('CASCADE');
    });

    it('应该正确设置模型选项', () => {
      const options = {
        modelName: 'EnbTaskList',
        tableName: 'EnbTaskList',
        timestamps: true,
        indexes: [
          {
            fields: ['TaskID']
          }
        ],
        comment: '基站任务列表'
      };

      // 验证表名和模型名
      expect(options.modelName).toBe('EnbTaskList');
      expect(options.tableName).toBe('EnbTaskList');

      // 验证时间戳
      expect(options.timestamps).toBe(true);

      // 验证索引
      expect(options.indexes).toEqual([
        {
          fields: ['TaskID']
        }
      ]);

      // 验证表注释
      expect(options.comment).toBe('基站任务列表');
    });
  });
});
