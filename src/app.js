const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require("express-fileupload");
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { testConnection } = require('./database/mysql');
const logger = require('./utils/logger');

// 创建 Express 应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 100 * 1024 * 1024 // 限制文件大小为100MB
    },
    abortOnLimit: true
  })
);

// Swagger配置
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MParser Center API',
            version: '1.0.0',
            description: 'MParser Center API文档'
        },
        // servers: [
        //     {
        //         url: `http://localhost:${process.env.PORT}`,
        //         description: '开发服务器'
        //     }
        // ]
    },
    apis: ['./src/docs/swagger/*.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 路由配置
app.use("/", require("./routes/app.route"));
app.use("/api/cell", require("./routes/celldata.route"));
app.use('/api/task', require('./routes/task.route'));
app.use('/api/nds', require('./routes/nds.route'));
app.use("/api/gateway", require("./routes/gateway.route"));

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now()
    });
});

// 测试错误路由
app.get('/error-test', (req, res, next) => {
    next(new Error('测试错误'));
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: '请求的资源不存在'
    });
});

// 错误处理中间件
const errorHandler = require('./middlewares/error.handler').default;
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 9002;
let server = null;

const startServer = async () => {
    try {
        // 测试数据库连接
        await testConnection();

        // 启动HTTP服务器
        return new Promise((resolve, reject) => {
            server = app.listen(PORT, () => {
                logger.info(`服务器已启动，监听端口 ${PORT}`);
                logger.info(`API文档地址: http://localhost:${PORT}/api-docs`);
                resolve(server);
            });

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    // 如果端口被占用，尝试使用随机端口
                    server = app.listen(0, () => {
                        logger.info(`服务器已启动，监听端口 ${server.address().port}`);
                        resolve(server);
                    });
                } else {
                    reject(err);
                }
            });
        });
    } catch (err) {
        logger.error('服务器启动失败:', err);
        // 在测试环境中抛出错误，在生产环境中退出进程
        if (process.env.NODE_ENV === 'test') {
            throw err;
        } else {
            process.exit(1);
        }
    }
};

const stopServer = async () => {
    if (server) {
        return new Promise((resolve) => {
            server.close(() => {
                server = null;
                resolve();
            });
        });
    }
};

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
    startServer();
}

module.exports = {
    app,
    startServer,
    stopServer
};
