import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Empty, Spin, Dropdown, message } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore  } from '../../../store';
import { ActivityAPI } from '../../../services/api';
import { transformActivityFromAPI } from '../../../utils/dataTransform';
import { getActivityTimeStatus } from '../../../utils/activityTimeStatus';
import CreateActivityModal from '../../../components/CreateActivityModal';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useViewportHeight from '../../../hooks/useViewportHeight';
import styles from './Home.module.css';
import 'antd-mobile/es/global'; // 引入 antd-mobile 的全局样式
const { Search } = Input;
/**
 * 管理员首页组件
 * 展示活动列表，支持无限滚动加载
 */
const AdminHomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState(''); // 输入框的值
  const [actualSearchTerm, setActualSearchTerm] = useState(''); // 实际用于搜索的值
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const viewportHeight = useViewportHeight(); // 获取当前视口高度
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // 使用无限滚动Hook
  const {
    data: allActivities,
    loading,
    loadingMore,
    hasMore,
    refresh,
    loadMore
  } = useInfiniteScroll(
    async ({ page, page_size }) => {
      // 构建API请求参数，支持通过name进行搜索
      interface ActivityListParams {
        page: number;
        page_size: number;
        name?: string;
      }
      const params: ActivityListParams = { page, page_size };
      if (actualSearchTerm.trim()) {
        params.name = actualSearchTerm.trim();
      }
      
      const response = await ActivityAPI.getActivityList(params);
      // 转换API响应数据为前端格式
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
      onSuccess: () => {},
      onError: (error) => {
        console.error('加载活动失败:', error);
      }
    }
  );

  /**
   * 处理搜索框输入变化（仅更新输入框显示值，不触发搜索）
   */
  const handleInputChange = (value: string) => {
    setSearchTerm(value);
  };

  /**
   * 处理搜索执行（点击搜索按钮或按回车时触发）
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
   * 处理创建活动成功
   */
  const handleCreateSuccess = () => {
    refresh(); // 刷新活动列表
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
    navigate('/admin/profile');
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
              <p className="text-white/80">要发布新活动了吗？</p>
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
          <div onClick={() => setCreateModalVisible(true)} className=" rounded-lg border-2 border-dashed  p-4 flex flex-col items-center justify-center text-center cursor-pointer">
            <div className="w-16 h-16 border-2 border-white/50 rounded-full flex items-center justify-center mb-2 shadow border-dashed">
              <span className="text-4xl font-bold text-white">+</span>
            </div>  
            <p className="text-lg font-semibold text-white">创建活动</p> 
          </div>
        </div>
      </div>
 
      {/* 搜索框 */}
      <div className={`border-0 border-white-300 w-full ${styles.searchContainer}`}>
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
                      {(() => {
                        const status = getActivityTimeStatus(nowMs, {
                          startDate: activity.startTime,
                          endDate: activity.endTime,
                        });
                        const meta = {
                          not_started: { label: '未开始', dot: 'bg-slate-400' },
                          in_progress: { label: '进行中', dot: 'bg-green-500' },
                          ended: { label: '已结束', dot: 'bg-rose-500' },
                        }[status];

                        return (
                          <>
                            <div className={`w-2 h-2 ${meta.dot} rounded-full`}></div>
                            <span className="text-sm font-medium">{meta.label}</span>
                          </>
                        );
                      })()}
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
          <div 
            className="flex items-center justify-center text-center"
            style={{ minHeight: `${Math.max(viewportHeight * 0.6, 60)}px` }}
          >
            <Empty
              className='h-full w-full'
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

      {/* 创建活动模态框 */}
      <CreateActivityModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />
      
      {/* 占位div，防止底部导航栏遮挡内容 */}
      <div style={{ height: 55 }} />
    </div>
  );
};
export default AdminHomePage;
