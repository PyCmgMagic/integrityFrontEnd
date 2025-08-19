import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Empty, Spin, Modal, message, Button } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { SwipeAction, Dialog, Toast } from 'antd-mobile';
import { useAppStore, useAuthStore, type Activity } from '../../../store';
import { ActivityAPI } from '../../../services/api';
import { transformActivityFromAPI } from '../../../utils/dataTransform';
import CreateActivityModal from '../../../components/CreateActivityModal';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import styles from '../Home/Home.module.css';
import 'antd-mobile/es/global'; // 引入 antd-mobile 的全局样式

const { Search } = Input;

const ReviewManagePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState(''); // 输入框的值
  const [actualSearchTerm, setActualSearchTerm] = useState(''); // 实际用于搜索的值
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // 使用无限滚动Hook
  const {
    data: allActivities,
    loading,
    loadingMore,
    hasMore,
    containerRef,
    refresh,
    loadMore
  } = useInfiniteScroll(
    async ({ page, page_size }) => {
      // 构建API请求参数，支持通过name进行搜索
      const params: any = { page, page_size };
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
      onSuccess: (data, page) => {
        console.log(`第${page}页加载成功，获得${data.length}条数据`);
      },
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
    navigate(`/admin/activity/${activityId}`);
  };

  /**
   * 处理活动删除的函数
   */
  const handleDelete = async (activityId: string) => {
    const result = await Dialog.confirm({
      content: '确定要删除这个活动吗？',
      confirmText: '确认',
      cancelText: '取消',
    });
    
    if (result) {
      try {
        await ActivityAPI.deleteActivity(parseInt(activityId));
        
        // 刷新活动列表
        refresh();
        
        Toast.show({ content: '删除成功', position: 'bottom' });
      } catch (error) {
        console.error('删除活动失败:', error);
        Toast.show({ content: '删除失败，请稍后重试', position: 'bottom' });
      }
    }
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

  // 定义滑动操作的按钮
  const rightActions = (activityId: string) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => handleDelete(activityId),
    },
  ];

  return (
    <div className="page-container">
 
 
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
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">我的活动</h2>
        </div>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : allActivities.length > 0 ? (
          <div className="space-y-4">
            {allActivities.map((activity, index) => {
              const gradientClasses = ['gradient-card-purple', 'gradient-card-yellow', 'gradient-card-blue', 'gradient-card-pink'];
              const gradientClass = gradientClasses[index % 4];
              
              return (
                // 使用 SwipeAction 包裹 Card
                <SwipeAction
                  key={`${activity.id}-${index}`}
                  rightActions={rightActions(activity.id)}
                >
                  <Card
                  onClick={() => handleActivityClick(activity.id)}
                    hoverable
                    className={`${styles.activityCard} modern-card ${gradientClass}`}
                    cover={
                      <div className="relative h-42 overflow-hidden" > 
                        <img alt={activity.name} src={activity.cover} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-4 text-white">
                          <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
                          <p className="text-sm opacity-95 overflow-hidden overflow-ellipsis line-clamp-2">{activity.description}</p>
                        </div>
                      </div>
                    }
                  >
                    <div className="flex items-center justify-between" >
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
                </SwipeAction>
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
          <div className="text-center py-12">
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

export default ReviewManagePage;
