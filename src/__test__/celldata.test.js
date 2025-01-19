const request = require("supertest");
const express = require("express");
const { Op } = require("sequelize");
const xlsx = require("xlsx");
const fileUpload = require("express-fileupload");
const celldataRouter = require("../routes/celldata.route");
const CellData = require("../models/entity/CellData");
const logger = require("../utils/logger");

// Mock 依赖模块
jest.mock("../models/entity/CellData");
jest.mock("../utils/logger");
jest.mock("xlsx");

// 创建测试用的express应用
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/api/cell", celldataRouter);

describe("小区数据管理接口测试", () => {
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
  });

  describe("GET /api/cell/list", () => {
    it("应该返回小区列表数据", async () => {
      const mockData = {
        count: 2,
        rows: [
          {
            CGI: "460-00-1234-5678",
            eNodeBID: 1234,
            PCI: 123,
            Azimuth: 90,
            Earfcn: 38400,
            Freq: 1800,
            eNBName: "SZ_NS_001",
            userLabel: "深圳南山01",
            Longitude: 113.923456,
            Latitude: 22.123456,
            toJSON: function () {
              return this;
            }
          },
          {
            CGI: "460-00-1234-5679",
            eNodeBID: 1235,
            PCI: 124,
            Azimuth: 180,
            Earfcn: 38400,
            Freq: 1800,
            eNBName: "SZ_NS_002",
            userLabel: "深圳南山02",
            Longitude: 113.923457,
            Latitude: 22.123457,
            toJSON: function () {
              return this;
            }
          }
        ]
      };

      CellData.findAndCountAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/cell/list")
        .query({ page: 1, pageSize: 10 })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("code", 200);
      expect(response.body).toHaveProperty("message", "操作成功");
      expect(response.body.data).toHaveProperty("total", 2);
      expect(response.body.data.list).toHaveLength(2);
      expect(CellData.findAndCountAll).toHaveBeenCalled();
    });

    it("应该支持关键字搜索", async () => {
      const mockData = {
        count: 1,
        rows: [
          {
            CGI: "460-00-1234-5678",
            eNBName: "SZ_NS_001",
            userLabel: "深圳南山01",
            toJSON: function () {
              return this;
            }
          }
        ]
      };

      CellData.findAndCountAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/cell/list")
        .query({ page: 1, pageSize: 10, field: "eNBName", keyword: "SZ" })
        .expect(200);

      expect(response.body.data.list).toHaveLength(1);
      expect(response.body.data.list[0].eNBName).toBe("SZ_NS_001");
    });

    it("应该处理分页参数", async () => {
      CellData.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await request(app)
        .get("/api/cell/list")
        .query({ page: 2, pageSize: 20 })
        .expect(200);

      expect(CellData.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        offset: 20,
        limit: 20,
        order: [['CGI', 'ASC']]
      });
    });

    it("应该支持字段搜索", async () => {
      CellData.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await request(app)
        .get("/api/cell/list")
        .query({ field: "eNBName", keyword: "SZ" })
        .expect(200);

      expect(CellData.findAndCountAll).toHaveBeenCalledWith({
        where: { eNBName: { [Op.like]: '%SZ%' } },
        offset: 0,
        limit: 50,
        order: [['CGI', 'ASC']]
      });
    });

    it("应该支持全字段搜索", async () => {
      CellData.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await request(app)
        .get("/api/cell/list")
        .query({ field: "all", keyword: "test" })
        .expect(200);

      expect(CellData.findAndCountAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { CGI: { [Op.like]: '%test%' } },
            { eNBName: { [Op.like]: '%test%' } },
            { userLabel: { [Op.like]: '%test%' } }
          ]
        },
        offset: 0,
        limit: 50,
        order: [['CGI', 'ASC']]
      });
    });

    it("应该正确处理数据类型转换", async () => {
      const mockData = {
        count: 1,
        rows: [{
          CGI: "460-00-1234-5678",
          eNodeBID: "1234",
          PCI: "123",
          Azimuth: "90",
          Earfcn: "38400",
          Freq: "1800",
          Longitude: "113.923456",
          Latitude: "22.123456",
          toJSON: function() { return this; }
        }]
      };

      CellData.findAndCountAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/cell/list")
        .expect(200);

      const item = response.body.data.list[0];
      expect(typeof item.eNodeBID).toBe("number");
      expect(typeof item.PCI).toBe("number");
      expect(typeof item.Azimuth).toBe("number");
      expect(typeof item.Earfcn).toBe("number");
      expect(typeof item.Freq).toBe("number");
      expect(typeof item.Longitude).toBe("number");
      expect(typeof item.Latitude).toBe("number");
    });

    it("应该处理查询错误", async () => {
      const error = new Error("数据库错误");
      CellData.findAndCountAll.mockRejectedValue(error);

      const response = await request(app)
        .get("/api/cell/list")
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body).toHaveProperty("message", error.message);
    });
  });

  describe("POST /api/cell/add", () => {
    it("应该成功添加新小区", async () => {
      const newCell = {
        CGI: "460-00-1234-5680",
        eNodeBID: 1236,
        PCI: 125,
        Earfcn: 38400
      };

      CellData.findOne.mockResolvedValue(null);
      CellData.create.mockResolvedValue(newCell);

      const response = await request(app)
        .post("/api/cell/add")
        .send(newCell)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("code", 200);
      expect(response.body).toHaveProperty("message", "新增成功");
      expect(CellData.create).toHaveBeenCalledWith(newCell);
    });

    it("应该阻止重复的CGI", async () => {
      const existingCell = {
        CGI: "460-00-1234-5680"
      };

      CellData.findOne.mockResolvedValue(existingCell);

      const response = await request(app)
        .post("/api/cell/add")
        .send(existingCell)
        .expect(400);

      expect(response.body).toHaveProperty("code", 400);
      expect(response.body).toHaveProperty("message", "CGI已存在,不能重复添加");
      expect(CellData.create).not.toHaveBeenCalled();
    });

    it("应该处理添加错误", async () => {
      const error = new Error("数据库错误");
      CellData.findOne.mockRejectedValue(error);

      const response = await request(app)
        .post("/api/cell/add")
        .send({ CGI: "test" })
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body).toHaveProperty("message", error.message);
    });
  });

  describe("POST /api/cell/update", () => {
    it("应该成功更新小区信息", async () => {
      const updateData = {
        CGI: "460-00-1234-5678",
        PCI: 126,
        Azimuth: 270
      };

      CellData.update.mockResolvedValue([1]);

      const response = await request(app)
        .post("/api/cell/update")
        .send(updateData)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("code", 200);
      expect(response.body).toHaveProperty("message", "更新成功");
      expect(CellData.update).toHaveBeenCalled();
    });

    it("应该处理不存在的记录", async () => {
      CellData.update.mockResolvedValue([0]);

      const response = await request(app)
        .post("/api/cell/update")
        .send({ CGI: "not-exist" })
        .expect(404);

      expect(response.body).toHaveProperty("code", 404);
      expect(response.body).toHaveProperty("message", "没有字段需要更新");
    });

    it("应该处理更新错误", async () => {
      const error = new Error("数据库错误");
      CellData.update.mockRejectedValue(error);

      const response = await request(app)
        .post("/api/cell/update")
        .send({ CGI: "test" })
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body).toHaveProperty("message", error.message);
    });
  });

  describe("DELETE /api/cell/remove/:cgi", () => {
    it("应该成功删除小区", async () => {
      const cgi = "460-00-1234-5678";
      CellData.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete(`/api/cell/remove/${cgi}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("code", 200);
      expect(response.body).toHaveProperty("message", "删除成功");
      expect(CellData.destroy).toHaveBeenCalledWith({
        where: { CGI: cgi }
      });
    });

    it("应该处理不存在的记录", async () => {
      CellData.destroy.mockResolvedValue(0);

      const response = await request(app)
        .delete("/api/cell/remove/not-exist")
        .expect(404);

      expect(response.body).toHaveProperty("code", 404);
      expect(response.body).toHaveProperty("message", "未找到要删除的记录");
    });

    it("应该处理删除错误", async () => {
      const error = new Error("数据库错误");
      CellData.destroy.mockRejectedValue(error);

      const response = await request(app)
        .delete("/api/cell/remove/test")
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body).toHaveProperty("message", error.message);
    });
  });

  describe("POST /api/cell/batch-delete", () => {
    it("应该成功批量删除小区", async () => {
      const cgis = ["460-00-1234-5678", "460-00-1234-5679"];
      CellData.destroy.mockResolvedValue(2);

      const response = await request(app)
        .post("/api/cell/batch-delete")
        .send({ cgis })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("code", 200);
      expect(response.body).toHaveProperty("message", "批量删除成功");
      expect(CellData.destroy).toHaveBeenCalledWith({
        where: { CGI: { [Op.in]: cgis } }
      });
    });

    it("应该验证CGI列表", async () => {
      const response = await request(app)
        .post("/api/cell/batch-delete")
        .send({ cgis: [] })
        .expect(400);

      expect(response.body).toHaveProperty("code", 400);
      expect(response.body).toHaveProperty("message", "请提供有效的CGI列表");
      expect(CellData.destroy).not.toHaveBeenCalled();
    });

    it("应该处理批量删除错误", async () => {
      const error = new Error("数据库错误");
      CellData.destroy.mockRejectedValue(error);

      const response = await request(app)
        .post("/api/cell/batch-delete")
        .send({ cgis: ["test1", "test2"] })
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body).toHaveProperty("message", error.message);
    });
  });

  describe("GET /api/cell/check/:cgi", () => {
    it("应该正确检查CGI是否存在", async () => {
      const cgi = "460-00-1234-5678";
      CellData.findOne.mockResolvedValue({ CGI: cgi });

      const response = await request(app)
        .get(`/api/cell/check/${cgi}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("code", 200);
      expect(response.body).toHaveProperty("message", "操作成功");
      expect(response.body.data).toHaveProperty("exists", true);
      expect(CellData.findOne).toHaveBeenCalledWith({
        where: { CGI: cgi }
      });
    });

    it("应该正确检查不存在的CGI", async () => {
      CellData.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/cell/check/not-exist")
        .expect(200);

      expect(response.body).toHaveProperty("code", 200);
      expect(response.body.data).toHaveProperty("exists", false);
    });

    it("应该处理检查错误", async () => {
      const error = new Error("数据库错误");
      CellData.findOne.mockRejectedValue(error);

      const response = await request(app)
        .get("/api/cell/check/test")
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body).toHaveProperty("message", error.message);
    });
  });

  describe("GET /api/cell/export", () => {
    beforeEach(() => {
      xlsx.utils.book_new.mockReturnValue({});
      xlsx.utils.json_to_sheet.mockReturnValue({});
      xlsx.utils.book_append_sheet.mockReturnValue();
      xlsx.write.mockReturnValue(Buffer.from("test"));
    });

    it("应该成功导出数据", async () => {
      const mockData = [
        {
          CGI: "460-00-1234-5678",
          toJSON: function() { return this; }
        }
      ];

      CellData.findAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/cell/export")
        .expect(200);

      expect(response.header["content-type"]).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(response.header["content-disposition"]).toContain("CellData.xlsx");
      expect(xlsx.utils.book_new).toHaveBeenCalled();
      expect(xlsx.utils.json_to_sheet).toHaveBeenCalled();
      expect(xlsx.utils.book_append_sheet).toHaveBeenCalled();
      expect(xlsx.write).toHaveBeenCalled();
    });

    it("应该处理导出错误", async () => {
      const error = new Error("导出错误");
      CellData.findAll.mockRejectedValue(error);

      const response = await request(app)
        .get("/api/cell/export")
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body).toHaveProperty("message", error.message);
    });
  });

  describe("POST /api/cell/upload", () => {
    const mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };

    beforeEach(() => {
      CellData.sequelize = {
        transaction: jest.fn().mockResolvedValue(mockTransaction)
      };
      xlsx.read.mockReturnValue({
        SheetNames: ["CellData"],
        Sheets: { CellData: {} }
      });
      xlsx.utils.sheet_to_json.mockReturnValue([]);
    });

    it("应该验证文件上传", async () => {
      const response = await request(app)
        .post("/api/cell/upload")
        .expect(400);

      expect(response.body).toHaveProperty("code", 400);
      expect(response.body).toHaveProperty("message", "没有上传文件");
    });

    it("应该验证工作表名称", async () => {
      xlsx.read.mockReturnValue({
        SheetNames: ["WrongSheet"],
        Sheets: {}
      });

      const response = await request(app)
        .post("/api/cell/upload")
        .attach("file", Buffer.from("test"), "test.xlsx")
        .expect(400);

      expect(response.body).toHaveProperty("code", 400);
      expect(response.body).toHaveProperty("message", "文件中未找到 CellData 工作表");
    });

    it("应该验证必填字段", async () => {
      xlsx.utils.sheet_to_json.mockReturnValue([{
        CGI: "460-00-1234-5678",
        // 缺少必填字段
      }]);

      const response = await request(app)
        .post("/api/cell/upload")
        .attach("file", Buffer.from("test"), "test.xlsx")
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body.message).toContain("缺少必填字段");
    });

    it("应该成功导入数据", async () => {
      const mockData = [{
        CGI: "460-00-1234-5678",
        eNodeBID: 1234,
        PCI: 123,
        Earfcn: 38400
      }];

      xlsx.utils.sheet_to_json.mockReturnValue(mockData);
      CellData.bulkUpsert.mockResolvedValue({
        total: 1,
        inserted: 1,
        updated: 0
      });

      const response = await request(app)
        .post("/api/cell/upload")
        .attach("file", Buffer.from("test"), "test.xlsx")
        .expect(200);

      expect(response.body).toHaveProperty("code", 200);
      expect(response.body.data).toHaveProperty("success", 1);
      expect(response.body.data).toHaveProperty("successRate", "100.00%");
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it("应该处理导入错误并回滚事务", async () => {
      const error = new Error("导入错误");
      CellData.bulkUpsert.mockRejectedValue(error);

      const response = await request(app)
        .post("/api/cell/upload")
        .attach("file", Buffer.from("test"), "test.xlsx")
        .expect(500);

      expect(response.body).toHaveProperty("code", 500);
      expect(response.body.message).toContain("文件处理失败");
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
