'use strict'

process.env.NODE_ENV = 'production';
// process.env.NODE_ENV = 'development';

// 抛出错误
process.on('unhandledRejection', err => {
  throw err
})


const NODE_ENV = process.env.NODE_ENV;
