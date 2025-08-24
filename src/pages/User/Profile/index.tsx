import React, { useState } from 'react';
import { Card, Tabs, Spin, Typography } from 'antd';
import type { UserProfile } from '../../../types/types';

// 导入组件
import EditProfileModal from '../../../components/EditProfileModal';
import { UserInfoCard, CheckInTab, ActivityHistoryTab } from './components';
import { useUserProfile, useActivityHistory, useCheckInData } from './hooks';

const { Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage: React.FC = () => {
  // 使用自定义hooks管理状态和数据
  const { user, loading, updateUserProfile } = useUserProfile();
  const { activityHistoryData, activityHistoryLoading } = useActivityHistory();
  const { checkInData, deleteCheckIn } = useCheckInData();
  
  // 本地状态
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  /**
   * 格式化日期显示
   * @param dateString ISO日期字符串
   * @returns 格式化后的日期字符串 (MM-DD)
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}-${day}`;
    } catch (error) {
      console.error('日期格式化失败:', error);
      return '未知';
    }
  };

  /**
   * 显示编辑模态框
   */
  const showEditModal = () => setIsEditModalVisible(true);
  
  /**
   * 关闭编辑模态框
   */
  const handleModalCancel = () => setIsEditModalVisible(false);

  /**
   * 处理个人信息保存
   */
  const handleModalSave = async (updatedData: UserProfile) => {
    const success = await updateUserProfile(updatedData);
    if (success) {
      setIsEditModalVisible(false);
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans pb-12 p-1 flex items-center justify-center">
        <Spin size="large" tip="加载用户信息中..." />
      </div>
    );
  }

  // 如果没有用户信息，显示错误状态
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans pb-12 p-1 flex items-center justify-center">
        <div className="text-center">
          <Text type="secondary">无法获取用户信息</Text>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen font-sans pb-12 p-1">
        <div className="max-w-2xl mx-auto">
          {/* 用户信息卡片 */}
          <UserInfoCard 
            user={user}
            onEditClick={showEditModal}
          />
          
          {/* 打卡与活动历史 */}
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <Tabs defaultActiveKey="1" centered size="large">
              <TabPane tab="最近打卡记录" key="1">
                <CheckInTab 
                  checkInData={checkInData}
                  onDelete={deleteCheckIn}
                  formatDate={formatDate}
                />
              </TabPane>
              <TabPane tab="参加活动历史" key="2">
                <ActivityHistoryTab 
                   activityHistory={activityHistoryData}
                   loading={activityHistoryLoading}
                   formatDate={formatDate}
                 />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* 渲染模态框组件 */}
      <EditProfileModal
        visible={isEditModalVisible}
        onCancel={handleModalCancel}
        onSave={handleModalSave}
        currentUser={user}
      />
    </>
  );
};

export default ProfilePage;