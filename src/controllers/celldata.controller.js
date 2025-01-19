/**
 * 小区管理控制器
 */
const { Op } = require('sequelize');
const xlsx = require('xlsx');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const CellData = require('../models/entity/CellData');

/**
 * 获取小区列表
 */
const getList = async (req, res) => {
  try {
    // 确保 page 和 pageSize 是数字类型
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const { field, keyword } = req.query;

    let where = {};
    if (field && keyword && field !== "all") {
      where[field] = { [Op.like]: `%${keyword}%` };
    } else if (keyword) {
      where = {
        [Op.or]: [
          { CGI: { [Op.like]: `%${keyword}%` } },
          { eNBName: { [Op.like]: `%${keyword}%` } },
          { userLabel: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const { count, rows } = await CellData.findAndCountAll({
      where,
      offset,
      limit,
      order: [["CGI", "ASC"]]
    });

    return res.json(
      success({
        total: count,
        list: rows.map((row) => {
          const data = row.toJSON();
          // 确保数值类型的字段被正确转换
          return {
            ...data,
            Latitude: data.Latitude ? parseFloat(data.Latitude) : null,
            Longitude: data.Longitude ? parseFloat(data.Longitude) : null,
            PCI: data.PCI ? parseInt(data.PCI) : null,
            eNodeBID: data.eNodeBID ? parseInt(data.eNodeBID) : null,
            Azimuth: data.Azimuth ? parseInt(data.Azimuth) : null,
            Earfcn: data.Earfcn ? parseInt(data.Earfcn) : null,
            Freq: data.Freq ? parseInt(data.Freq) : null
          };
        })
      })
    );
  } catch (err) {
    logger.error("获取小区列表失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 添加小区
 */
const addCell = async (req, res) => {
  try {
    const data = req.body;
    const existingRecord = await CellData.findOne({
      where: { CGI: data.CGI }
    });

    if (existingRecord) {
      return res.status(400).json(error("CGI已存在,不能重复添加", 400));
    }

    await CellData.create(data);
    return res.json(success(null, "新增成功"));
  } catch (err) {
    logger.error("添加小区失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 更新小区
 */
const updateCell = async (req, res) => {
  try {
    const data = req.body;
    const result = await CellData.update(data, {
      where: { CGI: data.CGI }
    });

    if (result[0] === 0) {
      return res.status(404).json(error("没有字段需要更新", 404));
    }

    return res.json(success(null, "更新成功"));
  } catch (err) {
    logger.error("更新小区失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 删除小区
 */
const removeCell = async (req, res) => {
  try {
    const { cgi } = req.params;
    const result = await CellData.destroy({
      where: { CGI: cgi }
    });

    if (result === 0) {
      return res.status(404).json(error("未找到要删除的记录", 404));
    }

    return res.json(success(null, "删除成功"));
  } catch (err) {
    logger.error("删除小区失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 批量删除小区
 */
const batchDeleteCells = async (req, res) => {
  try {
    const { cgis } = req.body;
    if (!Array.isArray(cgis) || cgis.length === 0) {
      return res.status(400).json(error("请提供有效的CGI列表", 400));
    }

    const result = await CellData.destroy({
      where: { CGI: { [Op.in]: cgis } }
    });

    return res.json(success({ deletedCount: result }, "批量删除成功"));
  } catch (err) {
    logger.error("批量删除小区失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 检查CGI是否存在
 */
const checkCGI = async (req, res) => {
  try {
    const { cgi } = req.params;
    const exists = await CellData.findOne({
      where: { CGI: cgi }
    });

    return res.json(success({ exists: !!exists }));
  } catch (err) {
    logger.error("检查CGI失败:", err);
    return res.status(500).json(error(err.message));
  }
};

/**
 * 导入Excel文件
 */
const importExcel = async (req, res) => {
  const transaction = await CellData.sequelize.transaction();

  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json(error("没有上传文件", 400));
    }

    const workbook = xlsx.read(req.files.file.data);
    if (!workbook.SheetNames.includes("CellData")) {
      return res.status(400).json(error("文件中未找到 CellData 工作表", 400));
    }

    const sheet = workbook.Sheets["CellData"];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // 验证和转换数据
    const data = rawData.map((row, index) => {
      // 验证必填字段
      const requiredFields = ["CGI", "eNodeBID", "PCI", "Earfcn"];
      for (const field of requiredFields) {
        if (
          row[field] === undefined ||
          row[field] === null ||
          row[field] === ""
        ) {
          throw new Error(`第${index + 1}行缺少必填字段: ${field}`);
        }
      }

      // 数据类型转换
      return {
        CGI: String(row.CGI),
        eNodeBID: parseInt(row.eNodeBID),
        PCI: parseInt(row.PCI),
        Azimuth:
          row.Azimuth !== undefined && row.Azimuth !== ""
            ? parseInt(row.Azimuth)
            : null,
        Earfcn: parseInt(row.Earfcn),
        Freq:
          row.Freq !== undefined && row.Freq !== "" ? parseInt(row.Freq) : null,
        eNBName: row.eNBName || null,
        UserLabel: row.UserLabel || null,
        Longitude:
          row.Longitude !== undefined && row.Longitude !== ""
            ? parseFloat(row.Longitude)
            : null,
        Latitude:
          row.Latitude !== undefined && row.Latitude !== ""
            ? parseFloat(row.Latitude)
            : null
      };
    });
    logger.info("处理CellData数据");

    // 使用模型的 bulkUpsert 方法，有则更新, 无则插入
    const results = await CellData.bulkUpsert(data, { transaction });

    await transaction.commit();

    const successCount = results.inserted + results.updated;
    const successRate = ((successCount / results.total) * 100).toFixed(2);

    return res.json(
      success(
        {
          ...results,
          success: successCount,
          successRate: `${successRate}%`
        },
        "文件处理成功"
      )
    );
  } catch (err) {
    await transaction.rollback();
    logger.error("导入Excel失败:", err);
    return res.status(500).json(error("文件处理失败: " + err.message));
  }
};

/**
 * 导出Excel文件
 */
const exportExcel = async (_req, res) => {
    try {
        const data = await CellData.findAll();
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(
            data.map(item => item.toJSON())
        );
        xlsx.utils.book_append_sheet(workbook, worksheet, 'CellData');

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=CellData.xlsx'
        );

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return res.send(buffer);
    } catch (err) {
        logger.error('导出Excel失败:', err);
        return res.status(500).json(error(err.message));
    }
};

module.exports = {
    getList,
    addCell,
    updateCell,
    removeCell,
    batchDeleteCells,
    checkCGI,
    importExcel,
    exportExcel
};
