/**
 * 扫描器控制器
 */
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");
const ScannerList = require("../models/entity/ScannerList");
const NDSList = require("../models/entity/NDSList");
const GatewayList = require("../models/entity/GatewayList");
const ScannerNDSMap = require("../models/entity/ScannerNDSMap");
const { getClientIP } = require("../utils/client_host");
const { sequelize } = require("../database/mysql");

/**
 * 获取扫描器列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getScannerList = async (req, res) => {
  try {
    const scanners = await ScannerList.findAll({
      include: [
        {
          model: NDSList,
          through: ScannerNDSMap,
          as: "ndsList"
        },
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });
    return res.json(success(scanners));
  } catch (err) {
    logger.error("获取扫描器列表失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 获取单个扫描器信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getScanner = async (req, res) => {
  try {
    const { ID } = req.params;
    const scanner = await ScannerList.findByPk(ID, {
      include: [
        {
          model: NDSList,
          through: ScannerNDSMap,
          as: "ndsList"
        },
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });

    if (!scanner) {
      return res.status(404).json(error("扫描器不存在", 404));
    }

    return res.json(success(scanner));
  } catch (err) {
    logger.error("获取扫描器信息失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 注册扫描器
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const registerScanner = async (req, res) => {
  try {
    const clientIp = getClientIP(req);
    const { ID, Port } = req.body;

    if (!Port) {
      return res.status(400).json(error("端口号是必需的", 400));
    }

    let scanner;
    if (ID && ID !== -1) {
      scanner = await ScannerList.findByPk(ID);
      if (!scanner) {
        return res.status(404).json(error("扫描器不存在", 404));
      }
      await scanner.update({
        Status: 1,
        Host: clientIp,
        Port: Port
      });
    } else {
      scanner = await ScannerList.create({
        NodeName: `Scanner-${Math.random().toString(36).substring(2, 9)}`,
        Status: 1,
        Host: clientIp,
        Port: Port,
        Switch: 0
      });

      await scanner.update({
        NodeName: `Scanner-${scanner.ID}`
      });
    }

    return res.json(success(scanner));
  } catch (err) {
    logger.error("注册扫描器失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 设置扫描器的网关
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const setGateway = async (req, res) => {
  try {
    const { scannerId, gatewayId } = req.body;

    const scanner = await ScannerList.findByPk(scannerId);
    if (!scanner) {
      return res.status(404).json(error("扫描器不存在", 404));
    }

    const gateway = await GatewayList.findByPk(gatewayId);
    if (!gateway) {
      return res.status(404).json(error("网关不存在", 404));
    }

    await scanner.update({ GatewayID: gatewayId });
    
    // 重新获取更新后的扫描器信息（包含关联数据）
    const updatedScanner = await ScannerList.findByPk(scannerId, {
      include: [
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });
    
    return res.json(success(updatedScanner));
  } catch (err) {
    logger.error("设置扫描器网关失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 设置扫描器的NDS服务器
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const setNDS = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { scannerId, ndsId } = req.body;

    // 验证参数类型
    if (typeof scannerId !== 'number' || typeof ndsId !== 'number') {
      return res.status(400).json(error("参数类型错误：scannerId和ndsId必须是数字", 400));
    }

    const scanner = await ScannerList.findByPk(scannerId);
    if (!scanner) {
      return res.status(404).json(error("扫描器不存在", 404));
    }

    const nds = await NDSList.findByPk(ndsId);
    if (!nds) {
      return res.status(404).json(error("NDS服务器不存在", 404));
    }

    // 清除旧的映射关系
    await ScannerNDSMap.destroy({
      where: { scannerId: scannerId },
      transaction: t
    });

    // 创建新的映射关系
    await ScannerNDSMap.create(
      {
        scannerId: scannerId,
        ndsId: ndsId
      },
      { transaction: t }
    );

    await t.commit();

    // 重新获取更新后的扫描器信息（包含关联数据）
    const updatedScanner = await ScannerList.findByPk(scannerId, {
      include: [
        {
          model: NDSList,
          through: ScannerNDSMap,
          as: "ndsList"
        },
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });
    
    return res.json(success(updatedScanner, "关联添加成功"));
  } catch (err) {
    await t.rollback();
    logger.error("设置扫描器NDS服务器失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 添加NDS服务器映射
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const addNDS = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { scannerId, ndsIds } = req.body;

    // 验证参数类型
    if (typeof scannerId !== 'number') {
      return res.status(400).json(error("参数类型错误：scannerId必须是数字", 400));
    }
    
    if (!Array.isArray(ndsIds)) {
      return res.status(400).json(error("参数类型错误：ndsIds必须是数组", 400));
    }

    // 验证数组元素类型
    if (!ndsIds.every(id => typeof id === 'number')) {
      return res.status(400).json(error("参数类型错误：ndsIds数组的所有元素必须是数字", 400));
    }

    // 使用大写的 ID 字段查找扫描器
    const scanner = await ScannerList.findOne({
      where: { ID: scannerId }
    });

    if (!scanner) {
      await t.rollback();
      return res.status(404).json(error("扫描器不存在", 404));
    }

    // 验证所有NDS服务器是否存在
    const ndsList = await NDSList.findAll({
      where: { ID: ndsIds }
    });

    if (ndsList.length !== ndsIds.length) {
      await t.rollback();
      return res.status(404).json(error("部分NDS服务器不存在", 404));
    }

    // 获取已存在的映射
    const existingMaps = await ScannerNDSMap.findAll({
      where: {
        scannerId: scannerId,
        ndsId: ndsIds
      }
    });

    // 过滤出需要新建的映射
    const existingNdsIds = existingMaps.map(map => map.ndsId);
    const newNdsIds = ndsIds.filter(id => !existingNdsIds.includes(id));

    if (newNdsIds.length > 0) {
      // 创建新的映射关系
      await Promise.all(
        newNdsIds.map((ndsId) =>
          ScannerNDSMap.create(
            {
              scannerId: scannerId,
              ndsId: ndsId
            },
            { transaction: t }
          )
        )
      );
    }

    await t.commit();

    // 重新获取更新后的扫描器信息（包含关联数据）
    const updatedScanner = await ScannerList.findOne({
      where: { ID: scannerId },
      include: [
        {
          model: NDSList,
          through: ScannerNDSMap,
          as: "ndsList"
        },
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });
    
    return res.json(success(updatedScanner, "关联添加成功"));
  } catch (err) {
    await t.rollback();
    logger.error("添加NDS服务器映射失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 批量删除NDS服务器映射
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const deleteNDS = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { scannerId, ndsIds } = req.body;

    // 验证参数类型
    if (typeof scannerId !== 'number') {
      return res.status(400).json(error("参数类型错误：scannerId必须是数字", 400));
    }
    
    if (!Array.isArray(ndsIds)) {
      return res.status(400).json(error("参数类型错误：ndsIds必须是数组", 400));
    }

    // 验证数组元素类型
    if (!ndsIds.every(id => typeof id === 'number')) {
      return res.status(400).json(error("参数类型错误：ndsIds数组的所有元素必须是数字", 400));
    }

    const scanner = await ScannerList.findByPk(scannerId);
    if (!scanner) {
      return res.status(404).json(error("扫描器不存在", 404));
    }

    // 批量删除映射关系
    await ScannerNDSMap.destroy({
      where: {
        scannerId: scannerId,
        ndsId: ndsIds
      },
      transaction: t
    });

    await t.commit();

    // 重新获取更新后的扫描器信息（包含关联数据）
    const updatedScanner = await ScannerList.findByPk(scannerId, {
      include: [
        {
          model: NDSList,
          through: ScannerNDSMap,
          as: "ndsList"
        },
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });
    
    return res.json(success(updatedScanner, "关联删除成功"));
  } catch (err) {
    await t.rollback();
    logger.error("删除NDS服务器映射失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 更新扫描器信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const updateScanner = async (req, res) => {
  try {
    const { ID } = req.params;
    const updateData = req.body;

    // 防止修改id
    delete updateData.ID;

    const scanner = await ScannerList.findByPk(ID);
    if (!scanner) {
      return res.status(404).json(error("扫描器不存在", 404));
    }

    await scanner.update(updateData);
    return res.json(success(scanner));
  } catch (err) {
    logger.error("更新扫描器信息失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 删除扫描器
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const deleteScanner = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { ID } = req.params;

    const scanner = await ScannerList.findByPk(ID);
    if (!scanner) {
      return res.status(404).json(error("扫描器不存在", 404));
    }

    // 删除相关的NDS映射
    await ScannerNDSMap.destroy({
      where: { scannerId: ID },
      transaction: t
    });

    // 删除扫描器
    await scanner.destroy({ transaction: t });

    await t.commit();
    return res.json(success({ message: "删除扫描器成功" }));
  } catch (err) {
    await t.rollback();
    logger.error("删除扫描器失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

module.exports = {
  getScannerList,
  getScanner,
  registerScanner,
  setGateway,
  addNDS,
  deleteNDS,
  updateScanner,
  deleteScanner
};
