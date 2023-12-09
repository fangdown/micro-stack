import { defineConfig } from 'umi';

export default defineConfig({
    plugins: ['@umijs/plugins/dist/qiankun'],
    routes: [
        { path: '/', redirect: '/home' },
        { path: '/home', component: 'home' },
    ],
    npmClient: 'yarn',
    qiankun: {
        slave: {},
    },
    mountElementId: 'micro-app', //  容器ID
});
