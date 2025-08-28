import React, { useState, useEffect } from 'react';
import { Card, Typography, Avatar, Tabs, List, Button, message, Empty, Spin, Space } from 'antd';
import { Dialog, SwipeAction, Toast } from 'antd-mobile';
import { EditOutlined, CalendarOutlined, StarOutlined, DownloadOutlined, LogoutOutlined } from '@ant-design/icons';


// 导入组件
import { 
  EditProfileModal, 
  ExportDataModal
} from '../../../components';
import CheckInDetailModal from './components/CheckInDetailModal';
import { useAuthStore } from '../../../store/useAuthStore';
import { API } from '../../../services/api';
import type { ActivityData, StarListData } from '../../../types/types';

import type { UserProfile, CheckInData, ActivityHistoryData, StarItem, StarListResponse } from '../../../types/types';
import type { ApiResponse } from '../../../types/api';

// 收藏的打卡信息类型（保持兼容现有UI）
interface FavoriteData {
  id: number;
  title: string;
  description: string;
  date: string;
}

const { Title, Text } = Typography;

// 为初始数据应用类型
const initialCheckInData: CheckInData[] = [
  { id: 1, title: '寒假打卡-“瑞蛇衔知”，勤学善知-自习打卡', time: '第14次打卡', date: '1.19' },
  { id: 2, title: '寒假打卡-“瑞蛇衔知”，勤学善知-单词打卡', time: '第13次打卡', date: '1.18' },
  { id: 3, title: '寒假打卡-“瑞蛇衔知”，勤学善知-自习打卡', time: '第12次打卡', date: '1.18' },
  { id: 4, title: '寒假打卡-“瑞蛇衔知”，勤学善知-单词打卡', time: '第11次打卡', date: '1.17' },
];

const activityHistoryData: ActivityHistoryData[] = [
    { id: 1, type: 'join', title: '参加了 "编程马拉松" 活动', date: '12-25' },
    { id: 2, type: 'post', title: '在 "校园摄影展" 中发布了新照片', date: '12-20' },
    { id: 3, type: 'join', title: '报名了 "学期总结分享会"', date: '12-15' },
];

// 收藏的打卡信息初始数据（现在从API获取，保留空数组作为初始状态）
const initialFavoriteData: FavoriteData[] = [];

