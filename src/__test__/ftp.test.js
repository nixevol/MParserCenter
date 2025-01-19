const ftp = require('basic-ftp');
const { Client } = require('ssh2');
const { testConnection } = require('../utils/ftp');

// 模拟 basic-ftp 模块
jest.mock('basic-ftp', () => ({
  Client: jest.fn().mockImplementation(() => ({
    ftp: { verbose: false },
    access: jest.fn(),
    cd: jest.fn(),
    close: jest.fn()
  }))
}));

// 模拟 ssh2 模块
jest.mock('ssh2', () => {
  const EventEmitter = require('events');
  return {
    Client: jest.fn().mockImplementation(() => {
      const client = new EventEmitter();
      client.connect = jest.fn();
      client.end = jest.fn();
      client.sftp = jest.fn();
      return client;
    })
  };
});

// 模拟日志模块
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn()
}));

describe('FTP工具类测试', () => {
  let mockConfig;

  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 测试配置
    mockConfig = {
      Type: 'FTP',
      Address: 'test.example.com',
      Port: 21,
      Account: 'testuser',
      Password: 'testpass',
      MRO_Path: '/mro',
      MDT_Path: '/mdt'
    };
  });

  describe("FTP连接测试", () => {
    let mockClient;

    beforeEach(() => {
      mockClient = new ftp.Client();
      // 确保每次测试都使用新的实例
      ftp.Client.mockImplementation(() => mockClient);
    });

    it("应该成功连接FTP服务器", async () => {
      mockClient.access.mockResolvedValue();
      mockClient.cd.mockResolvedValue();

      const result = await testConnection(mockConfig);

      expect(result.isConnected).toBe(true);
      expect(result.message).toBe("连接成功");
      expect(mockClient.access).toHaveBeenCalledWith({
        Host: mockConfig.Address,
        Port: mockConfig.Port,
        user: mockConfig.Account,
        password: mockConfig.Password,
        secure: false
      });
      expect(mockClient.cd).toHaveBeenCalledTimes(2);
      expect(mockClient.close).toHaveBeenCalled();
    });

    it("应该处理FTP连接失败", async () => {
      const error = new Error("连接失败");
      mockClient.access.mockRejectedValue(error);

      const result = await testConnection(mockConfig);

      expect(result.isConnected).toBe(false);
      expect(result.message).toBe("连接失败");
      expect(mockClient.close).toHaveBeenCalled();
    });

    it("应该处理目录访问失败", async () => {
      const error = new Error("目录不存在");
      mockClient.access.mockResolvedValue();
      mockClient.cd.mockRejectedValue(error);

      const result = await testConnection(mockConfig);

      expect(result.isConnected).toBe(false);
      expect(result.message).toBe("目录不存在");
      expect(mockClient.close).toHaveBeenCalled();
    });

    it("应该处理FTP配置缺失", async () => {
      const invalidConfigs = [
        { ...mockConfig, Address: "" },
        { ...mockConfig, Port: null },
        { ...mockConfig, Account: undefined },
        { ...mockConfig, Password: "" }
      ];

      for (const config of invalidConfigs) {
        const result = await testConnection(config);
        expect(result.isConnected).toBe(false);
        expect(result.message).toBe("无效的配置");
      }
    });
  });

  describe("SFTP连接测试", () => {
    let mockSftpClient;

    beforeEach(() => {
      mockConfig.Type = "SFTP";
      mockConfig.Port = 22;
      mockSftpClient = new Client();
      // 确保每次测试都使用新的实例
      Client.mockImplementation(() => mockSftpClient);
    });

    it("应该成功连接SFTP服务器", async () => {
      // 模拟 SFTP 会话
      mockSftpClient.sftp.mockImplementation((callback) => {
        callback(null, {
          readdir: (path, cb) => cb(null, [])
        });
      });

      const result = await new Promise((resolve) => {
        const connectPromise = testConnection(mockConfig);
        // 延迟触发连接成功
        setTimeout(() => {
          mockSftpClient.emit("ready");
        }, 100);
        resolve(connectPromise);
      });

      expect(result.isConnected).toBe(true);
      expect(result.message).toBe("连接成功");
      expect(mockSftpClient.connect).toHaveBeenCalledWith({
        Host: mockConfig.Address,
        Port: mockConfig.Port,
        username: mockConfig.Account,
        password: mockConfig.Password
      });
    }, 15000);

    it("应该处理SFTP连接失败", async () => {
      const result = await new Promise((resolve) => {
        const connectPromise = testConnection(mockConfig);
        // 延迟触发连接错误
        setTimeout(() => {
          mockSftpClient.emit("error", new Error("连接失败"));
        }, 100);
        resolve(connectPromise);
      });

      expect(result.isConnected).toBe(false);
      expect(result.message).toBe("连接失败");
    }, 15000);

    it("应该处理SFTP会话创建失败", async () => {
      // 模拟 SFTP 会话创建失败
      mockSftpClient.sftp.mockImplementation((callback) => {
        callback(new Error("SFTP会话创建失败"));
      });

      const result = await new Promise((resolve) => {
        const connectPromise = testConnection(mockConfig);
        // 延迟触发连接成功
        setTimeout(() => {
          mockSftpClient.emit("ready");
        }, 100);
        resolve(connectPromise);
      });

      expect(result.isConnected).toBe(false);
      expect(result.message).toBe("SFTP会话创建失败");
    }, 15000);

    it("应该处理目录访问失败", async () => {
      // 模拟 SFTP 会话
      mockSftpClient.sftp.mockImplementation((callback) => {
        callback(null, {
          readdir: (path, cb) => cb(new Error("目录不存在"))
        });
      });

      const result = await new Promise((resolve) => {
        const connectPromise = testConnection(mockConfig);
        // 延迟触发连接成功
        setTimeout(() => {
          mockSftpClient.emit("ready");
        }, 100);
        resolve(connectPromise);
      });

      expect(result.isConnected).toBe(false);
      expect(result.message).toBe("目录不存在");
    }, 15000);

    it("应该在没有路径需要检查时返回成功", async () => {
      // 清除路径配置
      mockConfig.MRO_Path = "";
      mockConfig.MDT_Path = "";

      // 模拟 SFTP 会话
      mockSftpClient.sftp.mockImplementation((callback) => {
        callback(null, {
          readdir: (path, cb) => cb(null, [])
        });
      });

      const result = await new Promise((resolve) => {
        const connectPromise = testConnection(mockConfig);
        // 延迟触发连接成功
        setTimeout(() => {
          mockSftpClient.emit("ready");
        }, 100);
        resolve(connectPromise);
      });

      expect(result.isConnected).toBe(true);
      expect(result.message).toBe("连接成功");
    }, 15000);

    it("应该处理SFTP配置缺失", async () => {
      const invalidConfigs = [
        { ...mockConfig, Address: "" },
        { ...mockConfig, Port: null },
        { ...mockConfig, Account: undefined },
        { ...mockConfig, Password: "" }
      ];

      for (const config of invalidConfigs) {
        const result = await testConnection(config);
        expect(result.isConnected).toBe(false);
        expect(result.message).toBe("无效的配置");
      }
    });
  });

  describe('通用测试', () => {
    it('应该处理无效的连接类型', async () => {
      mockConfig.Type = 'INVALID';
      
      const result = await testConnection(mockConfig);

      expect(result.isConnected).toBe(false);
      expect(result.message).toContain('不支持的连接类型');
    });

    it('应该处理空配置', async () => {
      const result = await testConnection(null);

      expect(result.isConnected).toBe(false);
      expect(result.message).toBe('无效的配置');
    });

    it('应该处理缺少类型的配置', async () => {
      delete mockConfig.Type;
      
      const result = await testConnection(mockConfig);

      expect(result.isConnected).toBe(false);
      expect(result.message).toContain('不支持的连接类型');
    });
  });
});
