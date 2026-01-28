import React from 'react';
import { Card, Typography, Avatar, Button } from 'antd';
import { Dialog, Toast } from 'antd-mobile';
import { BankOutlined, BookOutlined, EditOutlined, IdcardOutlined, LogoutOutlined } from '@ant-design/icons';
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
  const displayName = user?.nick_name || user?.name || '未设置';

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
    <Card
      className="rounded-2xl overflow-hidden border-1 border-gray-200 bg-white shadow-sm"
      styles={{ body: { padding: 0 } }}
    >
      {/* 顶部渐变头图 + 操作区 */}
      <div className="relative h-28 bg-gradient-to-r from-rose-200 via-orange-200 to-amber-200">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.55) 0, rgba(255,255,255,0) 40%)',
          }}
        />

        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="text-white/90 hover:text-white hover:bg-white/10"
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
        >
          退出登录
        </Button>
      </div>

      {/* 内容区 */}
      <div className="px-5 pb-5">
        <div className="relative -mt-10 flex items-end justify-between gap-3">
          <div className="relative">
            <Avatar
              size={88}
              src={user.avatar}
              className="border-4 border-white shadow-md"
            />
            <button
              type="button"
              onClick={onEditClick}
              className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white shadow-md ring-1 ring-black/5 flex items-center justify-center hover:bg-gray-50"
              aria-label="编辑个人信息"
            >
              <EditOutlined className="text-gray-700" />
            </button>
          </div>

          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={onEditClick}
            className="border-gray-200 text-gray-700 hover:text-gray-900"
          >
            编辑资料
          </Button>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-3">
            <Title level={4} className="!m-0 !font-bold text-gray-900">
              {displayName}
            </Title>
            <span className="shrink-0 text-xs text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">
              年级：{user?.grade || '未设置'}
            </span>
          </div>
          <Text type="secondary" className="block mt-1">
            姓名：{user?.name || '未设置'}
          </Text>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <IdcardOutlined className="text-gray-400" />
            <span className="text-gray-600">学号</span>
            <span className="ml-auto font-medium text-gray-900">{user?.studentId || '未设置'}</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <BankOutlined className="text-gray-400" />
            <span className="text-gray-600">学院</span>
            <span className="ml-auto font-medium text-gray-900">{user?.college || '未设置'}</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <BookOutlined className="text-gray-400" />
            <span className="text-gray-600">专业</span>
            <span className="ml-auto font-medium text-gray-900">{user?.major || '未设置'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserInfoCard;
