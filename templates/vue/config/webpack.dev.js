const path = require("path")
const { merge } = require("webpack-merge")
const baseConfig = require("./webpack.base")

module.exports = merge(baseConfig, {
  mode: "development",
  devServer: {
    contentBase: path.resolve(__dirname, "../dist"),
    publicPath: "/dist/",
    port: 8080,
  },
  devtool: "inline-source-map",
})
