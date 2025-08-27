import React, { useState } from 'react';
import { Card, Tabs, Spin, Typography } from 'antd';
import type { UserProfile } from '../../../types/types';

// 导入组件
import EditProfileModal from '../../../components/EditProfileModal';
import { UserInfoCard, CheckInTab, ActivityHistoryTab } from './components';
import { useUserProfile, useActivityHistory, useCheckInData } from './hooks';

const { Text } = Typography;

const ProfilePage: React.FC = () => {
  // 使用自定义hooks管理状态和数据
  const { user, loading, updateUserProfile } = useUserProfile();
  const { activityHistoryData, activityHistoryLoading } = useActivityHistory();
  const { checkInData, loading: checkInLoading, error: checkInError, deleteCheckIn, refreshData } = useCheckInData();
  
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
        <Spin size="large">
          <div className="p-8 text-center text-gray-600">加载用户信息中...</div>
        </Spin>
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
            <Tabs 
              defaultActiveKey="1" 
              centered 
              size="large"
              items={[
                {
                  key: '1',
                  label: '最近打卡记录',
                  children: (
                    <>
                      {checkInLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Spin size="large">
                            <div className="p-8 text-center text-gray-600">加载打卡记录中...</div>
                          </Spin>
                        </div>
                      ) : checkInError ? (
                        <div className="text-center py-8">
                          <Text type="danger">加载失败: {checkInError}</Text>
                          <div className="mt-4">
                            <button 
                              onClick={refreshData}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              重新加载
                            </button>
                          </div>
                        </div>
                      ) : checkInData.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无打卡记录</h3>
                          <p className="text-gray-500 mb-4">您还没有任何打卡记录，快去参与活动开始打卡吧！</p>
                          <button 
                            onClick={() => window.location.href = '/activities'}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            去参与活动
                          </button>
                        </div>
                      ) : (
                        <CheckInTab 
                          checkInData={checkInData}
                          onDelete={deleteCheckIn}
                          formatDate={formatDate}
                          onRefresh={refreshData}
                        />
                      )}
                    </>
                  ),
                },
                {
                  key: '2',
                  label: '参加活动历史',
                  children: (
                    <ActivityHistoryTab 
                      activityHistory={activityHistoryData}
                      loading={activityHistoryLoading}
                      formatDate={formatDate}
                    />
                  ),
                },
              ]}
            />
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