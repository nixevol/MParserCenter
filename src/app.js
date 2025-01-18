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
        servers: [
            {
                url: 'http://localhost:9002',
                description: '开发服务器'
            }
        ]
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

// 错误处理中间件
app.use((err, req, res, next) => {
    logger.error('未捕获的错误:', err);
    res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        timestamp: Date.now()
    });
});

// 启动服务器
const PORT = process.env.PORT || 9002;
const startServer = async () => {
    try {
        // 测试数据库连接
        await testConnection();

        // 启动HTTP服务器
        app.listen(PORT, () => {
            logger.info(`服务器已启动，监听端口 ${PORT}`);
            logger.info(`API文档地址: http://localhost:${PORT}/api-docs`);
        });
    } catch (err) {
        logger.error('服务器启动失败:', err);
        process.exit(1);
    }
};

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
    startServer();
}

module.exports = app;
