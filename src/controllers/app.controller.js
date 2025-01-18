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
    res.json(success({ status: '程序运行中' }));
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
    res.json(success({ status: '正在重启服务...' }));
    
    // 使用pm2的API重启应用
    pm2.connect((err) => {
      if (err) {
        console.error('连接PM2失败:', err);
        return;
      }

      pm2.reload("mparser-center", (err) => {
        if (err) {
          console.error("重启失败:", err);
        } else {
          console.log("应用重启成功");
        }

        // 断开PM2连接
        pm2.disconnect();
      });
    });

  } catch (err) {
    console.error('重启过程出错:', err);
    res.status(500).json(error('重启失败'));
  }
};

module.exports = {
  getHomeStatus,
  restartApp
};
