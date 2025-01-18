/**
 * 任务管理控制器
 */
const { Op } = require('sequelize');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const TaskList = require('../models/entity/TaskList');
const EnbTaskList = require('../models/entity/EnbTaskList');

/**
 * 创建任务
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const createTask = async (req, res) => {
    const transaction = await TaskList.sequelize.transaction();
    try {
        const { TaskName, DataType, StartTime, EndTime, eNodeBIDs } = req.body;

        // 验证eNodeBIDs是否为数组且不为空
        if (!Array.isArray(eNodeBIDs) || eNodeBIDs.length === 0) {
            return res.status(400).json(error('请提供有效的基站ID列表'));
        }

        // 创建任务
        const task = await TaskList.create({
            TaskName,
            DataType,
            StartTime,
            EndTime
        }, { transaction });

        // 创建基站任务关联
        const enbTasks = eNodeBIDs.map(eNodeBID => ({
            TaskID: task.TaskID,
            eNodeBID
        }));

        await EnbTaskList.bulkCreate(enbTasks, {
            transaction,
            // 忽略重复的TaskID+eNodeBID组合
            ignoreDuplicates: true
        });

        await transaction.commit();
        return res.json(success({ TaskID: task.TaskID }, '任务创建成功'));
    } catch (err) {
        await transaction.rollback();
        logger.error('创建任务失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 获取任务列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getTaskList = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, DataType } = req.query;
        const where = {};
        
        if (DataType) {
            where.DataType = DataType;
        }

        const { count, rows } = await TaskList.findAndCountAll({
            where,
            offset: (page - 1) * pageSize,
            limit: parseInt(pageSize),
            order: [['TaskID', 'DESC']]
        });

        return res.json(success({
            total: count,
            list: rows
        }));
    } catch (err) {
        logger.error('获取任务列表失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 获取任务详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getTaskDetail = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await TaskList.findByPk(taskId, {
            include: [{
                model: EnbTaskList,
                as: 'enbTasks',
                attributes: ['ID', 'eNodeBID']
            }]
        });

        if (!task) {
            return res.status(404).json(error('任务不存在'));
        }

        return res.json(success(task));
    } catch (err) {
        logger.error('获取任务详情失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 更新任务的基站列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const updateTaskEnbs = async (req, res) => {
    const transaction = await TaskList.sequelize.transaction();
    try {
        const { taskId } = req.params;
        const { addEnbs = [], removeEnbs = [] } = req.body;

        // 验证任务是否存在
        const task = await TaskList.findByPk(taskId);
        if (!task) {
            return res.status(404).json(error('任务不存在'));
        }

        // 添加新的基站
        if (addEnbs.length > 0) {
            const enbTasks = addEnbs.map(eNodeBID => ({
                TaskID: taskId,
                eNodeBID
            }));
            await EnbTaskList.bulkCreate(enbTasks, {
                transaction,
                ignoreDuplicates: true
            });
        }

        // 删除基站
        if (removeEnbs.length > 0) {
            await EnbTaskList.destroy({
                where: {
                    TaskID: taskId,
                    eNodeBID: { [Op.in]: removeEnbs }
                },
                transaction
            });
        }

        await transaction.commit();
        return res.json(success(null, '基站列表更新成功'));
    } catch (err) {
        await transaction.rollback();
        logger.error('更新任务基站列表失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 删除任务
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const result = await TaskList.destroy({
            where: { TaskID: taskId }
        });

        if (result === 0) {
            return res.status(404).json(error('任务不存在'));
        }

        // 由于设置了级联删除，不需要手动删除EnbTaskList中的记录

        return res.json(success(null, '任务删除成功'));
    } catch (err) {
        logger.error('删除任务失败:', err);
        return res.status(500).json(error(err.message));
    }
};

module.exports = {
    createTask,
    getTaskList,
    getTaskDetail,
    updateTaskEnbs,
    deleteTask
};
