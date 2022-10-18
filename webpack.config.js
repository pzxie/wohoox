const path = require('path');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const baseConfig = require('./webpack.config.dts');

const config = { ...baseConfig };

config.plugins = [
  new ForkTsCheckerWebpackPlugin({
    typescript: {
      diagnosticOptions: {
        syntactic: true, //语法检查
        semantic: true,  //语义检查
        declaration: true, //声明检查
        global: true,  //全局
      },
    },
  })
]

config.module.rules = [
  {
    test: /\.tsx?$/,
    use: [
      {
        loader: "ts-loader",
        options: {
          // 关闭ts类型检查，只进行转译。使用fork-ts-checker-webpack-plugin做类型检查。
          transpileOnly: true,
        },
      }
    ],
    exclude: /node_modules/
  }
]

module.exports = config;