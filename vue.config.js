const path = require('path')

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = {
    publicPath: '/',
    outputDir: 'dist',
    assetsDir: 'static',
    lintOnSave: process.env.NODE_ENV === 'development',
    productionSourceMap: false,
    devServer: {
    port: 9527,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      // change xxx-api/login => mock/login
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.BASE_API]: {
        // target: `http://localhost:${port}/mock`,
        target: `http://127.0.0.1:8888`,
        changeOrigin: true,
        // pathRewrite: {
        //   ['^' + process.env.VUE_APP_BASE_API]: ''
        // }
      }
    }
    // after: require('./mock/mock-server.js')
  },
    chainWebpack: config => {
        config.module.rules.delete("svg")

        config.module
            .rule('svg-sprite-loader')
            .test(/\.svg$/)
            .include
            .add(resolve('src/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })

        config.module
            .rule('svg')
            .test(/\.svg$/)
            .include
            .add(resolve('./'))
            .end()
            .exclude
            .add(resolve('src/icons'))
            .end()
            .use('url-loader')
            .loader('url-loader')
            .options({
            })
    }
  }