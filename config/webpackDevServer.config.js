'use strict';

const paths = require('./paths');

const host =  process.env.HOST || '127.0.0.1';

module.exports = function (proxy, allowedHost) {
  return {
    // 打开会跳过host检查，容易遭受DNS攻击
    disableHostCheck: false,
    open: true,
    // gzip compression
    compress: true,
    // 关闭日志
    clientLogLevel: 'silent',
    // 提供静态文件时才进行配置
    contentBase: paths.appPublic,
    contentBasePublicPath: paths.publicUrlOrPath,
    //  监听 contentBase 选项提供的文件。 启用后，文件更改将触发整个页面重新加载。
    watchContentBase: true,
    hot: true,
    transportMode: 'ws',
    publicPath: paths.publicUrlOrPath.slice(0, -1),
    quiet: false, // true
    host,
    // 编译错误覆盖全屏
    overlay: false,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
  }
}