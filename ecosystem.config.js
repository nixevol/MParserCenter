require('dotenv').config(); // 加载.env文件

module.exports = {
  apps: [
    {
      name: "mparser-center",
      script: "./src/app.js",
      instances: 1,
      exec_mode: "fork",
      watch: true, // 启用文件监视
      ignore_watch: [ // 忽略监视的文件和目录
        "node_modules",
        "logs",
        "*.log",
        ".git",
        "*.md",
        "__test__"
      ],
      watch_options: {
        followSymlinks: false,
        usePolling: true // 使用轮询方式监视文件变化，对某些编辑器更友好
      },
      max_memory_restart: "8G",
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 9002
      },
      min_uptime: "5s",  // 最小运行时间，如果在这段时间内退出，则认为是异常退出
      max_restarts: 10,  // 最大重启次数
      restart_delay: 3000  // 重启延迟
    }
  ]
};
