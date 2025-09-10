import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Empty, Spin, message, Dropdown } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../../store';
import { ActivityAPI } from '../../../services/api';
import { transformActivityFromAPI } from '../../../utils/dataTransform';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import styles from './Home.module.css';
import useViewportHeight from '../../../hooks/useViewportHeight';

const { Search } = Input;


/**
 * 用户首页组件
 * 展示活动列表，支持无限滚动加载和搜索功能
 */
const UserHomePage = () => {
  const navigate = useNavigate();
  const { user ,logout} = useAuthStore();
  const [searchTerm, setSearchTerm] = useState(''); // 输入框的值
  const [actualSearchTerm, setActualSearchTerm] = useState(''); // 实际用于搜索的值
  const viewportHeight = useViewportHeight(); // 获取当前视口高度
  // 使用无限滚动Hook
  const {
    data: allActivities,
    loading,
    loadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll(
    async ({ page, page_size }) => {
      // 构建API请求参数，支持通过name进行搜索
      const params: { page: number; page_size: number; name?: string } = { page, page_size };
      if (actualSearchTerm.trim()) {
        params.name = actualSearchTerm.trim();
      }
      
      const response = await ActivityAPI.getActivityList(params);
      const transformedActivities = response.activitys.map(transformActivityFromAPI);
      return {
        ...response,
        activitys: transformedActivities,
        pageSize: response.page_size 
      };
    },
    {
      pageSize: 20,
      deps: [actualSearchTerm], // 当实际搜索词变化时重新加载数据
      onSuccess: (data, page) => {
        console.log(`第${page}页加载成功，获得${data.length}条数据`);
      },
      onError: (error) => {
        console.error('加载活动失败:', error);
        message.error('加载活动失败，请稍后重试');
      }
    }
  );

  /**
   * 处理搜索框输入变化
   */
  const handleInputChange = (value: string) => {
    setSearchTerm(value);
  };

  /**
   * 处理搜索执行
   */
  const handleSearch = (value: string) => {
    setActualSearchTerm(value);
    // actualSearchTerm变化会通过deps自动触发数据重新加载
  };

  /**
   * 处理活动卡片点击
   */
  const handleActivityClick = (activityId: string) => {
    navigate(`/user/activity/${activityId}`);
  };
  /**
   * 手动加载更多
   */
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadMore();
    }
  };


  /**
   * 处理退出登录
   */
  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  /**
   * 处理跳转到个人页面
   */
  const handleGoToProfile = () => {
    navigate('/user/profile');
  };

  /**
   * 用户头像下拉菜单配置
   */
  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center px-2 py-1">
          <UserOutlined className="mr-2" />
          我的
        </div>
      ),
      onClick: handleGoToProfile,
    },
    {
      key: 'logout',
      label: (
        <div className="flex items-center px-2 py-1 text-red-500">
          <LogoutOutlined className="mr-2" />
          退出登录
        </div>
      ),
      onClick: handleLogout,
    },
  ];
  return (
    <div className="page-container">
      {/* 用户欢迎区域 */}
      <div className={styles.welcomeSection}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Hi, {user?.name || '同学'}! 👋
              </h1>
              <p className="text-white/80">让我们开始今天的打卡之旅</p>
            </div>
              <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                <UserOutlined className="text-white text-lg" />
              </div>
            </Dropdown>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm mb-1">
               <div className="flex items-center gap-1">
                 <span className="text-lg">🌅</span>
                 <span className="text-white/70">00:00</span>
               </div>
               <span className="text-white/70">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
               <div className="flex items-center gap-1">
                 <span className="text-white/70">24:00</span>
                 <span className="text-lg">🌙</span>
               </div>
             </div>
            <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden relative">
               <div 
                  className="bg-white h-full rounded-full transition-all duration-1000 ease-in-out" 
                  style={{ width: `${(new Date().getHours() * 60 + new Date().getMinutes()) / 1440 * 100}%` }}
                ></div>
             
               <div className="absolute top-0 right-0 w-1 h-full bg-white/60 rounded-full transform translate-x-0.5"></div>
             </div>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className={styles.searchContainer}>
        <Search
          placeholder="搜索活动..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      {/* 活动列表 */}
      <div className="mb-4"
            style={{ minHeight: `${Math.max(viewportHeight * 0.6, 60)}px` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">精彩活动</h2>
          <span className="text-gray-500 text-sm">查看全部</span>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : allActivities.length > 0 ? (
          <div className="space-y-4">
            {allActivities.map((activity, index) => {
              const gradientClasses = [
                'gradient-card-purple',
                'gradient-card-yellow', 
                'gradient-card-blue',
                'gradient-card-pink'
              ];
              const gradientClass = gradientClasses[index % 4];
              
              return (
                <Card
                  key={`${activity.id}-${index}`}
                  hoverable
                  className={`${styles.activityCard} modern-card ${gradientClass}`}
                  cover={
                    <div className="relative h-42 overflow-hidden"> 
                      <img
                        alt={activity.name}
                        src={activity.cover}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4 text-white">
                        <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
                        <p className="text-sm opacity-95 overflow-hidden overflow-ellipsis line-clamp-2">{activity.description}</p>
                      </div>
                    </div>
                  }
                  onClick={() => handleActivityClick(activity.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <CalendarOutlined className="mr-2" />
                      <span>{activity.startTime} ~ {activity.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">进行中</span>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* 加载更多指示器 */}
            {loadingMore && (
              <div className="text-center py-4">
                <Spin size="small" />
                <span className="ml-2 text-gray-500">加载更多...</span>
              </div>
            )}
            
            {/* 手动加载更多按钮*/}
            {hasMore && !loadingMore && (
              <div className="text-center py-4">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 text-blue-500 hover:text-blue-700 transition-colors"
                >
                  点击加载更多
                </button>
              </div>
            )}
            
            {/* 没有更多数据提示 */}
            {!hasMore && allActivities.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                已加载全部活动
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12" 
            style={{ minHeight: `${Math.max(viewportHeight * 0.6, 60)}px` }}
          >
            <Empty 
              description={
                <div>
                  <p className="text-gray-500 mb-2">暂无活动</p>
                  <p className="text-gray-400 text-sm">敬请期待更多精彩活动</p>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
      {/* 占位div，防止底部导航栏遮挡内容 */}
      <div style={{ height: 55 }} />
    </div>
  );
};

export default UserHomePage;