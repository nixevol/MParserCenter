/**
 * 任务管理路由
 */
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// 创建任务
router.post('/add', taskController.createTask);

// 获取任务列表
router.get('/list', taskController.getTaskList);

// 获取任务详情
router.get('/detail/:taskId', taskController.getTaskDetail);

// 更新任务的基站列表
router.put('/:taskId/enbs', taskController.updateTaskEnbs);

// 删除任务
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
