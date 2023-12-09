/**
 * @param  { arr }  Array 扁平的数组结构
 * @return { tree } Object 树形结构对象
 */
interface Node {
    id: number;
    name: string;
    pid: number;
    children?: Array<Node>;
}

export const arrayToTree = (arr: Array<Node>): Node => {
    const map = new Map();

    // 生成一个用 id 作为 key，用原对象值并添加 children 以作为值的 Map 对象
    arr.forEach((item: any, index: number) => map.set(item.id, { ...item, children: [] }));

    // 存放树形结果
    let tree = {};
    console.log('map', map);

    // 循环 map 数组
    map.forEach((item, idx) => {
        console.log('idx', idx);
        console.log('item', item);

        if (map.has(item.pid)) {
            const parentNode = map.get(item.pid);
            parentNode.children.push({ ...item, key: item.key || 0 + '-' + (idx - 1) });
        } else {
            tree = map.get(item.id);
        }
    });
    // @ts-ignore
    return tree;
};

export const toTree = (arr: any[], parentId: number, preKey: string) => {
    const list: any = [];
    function loop(parentId: number, preKey: string) {
        let res = [];
        // @ts-ignore
        let i = 0;
        for (let item of arr) {
            if (item.pid !== parentId) {
                continue;
            }
            const key = `${preKey}-${i++}`;
            item.children = loop(item.id, key);
            item.key = key;
            res.push(item);
            list.push(item);
        }
        return res;
    }
    const treeData = loop(parentId, preKey);
    return {
        treeData,
        list,
    };
};
