import React from 'react';
import { Card, Typography, Spin } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import type { ParticipationActivityItem } from '../../../../types/api';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface ActivityHistoryTabProps {
  activityHistory: ParticipationActivityItem[];
  loading: boolean;
  formatDate: (dateString: string) => string;
}

/**
 * 活动历史标签页组件
 * 显示用户参加的活动历史记录
 */
const ActivityHistoryTab: React.FC<ActivityHistoryTabProps> = ({ 
  activityHistory, 
  loading, 
  formatDate 
}) => {
    const navigate = useNavigate();
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spin size="large">
          <div className="p-8 text-center text-gray-600">加载活动历史中...</div>
        </Spin>
      </div>
    );
  }

  if (activityHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <Text type="secondary">暂无参加活动历史</Text>
      </div>
    );
  }
  const  handleClick = (id: number) => {
    navigate(`/user/activity/${id}`);
  }

  return (
    <div className="p-4 pt-0 space-y-5">
      {activityHistory.map((item, index) => {
        const gradientClasses = [
          'gradient-card-purple',
          'gradient-card-yellow', 
          'gradient-card-blue',
          'gradient-card-pink'
        ];
        const gradientClass = gradientClasses[index % 4];
        
        return (
          <Card
            key={item.ID}
            className={`modern-card ${gradientClass} rounded-3xl shadow-xl border-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
            styles={{ body: { padding: '16px' } }}
            onClick={() =>handleClick(item.ID)}
            cover={
              <div className="relative h-40 overflow-hidden group"> 
                <img
                  alt={item.name}
                  src={item.avatar || '/assets/默认封面.png'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute top-3 right-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-xs font-medium border border-white/30">
                    已参加
                  </div>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-bold text-xl mb-1.5 drop-shadow-lg">{item.name}</h3>
                  <p className="text-sm opacity-95 overflow-hidden overflow-ellipsis line-clamp-2 drop-shadow-md">
                    {item.description}
                  </p>
                </div>
              </div>
            }
          >
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center text-sm font-medium">
                <div className="bg-white/30 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center">
                  <CalendarOutlined className="mr-2 text-base" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse"></div>
                <span className="text-sm font-semibold">活跃</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ActivityHistoryTab;