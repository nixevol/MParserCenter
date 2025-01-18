/**
 * FTP/SFTP 连接工具
 */
const ftp = require('basic-ftp');
const { Client } = require('ssh2');
const logger = require('./logger');

/**
 * 测试 FTP 连接
 * @param {Object} config - FTP配置
 * @returns {Promise<Object>} 测试结果
 */
const testFTPConnection = async (config) => {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: config.Address,
      port: config.Port,
      user: config.Account,
      password: config.Password,
      secure: false
    });

    // 尝试访问 MRO 和 MDT 目录
    const paths = [config.MRO_Path, config.MDT_Path].filter(Boolean);
    for (const path of paths) {
      await client.cd(path);
    }

    return { isConnected: true, message: '连接成功' };
  } catch (err) {
    logger.error('FTP连接测试失败:', err);
    return { isConnected: false, message: err.message };
  } finally {
    client.close();
  }
};

/**
 * 测试 SFTP 连接
 * @param {Object} config - SFTP配置
 * @returns {Promise<Object>} 测试结果
 */
const testSFTPConnection = async (config) => {
  return new Promise((resolve) => {
    const conn = new Client();

    conn.on('ready', async () => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end();
          return resolve({ isConnected: false, message: err.message });
        }

        // 尝试访问 MRO 和 MDT 目录
        const paths = [config.MRO_Path, config.MDT_Path].filter(Boolean);
        let checkedPaths = 0;

        paths.forEach(path => {
          sftp.readdir(path, (err) => {
            checkedPaths++;
            if (checkedPaths === paths.length) {
              conn.end();
              if (err) {
                resolve({ isConnected: false, message: err.message });
              } else {
                resolve({ isConnected: true, message: '连接成功' });
              }
            }
          });
        });

        // 如果没有路径需要检查
        if (paths.length === 0) {
          conn.end();
          resolve({ isConnected: true, message: '连接成功' });
        }
      });
    });

    conn.on('error', (err) => {
      logger.error('SFTP连接测试失败:', err);
      resolve({ isConnected: false, message: err.message });
    });

    conn.connect({
      host: config.Address,
      port: config.Port,
      username: config.Account,
      password: config.Password
    });
  });
};

/**
 * 测试 FTP/SFTP 连接
 * @param {Object} config - 服务器配置
 * @returns {Promise<Object>} 测试结果
 */
const testConnection = async (config) => {
  try {
    if (config.Protocol === 'SFTP') {
      return await testSFTPConnection(config);
    } else {
      return await testFTPConnection(config);
    }
  } catch (err) {
    logger.error('连接测试失败:', err);
    return { isConnected: false, message: err.message };
  }
};

module.exports = {
  testConnection
};
