const path = require('path');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");


const config = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'wohoox.min.js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
    umdNamedDefine: true,
    library: {
      name: 'Wohoox',
      type: 'umd',
    },
    clean: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",

          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', 'json']
  },
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react"
    }
  },
}

module.exports = config