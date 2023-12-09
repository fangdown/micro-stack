import { useEffect, useMemo, useState } from 'react';
import { message, Space, Tree, Badge, Input } from 'antd';
import type { DataNode, TreeProps } from 'antd/lib/tree';
import { PlusOutlined, EditOutlined, MinusCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { deleteStack, listStack, updatePid } from '@/api/stack';
import { toTree } from '@/utils';
import StackInfoModal from '@/components/stack-info-modal';
import s from './style.scss';

const { Search } = Input;
interface IProps {
    isAdmin: boolean;
}
const StackTree = (props: IProps) => {
    const { isAdmin = false } = props;
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [gData, setGData] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);
    const [currentNode, setCurrentNode] = useState({});
    const [searchValue, setSearchValue] = useState('');

    const [dataList, setDataList] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);
    const loadData = () => {
        listStack().then(({ data }: any) => {
            const { rows = [] } = data || {};
            const { treeData, list } = toTree(rows, 0, '0') || [];
            setGData(treeData);
            setDataList(list);
            showFirstLevel(treeData);
        });
    };
    const showFirstLevel = (treeData: any) => {
        const firstKeys = treeData.map((item: any) => item.key);
        expandedKeys.length === 0 && setExpandedKeys(firstKeys);
    };
    const onExpand = (expandedKeysValue: any) => {
        // console.log('onExpand', expandedKeysValue); // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.

        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const onCheck = (checkedKeysValue: any) => {
        // console.log('onCheck', checkedKeysValue);
        setCheckedKeys(checkedKeysValue);
    };

    const onSelect = (selectedKeysValue: any, info: any) => {
        // console.log('onSelect', info);
        // console.log('selectedKeysValue', selectedKeysValue);
        setSelectedKeys(selectedKeysValue);
    };
    const onDragEnter: TreeProps['onDragEnter'] = (info: any) => {
        // console.log(info);
        // expandedKeys 需要受控时设置
        setExpandedKeys(info.expandedKeys);
    };
    const onDrop = (info: any) => {
        const dropKey = info.node.key;
        const dragKey = info.dragNode.key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (
            data: DataNode[],
            key: React.Key,
            callback: (node: DataNode, i: number, data: DataNode[]) => void
        ) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children!, key, callback);
                }
            }
        };
        const data = [...gData];

        // Find dragObject
        let dragObj: DataNode;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else if (
            ((info.node as any).props.children || []).length > 0 && // Has children
            (info.node as any).props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
                // in previous version, we use item.children.push(dragObj) to insert the
                // item to the tail of the children
            });
        } else {
            let ar: DataNode[] = [];
            let i: number;
            loop(data, dropKey, (_item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i!, 0, dragObj!);
            } else {
                ar.splice(i! + 1, 0, dragObj!);
            }
        }
        setGData(data);
        updatePid(info.dragNode.id, info.node.id)
            .then(() => {
                message.success('操作成功');
            })
            .catch((error: any) => message.error('操作失败' + error));
    };
    const onAdd = (pid: number) => {
        setVisible(true);
        setCurrentNode({ pid });
    };
    const onUpdate = (nodeData: Record<string, any>) => {
        setVisible(true);
        setCurrentNode(nodeData);
    };
    const onDelete = (id: number) => {
        deleteStack(id).then(() => {
            message.success('操作成功');
            loadData();
        });
    };
    const customTitleRender = (nodeData: any) => {
        const { children, ...rest } = nodeData;
        return (
            <div className={s.custom}>
                <span className={s.title}>{rest.title}</span>
                <div className={s.op}>
                    <Space>
                        <LinkOutlined
                            onClick={() => {
                                if (rest.link === '#') return;
                                window.open(rest.link, '_blank');
                            }}
                        />
                        {isAdmin && (
                            <>
                                <PlusOutlined onClick={() => onAdd(rest.id)} />
                                <EditOutlined onClick={() => onUpdate(rest)} />
                                <MinusCircleOutlined onClick={() => onDelete(rest.id)} />
                            </>
                        )}
                    </Space>
                </div>
                {children.length > 0 && (
                    <span className={s.title}>
                        <Badge count={children.length} style={{ backgroundColor: '#52c41a' }} />
                    </span>
                )}
            </div>
        );
    };
    const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
        let parentKey: React.Key;
        for (let node of tree) {
            if (node.children) {
                if (node.children.some((item) => item.key === key)) {
                    parentKey = node.key;
                } else if (getParentKey(key, node.children)) {
                    parentKey = getParentKey(key, node.children);
                }
            }
        }
        return parentKey!;
    };

    const onPressEnter = (e: any) => {
        const { value } = e.target;
        const newExpandedKeys: any = dataList
            .map((item: any) => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, treeData);
                }
                return null;
            })
            .filter((item: any, i: number, self: any) => item && self.indexOf(item) === i);
        if (!value || newExpandedKeys.length === 0) {
            showFirstLevel(treeData);
        } else {
            setExpandedKeys(newExpandedKeys);
            setSearchValue(value);
            setAutoExpandParent(true);
        }
    };
    const treeData = useMemo(() => {
        const loop = (data: DataNode[]): DataNode[] =>
            data?.map((item) => {
                const strTitle = item.title as string;
                const index = strTitle.indexOf(searchValue);
                const beforeStr = strTitle.substring(0, index);
                const afterStr = strTitle.slice(index + searchValue.length);
                const title =
                    index > -1 ? (
                        <span>
                            {beforeStr}
                            <span className="site-tree-search-value">{searchValue}</span>
                            {afterStr}
                        </span>
                    ) : (
                        <span>{strTitle}</span>
                    );
                const { children, ...rest } = item;
                if (children) {
                    return { ...rest, children: loop(children) };
                }

                return {
                    ...rest,
                    title,
                };
            });

        return loop(gData);
    }, [searchValue, gData]);
    console.log('treeData', treeData);
    return (
        <>
            <Search
                style={{ marginBottom: 8 }}
                placeholder="输入关键词"
                onPressEnter={onPressEnter}
            />
            <Tree
                showLine={true}
                draggable
                onDragEnter={onDragEnter}
                onDrop={onDrop}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                onSelect={onSelect}
                selectedKeys={selectedKeys}
                treeData={treeData}
                titleRender={customTitleRender}
                defaultExpandAll={true}
            />
            <StackInfoModal
                visible={visible}
                currentNode={currentNode}
                callback={(refresh) => {
                    setVisible(false);
                    if (refresh) {
                        loadData();
                    }
                }}
            />
        </>
    );
};

export default StackTree;
