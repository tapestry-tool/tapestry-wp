const devConfig = require("./config/webpack.dev")
const prodConfig = require("./config/webpack.prod")

module.exports = process.env.NODE_ENV === "production" ? prodConfig : devConfig
