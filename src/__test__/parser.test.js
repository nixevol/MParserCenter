const request = require("supertest");
const { sequelize } = require("../database/mysql");
const ParserList = require("../models/entity/ParserList");
const GatewayList = require("../models/entity/GatewayList");
const ScannerList = require("../models/entity/ScannerList");
const ScannerNDSMap = require("../models/entity/ScannerNDSMap");
const NDSList = require("../models/entity/NDSList");
const app = require("../app");

describe("Parser API Tests", () => {
  let testParser;
  let testGateway;

  beforeAll(async () => {
    try {
      // 等待数据库连接
      await sequelize.authenticate();
      
      // 同步数据库模型（创建表），需要按照正确的顺序处理外键依赖
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');  // 暂时禁用外键检查
      
      // 同步所有表
      await ScannerNDSMap.sync({ force: true });
      await ScannerList.sync({ force: true });
      await ParserList.sync({ force: true });
      await GatewayList.sync({ force: true });
      await NDSList.sync({ force: true });
      
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');  // 重新启用外键检查

      // 创建测试数据
      testParser = await ParserList.create({
        NodeName: "Test Parser",
        Status: 1,
        Host: "127.0.0.1",
        Port: 8081,
        Threads: 4
      });

      testGateway = await GatewayList.create({
        NodeName: "Test Gateway",
        Status: 1,
        Host: "127.0.0.1",
        Port: 8080
      });
    } catch (error) {
      console.error("数据库初始化失败:", error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    try {
      await sequelize.close();
    } catch (error) {
      console.error("关闭数据库连接失败:", error);
    }
  });

  describe("基本CRUD操作", () => {
    describe("GET /api/parser", () => {
      it("应该返回解析器列表", async () => {
        const response = await request(app)
          .get("/api/parser")
          .expect(200);
        
        expect(response.body.code).toBe(200);
        expect(response.body.data).toHaveLength(1);
      });
    });

    describe("GET /api/parser/:id", () => {
      it("应该返回单个解析器", async () => {
        const response = await request(app)
          .get(`/api/parser/${testParser.ID}`)
          .expect(200);
        
        expect(response.body.code).toBe(200);
        expect(response.body.data.NodeName).toBe("Test Parser");
      });

      it("不存在的ID应返回404", async () => {
        const response = await request(app)
          .get("/api/parser/999999")
          .expect(404);
        
        expect(response.body.code).toBe(404);
      });
    });

    describe("POST /api/parser/register", () => {
      it("应该注册新解析器", async () => {
        const response = await request(app)
          .post("/api/parser/register")
          .send({
            Port: 8082,
            Threads: 6
          })
          .expect(200);
        
        expect(response.body.code).toBe(200);
        expect(response.body.data.Port).toBe(8082);
      });

      it("应该更新现有解析器", async () => {
        const response = await request(app)
          .post("/api/parser/register")
          .send({
            ID: testParser.ID,
            Port: 8083
          })
          .expect(200);
        
        expect(response.body.code).toBe(200);
        expect(response.body.data.Port).toBe(8083);
      });
    });

    describe("PUT /api/parser/:id", () => {
      it("应该更新解析器", async () => {
        const response = await request(app)
          .put(`/api/parser/${testParser.ID}`)
          .send({
            NodeName: "Updated Parser",
            Threads: 8
          })
          .expect(200);
        
        expect(response.body.code).toBe(200);
        expect(response.body.data.NodeName).toBe("Updated Parser");
      });
    });
  });

  describe("网关关联操作", () => {
    describe("POST /api/parser/gateway", () => {
      it("应该设置网关", async () => {
        const response = await request(app)
          .post("/api/parser/gateway")
          .send({
            parserId: testParser.ID,
            gatewayId: testGateway.ID
          })
          .expect(200);
        
        expect(response.body.code).toBe(200);
      });

      it("不存在的解析器ID应返回404", async () => {
        const response = await request(app)
          .post("/api/parser/gateway")
          .send({
            parserId: 999999,
            gatewayId: testGateway.ID
          })
          .expect(404);
        
        expect(response.body.code).toBe(404);
      });

      it("不存在的网关ID应返回404", async () => {
        const response = await request(app)
          .post("/api/parser/gateway")
          .send({
            parserId: testParser.ID,
            gatewayId: 999999
          })
          .expect(404);
        
        expect(response.body.code).toBe(404);
      });
    });
  });

  describe("DELETE /api/parser/:id", () => {
    it("应该删除解析器", async () => {
      const response = await request(app)
        .delete(`/api/parser/${testParser.ID}`)
        .expect(200);
      
      expect(response.body.code).toBe(200);
    });
  });
});
