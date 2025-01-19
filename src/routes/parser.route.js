/**
 * 解析器路由
 */
const express = require("express");
const router = express.Router();
const {
  getParserList,
  getParser,
  registerParser,
  setGateway,
  updateParser,
  deleteParser
} = require("../controllers/parser.controller");

// 获取解析器列表
router.get("/", getParserList);

// 获取单个解析器
router.get("/:id", getParser);

// 注册解析器
router.post("/register", registerParser);

// 设置网关
router.post("/gateway", setGateway);

// 更新解析器
router.put("/:id", updateParser);

// 删除解析器
router.delete("/:id", deleteParser);

module.exports = router;
