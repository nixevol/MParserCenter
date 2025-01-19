const request = require("supertest");
const { sequelize } = require("../database/mysql");
const ScannerList = require("../models/entity/ScannerList");
const NDSList = require("../models/entity/NDSList");
const ScannerNDSMap = require("../models/entity/ScannerNDSMap");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// 配置中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 加载路由
app.use("/api/scanner", require("../routes/scanner.route"));

// 增加超时时间
jest.setTimeout(30000);

describe("Scanner API Tests", () => {
  let testScanner;
  let testNDS1;
  let testNDS2;

  beforeEach(async () => {
    // 清理测试数据
    await ScannerNDSMap.destroy({ where: {} });
    await ScannerList.destroy({ where: {} });
    await NDSList.destroy({ where: {} });

    // 创建测试扫描器
    testScanner = await ScannerList.create({
      NodeName: "Test Scanner",
      Host: "192.168.1.100",
      Port: 8080,
      Status: 1,
      Switch: 1
    });

    // 创建测试NDS1
    testNDS1 = await NDSList.create({
      Name: "Test NDS 1",
      Address: "192.168.1.201",
      Port: 2121,
      Protocol: "SFTP",
      Account: "test1",
      Password: "test123",
      MRO_Path: "/MR/MRO/",
      MRO_Filter: "^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$",
      MDT_Path: "/MDT/",
      MDT_Filter: "^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$",
      Switch: 1
    });

    // 创建测试NDS2
    testNDS2 = await NDSList.create({
      Name: "Test NDS 2",
      Address: "192.168.1.202",
      Port: 2121,
      Protocol: "SFTP",
      Account: "test2",
      Password: "test123",
      MRO_Path: "/MR/MRO/",
      MRO_Filter: "^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$",
      MDT_Path: "/MDT/",
      MDT_Filter: "^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$",
      Switch: 1
    });
  });

  afterAll(async () => {
    try {
      // 清理测试数据
      await Promise.all([
        ScannerNDSMap.destroy({ where: {} }),
        ScannerList.destroy({ where: {} }),
        NDSList.destroy({ where: {} })
      ]);
      // 关闭数据库连接
      await sequelize.close();
      // 等待所有挂起的Promise完成
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('清理过程中出错:', error);
      throw error;
    }
  });

  describe("GET /api/scanner", () => {
    it("应该返回扫描器列表", async () => {
      const response = await request(app).get("/api/scanner");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].ID).toBe(testScanner.ID);
    }, 30000);

    it("应该根据状态过滤扫描器", async () => {
      const response = await request(app).get("/api/scanner?Status=1");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].Status).toBe(1);
    }, 30000);
  });

  describe("GET /api/scanner/:id", () => {
    it("应该返回单个扫描器信息", async () => {
      const response = await request(app).get(`/api/scanner/${testScanner.ID}`);
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.ID).toBe(testScanner.ID);
      expect(response.body.data.NodeName).toBe(testScanner.NodeName);
    }, 30000);

    it("对于不存在的扫描器ID应返回404", async () => {
      const response = await request(app).get("/api/scanner/999999");
      
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe("扫描器不存在");
    }, 30000);
  });

  describe("POST /api/scanner/nds", () => {
    it("应该批量添加NDS关联", async () => {
      const response = await request(app)
        .post("/api/scanner/nds")
        .send({
          scannerId: testScanner.ID,
          ndsIds: [testNDS1.ID, testNDS2.ID]
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe("关联添加成功");

      // 验证关联是否创建成功
      const associations = await ScannerNDSMap.findAll({
        where: {
          scannerId: testScanner.ID
        }
      });
      expect(associations).toHaveLength(2);
      expect(associations.map(a => a.ndsId)).toContain(testNDS1.ID);
      expect(associations.map(a => a.ndsId)).toContain(testNDS2.ID);
    }, 30000);

    it("对于不存在的扫描器应返回404", async () => {
      const response = await request(app)
        .post("/api/scanner/nds")
        .send({
          scannerId: 99999,
          ndsIds: [testNDS1.ID, testNDS2.ID]
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe("扫描器不存在");
    }, 30000);

    it("对于无效的ndsIds参数应返回400", async () => {
      const response = await request(app)
        .post("/api/scanner/nds")
        .send({
          scannerId: testScanner.ID,
          ndsIds: "not-an-array"
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe("参数类型错误：ndsIds必须是数组");
    }, 30000);
  });

  describe("DELETE /api/scanner/nds", () => {
    beforeEach(async () => {
      // 创建测试关联
      await ScannerNDSMap.bulkCreate([
        { scannerId: testScanner.ID, ndsId: testNDS1.ID },
        { scannerId: testScanner.ID, ndsId: testNDS2.ID }
      ]);
    });

    it("应该批量删除NDS关联", async () => {
      const response = await request(app)
        .delete("/api/scanner/nds")
        .send({
          scannerId: testScanner.ID,
          ndsIds: [testNDS1.ID, testNDS2.ID]
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe("关联删除成功");

      // 验证关联是否删除成功
      const associations = await ScannerNDSMap.findAll({
        where: {
          scannerId: testScanner.ID
        }
      });
      expect(associations).toHaveLength(0);
    }, 30000);

    it("对于不存在的扫描器应返回404", async () => {
      const response = await request(app)
        .delete("/api/scanner/nds")
        .send({
          scannerId: 99999,
          ndsIds: [testNDS1.ID, testNDS2.ID]
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe("扫描器不存在");
    }, 30000);

    it("对于无效的ndsIds参数应返回400", async () => {
      const response = await request(app)
        .delete("/api/scanner/nds")
        .send({
          scannerId: testScanner.ID,
          ndsIds: "not-an-array"
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe("参数类型错误：ndsIds必须是数组");
    }, 30000);
  });
});
