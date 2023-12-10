import { defineConfig } from 'umi';
import packages from './package.json';
const publicPathBase = `/${packages.name}`;

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
    mountElementId: 'micro-app', //  容器ID
    // 必须要配，不然找不到微应用js
    publicPath: publicPathBase + '/', // 静态资源路径的前缀
    base: publicPathBase + '/', // 路由前缀
    outputPath: './dist' + publicPathBase, // 打包输出路径
    define: {
        BASE_URL: publicPathBase,
        PUBLIC_PATH: publicPathBase + '/',
    },
    runtimePublicPath: {},
});
