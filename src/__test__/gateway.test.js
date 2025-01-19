const request = require("supertest");
const { sequelize } = require("../database/mysql");
const GatewayList = require("../models/entity/GatewayList");
const NDSList = require("../models/entity/NDSList");
const GatewayNDSMap = require("../models/entity/GatewayNDSMap");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// 配置中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 加载路由
app.use("/api/gateway", require("../routes/gateway.route"));

describe("Gateway API Tests", () => {
  let testGateway;
  let testNDS;

  beforeEach(async () => {
    // 清理测试数据
    await GatewayNDSMap.destroy({ where: {} });
    await GatewayList.destroy({ where: {} });
    await NDSList.destroy({ where: {} });

    // 创建测试网关
    testGateway = await GatewayList.create({
      NodeName: "Test Gateway",
      Host: "192.168.1.100",
      Port: 8080,
      Status: 1,
      Switch: 1
    });

    // 创建测试NDS
    testNDS = await NDSList.create({
      Name: "Test NDS",
      Address: "192.168.1.200",
      Port: 2121,
      Protocol: "SFTP",
      Account: "test",
      Password: "test123",
      MRO_Path: "/MR/MRO/",
      MRO_Filter: "^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$",
      MDT_Path: "/MDT/",
      MDT_Filter: "^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$",
      Switch: 1
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await GatewayNDSMap.destroy({ where: {} });
    await GatewayList.destroy({ where: {} });
    await NDSList.destroy({ where: {} });
    await sequelize.close();
  });

  describe("GET /api/gateway", () => {
    it("应该返回网关列表", async () => {
      const response = await request(app).get("/api/gateway");

      expect(response.body.code).toBe(200);
      expect(response.body.data.list).toHaveLength(1);
      expect(response.body.data.list[0].ID).toBe(testGateway.ID);
    });

    it("应该根据状态过滤网关", async () => {
      const response = await request(app).get("/api/gateway?Status=1");

      expect(response.body.code).toBe(200);
      expect(response.body.data.list).toHaveLength(1);
      expect(response.body.data.list[0].Status).toBe(1);
    });

    it("应该支持分页查询", async () => {
      // 创建另一个测试网关
      await GatewayList.create({
        NodeName: "Test Gateway 2",
        Host: "192.168.1.101",
        Port: 8081,
        Status: 1,
        Switch: 1
      });

      const response = await request(app).get("/api/gateway?page=1&pageSize=1");

      expect(response.body.code).toBe(200);
      expect(response.body.data.list).toHaveLength(1);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(1);
    });
  });

  describe("GET /api/gateway/:ID", () => {
    it("应该返回网关详情", async () => {
      const response = await request(app).get(`/api/gateway/${testGateway.ID}`);

      expect(response.body.code).toBe(200);
      expect(response.body.data.ID).toBe(testGateway.ID);
      expect(response.body.data.NodeName).toBe(testGateway.NodeName);
    });

    it("对于不存在的网关应返回404", async () => {
      const response = await request(app).get("/api/gateway/99999");

      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe("网关不存在");
    });
  });

  describe("PUT /api/gateway/:ID", () => {
    it("应该更新网关信息", async () => {
      const updateData = {
        NodeName: "Updated Gateway",
        Port: 8081
      };

      const response = await request(app)
        .put(`/api/gateway/${testGateway.ID}`)
        .send(updateData);

      expect(response.body.code).toBe(200);
      expect(response.body.data.NodeName).toBe(updateData.NodeName);
      expect(response.body.data.Port).toBe(updateData.Port);

      // 验证数据库中的数据是否更新
      const updatedGateway = await GatewayList.findByPk(testGateway.ID);
      expect(updatedGateway.NodeName).toBe(updateData.NodeName);
      expect(updatedGateway.Port).toBe(updateData.Port);
    });

    it("对于不存在的网关应返回404", async () => {
      const response = await request(app)
        .put("/api/gateway/99999")
        .send({ NodeName: "Test" });

      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe("网关不存在");
    });
  });

  describe("POST /api/gateway/:ID/logout", () => {
    it("应该使网关下线", async () => {
      const response = await request(app).post(
        `/api/gateway/${testGateway.ID}/logout`
      );

      expect(response.body.code).toBe(200);

      // 验证网关状态是否更新为离线
      const updatedGateway = await GatewayList.findByPk(testGateway.ID);
      expect(updatedGateway.Status).toBe(0);
    });

    it("对于不存在的网关应返回404", async () => {
      const response = await request(app).post("/api/gateway/99999/logout");

      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe("网关不存在");
    });
  });

  describe("网关-NDS关联测试", () => {
    describe("POST /api/gateway/:ID/nds", () => {
      it("应该添加NDS关联", async () => {
        const response = await request(app)
          .post(`/api/gateway/${testGateway.ID}/nds`)
          .send({ ndsId: testNDS.ID });

        expect(response.body.code).toBe(200);
        expect(response.body.message).toBe("关联添加成功");

        // 验证关联是否创建成功
        const association = await GatewayNDSMap.findOne({
          where: {
            gatewayId: testGateway.ID,
            ndsId: testNDS.ID
          }
        });
        expect(association).toBeTruthy();
      });

      it("对于重复的关联应返回400", async () => {
        // 先创建关联
        await GatewayNDSMap.create({
          gatewayId: testGateway.ID,
          ndsId: testNDS.ID
        });

        const response = await request(app)
          .post(`/api/gateway/${testGateway.ID}/nds`)
          .send({ ndsId: testNDS.ID });

        expect(response.body.code).toBe(400);
        expect(response.body.message).toBe("关联已存在");
      });

      it("对于不存在的网关应返回404", async () => {
        const response = await request(app)
          .post("/api/gateway/99999/nds")
          .send({ ndsId: testNDS.ID });

        expect(response.body.code).toBe(404);
        expect(response.body.message).toBe("网关不存在");
      });

      it("对于不存在的NDS应返回404", async () => {
        const response = await request(app)
          .post(`/api/gateway/${testGateway.ID}/nds`)
          .send({ ndsId: 99999 });

        expect(response.body.code).toBe(404);
        expect(response.body.message).toBe("NDS不存在");
      });
    });

    describe("GET /api/gateway/:ID/nds", () => {
      it("应该返回关联的NDS列表", async () => {
        // 先创建关联
        await GatewayNDSMap.create({
          gatewayId: testGateway.ID,
          ndsId: testNDS.ID
        });

        const response = await request(app)
          .get(`/api/gateway/${testGateway.ID}/nds`);

        expect(response.body.code).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].ID).toBe(testNDS.ID);
      });

      it("对于不存在的网关应返回404", async () => {
        const response = await request(app)
          .get("/api/gateway/99999/nds");

        expect(response.body.code).toBe(404);
        expect(response.body.message).toBe("网关不存在");
      });
    });

    describe("PUT /api/gateway/:ID/nds", () => {
      it("应该更新NDS关联", async () => {
        // 先创建关联
        await GatewayNDSMap.create({
          gatewayId: testGateway.ID,
          ndsId: testNDS.ID
        });

        // 创建新的NDS用于更新
        const newNDS = await NDSList.create({
          Name: "New NDS",
          Address: "192.168.1.201",
          Port: 2122,
          Protocol: "SFTP",
          Account: "test2",
          Password: "test456",
          MRO_Path: "/MR/MRO/",
          MRO_Filter: "^/MR/MRO/[^/]+/[^/]+_MRO_[^/]+.zip$",
          MDT_Path: "/MDT/",
          MDT_Filter: "^/MDT/[^/]+/CSV/LOG-MDT/.*_LOG-MDT_.*.zip$",
          Switch: 1
        });

        const response = await request(app)
          .put(`/api/gateway/${testGateway.ID}/nds`)
          .send({ ndsIds: [newNDS.ID] });

        expect(response.body.code).toBe(200);

        // 验证关联是否更新成功
        const associations = await GatewayNDSMap.findAll({
          where: { gatewayId: testGateway.ID }
        });
        expect(associations).toHaveLength(1);
        expect(associations[0].ndsId).toBe(newNDS.ID);

        // 清理测试数据
        await newNDS.destroy();
      });

      it("对于不存在的网关应返回404", async () => {
        const response = await request(app)
          .put("/api/gateway/99999/nds")
          .send({ ndsIds: [testNDS.ID] });

        expect(response.body.code).toBe(404);
        expect(response.body.message).toBe("网关不存在");
      });
    });

    describe("DELETE /api/gateway/:ID/nds/:ndsId", () => {
      it("应该删除NDS关联", async () => {
        // 先创建关联
        await GatewayNDSMap.create({
          gatewayId: testGateway.ID,
          ndsId: testNDS.ID
        });

        const response = await request(app)
          .delete(`/api/gateway/${testGateway.ID}/nds/${testNDS.ID}`);

        expect(response.body.code).toBe(200);
        expect(response.body.message).toBe("关联删除成功");

        // 验证关联是否删除成功
        const association = await GatewayNDSMap.findOne({
          where: {
            gatewayId: testGateway.ID,
            ndsId: testNDS.ID
          }
        });
        expect(association).toBeNull();
      });

      it("对于不存在的网关应返回404", async () => {
        const response = await request(app)
          .delete("/api/gateway/99999/nds/1");

        expect(response.body.code).toBe(404);
        expect(response.body.message).toBe("网关不存在");
      });

      it("对于不存在的NDS应返回404", async () => {
        const response = await request(app)
          .delete(`/api/gateway/${testGateway.ID}/nds/99999`);

        expect(response.body.code).toBe(404);
        expect(response.body.message).toBe("NDS不存在");
      });

      it("对于不存在的关联应返回404", async () => {
        const response = await request(app)
          .delete(`/api/gateway/${testGateway.ID}/nds/${testNDS.ID}`);

        expect(response.body.code).toBe(404);
        expect(response.body.message).toBe("关联不存在");
      });
    });
  });
});
