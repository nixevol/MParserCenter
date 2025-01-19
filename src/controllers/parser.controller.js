/**
 * 解析器控制器
 */
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");
const { sequelize } = require("../database/mysql");
const ParserList = require("../models/entity/ParserList");
const GatewayList = require("../models/entity/GatewayList");

/**
 * 获取解析器列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getParserList = async (req, res) => {
  try {
    const { Status } = req.query;
    const where = {};

    if (Status !== undefined) {
      where.Status = parseInt(Status);
    }

    const parsers = await ParserList.findAll({
      where,
      include: [
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });

    return res.json(success(parsers));
  } catch (err) {
    logger.error("获取解析器列表失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 获取单个解析器信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getParser = async (req, res) => {
  try {
    const { id } = req.params;
    const parser = await ParserList.findOne({
      where: { ID: id },
      include: [
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });

    if (!parser) {
      return res.status(404).json(error("解析器不存在", 404));
    }

    return res.json(success(parser));
  } catch (err) {
    logger.error("获取解析器信息失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 注册解析器
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const registerParser = async (req, res) => {
  try {
    const clientIp = req.ip.replace(/^::ffff:/, "");
    const parser = await ParserList.registerParser(req.body, clientIp);
    return res.json(success(parser, "解析器注册成功"));
  } catch (err) {
    logger.error("注册解析器失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 设置解析器的网关
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const setGateway = async (req, res) => {
  try {
    const { parserId, gatewayId } = req.body;

    // 验证参数类型
    if (typeof parserId !== 'number' || typeof gatewayId !== 'number') {
      return res.status(400).json(error("参数类型错误：parserId和gatewayId必须是数字", 400));
    }

    // 检查解析器是否存在
    const parser = await ParserList.findOne({
      where: { ID: parserId }
    });

    if (!parser) {
      return res.status(404).json(error("解析器不存在", 404));
    }

    // 检查网关是否存在
    const gateway = await GatewayList.findOne({
      where: { ID: gatewayId }
    });

    if (!gateway) {
      return res.status(404).json(error("网关不存在", 404));
    }

    // 开始事务
    const t = await sequelize.transaction();

    try {
      // 更新解析器的网关ID
      await parser.update({ GatewayID: gatewayId }, { transaction: t });
      await t.commit();

      // 重新获取更新后的解析器信息（包含关联数据）
      const updatedParser = await ParserList.findOne({
        where: { ID: parserId },
        include: [
          {
            model: GatewayList,
            as: "gateway"
          }
        ]
      });

      return res.json(success(updatedParser, "网关设置成功"));
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    logger.error("设置网关失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 更新解析器信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const updateParser = async (req, res) => {
  try {
    const { id } = req.params;
    const { NodeName, Status, Switch, Threads } = req.body;

    const parser = await ParserList.findOne({
      where: { ID: id }
    });

    if (!parser) {
      return res.status(404).json(error("解析器不存在", 404));
    }

    const updateData = {};
    if (NodeName !== undefined) updateData.NodeName = NodeName;
    if (Status !== undefined) updateData.Status = Status;
    if (Switch !== undefined) updateData.Switch = Switch;
    if (Threads !== undefined) updateData.Threads = Threads;

    await parser.update(updateData);

    // 重新获取更新后的解析器信息
    const updatedParser = await ParserList.findOne({
      where: { ID: id },
      include: [
        {
          model: GatewayList,
          as: "gateway"
        }
      ]
    });

    return res.json(success(updatedParser, "解析器更新成功"));
  } catch (err) {
    logger.error("更新解析器失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

/**
 * 删除解析器
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const deleteParser = async (req, res) => {
  try {
    const { id } = req.params;
    const parser = await ParserList.findOne({
      where: { ID: id }
    });

    if (!parser) {
      return res.status(404).json(error("解析器不存在", 404));
    }

    await parser.destroy();
    return res.json(success(null, "解析器删除成功"));
  } catch (err) {
    logger.error("删除解析器失败:", err);
    return res.status(500).json(error(err.message, 500));
  }
};

module.exports = {
  getParserList,
  getParser,
  registerParser,
  setGateway,
  updateParser,
  deleteParser
};
