import { Form, Input, message, Modal } from 'antd';
import { useEffect } from 'react';
import { addStack } from '@/api/stack';

interface IProps {
    visible: boolean;
    currentNode: Record<string, any>;
    callback: (refresh?: boolean) => void;
}
const StackInfoModal = (props: IProps) => {
    const { visible, currentNode, callback } = props;
    const [form] = Form.useForm();
    const onCreate = (values: any) => {
        addStack({ ...values, pid: currentNode.pid, id: currentNode.id })
            .then(() => {
                callback(true);
                message.success('操作成功');
            })
            .catch(() => {
                message.error('操作失败');
            });
    };
    useEffect(() => {
        const { title, link, desc, icon, img_url } = currentNode;
        const initialValues = {
            title,
            link,
            desc,
            icon,
            img_url,
        };
        form.setFieldsValue(initialValues);
    }, [currentNode]);
    return (
        <Modal
            open={visible}
            title={currentNode.isAdd ? '修改信息' : '添加信息'}
            okText="确定"
            cancelText="取消"
            onCancel={() => callback()}
            onOk={() => {
                form.validateFields()
                    .then((values) => {
                        form.resetFields();
                        onCreate(values);
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
                initialValues={{
                    modifier: 'public',
                }}
            >
                <Form.Item
                    name="title"
                    label="标题"
                    rules={[
                        {
                            required: true,
                            message: '请输入标题',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="link"
                    label="链接"
                    rules={[
                        {
                            required: true,
                            message: '请输入链接',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="desc" label="描述">
                    <Input type="textarea" />
                </Form.Item>
                <Form.Item name="icon" label="图标">
                    <Input />
                </Form.Item>
                <Form.Item name="img_url" label="图片链接">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StackInfoModal;
