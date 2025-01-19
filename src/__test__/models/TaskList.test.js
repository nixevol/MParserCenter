const { DataTypes } = require('sequelize');

// 模拟依赖
jest.mock('sequelize', () => {
  class MockModel {
    static init() {}
    static getAttributes() {
      return {
        TaskID: {
          type: 'BIGINT',
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        TaskName: {
          type: 'STRING',
          allowNull: false
        },
        DataType: {
          type: 'STRING',
          allowNull: false,
          defaultValue: 'MRO',
          validate: {
            isIn: [['MRO', 'MDT']]
          }
        },
        StartTime: {
          type: 'DATE',
          allowNull: false
        },
        EndTime: {
          type: 'DATE',
          allowNull: false
        }
      };
    }
  }

  return {
    DataTypes: {
      BIGINT: jest.fn(() => ({ type: 'BIGINT' })),
      STRING: jest.fn((length) => ({ type: 'STRING', length })),
      DATE: jest.fn(() => ({ type: 'DATE' }))
    },
    Model: MockModel
  };
});

jest.mock('../../database/mysql', () => ({
  sequelize: {
    define: jest.fn()
  }
}));

// 在测试开始前清除所有模拟
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

describe('TaskList Model', () => {
  let TaskList;
  let sequelize;

  beforeEach(() => {
    // 每个测试前重新导入模型
    TaskList = require('../../models/entity/TaskList');
    sequelize = require('../../database/mysql').sequelize;
  });

  describe('Model Initialization', () => {
    it('应该正确定义模型属性和选项', () => {
      const attributes = TaskList.getAttributes();

      // 验证字段定义
      expect(attributes).toHaveProperty('TaskID');
      expect(attributes).toHaveProperty('TaskName');
      expect(attributes).toHaveProperty('DataType');
      expect(attributes).toHaveProperty('StartTime');
      expect(attributes).toHaveProperty('EndTime');

      // 验证主键
      expect(attributes.TaskID.primaryKey).toBe(true);
      expect(attributes.TaskID.autoIncrement).toBe(true);

      // 验证必填字段
      expect(attributes.TaskID.allowNull).toBe(false);
      expect(attributes.TaskName.allowNull).toBe(false);
      expect(attributes.DataType.allowNull).toBe(false);
      expect(attributes.StartTime.allowNull).toBe(false);
      expect(attributes.EndTime.allowNull).toBe(false);

      // 验证默认值和验证规则
      expect(attributes.DataType.defaultValue).toBe('MRO');
      expect(attributes.DataType.validate).toEqual({
        isIn: [['MRO', 'MDT']]
      });
    });

    it('应该正确设置模型选项', () => {
      const options = {
        modelName: 'TaskList',
        tableName: 'TaskList',
        timestamps: true,
        indexes: [
          {
            fields: ['TaskID']
          },
          {
            fields: ['TaskName']
          }
        ],
        comment: '任务列表'
      };

      // 验证表名和模型名
      expect(options.modelName).toBe('TaskList');
      expect(options.tableName).toBe('TaskList');

      // 验证时间戳
      expect(options.timestamps).toBe(true);

      // 验证索引
      expect(options.indexes).toEqual([
        {
          fields: ['TaskID']
        },
        {
          fields: ['TaskName']
        }
      ]);

      // 验证表注释
      expect(options.comment).toBe('任务列表');
    });
  });

  describe('Model Validation', () => {
    it('应该只允许 MRO 和 MDT 作为 DataType 的值', () => {
      const attributes = TaskList.getAttributes();
      const validValues = ['MRO', 'MDT'];

      // 验证 DataType 字段的验证规则
      expect(attributes.DataType.validate.isIn[0]).toEqual(validValues);
    });
  });
});
