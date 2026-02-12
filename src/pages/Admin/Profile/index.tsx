import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, Avatar, List, Button, Empty, Spin, Modal } from 'antd';
import { Dialog, Toast, Tabs } from 'antd-mobile';
import { BankOutlined, BookOutlined, EditOutlined, IdcardOutlined, LogoutOutlined, CalendarOutlined, StarOutlined, QuestionCircleOutlined, RightOutlined } from '@ant-design/icons';

// 添加全局样式来禁用浏览器左滑返回
const globalStyles = `
  body {
    overscroll-behavior-x: none;
    touch-action: pan-y;
  }
  
  .adm-tabs {
    overscroll-behavior-x: none;
    touch-action: pan-y;
  }
  
  .adm-tabs-content {
    overscroll-behavior-x: none;
    touch-action: pan-y;
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}


// 导入组件
import { 
  EditProfileModal,
} from '../../../components';
import CheckInDetailModal from './components/CheckInDetailModal';
// 导入用户端个人中心组件
import { CheckInTab, ActivityHistoryTab } from '../../User/Profile/components';
import { useCheckInData, useActivityHistory } from '../../User/Profile/hooks';
import { useAuthStore } from '../../../store/useAuthStore';
import { API } from '../../../services/api';
import { FEEDBACK_QQ_GROUP } from '../../../config/feedback';
import { formatBeijingDateMd, formatInBeijing } from '../../../utils/beijingTime';
import type {  StarListData } from '../../../types/types';

import type { UserProfile, StarItem  } from '../../../types/types';
import type { ApiResponse } from '../../../types/api';

// 收藏的打卡信息类型（保持兼容现有UI）
interface FavoriteData {
  id: number;
  title: string;
  description: string;
  date: string;
}

const { Title, Text } = Typography;




// 收藏的打卡信息初始数据
const initialFavoriteData: FavoriteData[] = [];

const ProfilePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // 从认证store获取用户信息
  const { user: authUser, setUserProfile, logout } = useAuthStore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState<boolean>(false);

  // If navigated here for completing missing fields, open the edit modal automatically.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === '1') setIsEditModalVisible(true);
  }, [location.search]);

  // const [checkInData, setCheckInData] = useState<CheckInData[]>(initialCheckInData);
  const [myActivities, setMyActivities] = useState<any[]>([]);
  const [myActivitiesLoading, setMyActivitiesLoading] = useState<boolean>(false);
  const [myActivitiesError, setMyActivitiesError] = useState<string>('');
  const [favoriteData, setFavoriteData] = useState<FavoriteData[]>(initialFavoriteData);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedPunchId, setSelectedPunchId] = useState<number>(0);
  const displayName = user?.nick_name || user?.name || '未设置';

  // 使用用户端个人中心的hooks
  const { checkInData: userCheckInData, loading: checkInLoading, error: checkInError, deleteCheckIn, refreshData } = useCheckInData();
  const { activityHistoryData, activityHistoryLoading } = useActivityHistory();

  const handleCopyQQGroup = async () => {
    if (!FEEDBACK_QQ_GROUP) return;
    try {
      await navigator.clipboard.writeText(FEEDBACK_QQ_GROUP);
      Toast.show({ content: '已复制QQ群号', position: 'bottom' });
    } catch (e) {
      console.error('复制失败:', e);
      Toast.show({ content: '复制失败，请手动复制', position: 'bottom' });
    }
  };

  /**
   * 格式化日期显示
   * @param dateString ISO日期字符串
   * @returns 格式化后的日期字符串 (MM-DD)
   */
  const formatDate = (dateString: string): string => {
    const formatted = formatBeijingDateMd(dateString);
    if (formatted) return formatted;
    console.error('日期格式化失败');
    return '未知';
  };

  // /**
  //  * 将ParticipationActivityItem数组转换为ActivityData格式
  //  * @param activities 活动历史数据数组
  //  * @returns 转换后的ActivityData对象
  //  */
  // const transformToActivityData = (activities: ParticipationActivityItem[]): ActivityData => {
  //   if (!activities || activities.length === 0) {
  //     return {
  //       id: 'empty',
  //       title: '暂无活动数据',
  //       checkInRecords: []
  //     };
  //   }

  //   // 将所有活动的打卡记录合并到一个ActivityData对象中
  //   const allCheckInRecords: CheckInRecord[] = [];
    
  //   activities.forEach(activity => {
  //     // 这里需要根据实际的打卡记录数据结构来填充
  //     // 目前先创建一个示例记录
  //     const record: CheckInRecord = {
  //       id: activity.ID+"",
  //       userName: activity.user?.nick_name || '未知用户',
  //       checkInTime: formatDateFromNumber(activity.start_date),
  //       score: 100, // 默认分数
  //       categoryName: activity.name
  //     };
  //     allCheckInRecords.push(record);
  //   });

  //   return {
  //     id: 'combined-activities',
  //     title: '活动打卡记录汇总',
  //     checkInRecords: allCheckInRecords
  //   };
  // };

  /**
   * 格式化数字日期为字符串
   * @param dateNumber 数字格式日期（如20250103）
   * @returns 格式化后的日期字符串
   */
  const formatDateFromNumber = (dateNumber: number): string => {
    const dateStr = dateNumber.toString();
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  /**
   * 获取我创建的活动数据
   */
  const fetchMyActivities = async () => {
    try {
      setMyActivitiesLoading(true);
      setMyActivitiesError('');
      
      // 检查用户是否已登录
      if (!authUser || !authUser.id) {
        const errorMsg = '请先登录后再查看我创建的活动';
        setMyActivitiesError(errorMsg);
        console.warn('用户未登录，无法获取我创建的活动');
        Toast.show({ content: errorMsg, position: 'bottom' });
        return;
      }
      
      const response = await API.Activity.getMyActivities();
      
      if (response.code === 200 && response.data) {
        setMyActivities(response.data);
        setMyActivitiesError('');
      } else {
        const errorMsg = response.msg || '获取我创建的活动失败';
        setMyActivitiesError(errorMsg);
        Toast.show({ content: errorMsg, position: 'bottom' });
      }
    } catch (error: any) {
      let errorMsg = '获取我创建的活动失败';
      
      // 根据错误类型提供更具体的错误信息
      if (error.code === 400) {
        errorMsg = '认证失败，请重新登录';
      } else if (error.code === 401) {
        errorMsg = '登录已过期，请重新登录';
      } else if (error.code === 403) {
        errorMsg = '没有权限访问此功能';
      } else if (error.code === 404) {
        errorMsg = 'API接口不存在';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setMyActivitiesError(errorMsg);
      Toast.show({ content: errorMsg, position: 'bottom' });
    } finally {
      setMyActivitiesLoading(false);
    }
  };

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
      if (response.code === 200 && response.data.stars) {
        // 将API返回的数据转换为UI需要的格式
        const transformedData: FavoriteData[] = response.data.stars.map((item: StarItem) => ({
          id: item.punch.ID,
          title: `打卡记录 #${item.punch.ID}`,
          description: item.punch.content || '暂无内容',
          date:
            formatInBeijing(item.created_at, { year: 'numeric', month: 'numeric', day: 'numeric' }) ||
            item.created_at,
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
        // name 为真实姓名（不可编辑）；nick_name 为昵称（可编辑）
        name: profileData.name || '未设置',
        nick_name: profileData.nick_name || '',
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
          name: authUser.name || '未设置',
          nick_name: authUser.nick_name || '',
          avatar: authUser.avatar || '/assets/默认头像.png',
          bio: '',
          studentId: authUser.student_id || '未设置',
          grade: '',
          college: authUser.college || '未设置',
          major: authUser.major || '未设置',
          dob: '',
          gender: '男',
        };
        setUser(fallbackProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 组件挂载时获取用户信息、我创建的活动和收藏列表
   */
  useEffect(() => {
    fetchUserProfile();
    fetchMyActivities();
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
      const nickName = (updatedData.nick_name || '').trim();
      // 转换前端数据格式为API所需格式
      const updateRequest = {
        avatar: updatedData.avatar,
        college: updatedData.college,
        major: updatedData.major,
        grade: updatedData.grade,
        ...(nickName ? { nick_name: nickName } : {}),
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
    const result = await Dialog.confirm({
      content: '确定要取消收藏吗？',
      confirmText: '确认',
      cancelText: '取消',
    });

    if (!result) return;

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
          
          <Card
            className="rounded-2xl overflow-hidden border-1 border-gray-200 bg-white shadow-sm"
            styles={{ body: { padding: 0 } }}
          >
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

            <div className="px-5 pb-5">
              <div className="relative -mt-10 flex items-end justify-between gap-3">
                <div className="relative">
                  <Avatar size={88} src={user.avatar} className="border-4 border-white shadow-md" />
                  <button
                    type="button"
                    onClick={showEditModal}
                    className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white shadow-md ring-1 ring-black/5 flex items-center justify-center hover:bg-gray-50"
                    aria-label="编辑个人信息"
                  >
                    <EditOutlined className="text-gray-700" />
                  </button>
                </div>

                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={showEditModal}
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

          {/* 问题反馈 */}
          <Card className="rounded-2xl border-0 bg-white shadow-sm" style={{ marginTop: 16 }}>
            <div
              role="button"
              tabIndex={0}
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setIsFeedbackModalVisible(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsFeedbackModalVisible(true);
              }}
            >
              <div className="flex items-center gap-2 text-gray-800">
                <QuestionCircleOutlined className="text-gray-500" />
                <span className="font-medium">问题反馈</span>
              </div>
              <RightOutlined className="text-gray-400" />
            </div>
          </Card>
          
          {/* 打卡与活动历史 */}
          <Card 
            className="rounded-2xl border-0 bg-white"
            style={{
              touchAction: 'pan-y', // 只允许垂直滑动
              overscrollBehaviorX: 'none', // 禁用水平过度滚动
              marginTop: 16,
            }}
          >
            <Tabs 
              defaultActiveKey="0"
              style={{
                '--adm-color-primary': '#1890ff',
                '--adm-tabs-tab-line-color': '#1890ff',
              } as React.CSSProperties}
            >
              <Tabs.Tab title="我创建的活动" key="0">
                {myActivitiesLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <Spin size="large">
                      <div className="p-8 text-center text-gray-600">加载我创建的活动中...</div>
                    </Spin>
                  </div>
                ) : myActivitiesError ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
                    <p className="text-gray-500 mb-4">{myActivitiesError}</p>
                    {myActivitiesError.includes('登录') && (
                      <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">
                        提示：请检查您的登录状态，如果问题持续存在，请重新登录
                      </div>
                    )}
                    <div className="space-x-4">
                      <button 
                        onClick={fetchMyActivities}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        重试
                      </button>
                      {myActivitiesError.includes('登录') && (
                        <button 
                          onClick={() => {
                            logout();
                            window.location.href = '/login';
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          重新登录
                        </button>
                      )}
                    </div>
                  </div>
                ) : myActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无创建的活动</h3>
                    <p className="text-gray-500 mb-4">您还没有创建任何活动，快去创建第一个活动吧！</p>
                    <div className="space-x-4">
                      <button 
                        onClick={fetchMyActivities}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        刷新
                      </button>
                      <button 
                        onClick={() => window.location.href = '/admin/home'}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        去创建活动
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 pt-0 space-y-5">
                    {myActivities.map((activity, index) => {
                      const gradientClasses = [
                        'gradient-card-purple',
                        'gradient-card-yellow', 
                        'gradient-card-blue',
                        'gradient-card-pink'
                      ];
                      const gradientClass = gradientClasses[index % 4];
                      
                      return (
                        <Card
                          key={activity.ID}
                          className={`modern-card ${gradientClass} rounded-3xl shadow-xl border-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                          styles={{ body: { padding: '16px' } }}
                          onClick={() => navigate(`/admin/activity/${activity.ID}`)}
                          cover={
                            <div className="relative h-40 overflow-hidden group"> 
                              <img
                                alt={activity.name}
                                src={activity.avatar || '/assets/默认封面.png'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                              <div className="absolute top-3 right-3">
                                <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-xs font-medium border border-white/30">
                                  创建者
                                </div>
                              </div>
                              <div className="absolute bottom-3 left-4 right-4 text-white">
                                <h3 className="font-bold text-xl mb-1.5 drop-shadow-lg">{activity.name}</h3>
                                <p className="text-sm opacity-95 overflow-hidden overflow-ellipsis line-clamp-2 drop-shadow-md">
                                  {activity.description || '暂无描述'}
                                </p>
                              </div>
                            </div>
                          }
                        >
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center text-sm font-medium">
                              <div className="bg-white/30 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center">
                                <CalendarOutlined className="mr-2 text-base" />
                                <span>{activity.start_date ? formatDateFromNumber(activity.start_date) : '未设置'}</span>
                              </div>
                            </div>
                            <Button 
                              type="text" 
                              danger 
                              size="middle"
                              className="font-medium hover:scale-105 transition-transform"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const result = await Dialog.confirm({
                                  content: '确定要删除这个活动吗？',
                                  confirmText: '确认',
                                  cancelText: '取消',
                                });
                                if (result) {
                                  try {
                                    const response = await API.Activity.deleteActivity(activity.ID);
                                    if (response.code === 200) {
                                      await fetchMyActivities();
                                      Toast.show({ content: '删除成功', position: 'bottom' });
                                    } else {
                                      Toast.show({ content: response.msg || '删除失败', position: 'bottom' });
                                    }
                                  } catch (error) {
                                    console.error('删除活动失败:', error);
                                    Toast.show({ content: '删除失败，请重试', position: 'bottom' });
                                  }
                                }
                              }}
                            >
                              删除
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Tabs.Tab>
              
              <Tabs.Tab title="最近打卡记录" key="1">
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
                  ) : userCheckInData.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无打卡记录</h3>
                      <p className="text-gray-500 mb-4">您还没有任何打卡记录，快去参与活动开始打卡吧！</p>
                      <button 
                        onClick={() => window.location.href = '/admin/home'}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        去管理活动
                      </button>
                    </div>
                  ) : (
                    <CheckInTab 
                      checkInData={userCheckInData}
                      onDelete={deleteCheckIn}
                      formatDate={formatDate}
                      onRefresh={refreshData}
                    />
                  )}
                </>
              </Tabs.Tab>
              
              <Tabs.Tab title="参加活动历史" key="2">
                <ActivityHistoryTab 
                  activityHistory={activityHistoryData}
                  loading={activityHistoryLoading}
                  formatDate={formatDate}
                />
              </Tabs.Tab>
              <Tabs.Tab title="我的收藏" key="4">
                <div className="p-2 pt-0">
                  <Spin spinning={favoriteLoading}>
                    {favoriteData.length > 0 ? (
                      <List
                        dataSource={favoriteData}
                        renderItem={(item) => (
                          <List.Item key={item.id} className="border-0 px-0 py-2">
                            <div 
                              className="w-full bg-yellow-50 rounded-xl px-1 py-2 transition-all hover:bg-yellow-100 hover:shadow-md cursor-pointer"
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
              </Tabs.Tab>
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





      <Modal
        title="问题反馈"
        open={isFeedbackModalVisible}
        onCancel={() => setIsFeedbackModalVisible(false)}
        footer={null}
        centered
      >
        <div className="text-gray-700">
          <div className="mb-2">加入QQ群反馈问题：</div>
          <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-mono text-gray-900">
              {FEEDBACK_QQ_GROUP ? `QQ群：${FEEDBACK_QQ_GROUP}` : 'QQ群：稍后设置'}
            </span>
            <Button size="small" onClick={handleCopyQQGroup} disabled={!FEEDBACK_QQ_GROUP}>
              复制
            </Button>
          </div>
          {!FEEDBACK_QQ_GROUP && (
            <div className="mt-2 text-xs text-gray-500">
              群号配置后这里会自动显示。
            </div>
          )}
        </div>
      </Modal>

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
