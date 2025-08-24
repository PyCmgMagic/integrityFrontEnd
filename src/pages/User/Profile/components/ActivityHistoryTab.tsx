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
        <Spin size="large" tip="加载活动历史中..." />
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
    <div className="p-4 pt-0 space-y-4">
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
            className={`modern-card ${gradientClass} rounded-2xl shadow-lg border-0`}
            onClick={() =>handleClick(item.ID)}
            cover={
              <div className="relative h-32 overflow-hidden"> 
                <img
                  alt={item.name}
                  src={item.avatar || '/assets/默认封面.png'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm opacity-95 overflow-hidden overflow-ellipsis line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            }
          >
            <div className="flex h-1 items-center justify-between">
              <div className="flex items-center text-sm">
                <CalendarOutlined className="mr-2" />
                <span>{formatDate(item.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">已参加</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ActivityHistoryTab;