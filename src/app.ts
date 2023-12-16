import actions from './qiankun/actions';
if (window.__POWERED_BY_QIANKUN__) {
    // @ts-ignore
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

export const qiankun = {
    // 应用加载之前
    async bootstrap(props: any) {
        console.log('stack bootstrap', props);
    },
    // 应用 render 之前触发
    async mount(props: any) {
        console.log('stack mount', props);
        actions.setActions(props);
    },
    // 应用卸载之后触发
    async unmount(props: any) {
        console.log('stack unmount', props);
    },
};
