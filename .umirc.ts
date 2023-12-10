import { defineConfig } from 'umi';
import packages from './package.json';
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
    publicPath: '/' + packages.name + '/',
    runtimePublicPath: {},
});
