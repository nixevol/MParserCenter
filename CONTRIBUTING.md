# 项目开发规范与约定

## 目录结构
```
e:/Center/
├── src/                      # 源代码目录
│   ├── __test__/            # 测试文件目录
│   ├── config/              # 配置文件目录
│   ├── controllers/         # 控制器目录
│   ├── database/           # 数据库相关代码
│   ├── docs/               # API文档目录
│   │   └── swagger/        # Swagger文档
│   ├── middlewares/        # 中间件目录
│   ├── models/             # 数据模型目录
│   ├── routes/             # 路由目录
│   └── utils/              # 工具函数目录
```

## 文件说明

### 根目录文件
- `package.json`: 项目配置文件，包含依赖和脚本命令
- `ecosystem.config.js`: PM2 进程管理配置文件
- `jest.config.js`: Jest 测试框架配置文件
- `.env`: 环境变量配置文件
- `.env.example`: 环境变量模板文件
- `.gitignore`: Git 忽略文件配置
- `README.md`: 项目说明文档
- `CONTRIBUTING.md`: 开发规范文档

### src 目录

#### app.js
主应用程序入口文件，包含：
- Express 应用程序配置
- 中间件配置
- 路由配置
- Swagger 配置
- 错误处理配置

#### controllers/
控制器文件，处理具体业务逻辑：
- `app.controller.js`: 应用程序基础控制器
- `celldata.controller.js`: 小区数据管理控制器
- `gateway.controller.js`: 网关管理控制器
- `nds.controller.js`: NDS服务器管理控制器
- `task.controller.js`: 任务管理控制器

#### routes/
路由文件，定义 API 路由：
- `app.route.js`: 基础路由配置
- `celldata.route.js`: 小区数据相关路由
- `gateway.route.js`: 网关相关路由
- `nds.route.js`: NDS服务器相关路由
- `task.route.js`: 任务相关路由

#### models/
数据模型文件：
- `entity/CellData.js`: 小区数据模型
- `entity/EnbTaskList.js`: 基站任务列表模型
- `entity/GatewayList.js`: 网关列表模型
- `entity/GatewayNDSMap.js`: 网关与NDS映射模型
- `entity/NDSList.js`: NDS服务器列表模型
- `entity/TaskList.js`: 任务列表模型
- 视图模型：`src/models/view/`

#### docs/swagger/
Swagger API 文档文件：
- `celldata.swagger.js`: 小区数据 API 文档
- `gateway.swagger.js`: 网关 API 文档
- `nds.swagger.js`: NDS服务器 API 文档
- `task.swagger.js`: 任务 API 文档

#### database/
数据库相关文件：
- `mysql.js`: MySQL 数据库配置和连接管理

#### middlewares/
中间件文件：
- `error.handler.js`: 统一错误处理中间件

#### utils/
工具函数文件：
- `logger.js`: 日志工具
- `response.js`: 统一响应格式工具
- `ftp.js`: FTP/SFTP 操作工具

#### __test__/
测试文件：
- `app.test.js`: 应用程序测试
- `celldata.test.js`: 小区数据功能测试
- `gateway.test.js`: 网关功能测试
- `nds.test.js`: NDS服务器功能测试
- `task.test.js`: 任务功能测试

### 配置文件说明

#### .env 配置项
```
PORT=3000                    # 服务器端口
NODE_ENV=development        # 环境模式
DB_HOST=localhost          # 数据库主机
DB_PORT=3306              # 数据库端口
DB_USER=root              # 数据库用户名
DB_PASSWORD=password      # 数据库密码
DB_DATABASE=mparser       # 数据库名称
```

#### ecosystem.config.js 配置项
```javascript
{
  name: "mparser-center",    // 应用名称
  script: "./src/app.js",    // 启动脚本
  watch: true,               // 文件变化自动重启
  env: {
    NODE_ENV: "development"  // 环境变量
  }
}
```

## 编码规范

### 基本规范
- 使用 JavaScript + Express 框架开发
- 使用函数式和声明式编程，避免使用类
- 遵循 DRY 原则，避免代码重复
- 使用驼峰命名法(camelCase)命名变量和函数
- 使用带有辅助动词的描述性变量名（例如：isLoading, hasError）

### 文件组织
1. **控制器（Controllers）**
   - 位置：`src/controllers/`
   - 命名：`[模块名].controller.js`
   - 职责：处理业务逻辑，不直接处理数据库操作

2. **路由（Routes）**
   - 位置：`src/routes/`
   - 命名：`[模块名].route.js`
   - 职责：定义 API 路由，关联控制器方法

3. **模型（Models）**
   - 位置：`src/models/`
   - 命名：`[模型名].js`
   - 职责：定义数据模型和数据库交互

4. **中间件（Middlewares）**
   - 位置：`src/middlewares/`
   - 命名：`[功能名].js`
   - 职责：处理请求前后的通用逻辑

5. **工具函数（Utils）**
   - 位置：`src/utils/`
   - 命名：`[功能名].js`
   - 职责：提供通用功能

## API 文档规范

### Swagger/OpenAPI 规范
- 使用 OpenAPI 3.0.0 规范
- 所有 API 端点必须有 Swagger 文档
- 文档需包含：
  - 请求参数及其验证规则
  - 响应格式
  - 错误处理
  - 中文注释说明

### 文档位置
- Swagger 文档文件位于 `src/docs/swagger/` 目录
- 按模块分文件存放，如 `gateway.swagger.js`

## 测试规范

### 基本要求
- 使用 Jest 作为测试框架
- 单元测试覆盖率要求 100%
- 测试文件放在 `src/__test__/` 目录下
- 测试文件命名：`[模块名].test.js`

### 测试内容
- 控制器方法的输入输出
- 中间件的功能
- 工具函数的各种场景
- API 接口的请求响应

## 依赖管理

### 包管理工具
- 使用 yarn 作为包管理工具
- 常用命令：
  ```bash
  yarn install     # 安装依赖
  yarn add [包名]  # 添加依赖
  yarn test       # 运行测试
  yarn lint       # 代码检查
  ```

### 主要依赖
- express：Web 框架
- swagger-jsdoc：API 文档生成
- swagger-ui-express：API 文档界面
- jest：测试框架

## 开发流程

### 新功能开发
1. 创建功能分支
2. 编写业务代码
3. 编写/更新 Swagger 文档
4. 编写单元测试
5. 更新 README.md
6. 提交代码前检查

### 代码提交前检查清单
- [ ] 运行并通过所有测试 (`yarn test`)
- [ ] 运行并通过代码检查 (`yarn lint`)
- [ ] 更新了 Swagger 文档
- [ ] 更新了 README.md
- [ ] 代码符合项目规范

## 错误处理

### 统一错误响应格式
```javascript
{
  code: number,    // 错误码
  message: string  // 错误信息
}
```

### 错误处理原则
- 使用中间件统一处理错误

## 注释规范

### 基本要求
- 使用中文编写注释
- 保留现有注释，不随意删除
- 为复杂逻辑添加必要的注释说明

### 注释内容
- 函数的功能说明
- 参数的类型和用途
- 返回值的格式
- 特殊逻辑的解释

## 环境配置

### 环境变量
- 使用 `.env` 文件管理环境变量
- 提供 `.env.example` 作为模板
- 不要在代码中硬编码配置信息

### 配置文件
- 配置文件放在 `src/config/` 目录下
- 按环境分别配置（开发、测试、生产）


