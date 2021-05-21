const path = require('path')
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PrettierPlugin = require('prettier-webpack-plugin')
const prettierConfig = require('./prettier.config.js')

const ISPROD = process.env.NODE_ENV === 'production'
const ISDEV = !ISPROD
const TARGET = process.env.NODE_ENV === 'production' ? 'browserslist' : 'web'

const filename = ext => (ISDEV ? `bundle.${ext}` : `bundle.[hash].${ext}`)

const jsLoaders = () => {
  return [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
        plugins: [
          '@babel/proposal-class-properties',
          '@babel/proposal-object-rest-spread'
        ]
      }
    }
  ]
}

const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
  styles: `${this.src}/styles`,
  js: `${this.src}/js`,
  assets: 'assets/'
}

const PAGES = fs.readdirSync(PATHS.src).filter(file => file.endsWith('.pug'))

module.exports = {
  context: PATHS.src,
  mode: 'development',
  entry: [
    '@babel/polyfill',
    './index.ts',
    ...PAGES.map(page => `${PATHS.src}/${page}`)
  ],
  output: {
    filename: filename('js'),
    clean: true,
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.pug/,
        use: ['html-loader', 'pug-html-loader?pretty=true']
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(js|jsx|tsx|ts)$/,
        use: jsLoaders(),
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': PATHS.src,
      '@core': PATHS.src + '/core'
    }
  },
  devtool: ISDEV ? 'source-map' : false,
  target: TARGET,
  devServer: {
    port: 3000,
    hot: ISDEV,
    contentBase: './dist'
  },
  plugins: [
    ...PAGES.map(page => {
      return new HTMLWebpackPlugin({
        template: `${PATHS.src}/${page}`,
        filename: `${PATHS.dist}/${page.replace('.pug', '.html')}`,
        minify: {
          removeComments: ISPROD,
          collapseWhitespace: ISPROD
        }
      })
    }),
    new MiniCssExtractPlugin({
      filename: filename('css')
    }),
    new PrettierPlugin(prettierConfig)
  ]
}
