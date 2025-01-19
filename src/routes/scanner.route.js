const express = require('express');
const router = express.Router();
const {
    getScannerList,
    getScanner,
    registerScanner,
    setGateway,
    addNDS,
    deleteNDS,
    updateScanner,
    deleteScanner
} = require('../controllers/scanner.controller');

/**
 * 扫描器路由
 */

// 获取扫描器列表
router.get('/', getScannerList);

// 获取单个扫描器信息
router.get('/:ID', getScanner);

// 注册扫描器
router.post('/register', registerScanner);

// 设置扫描器对应的网关
router.post('/gateway', setGateway);

// 批量添加NDS服务器映射
router.post('/nds', addNDS);

// 批量删除NDS服务器映射
router.delete('/nds', deleteNDS);

// 修改扫描器信息
router.put('/:ID', updateScanner);

// 删除扫描器
router.delete('/:ID', deleteScanner);

module.exports = router;
