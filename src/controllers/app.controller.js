/**
 * 应用控制器
 * 处理应用级别的请求
 */
const pm2 = require('pm2');
const { success, error } = require('../utils/response');

/**
 * 获取应用状态
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getHomeStatus = async (req, res) => {
  try {
    res.json(success({ Status: "程序运行中" }));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

/**
 * 重启应用程序
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const restartApp = async (req, res) => {
  try {
    // 先返回重启开始的响应
    res.json(success({ Status: "正在重启服务..." }));

    // 使用Promise包装PM2重启操作
    const restartPromise = new Promise((resolve, reject) => {
      pm2.connect(async (err) => {
        if (err) {
          console.error("连接PM2失败:", err);
          reject(err);
          return;
        }

        pm2.reload("mparser-center", (err) => {
          if (err) {
            console.error("重启失败:", err);
            reject(err);
          } else {
            console.log("应用重启成功");
            resolve();
          }

          // 断开PM2连接
          pm2.disconnect();
        });
      });
    });

    // 在测试环境中等待重启完成
    if (process.env.NODE_ENV === 'test') {
      await restartPromise;
    }
  } catch (err) {
    console.error("重启过程出错:", err);
    res.status(500).json(error("重启失败"));
  }
};

module.exports = {
  getHomeStatus,
  restartApp
};
