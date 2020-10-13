const devConfig = require("./config/webpack.dev")
const prodConfig = require("./config/webpack.prod")
const { DefinePlugin } = require("webpack")
const dotenv = require("dotenv")

const config = process.env.NODE_ENV === "production" ? prodConfig : devConfig

const env = dotenv.config()

if (env.error) {
  throw env.error
}

const envPlugin = new DefinePlugin({
  "process.env": JSON.stringify(env.parsed),
})

if (config.plugins) {
  config.plugins.push(envPlugin)
} else {
  config.plugins = [envPlugin]
}

module.exports = config
