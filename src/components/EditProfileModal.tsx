
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'antd';
import AvatarUpload from './Upload/AvatarUpload';
import type { UserProfile, UserProfileForm } from '../types/types'; 

// 定义组件的 props 类型
interface EditProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (data: UserProfile) => void;
  currentUser: UserProfile;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onCancel, onSave, currentUser }) => {
  const [form] = Form.useForm<UserProfileForm>();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser?.avatar);

  useEffect(() => {
    if (currentUser && visible) {
      setAvatarUrl(currentUser.avatar);
      form.setFieldsValue({
        ...currentUser,
      });
    }
  }, [currentUser, visible, form]);

  /**
   * 处理表单保存
   */
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        const updatedData = {
          ...currentUser,
          ...values,
          // 使用上传后的头像URL，如果没有则保留旧头像或设置默认值
          avatar: avatarUrl || '/assets/默认头像.png', 
        };
        onSave(updatedData);
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
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

    >
      <Form form={form} layout="vertical">
        <Form.Item label="" className="flex justify-center">
            <AvatarUpload
                value={avatarUrl}
                onChange={setAvatarUrl}
                size={100}
                maxSize={5}
                className="avatar-uploader"
            />
        </Form.Item>

        <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入你的姓名!' }]}>
          <Input placeholder="请输入姓名"/>
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

        <Form.Item name="grade" label="年级">
            <Input placeholder="例如：2024" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;