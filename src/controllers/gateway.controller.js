/**
 * 网关控制器
 */
const { Op } = require("sequelize");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");
const GatewayList = require("../models/entity/GatewayList");
const NDSList = require("../models/entity/NDSList");
const GatewayNDSMap = require("../models/entity/GatewayNDSMap");
const sequelize = require("../database/mysql"); // 引入sequelize实例

/**
 * 获取客户端真实IP
 * @param {Object} req - 请求对象
 * @returns {string} 客户端IP
 */
const getClientIP = (req) => {
  // 尝试从X-Forwarded-For获取
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // 取第一个IP（最原始的客户端IP）
    const ips = forwardedFor.split(",");
    const clientIP = ips[0].trim();
    if (clientIP && clientIP !== "::1" && clientIP !== "127.0.0.1") {
      return clientIP;
    }
  }

  // 尝试从X-Real-IP获取
  const realIP = req.headers["x-real-ip"];
  if (realIP && realIP !== "::1" && realIP !== "127.0.0.1") {
    return realIP;
  }

  // 从socket获取
  const ip = req.socket.remoteAddress;
  if (ip) {
    // 去除IPv6前缀
    const realIP = ip.replace(/^::ffff:/, "");
    if (realIP && realIP === "::1") {
      return "127.0.0.1";
    }
    return realIP;
  }

  return "127.0.0.1";
};

/**
 * 网关注册
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const registerGateway = async (req, res) => {
  try {
    const clientIp = getClientIP(req);
    const { port } = req.body;

    if (!port) {
      return res.status(400).json(error("端口号是必需的"));
    }

    const gateway = await GatewayList.registerGateway(req.body, clientIp);
    return res.json(success(gateway));
  } catch (err) {
    logger.error("网关注册失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 更新网关配置
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const updateGateway = async (req, res) => {
  try {
    const { ID } = req.params;
    const updateData = req.body;

    // 防止修改id
    delete updateData.ID;

    const gateway = await GatewayList.findByPk(ID);
    if (!gateway) {
      return res.status(404).json(error("网关不存在"));
    }

    await gateway.update(updateData);
    return res.json(success(gateway));
  } catch (err) {
    logger.error("更新网关配置失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 获取网关列表
 */
const getGatewayList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const where = {};

    if (status !== undefined) {
      where.status = parseInt(status);
    }

    const { count, rows } = await GatewayList.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [["ID", "DESC"]]
    });

    return res.json(
      success({
        total: count,
        list: rows,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      })
    );
  } catch (err) {
    logger.error("获取网关列表失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 获取网关详情
 */
const getGateway = async (req, res) => {
  try {
    const { ID } = req.params;
    const gateway = await GatewayList.findByPk(ID);

    if (!gateway) {
      return res.status(404).json(error("网关不存在"));
    }

    return res.json(success(gateway));
  } catch (err) {
    logger.error("获取网关详情失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 删除网关
 */
const deleteGateway = async (req, res) => {
  try {
    const { ID } = req.params;
    const gateway = await GatewayList.findByPk(ID);

    if (!gateway) {
      return res.status(404).json(error("网关不存在"));
    }

    await gateway.destroy();
    return res.json(success(null, "删除成功"));
  } catch (err) {
    logger.error("删除网关失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 网关登出
 */
const logoutGateway = async (req, res) => {
  try {
    const { ID } = req.params;
    const gateway = await GatewayList.findByPk(ID);

    if (!gateway) {
      return res.status(404).json(error("网关不存在"));
    }

    await gateway.update({ status: 0 });
    return res.json(success(null, "登出成功"));
  } catch (err) {
    logger.error("网关登出失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 获取网关关联的NDS列表
 */
const getGatewayNDSList = async (req, res) => {
  try {
    const { ID } = req.params;

    // 查找网关
    const gateway = await GatewayList.findByPk(ID);
    if (!gateway) {
      return res.status(404).json(error("网关不存在"));
    }

    // 查找关联的NDS列表
    const ndsList = await NDSList.findAll({
      include: [{
        model: GatewayNDSMap,
        where: { gatewayId: gateway.ID },
        required: true,
        attributes: [],
        as: 'GatewayNDSMaps'  // 添加关联别名
      }]
    });

    return res.json(success(ndsList));
  } catch (err) {
    logger.error("获取网关关联的NDS列表失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 更新网关关联的NDS
 */
const updateGatewayNDS = async (req, res) => {
  try {
    const { ID } = req.params;
    const { ndsIds } = req.body;

    if (!Array.isArray(ndsIds)) {
      return res.status(400).json(error("ndsIds必须是数组"));
    }

    // 查找网关
    const gateway = await GatewayList.findByPk(ID);
    if (!gateway) {
      return res.status(404).json(error("网关不存在"));
    }

    // 验证所有NDS是否存在
    const ndsList = await NDSList.findAll({
      where: {
        ID: ndsIds
      }
    });

    if (ndsList.length !== ndsIds.length) {
      return res.status(400).json(error("存在无效的NDS ID"));
    }

    // 使用事务确保操作的原子性
    await sequelize.sequelize.transaction(async (t) => {
      // 删除旧的关联关系
      await GatewayNDSMap.destroy({
        where: { gatewayId: gateway.ID },
        transaction: t
      });

      // 创建新的关联关系
      if (ndsIds.length > 0) {
        const mappings = ndsIds.map((ndsId) => ({
          gatewayId: gateway.ID,
          ndsId
        }));
        await GatewayNDSMap.bulkCreate(mappings, { transaction: t });
      }
    });

    // 获取更新后的关联列表
    const updatedNDSList = await NDSList.findAll({
      include: [{
        model: GatewayNDSMap,
        where: { gatewayId: gateway.ID },
        required: true,
        attributes: []
      }]
    });

    return res.json(success(updatedNDSList));
  } catch (err) {
    logger.error("更新网关关联的NDS失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 添加网关关联的NDS
 */
const addGatewayNDS = async (req, res) => {
  try {
    const { ID } = req.params;
    const { ndsId } = req.body;

    const gateway = await GatewayList.findByPk(ID);
    if (!gateway) {
      return res.status(404).json(error("网关不存在"));
    }

    const nds = await NDSList.findByPk(ndsId);
    if (!nds) {
      return res.status(404).json(error("NDS不存在"));
    }

    // 创建关联关系
    await GatewayNDSMap.create({
      gatewayId: gateway.ID,
      ndsId
    });

    return res.json(success(null, "关联添加成功"));
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json(error("该关联已存在"));
    }
    logger.error("添加网关关联的NDS失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 删除网关关联的NDS
 */
const removeGatewayNDS = async (req, res) => {
  try {
    const { ID, ndsId } = req.params;

    const gateway = await GatewayList.findByPk(ID);
    if (!gateway) {
      return res.status(404).json(error("网关不存在"));
    }

    const nds = await NDSList.findByPk(ndsId);
    if (!nds) {
      return res.status(404).json(error("NDS不存在"));
    }

    // 删除关联关系
    const deleted = await GatewayNDSMap.destroy({
      where: {
        gatewayId: gateway.ID,
        ndsId
      }
    });

    if (!deleted) {
      return res.status(404).json(error("关联不存在"));
    }

    return res.json(success(null, "关联删除成功"));
  } catch (err) {
    logger.error("删除网关关联的NDS失败:", err);
    return res.status(500).json(error(err.message));
  }
};

module.exports = {
  registerGateway,
  updateGateway,
  deleteGateway,
  getGateway,
  getGatewayList,
  logoutGateway,
  getGatewayNDSList,
  updateGatewayNDS,
  addGatewayNDS,
  removeGatewayNDS
};
