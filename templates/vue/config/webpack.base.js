const path = require("path")
const VueLoaderPlugin = require("vue-loader/lib/plugin")

module.exports = {
  entry: ["@babel/polyfill", path.resolve(__dirname, "../src/main.js")],
  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/dist/",
    filename: "build.js",
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
        exclude: /node_modules\/(?!(bootstrap-vue|bootstrap|leaflet|vue-select|vue-swatches)\/).*/,
      },
      {
        test: /\.scss$/,
        use: [
          "vue-style-loader",
          "css-loader",
          "sass-loader",
          {
            loader: "sass-loader",
            options: {
              data: "@import 'src/assets/styles/onbording-colors.scss';",
            },
          },
        ],
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]",
        },
      },
    ],
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
      "@": path.resolve(__dirname, "../src"),
    },
    extensions: ["*", ".js", ".vue", ".json"],
  },
  performance: {
    hints: false,
  },
  plugins: [new VueLoaderPlugin()],
}
