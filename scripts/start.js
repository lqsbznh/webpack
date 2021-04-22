'use strict';

process.env.BABEL_ENV = 'development';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpackDevServer.config');

const chalk = require('react-dev-utils/chalk');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// 缺少文件退出
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// npm start 后打印出地址端口
if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
}

choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port == null) return;

    const config = configFactory('development');
    const compiler = webpack(config);;

    const serverConfig = createDevServerConfig();
    const devServer = new WebpackDevServer(compiler, serverConfig);

    devServer.listen(port, HOST, err => {
      if (err) console.log(err);

    })
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });