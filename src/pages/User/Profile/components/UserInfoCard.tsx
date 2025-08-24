import React from 'react';
import { Card, Typography, Avatar, Space, Button } from 'antd';
import { Dialog, Toast } from 'antd-mobile';
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../../../store/useAuthStore';
import type { UserProfile } from '../../../../types/types';

const { Title, Text } = Typography;

interface UserInfoCardProps {
  user: UserProfile;
  onEditClick: () => void;
}

/**
 * 用户信息卡片组件
 * 显示用户头像、基本信息和操作按钮
 */
const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, onEditClick }) => {
  const { logout } = useAuthStore();

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    const result = await Dialog.confirm({
      content: '确定要退出登录吗？',
      confirmText: '确认',
      cancelText: '取消',
    });
    
    if (result) {
      try {
        await logout();
        Toast.show({ content: '已退出登录', position: 'bottom' });
      } catch (error) {
        console.error('退出登录失败:', error);
        Toast.show({ content: '退出登录失败，请重试', position: 'bottom' });
      }
    }
  };

  return (
    <Card className="rounded-2xl border-1 border-gray-200 mb-4 bg-white" style={{ position: 'relative' }}>
      {/* 退出登录按钮 */}
      <Button 
        type="text" 
        icon={<LogoutOutlined />} 
        onClick={handleLogout}
        className="text-gray-600 hover:text-red-500 hover:bg-red-50"
        style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
      >
        退出登录
      </Button>
      
      <div className="flex flex-col items-center p-4">
        <div className="relative mb-3">
          <Avatar size={100} src={user.avatar} className="border-2 border-gray-300"/>
          <div 
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-md flex items-center justify-center border-1 border-black cursor-pointer bg-white hover:bg-gray-100 transition-colors" 
            onClick={onEditClick}
          >
            <EditOutlined />
          </div>
        </div>
        
        <Title level={3} className="mt-2 mb-1 font-bold">{user?.name}</Title>
        
        <div className="mt-2 text-center">
          <Text type="secondary" className="block">学号: {user?.studentId}</Text>
          <Space>
            <Text type="secondary">{user?.college}</Text>
            <Text type="secondary">{user?.major}</Text>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default UserInfoCard;