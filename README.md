# MParser V2 后端服务

基于 Node.js + Express 的后端服务。

## 功能特性

1. 小区数据管理
   - 支持小区数据的增删改查
   - 支持批量导入/导出 Excel
   - 支持按字段搜索和分页查询

2. 任务管理
   - 支持创建解析任务（MRO/MDT）
   - 支持关联多个基站
   - 支持任务的增删改查
   - 支持基站列表的动态调整

## 技术栈

- Node.js
- Express
- MySQL (Sequelize ORM)
- Jest (单元测试)
- Swagger (API文档)

## 项目结构

\`\`\`
src/
├── __tests__/          # 单元测试文件
├── config/            # 配置文件
├── controllers/       # 控制器
├── database/         # 数据库配置
├── docs/             # API文档
├── middlewares/      # 中间件
├── models/           # 数据模型
├── routes/           # 路由
└── utils/            # 工具函数
\`\`\`

## 数据库设计

### CellData 表
- CGI (主键): 小区全局标识
- eNodeBID: 基站ID
- PCI: 物理小区标识
- Azimuth: 方位角
- Earfcn: 频点编号
- Freq: 频率
- eNBName: 基站名称
- UserLabel: 用户标签
- Longitude: 经度
- Latitude: 纬度

### TaskList 表
- TaskID (主键): 任务ID
- TaskName: 任务名称
- DataType: 数据类型(MRO/MDT)
- StartTime: 开始时间
- EndTime: 结束时间

### EnbTaskList 表
- ID (主键): 记录ID
- TaskID (外键): 任务ID
- eNodeBID: 基站ID

## API 接口

### 小区管理
- GET /api/cell/list - 获取小区列表
- POST /api/cell/add - 添加小区
- PUT /api/cell/update - 更新小区
- DELETE /api/cell/:cgi - 删除小区
- POST /api/cell/batch-delete - 批量删除小区
- POST /api/cell/import - 导入Excel
- GET /api/cell/export - 导出Excel

### 任务管理
- POST /api/task/add - 创建任务
- GET /api/task/list - 获取任务列表
- GET /api/task/detail/:taskId - 获取任务详情
- PUT /api/task/:taskId/enbs - 更新任务的基站列表
- DELETE /api/task/:taskId - 删除任务

## 开发指南

1. 安装依赖
\`\`\`bash
yarn install
\`\`\`

2. 配置数据库
- 修改 src/config/index.js 中的数据库配置

3. 运行服务
\`\`\`bash
yarn start
\`\`\`

4. 运行测试
\`\`\`bash
yarn test
\`\`\`

## API 文档

启动服务后访问：http://localhost:9002/api-docs

## 开发规范

1. 使用函数式编程，避免使用类
2. 使用驼峰命名法
3. 代码必须有单元测试，覆盖率100%
4. 使用 Swagger 生成API文档
5. 遵循 DRY 原则，避免代码重复

## 注意事项

1. 所有接口都需要添加错误处理
2. 所有数据库操作都需要使用事务
3. 代码提交前需要运行测试
4. 及时更新 Swagger 文档
