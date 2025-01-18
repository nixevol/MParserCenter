/**
 * NDS服务器配置控制器
 */
const { Op } = require('sequelize');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const NDSList = require('../models/entity/NDSList');
const { testConnection } = require('../utils/ftp');

/**
 * 获取NDS服务器列表
 */
const getNDSList = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, keyword } = req.query;
        const where = {};
        
        if (keyword) {
            where[Op.or] = [
                { Name: { [Op.like]: `%${keyword}%` } },
                { Address: { [Op.like]: `%${keyword}%` } }
            ];
        }

        const { count, rows } = await NDSList.findAndCountAll({
            where,
            offset: (page - 1) * pageSize,
            limit: parseInt(pageSize),
            order: [['ID', 'DESC']]
        });

        return res.json(success({
            total: count,
            list: rows
        }));
    } catch (err) {
        logger.error('获取NDS服务器列表失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 获取单个NDS服务器详情
 */
const getNDSDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const nds = await NDSList.findByPk(id);

        if (!nds) {
            return res.status(404).json(error('服务器不存在'));
        }

        return res.json(success(nds));
    } catch (err) {
        logger.error('获取NDS服务器详情失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 添加NDS服务器
 */
const addNDS = async (req, res) => {
    try {
        const ndsData = req.body;
        const existingNDS = await NDSList.findOne({
            where: {
                [Op.or]: [
                    { Name: ndsData.Name },
                    { 
                        Address: ndsData.Address,
                        Port: ndsData.Port
                    }
                ]
            }
        });

        if (existingNDS) {
            return res.status(400).json(error('服务器名称或地址端口组合已存在'));
        }

        const nds = await NDSList.create(ndsData);
        return res.json(success({ ID: nds.ID }, '添加成功'));
    } catch (err) {
        logger.error('添加NDS服务器失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 更新NDS服务器
 */
const updateNDS = async (req, res) => {
    try {
        const { id } = req.params;
        const ndsData = req.body;

        // 检查是否存在同名或相同地址端口的其他记录
        const existingNDS = await NDSList.findOne({
            where: {
                ID: { [Op.ne]: id },
                [Op.or]: [
                    { Name: ndsData.Name },
                    { 
                        Address: ndsData.Address,
                        Port: ndsData.Port
                    }
                ]
            }
        });

        if (existingNDS) {
            return res.status(400).json(error('服务器名称或地址端口组合已存在'));
        }

        const result = await NDSList.update(ndsData, {
            where: { ID: id }
        });

        if (result[0] === 0) {
            return res.status(404).json(error('服务器不存在'));
        }

        return res.json(success(null, '更新成功'));
    } catch (err) {
        logger.error('更新NDS服务器失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 删除NDS服务器
 */
const deleteNDS = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await NDSList.destroy({
            where: { ID: id }
        });

        if (result === 0) {
            return res.status(404).json(error('服务器不存在'));
        }

        return res.json(success(null, '删除成功'));
    } catch (err) {
        logger.error('删除NDS服务器失败:', err);
        return res.status(500).json(error(err.message));
    }
};

/**
 * 测试NDS服务器连接
 */
const testNDSConnection = async (req, res) => {
    try {
        const { id } = req.params;
        const nds = await NDSList.findByPk(id);

        if (!nds) {
            return res.status(404).json(error('服务器不存在'));
        }

        const testResult = await testConnection(nds);
        return res.json(success(testResult));
    } catch (err) {
        logger.error('测试NDS服务器连接失败:', err);
        return res.status(500).json(error(err.message));
    }
};

module.exports = {
    getNDSList,
    getNDSDetail,
    addNDS,
    updateNDS,
    deleteNDS,
    testNDSConnection
};
