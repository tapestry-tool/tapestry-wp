const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: ['@babel/polyfill', './src/main.js'],
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
        exclude: /node_modules\/(?!(bootstrap-vue|bootstrap)\/).*/
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules\/(?!(audio-recorder-polyfill|tiptap|tiptap-commands|highlight.js)\/).*/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    port: 8080
  },
  performance: {
    hints: false
  },
  devtool: 'inline-source-map',
  plugins: [
    new VueLoaderPlugin()
  ]
}
