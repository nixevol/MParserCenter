const request = require('supertest');
const express = require('express');
const { Op } = require('sequelize');

// Mock the models before requiring the router
jest.mock('../models/entity/TaskList', () => ({
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  destroy: jest.fn(),
  sequelize: {
    transaction: jest.fn()
  }
}));

jest.mock('../models/entity/EnbTaskList', () => ({
  bulkCreate: jest.fn(),
  destroy: jest.fn()
}));

const taskRouter = require('../routes/task.route');
const TaskList = require('../models/entity/TaskList');
const EnbTaskList = require('../models/entity/EnbTaskList');

// Mock sequelize transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};
TaskList.sequelize.transaction.mockResolvedValue(mockTransaction);

// 创建测试用的express应用
const app = express();
app.use(express.json());
app.use('/api/task', taskRouter);

describe('任务管理接口测试', () => {
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
  });

  describe('POST /api/task/add', () => {
    it('应该成功创建任务', async () => {
      const newTask = {
        TaskName: '测试任务1',
        DataType: 'MRO',
        StartTime: '2025-01-19T00:00:00Z',
        EndTime: '2025-01-19T23:59:59Z',
        eNodeBIDs: [1001, 1002, 1003]
      };

      const mockCreatedTask = {
        TaskID: 1,
        ...newTask
      };

      TaskList.create.mockResolvedValue(mockCreatedTask);
      EnbTaskList.bulkCreate.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/task/add')
        .send(newTask)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '任务创建成功');
      expect(response.body.data).toHaveProperty('TaskID', 1);
      expect(TaskList.create).toHaveBeenCalledWith(
        expect.objectContaining({
          TaskName: newTask.TaskName,
          DataType: newTask.DataType,
          StartTime: newTask.StartTime,
          EndTime: newTask.EndTime
        }),
        { transaction: mockTransaction }
      );
      expect(EnbTaskList.bulkCreate).toHaveBeenCalledWith(
        newTask.eNodeBIDs.map(eNodeBID => ({
          TaskID: 1,
          eNodeBID
        })),
        {
          transaction: mockTransaction,
          ignoreDuplicates: true
        }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('当eNodeBIDs为空时应该返回错误', async () => {
      const invalidTask = {
        TaskName: '测试任务1',
        DataType: 'MRO',
        StartTime: '2025-01-19T00:00:00Z',
        EndTime: '2025-01-19T23:59:59Z',
        eNodeBIDs: []
      };

      const response = await request(app)
        .post('/api/task/add')
        .send(invalidTask)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '请提供有效的基站ID列表');
      expect(TaskList.create).not.toHaveBeenCalled();
      expect(EnbTaskList.bulkCreate).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/task/list', () => {
    it('应该返回任务列表', async () => {
      const mockTasks = {
        count: 2,
        rows: [
          {
            TaskID: 1,
            TaskName: '测试任务1',
            DataType: 'MRO',
            StartTime: '2025-01-19T00:00:00Z',
            EndTime: '2025-01-19T23:59:59Z'
          },
          {
            TaskID: 2,
            TaskName: '测试任务2',
            DataType: 'MDT',
            StartTime: '2025-01-19T00:00:00Z',
            EndTime: '2025-01-19T23:59:59Z'
          }
        ]
      };

      TaskList.findAndCountAll.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/task/list')
        .query({ page: 1, pageSize: 10 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(response.body.data).toHaveProperty('total', 2);
      expect(response.body.data.list).toHaveLength(2);
    });

    it('应该支持关键字搜索', async () => {
      const mockTasks = {
        count: 1,
        rows: [
          {
            TaskID: 1,
            TaskName: '测试任务1',
            DataType: 'MRO'
          }
        ]
      };

      // 重置所有模拟
      jest.clearAllMocks();

      // 设置模拟实现
      TaskList.findAndCountAll.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/task/list')
        .query({ keyword: '测试', page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body.data).toEqual({
        total: mockTasks.count,
        list: mockTasks.rows
      });
      expect(TaskList.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        offset: 0,
        limit: 10,
        order: [['TaskID', 'DESC']]
      });
    });
  });

  describe('GET /api/task/detail/:taskId', () => {
    it('应该返回任务详情', async () => {
      const mockTask = {
        TaskID: 1,
        TaskName: '测试任务1',
        DataType: 'MRO',
        StartTime: '2025-01-19T00:00:00Z',
        EndTime: '2025-01-19T23:59:59Z',
        EnbTaskList: [
          { eNodeBID: 1001 },
          { eNodeBID: 1002 }
        ]
      };

      TaskList.findByPk.mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/api/task/detail/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(response.body.data).toMatchObject(mockTask);
    });

    it('当任务不存在时应该返回404', async () => {
      TaskList.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/task/detail/999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '任务不存在');
    });
  });

  describe('PUT /api/task/:taskId/enbs', () => {
    it('应该成功更新任务的基站列表', async () => {
      const taskId = "1";
      const newEnbs = { addEnbs: [1001, 1002], removeEnbs: [1004] };

      // 重置所有模拟
      jest.clearAllMocks();

      // 模拟事务
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      TaskList.sequelize.transaction.mockResolvedValue(transaction);
      
      TaskList.findByPk.mockResolvedValue({ TaskID: 1 });
      EnbTaskList.bulkCreate.mockResolvedValue([]);
      EnbTaskList.destroy.mockResolvedValue(1);

      const response = await request(app)
        .put(`/api/task/${taskId}/enbs`)
        .send(newEnbs)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '基站列表更新成功');

      // 验证事务和数据库操作
      expect(TaskList.sequelize.transaction).toHaveBeenCalled();
      expect(EnbTaskList.bulkCreate).toHaveBeenCalledWith(
        newEnbs.addEnbs.map(eNodeBID => ({
          TaskID: taskId,
          eNodeBID
        })),
        {
          transaction,
          ignoreDuplicates: true
        }
      );
      expect(EnbTaskList.destroy).toHaveBeenCalledWith({
        where: {
          TaskID: taskId,
          eNodeBID: { [Op.in]: newEnbs.removeEnbs }
        },
        transaction
      });
      expect(transaction.commit).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/task/:taskId', () => {
    it('应该成功删除任务', async () => {
      // 重置所有模拟
      jest.clearAllMocks();

      TaskList.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete('/api/task/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '任务删除成功');

      // 验证数据库操作
      expect(TaskList.destroy).toHaveBeenCalledWith({
        where: { TaskID: "1" }
      });
    });

    it('当任务不存在时应该返回错误', async () => {
      // 重置所有模拟
      jest.clearAllMocks();

      TaskList.destroy.mockResolvedValue(0);

      const response = await request(app)
        .delete('/api/task/999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('code', 500);
      expect(response.body).toHaveProperty('message', '任务不存在');
    });
  });
});
