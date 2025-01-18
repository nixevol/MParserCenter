/**
 * 小区管理路由
 */
const express = require('express');
const router = express.Router();
const cellController = require('../controllers/celldata.controller');

// 获取小区列表
router.get('/list', cellController.getList);

// 添加小区
router.post('/add', cellController.addCell);

// 更新小区
router.post('/update', cellController.updateCell);

// 删除小区
router.delete('/remove/:cgi', cellController.removeCell);

// 批量删除小区
router.post('/batch-delete', cellController.batchDeleteCells);

// 检查CGI是否存在
router.get('/check/:cgi', cellController.checkCGI);

// 导入Excel
router.post('/upload', cellController.importExcel);

// 导出Excel
router.get('/export', cellController.exportExcel);

module.exports = router;
