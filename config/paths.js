'use strict'

const path = require('path');
const fs = require('fs');

// 运行node的位置
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
];

// 检查是否有该文件，有自动加后缀，没有js
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extensions =>
    fs.existsSync(resolveFn(`${filePath}.${extensions}`))
  )
  if (extension) `${filePath}.${extension}`;
  return `${filePath}.js`;
}

console.log(process.env.BUILD_PATH)
module.exports = {
  appPath: resolveApp('.'),
  appBuild: resolveApp('dist'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  // testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  // proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  // swSrc: resolveModule(resolveApp, 'src/service-worker'),
  publicUrlOrPath: resolveApp(),
  moduleFileExtensions: moduleFileExtensions,
};