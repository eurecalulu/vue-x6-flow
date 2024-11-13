const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  runtimeCompiler: true,

  devServer: {
    proxy: {
      "/simgui": {
        // 匹配 /simgui 开头的 API 请求
        target: "http://10.137.174.74:8080", // 目标服务器地址
        changeOrigin: true, // 允许跨域
        // pathRewrite: { "^/simgui": "" }, // 可选：去掉 /simgui 前缀
      },
    },
  },
});
