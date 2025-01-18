/**
 * NDS服务器配置路由
 */
const express = require('express');
const router = express.Router();
const ndsController = require('../controllers/nds.controller');

// 获取NDS服务器列表
router.get('/list', ndsController.getNDSList);

// 获取单个NDS服务器详情
router.get('/:id', ndsController.getNDSDetail);

// 添加NDS服务器
router.post('/add', ndsController.addNDS);

// 更新NDS服务器
router.put('/:id', ndsController.updateNDS);

// 删除NDS服务器
router.delete('/:id', ndsController.deleteNDS);

// 测试NDS服务器连接
router.post('/:id/test', ndsController.testNDSConnection);

module.exports = router;
