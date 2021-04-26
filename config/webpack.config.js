'use strict';
const fs = require('fs');
const path = require('path');
const paths = require('./paths');

// 插件
const webpack = require('webpack');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const {InjectManifest} = require('workbox-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

const imageInlineSizeLimit = 10000;
const shouldUseSourceMap = false;

const swSrc = paths.swSrc;

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

module.exports = function (webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  // 用于在生产中启用性能分析的变量
  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes('--profile');

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: paths.publicUrlOrPath.startsWith('.')
          ? { publicPath: '../../' }
          : {},
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      // {
      //   loader: require.resolve('postcss-loader'),
      //   options: {
      //     // Necessary for external CSS imports to work
      //     // https://github.com/facebook/create-react-app/issues/2677
      //     ident: 'postcss',
      //     plugins: () => [
      //       require('postcss-flexbugs-fixes'),
      //       require('postcss-preset-env')({
      //         autoprefixer: {
      //           flexbox: 'no-2009',
      //         },
      //         stage: 3,
      //       }),
      //       // Adds PostCSS Normalize as the reset css with default options,
      //       // so that it honors browserslist config in package.json
      //       // which in turn let's users customize the target behavior as per their needs.
      //       postcssNormalize(),
      //     ],
      //     sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
      //   },
      // },
    ].filter(Boolean);

    if (preProcessor) {
      loaders.push({
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
        }
      })
    }
    return loaders;
  }

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',

    // 生产模式代码错误停止编译
    bail: isEnvProduction,

    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',

    entry: paths.appIndexJs,

    output: {
      path: paths.appBuild,
      pathinfo: isEnvDevelopment,
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/[name].bundle.js',
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      publicPath: paths.publicUrlOrPath,
      // 在生成的SourceMap里的函数sources数组的文件名模板。[resource]替换被Webpack用来解析文件的路径
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info =>
          path
            .relative(paths.appSrc, info.absoluteResourcePath)
            .replace(/\\/g, '/')
        : isEnvDevelopment &&
        (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
      globalObject: 'this',
      assetModuleFilename: 'static/media/[name].[hash:8].[ext]',
    },

    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // 压缩js
        new TerserPlugin({
          terserOptions: {
            compress: {
              // Uglify违反了有效的代码的问题而被禁用
              warnings: false,
              // Terser破坏有效代码而被禁用：
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            keep_classnames: isEnvProductionProfile,
            keep_fnames: isEnvProductionProfile,
            output: {
              comments: false,
              ascii_only: true,
            },
            format: {
              // 删除代码注释
              comments: false,
            },
          },
          // sourceMap: shouldUseSourceMap,
        }),
        // 压缩css
        new CssMinimizerPlugin({
          test: /\.foo\.css$/i,
        }),
      ],
      splitChunks: {
        // 加强
        chunks: 'all',
        name: "isEnvDevelopment",
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },

    resolve: {
      // 找不到直接去node_modules中查找，不一层层向上了
      modules: ['node_modules', paths.appNodeModules],
      // alias: {
      //   ...(modules.webpackAliases || {}),
      // },
      extensions: paths.moduleFileExtensions.map(ext => `.${ext}`),
      plugins: [
        // 防止引入src目录之外的文件导致不可预期的结果
        new ModuleScopePlugin(paths.appSrc, [
          paths.appPackageJson,
        ]),
      ],
    },

    module: {
      rules: [
        {
          oneOf: [
            {
              test: [/\.avif$/],
              loader: require.resolve('url-loader'),
              type: 'javascript/auto',
              options: {
                limit: imageInlineSizeLimit,
                mimetype: 'image/avif',
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              type: 'javascript/auto',
              options: {
                limit: imageInlineSizeLimit,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                // babel-loader 配置
                // customize: require.resolve(
                //   'babel-preset-react-app/webpack-overrides'
                // ),
                // presets: [
                //   [
                //     require.resolve('babel-preset-react-app'),
                //     {
                //       runtime: hasJsxRuntime ? 'automatic' : 'classic',
                //     },
                //   ],
                // ],
                //
                // plugins: [
                //   [
                //     require.resolve('babel-plugin-named-asset-import'),
                //     {
                //       loaderMap: {
                //         svg: {
                //           ReactComponent:
                //             '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                //         },
                //       },
                //     },
                //   ],
                //   isEnvDevelopment &&
                //   shouldUseReactRefresh &&
                //   require.resolve('react-refresh/babel'),
                // ].filter(Boolean),
                // // This is a feature of `babel-loader` for webpack (not Babel itself).
                // // It enables caching results in ./node_modules/.cache/babel-loader/
                // // directory for faster rebuilds.
                // cacheDirectory: true,
                // // See #6846 for context on why cacheCompression is disabled
                // cacheCompression: false,
                // compact: isEnvProduction,
              },
            },
            // 对于src外的文件做处理
            // {
            //   test: /\.(js|mjs)$/,
            //   exclude: /@babel(?:\/|\\{1,2})runtime/,
            //   loader: require.resolve('babel-loader'),
            //   options: {
            //     babelrc: false,
            //     configFile: false,
            //     compact: false,
            //     presets: [
            //       [
            //         require.resolve('babel-preset-react-app/dependencies'),
            //         { helpers: true },
            //       ],
            //     ],
            //     cacheDirectory: true,
            //     // See #6846 for context on why cacheCompression is disabled
            //     cacheCompression: false,
            //
            //     // Babel sourcemaps are needed for debugging into node_modules
            //     // code.  Without the options below, debuggers like VSCode
            //     // show incorrect code and set breakpoints on the wrong lines.
            //     sourceMaps: shouldUseSourceMap,
            //     inputSourceMap: shouldUseSourceMap,
            //   },
            // },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction
                  ? shouldUseSourceMap
                  : isEnvDevelopment,
              }),
              sideEffects: true,
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction
                  ? shouldUseSourceMap
                  : isEnvDevelopment,
                modules: true,
              }),
            },
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  // 使用Dart Sass
                  implementation: require('sass'),
                  sourceMap: isEnvProduction
                    ? shouldUseSourceMap
                    : isEnvDevelopment,
                },
                'sass-loader'
              ),
              sideEffects: true,
            },
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  implementation: require('sass'),
                  sourceMap: isEnvProduction
                    ? shouldUseSourceMap
                    : isEnvDevelopment,
                  modules: true,
                },
                'sass-loader'
              ),
            },
            {
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
            },
          ]
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },isEnvProduction
            ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
            : undefined
        )
      ),
      // 将PUBLIC_URL插入html页面(%PUBLIC_URL%)
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, {PUBLIC_URL: paths.publicUrlOrPath.slice(0, -1)}),
      // 运行时插入全局常量
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      // 检查输入路径大小写问题
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      // 忘记npm install时候运行项目，无需重启。直接npm install
      isEnvDevelopment &&
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      isEnvProduction &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
      // 生成一个源文件映射到相应的输出文件
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            fileName => !fileName.endsWith('.map')
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),
      // 生成要预缓存的资产列表注入到Service Worker文件中。
      isEnvProduction &&
        fs.existsSync(swSrc) &&
        new InjectManifest({
          // 插入地址路径
          swSrc,
          dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
          exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
          // 提升预先缓存的默认最大大小（2mb），以减少延迟加载失败的可能性。
          // https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        }),
    ].filter(Boolean),

    // 如果一个资源超过 250kb，webpack 会对此输出一个警告来通知你。
    performance: false,
  }
}
// Moment.js库
