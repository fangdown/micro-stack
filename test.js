const path = require('path');
const theme = require('./theme');
const rewireWebpackBundleAnalyzer = require('react-app-rewire-webpack-bundle-analyzer');
const WebpackBar = require('webpackbar'); // 打包进度
const rewireHappyPackLoader = require('react-app-rewire-happy-pack');
const TerserPlugin = require('terser-webpack-plugin');
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const {
    babelInclude,
    override,
    addLessLoader,
    addWebpackAlias,
    useEslintRc,
    babelExclude,
    addWebpackPlugin,
} = require('customize-cra');

const addCustomize = () => (config) => {
    //! 【重要】该项目因为在caddy中无法和首页的项目进行区分，所以暂添加CDN
    // if (process.env.CICD_ENV === 'PROD') {
    //   config.output.publicPath = 'https://cdn.marineonline.com/home-web/'
    // }else if( process.env.CICD_ENV === 'STAGING') {
    //   config.output.publicPath = 'https://cdn-staging.marineonline.com/home-web/'
    // }

    config.externals = {
        moment: 'moment',
        react: 'React',
        'react-dom': 'ReactDOM',
        mathjs: 'math',
        lodash: '_',
    };
    const env = config.mode;
    const minimizer = config.optimization.optimization?.minimizer || [];
    minimizer.push(
        new TerserPlugin({
            parallel: true,
        })
    );
    config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 11,
        maxInitialRequests: 11,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
            vendors: {
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
            },
            common: {
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true,
            },
            codemirror: {
                name: 'codemirror',
                test: /[\\/]codemirror[\\/]/,
                priority: 1000,
            },
            'mol-common-layout': {
                test: /[\\/]mol-common-layout[\\/]/,
                priority: 1000,
            },
            'ant-design': {
                name: 'ant-design',
                test: /[\\/]@ant-design[\\/]/,
                chunks: 'all',
                minChunks: 1,
                priority: 1000,
                reuseExistingChunk: true,
            },
        },
    };

    if (process.env.REPORT === '1') {
        config = rewireWebpackBundleAnalyzer(config, env, {
            analyzerMode: 'static',
            reportFilename: 'report.html',
        });
    }
    return config;
};

const useCache = (config) => {
    // 添加cache-loader配置
    config.module.rules.push({
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'cache-loader',
                options: {
                    cacheDirectory: path.resolve(__dirname, './webpack_cache'), // 缓存目录
                },
            },
        ],
    });
    return config;
};
const useSoureMap = (config) => {
    config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false;
    return config;
};
const useHappyPack = (config) => rewireHappyPackLoader(config);
// const useSMP = (config) => {
//   const cssPluginIndex = config.plugins.findIndex(
//       (e) => e.constructor.name === 'MiniCssExtractPlugin'
//   );
//   const cssPlugin = config.plugins[cssPluginIndex];
//   smpConfig = new SpeedMeasurePlugin().wrap(config);
//   smpConfig.plugins[cssPluginIndex] = cssPlugin;
//   return smpConfig;
// };

const useDelConflictingOrder = (config) => {
    for (let i = 0; i < config.plugins.length; i++) {
        const p = config.plugins[i];
        if (!!p.constructor && p.constructor.name === MiniCssExtractPlugin.name) {
            const miniCssExtractOptions = { ...p.options, ignoreOrder: true };
            config.plugins[i] = new MiniCssExtractPlugin(miniCssExtractOptions);
            break;
        }
    }
    return config;
};
//生产环境去除console.* functions
const useDropConsole = (config) => {
    if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
            if (minimizer.constructor.name === 'TerserPlugin') {
                minimizer.options.terserOptions.compress.drop_console = true;
            }
        });
    }
    return config;
};
module.exports = override(
    // babelInclude([path.resolve('src'), path.join(__dirname, '../mol-mall-component/src')]),
    babelInclude([
        path.resolve('src'),
        path.join(__dirname, '../mol-common-layout/src'),
        // path.join(__dirname, '../mol-common-component/src'),
    ]),
    useEslintRc(resolve('.eslintrc.js')),
    addLessLoader({
        // ident: 'postcss', // 注释后 FIXED: TypeError: options.plugins.push is not a function
        javascriptEnabled: true,
        modifyVars: theme,
    }),
    addCustomize(),
    addWebpackAlias({
        ['@']: resolve('src'),
        ['@Elements']: resolve('src/components/Layout/Elements.js'),
        ['@Components']: resolve('src/components'),
        ['@Store']: resolve('src/store'),
        ['@Page']: resolve('src/page'),
        ['@Services']: resolve('src/services'),
        ['@Utils']: resolve('src/utils'),
        // src/myAntdIcon返回空对象，达到取消ant-design icon的效果
        ['@ant-design/icons/lib/dist$']: resolve('src/myAntdIcon'),
    }),
    babelExclude([path.resolve('node_modules/mapbox-gl/dist/mapbox-gl.js')]),
    addWebpackPlugin(new WebpackBar()),
    useDelConflictingOrder,
    useCache,
    useSoureMap,
    useHappyPack,
    useDropConsole
    // useSMP
);

function resolve(dir) {
    return path.join(__dirname, dir);
}
