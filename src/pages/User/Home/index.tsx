import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Empty, Spin, message, Button } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppStore, useAuthStore, type Activity } from '../../../store';
import { ActivityAPI } from '../../../services/api';
import { transformActivityFromAPI } from '../../../utils/dataTransform';
import styles from './Home.module.css';

const { Search } = Input;
const { Meta } = Card;

const UserHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activities, loading, setLoading } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = activities.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivities(filtered);
    } else {
      setFilteredActivities(activities);
    }
  }, [activities, searchTerm]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await ActivityAPI.getActivityList({
        page: 1,
        page_size: 20
      });
      
      // 转换API响应数据为前端格式
      const transformedActivities = response.activitys.map(transformActivityFromAPI);
      setFilteredActivities(transformedActivities);
    } catch (error) {
      console.error('加载活动失败:', error);
      message.error('加载活动失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activityId: string) => {
    navigate(`/user/activity/${activityId}`);
  };

  const handleJoinActivity = async (activityId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    try {
      await ActivityAPI.joinActivity(activityId);
      message.success('参加活动成功！');
      // 可以在这里更新活动状态或重新加载活动列表
    } catch (error) {
      console.error('参加活动失败:', error);
      message.error('参加活动失败，请稍后重试');
    }
  };

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
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm">
              <span>今日已打卡</span>
              <span className="font-bold">3/5</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '60%' }}></div>
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
              const gradientClasses = [
                'gradient-card-purple',
                'gradient-card-yellow', 
                'gradient-card-blue',
                'gradient-card-pink'
              ];
              const gradientClass = gradientClasses[index % 4];
              
              return (
                <Card
                  key={activity.id}
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
                        <p className="text-sm opacity-90">{activity.description}</p>
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

export default UserHomePage;