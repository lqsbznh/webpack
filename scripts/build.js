'use strict'

process.env.NODE_ENV = 'production';
// process.env.NODE_ENV = 'production';

// 抛出错误
process.on('unhandledRejection', err => {
  throw err
})


const webpack = require('webpack');
const fs = require('fs');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

console.log('Creating an optimized production build...');
const config = configFactory('production');
const compiler = webpack(config);

new Promise((resolve, reject) => {
  compiler.run((err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    return resolve({stats});
  })
}).then((stats) => {
})