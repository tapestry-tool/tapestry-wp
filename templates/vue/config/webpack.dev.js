const path = require("path")
const { merge } = require("webpack-merge")
const baseConfig = require("./webpack.base")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = merge(baseConfig, {
  mode: "development",
  output: {
    publicPath: "http://localhost:8080/dist/",
  },
  devServer: {
    headers: { "Access-Control-Allow-Origin": "*" },
    contentBase: path.resolve(__dirname, "../dist"),
    publicPath: "/dist/",
    port: 8080,
    hot: true,
  },
  devtool: "inline-source-map",
  plugins: [new BundleAnalyzerPlugin()],
})
