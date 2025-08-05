import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Empty, Spin, Modal } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { SwipeAction, Dialog, Toast } from 'antd-mobile';
import { useAppStore, useAuthStore, type Activity } from '../../../store';
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockActivities: Activity[] = [
        { id: '1', name: '春季健康打卡活动', description: '每日运动打卡，健康生活从现在开始', cover: 'https://picsum.photos/300/200?random=1', startTime: '2024-03-01', endTime: '2024-05-31', projects: [], createdAt: '2024-03-01' },
        { id: '2', name: '学习打卡挑战', description: '每日学习记录，提升自我修养', cover: 'https://picsum.photos/300/200?random=2', startTime: '2024-03-15', endTime: '2024-06-15', projects: [], createdAt: '2024-03-15' },
        { id: '3', name: '环保行动打卡', description: '绿色生活，从小事做起', cover: 'https://picsum.photos/300/200?random=3', startTime: '2024-04-01', endTime: '2024-12-31', projects: [], createdAt: '2024-04-01' }
      ];
      
      // 将模拟数据设置到 allActivities 作为数据源
      setAllActivities(mockActivities);
    } catch (error) {
      console.error('加载活动失败:', error);
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
          content: '确定要删除这条打卡记录吗？',
          confirmText: '确认',
          cancelText: '取消',
        });
        if (result) {
          // setCheckInData(prevData => prevData.filter(item => item.id !== id));
          Toast.show({ content: '删除成功', position: 'bottom' });
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
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <UserOutlined className="text-white text-lg" />
            </div>
          </div>
          <div className=" rounded-lg border-2 border-dashed  p-4 flex flex-col items-center justify-center text-center cursor-pointer">
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
      
      {/* 占位div，防止底部导航栏遮挡内容 */}
      <div style={{ height: 55 }} />
    </div>
  );
};

export default AdminHomePage;
