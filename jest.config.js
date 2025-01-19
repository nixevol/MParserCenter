module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件的匹配模式
  testMatch: [
    '**/src/__test__/**/*.test.js'
  ],
  
  // 覆盖率收集配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/__test__/**',
    '!src/docs/**',
    '!src/config/**',
    '!**/node_modules/**'
  ],
  
  // 覆盖率报告配置
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  
  // 在每次测试前清理模拟调用和实例
  clearMocks: true,
  
  // 允许测试使用ES模块语法
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};