const ProfilePage: React.FC = () => {
  // 从认证store获取用户信息
  const { user: authUser, setUserProfile, logout } = useAuthStore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isExportDataModalVisible, setIsExportDataModalVisible] = useState<boolean>(false);
  const [checkInData, setCheckInData] = useState<CheckInData[]>(initialCheckInData);
  const [favoriteData, setFavoriteData] = useState<FavoriteData[]>(initialFavoriteData);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedPunchId, setSelectedPunchId] = useState<number>(0);

  /**
   * 获取收藏列表数据
   */
  const fetchFavoriteData = async () => {
    try {
      setFavoriteLoading(true);
      const response: ApiResponse<StarListData> = await API.Star.getStarList({
        page: 1,
        page_size: 50, // 获取更多数据
      });
      console.log(response)
      console.log(response.data)
      if (response.code === 200 && response.data.stars) {
        // 将API返回的数据转换为UI需要的格式
        const transformedData: FavoriteData[] = response.data.stars.map((item: StarItem) => ({
          id: item.punch.ID,
          title: `打卡记录 #${item.punch.ID}`,
          description: item.punch.content || '暂无内容',
          date: new Date(item.created_at).toLocaleDateString('zh-CN'),
        }));
        
        setFavoriteData(transformedData);
      } else {
        console.error('获取收藏列表失败:', response.msg);
        Toast.show({ content: response.msg || '获取收藏列表失败', position: 'bottom' });
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      Toast.show({ content: '获取收藏列表失败', position: 'bottom' });
    } finally {
      setFavoriteLoading(false);
    }
  };

  /**
   * 获取用户个人信息
   */
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await API.User.getCurrentUser();
      
      // 转换API数据格式为前端UserProfile格式
      const userProfile: UserProfile = {
        name: profileData.nick_name || profileData.name || '未设置',
        avatar: profileData.avatar || '/assets/默认头像.png',
        studentId: authUser?.student_id || '未设置',
        grade: profileData.grade || '未设置', 
        college: profileData.college || '未设置',
        major: profileData.major || '未设置',
      };
      
      setUser(userProfile);
      // 同时更新认证store中的用户信息
      setUserProfile(profileData);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      Toast.show({ content: '获取用户信息失败', position: 'bottom' });
      
      // 使用认证store中的基本信息作为fallback
      if (authUser) {
        const fallbackProfile: UserProfile = {
          name: authUser.nick_name || authUser.name || '未设置',
          avatar: authUser.avatar || '/assets/默认头像.png',
          bio: '管理员账户',
          studentId: authUser.student_id || '未设置',
          grade: '2024级',
          college: authUser.college || '未设置',
          major: authUser.major || '未设置',
          dob: '2006-01-01',
          gender: '男',
        };
        setUser(fallbackProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 组件挂载时获取用户信息和收藏列表
   */
  useEffect(() => {
    fetchUserProfile();
    fetchFavoriteData();
  }, []);

  const showEditModal = () => setIsEditModalVisible(true);
  const handleModalCancel = () => setIsEditModalVisible(false);

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    try {
      const result = await Dialog.confirm({
        content: '确定要退出登录吗？',
        confirmText: '确认',
        cancelText: '取消',
      });
      
      if (result) {
        logout();
        Toast.show({ content: '已退出登录', position: 'bottom' });
      }
    } catch (error) {
      console.error('退出登录失败:', error);
      Toast.show({ content: '退出登录失败', position: 'bottom' });
    }
  };

  /**
   * 处理个人信息保存
   */
  const handleModalSave = async (updatedData: UserProfile) => {
    try {
      // 转换前端数据格式为API所需格式
      const updateRequest = {
        nick_name: updatedData.name,
        avatar: updatedData.avatar,
        college: updatedData.college,
        major: updatedData.major,
        grade: updatedData.grade,
      };
      
      // 调用API更新用户信息
      const response = await API.User.updateProfile(updateRequest);
      
      if (response && response.code === 200) {
        setUser(updatedData);
        setIsEditModalVisible(false);
        Toast.show({ content: '个人信息已更新', position: 'bottom' });
        
        // 重新获取最新的用户信息
        await fetchUserProfile();
      } else {
        Toast.show({ content: (response && response.msg) || '更新失败', position: 'bottom' });
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      Toast.show({ content: '更新失败，请重试', position: 'bottom' });
    }
  };


  // 显示导出数据模态框
  const showExportDataModal = () => {
    setIsExportDataModalVisible(true);
  };

  // 隐藏导出数据模态框
  const hideExportDataModal = () => {
    setIsExportDataModalVisible(false);
  };

  // 处理导出数据
  const handleExportData = (exportOptions: any) => {
    // 模拟导出过程
    message.loading('正在导出数据...', 1.5)
      .then(() => {
        console.log('导出选项:', exportOptions);
        message.success('活动数据已导出');
        setIsExportDataModalVisible(false);
      });
  };

  /**
   * 处理点击收藏记录，显示打卡详情
   */
  const handleFavoriteClick = (punchId: number) => {
    setSelectedPunchId(punchId);
    setIsDetailModalVisible(true);
  };

  /**
   * 关闭打卡详情模态窗口
   */
  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedPunchId(0);
  };

  // 取消收藏的处理函数
  const handleRemoveFavorite = async (id: number) => {
    try {
      const response = await API.Star.cancelStar(id);
      if (response.code === 200) {
        // 从本地状态中移除该项
        setFavoriteData(prevData => prevData.filter(item => item.id !== id));
        Toast.show({ content: '已取消收藏', position: 'bottom' });
      } else {
        Toast.show({ content: response.msg || '取消收藏失败', position: 'bottom' });
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      Toast.show({ content: '取消收藏失败，请重试', position: 'bottom' });
    }
  };

  const rightActions = (id: number) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger' as const, // antd-mobile 需要一个常量类型
      onClick: async () => {
        const result = await Dialog.confirm({
          content: '确定要删除这条打卡记录吗？',
          confirmText: '确认',
          cancelText: '取消',
        });
        if (result) {
          setCheckInData(prevData => prevData.filter(item => item.id !== id));
          Toast.show({ content: '删除成功', position: 'bottom' });
        }
      },
    },
  ];

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
              onClick={fetchUserProfile}
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
          <Card className="border-1 border-gray-200 mb-4 bg-white" style={{ position: 'relative' }}>
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
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-md flex items-center justify-center border-1 border-black cursor-pointer bg-white hover:bg-gray-100 transition-colors" onClick={showEditModal}>
                  <EditOutlined />
                </div>
              </div>
              <Title level={3} className="mt-2 font-bold">{user?.name}</Title>
              <div className="mt-1 text-center">
                <Text type="secondary" className="block">学号: {user?.studentId}</Text>
                <Space>
                <Text type="secondary" className="block">{user?.college}</Text>
                <Text type="secondary" className="block">{user?.major}</Text>
              </Space>
              </div>
            </div>
          </Card>
          
          {/* 打卡与活动历史 */}
          <Card className="rounded-2xl border-0 bg-white">
            <Tabs 
              defaultActiveKey="1" 
              centered 
              size="large"
              items={[
                {
                  key: '1',
                  label: '我创建的活动',
                  children: (
                    <div className="p-4 pt-0">
                      {checkInData.map((item, index) => (
                        <SwipeAction
                          key={item.id}
                          style={{ ['--adm-swipe-action-actions-border-radius' as string]: '0.75rem' }}
                          rightActions={rightActions(item.id)}
                          className={index === checkInData.length - 1 ? '' : 'mb-3'}
                        >
                          <div className="w-full bg-blue-50 rounded-xl p-4 transition-all hover:bg-blue-100 hover:shadow-md">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div>
                                    <Text strong className="text-gray-800">{item.title}</Text>
                                    <div className="flex justify-between items-center mt-1">
                                      <p className="text-gray-500 text-sm m-0">{item.time}</p> 
                                      <Text type="secondary" className="font-semibold ml-4">{item.date}</Text>
                                    </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </SwipeAction>
                      ))}
                    </div>
                  ),
                },
                {
                  key: '2',
                  label: '导出活动数据',
                  children: (
                    <div className="p-4 pt-0">
                      <Button 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        className="mb-4 bg-green-500 hover:bg-green-600" 
                        onClick={showExportDataModal}
                      >
                        导出数据
                      </Button>
                      <List
                        className="mt-2"
                        dataSource={activityHistoryData}
                        renderItem={(item) => (
                         <List.Item key={item.id} className="border-0 px-0 py-2">
                          <div className="w-full bg-gray-50 rounded-xl p-4 transition-all hover:bg-gray-100 hover:shadow-md">
                            <div className="flex justify-between items-center">
                               <div className="flex items-center">
                                  <CalendarOutlined className="text-purple-500 mr-4 text-xl" />
                                  <Text className="text-gray-700">{item.title}</Text>
                               </div>
                               <Text type="secondary">{item.date}</Text>
                            </div>
                          </div>
                        </List.Item>
                      )}
                      />
                    </div>
                  ),
                },
                {
                  key: '3',
                  label: '我的收藏',
                  children: (
                    <div className="p-4 pt-0">
                      <Spin spinning={favoriteLoading}>
                        {favoriteData.length > 0 ? (
                          <List
                            dataSource={favoriteData}
                            renderItem={(item) => (
                              <List.Item key={item.id} className="border-0 px-0 py-2">
                                <div 
                                  className="w-full bg-yellow-50 rounded-xl p-4 transition-all hover:bg-yellow-100 hover:shadow-md cursor-pointer"
                                  onClick={() => handleFavoriteClick(item.id)}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center flex-1">
                                      <StarOutlined className="text-yellow-500 mr-4 text-xl" />
                                      <div className="flex-1">
                                        <Text strong className="text-gray-800">{item.title}</Text>
                                        <div className="mt-1">
                                          <Text 
                                            className="line-clamp-2" 
                                            type="secondary"
                                          >
                                            {item.description}
                                          </Text>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <Text type="secondary">{item.date}</Text>
                                      <Button 
                                        type="text" 
                                        danger 
                                        size="small" 
                                        className="mt-2"
                                        onClick={(e) => {
                                          e.stopPropagation(); // 阻止事件冒泡
                                          handleRemoveFavorite(item.id);
                                        }}
                                      >
                                        取消收藏
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty description={favoriteLoading ? "加载中..." : "暂无收藏"} />
                        )}
                      </Spin>
                    </div>
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



      {/* 导出数据模态框 */}
      <ExportDataModal
        visible={isExportDataModalVisible}
        onCancel={hideExportDataModal}
        onExport={handleExportData}
      />

      {/* 打卡详情模态框 */}
      <CheckInDetailModal
        visible={isDetailModalVisible}
        onClose={handleDetailModalClose}
        punchId={selectedPunchId}
      />
    </>
  );
};

export default ProfilePage;