
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Radio, Upload, Button, Avatar, message, Row, Col } from 'antd';
import type { UploadChangeParam, UploadFile, RcFile } from 'antd/es/upload';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import type { UserProfile, UserProfileForm } from '../types/types'; 

const { Option } = Select;
const { TextArea } = Input;

// 定义组件的 props 类型
interface EditProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (data: UserProfile) => void;
  currentUser: UserProfile;
}

// 一个模拟的上传函数
const dummyRequest = ({ onSuccess }: any) => {
  setTimeout(() => {
    onSuccess?.("ok");
  }, 0);
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onCancel, onSave, currentUser }) => {
  const [form] = Form.useForm<UserProfileForm>();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser?.avatar);

  useEffect(() => {
    if (currentUser && visible) {
      setAvatarUrl(currentUser.avatar);
      form.setFieldsValue({
        ...currentUser,
        dob: currentUser.dob ? dayjs(currentUser.dob, 'YYYY-MM-DD') : null,
      });
    }
  }, [currentUser, visible, form]);

  const handleSave = () => {
    form.validateFields()
      .then(values => {
        const updatedData: UserProfile = {
          ...currentUser,
          ...values,
          dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
          // 如果没有上传新头像，则保留旧头像或设置一个默认值
          avatar: avatarUrl || '/assets/默认头像.png', 
        };
        onSave(updatedData);
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('你只能上传 JPG/PNG 格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小必须小于 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleUploadChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.addEventListener('load', () => setAvatarUrl(reader.result as string));
      reader.readAsDataURL(info.file.originFileObj as RcFile);
      message.success('头像上传成功');
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  return (
    <Modal
      title="编辑个人信息"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" onClick={handleSave}>保存</Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ gender: '男' }}>
        <Form.Item label="" className="flex justify-center">
            <Upload
                name="avatar"
                listType="picture-circle"
                showUploadList={false}
                customRequest={dummyRequest}
                beforeUpload={beforeUpload}
                onChange={handleUploadChange}
            >
                {avatarUrl ? <Avatar src={avatarUrl} size={100} /> : (
                    <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>上传</div>
                    </div>
                )}
            </Upload>
        </Form.Item>

        <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入你的姓名!' }]}>
          <Input placeholder="请输入姓名"/>
        </Form.Item>

        <Form.Item name="studentId" label="学号">
          <Input placeholder="请输入学号"/>
        </Form.Item>

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="college" label="学院">
                    <Input placeholder="例如：计算机学院" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="major" label="专业">
                    <Input placeholder="例如：软件工程" />
                </Form.Item>
            </Col>
        </Row>

        <Form.Item name="bio" label="个人简介">
            <TextArea rows={3} placeholder="介绍一下你自己吧..." />
        </Form.Item>
        {/* --- 新增字段结束 --- */}

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="dob" label="出生日期">
                    <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="gender" label="性别">
                    <Radio.Group>
                        <Radio value="男">男</Radio>
                        <Radio value="女">女</Radio>
                    </Radio.Group>
                </Form.Item>
            </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;