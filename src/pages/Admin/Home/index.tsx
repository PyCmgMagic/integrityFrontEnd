import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Empty, Spin, Modal, message, Button } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { SwipeAction, Dialog, Toast } from 'antd-mobile';
import { useAppStore, useAuthStore, type Activity } from '../../../store';
import { ActivityAPI } from '../../../services/api';
import { transformActivityFromAPI } from '../../../utils/dataTransform';
import CreateActivityModal from '../../../components/CreateActivityModal';
import styles from './Home.module.css';
import 'antd-mobile/es/global'; // 引入 antd-mobile 的全局样式

const { Search } = Input;

const AdminHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loading, setLoading } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  // 当搜索词或主活动列表更改时，更新过滤后的列表
  useEffect(() => {
    if (searchTerm) {
      const filtered = allActivities.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivities(filtered);
    } else {
      setFilteredActivities(allActivities);
    }
  }, [allActivities, searchTerm]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await ActivityAPI.getActivityList({
        page: 1,
        page_size: 20
      });
      
      // 转换API响应数据为前端格式
      const transformedActivities = response.activitys.map(transformActivityFromAPI);
      setAllActivities(transformedActivities);
    } catch (error) {
      console.error('加载活动失败:', error);
      message.error('加载活动失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activityId: string) => {
    navigate(`/admin/activity/${activityId}`);
  };

  // 处理活动删除的函数
  const handleDelete = async (activityId: string) => {
    const result = await Dialog.confirm({
      content: '确定要删除这个活动吗？',
      confirmText: '确认',
      cancelText: '取消',
    });
    
    if (result) {
      try {
        await ActivityAPI.deleteActivity(parseInt(activityId));
        
        // 从本地状态中移除已删除的活动
        setAllActivities(prevActivities => 
          prevActivities.filter(activity => activity.id !== activityId)
        );
        
        Toast.show({ content: '删除成功', position: 'bottom' });
      } catch (error) {
        console.error('删除活动失败:', error);
        Toast.show({ content: '删除失败，请稍后重试', position: 'bottom' });
      }
    }
  };

  // 处理创建活动成功
  const handleCreateSuccess = () => {
    loadActivities(); // 重新加载活动列表
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
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <UserOutlined className="text-white text-lg" />
            </div>
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
      <div className={styles.searchContainer}>
        <Search
          placeholder="搜索活动..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 活动列表 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">精彩活动</h2>
          <span className="text-gray-500 text-sm">查看全部</span>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const gradientClasses = ['gradient-card-purple', 'gradient-card-yellow', 'gradient-card-blue', 'gradient-card-pink'];
              const gradientClass = gradientClasses[index % 4];
              
              return (
                // 使用 SwipeAction 包裹 Card
                <SwipeAction
                  key={activity.id}
                  rightActions={rightActions(activity.id)}
                >
                  <Card
                    hoverable
                    className={`${styles.activityCard} modern-card ${gradientClass}`}
                    cover={
                      <div className="relative h-42 overflow-hidden" onClick={() => handleActivityClick(activity.id)}> 
                        <img alt={activity.name} src={activity.cover} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-4 text-white">
                          <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
                          <p className="text-sm opacity-90">{activity.description}</p>
                        </div>
                      </div>
                    }
                  >
                    <div className="flex items-center justify-between" onClick={() => handleActivityClick(activity.id)}>
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

export default AdminHomePage;
