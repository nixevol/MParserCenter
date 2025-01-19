const { DataTypes } = require('sequelize');

// 模拟依赖
jest.mock('sequelize', () => {
  const mockDataTypes = {
    STRING: jest.fn((length) => ({ type: 'STRING', length })),
    INTEGER: jest.fn(() => ({ type: 'INTEGER' })),
    DECIMAL: jest.fn((precision, scale) => ({ type: 'DECIMAL', precision, scale }))
  };

  class MockModel {
    static init() {}
    static bulkCreate() {}
  }

  return {
    DataTypes: mockDataTypes,
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

describe('CellData Model', () => {
  let CellData;

  beforeEach(() => {
    // 每个测试前重新导入模型
    CellData = require('../../models/entity/CellData');
  });

  describe('bulkUpsert', () => {
    it('应该成功批量更新或插入记录', async () => {
      // 准备测试数据
      const testRecords = [
        {
          CGI: 'test1',
          eNodeBID: 1,
          PCI: 1,
          Earfcn: 100,
          isNewRecord: true
        },
        {
          CGI: 'test2',
          eNodeBID: 2,
          PCI: 2,
          Earfcn: 200,
          isNewRecord: false
        }
      ];

      // 模拟 bulkCreate 方法
      CellData.bulkCreate = jest.fn().mockResolvedValue(testRecords);

      // 执行批量更新
      const result = await CellData.bulkUpsert(testRecords);

      // 验证 bulkCreate 被正确调用
      expect(CellData.bulkCreate).toHaveBeenCalledWith(testRecords, {
        updateOnDuplicate: [
          'eNodeBID', 'PCI', 'Azimuth', 'Earfcn', 'Freq',
          'eNBName', 'UserLabel', 'Longitude', 'Latitude'
        ],
        transaction: undefined,
        returning: true,
        chunkSize: 1000
      });

      // 验证返回结果
      expect(result).toEqual({
        total: 2,
        inserted: 1,
        updated: 1
      });
    });

    it('应该在批量更新失败时抛出错误', async () => {
      // 模拟错误
      const testError = new Error('批量更新失败');
      CellData.bulkCreate = jest.fn().mockRejectedValue(testError);

      // 验证错误处理
      await expect(CellData.bulkUpsert([{}])).rejects.toThrow('批量更新失败');
    });

    it('应该使用提供的事务进行批量更新', async () => {
      // 准备测试数据和事务对象
      const testRecords = [{ CGI: 'test1', eNodeBID: 1, PCI: 1, Earfcn: 100 }];
      const testTransaction = { id: 'test-transaction' };

      // 模拟 bulkCreate 方法
      CellData.bulkCreate = jest.fn().mockResolvedValue([{ ...testRecords[0], isNewRecord: true }]);

      // 执行带事务的批量更新
      await CellData.bulkUpsert(testRecords, { transaction: testTransaction });

      // 验证事务被正确传递
      expect(CellData.bulkCreate).toHaveBeenCalledWith(
        testRecords,
        expect.objectContaining({
          transaction: testTransaction
        })
      );
    });
  });
});
