module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件的匹配模式
  testMatch: [
    '**/src/__test__/**/*.test.js'
  ],
  
  // 覆盖率收集配置
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/__test__/**',
    '!src/docs/**'
  ],
  
  // 覆盖率报告目录
  coverageDirectory: 'coverage',
  
  // 在每次测试前清理模拟调用和实例
  clearMocks: true,
  
  // 允许测试使用ES模块语法
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};
