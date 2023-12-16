import { defineConfig } from 'umi';
import packages from './package.json';
const publicPathBase = `${packages.name}`;

export default defineConfig({
    plugins: ['@umijs/plugins/dist/qiankun'],
    routes: [
        { path: '/', redirect: '/home' },
        { path: '/home', component: './home' },
    ],
    npmClient: 'yarn',
    qiankun: {
        slave: {},
    },
    hash: true,
    mfsu: false,
    mountElementId: 'micro-app', //  容器ID
    // 必须要配，不然找不到微应用js
    base: '/' + publicPathBase,
    cssPublicPath: '/' + publicPathBase + '/', // 静态资源路径的前缀
    publicPath: '/' + publicPathBase + '/', // 静态资源路径的前缀
    outputPath: './dist/' + publicPathBase, // 打包输出路径
    runtimePublicPath: {},
});
