import React from 'react';
import { Button } from 'antd';
import { LeftOutlined, InfoCircleOutlined } from '@ant-design/icons';

import type { Activity } from '../types';

/**
 * ActivityHeader组件的属性接口
 */
interface ActivityHeaderProps {
  /** 活动信息对象 */
  activity: Activity;
  /** 返回按钮点击事件 */
  onGoBack: () => void;
  /** 信息按钮点击事件 */
  onShowIntro: () => void;
}

/**
 * ActivityHeader组件 - 活动详情页面头部
 * 包含导航栏、活动标题和时间显示
 */
const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  activity,
  onGoBack,
  onShowIntro
}) => {
  /**
   * 格式化日期显示
   * @param startDate 开始日期（数字格式：20250103）
   * @param endDate 结束日期（数字格式：20250810）
   * @returns 格式化后的日期字符串
   */
  const formatDateRange = (startDate: number, endDate: number): string => {
    const formatDate = (date: number): string => {
      const dateStr = date.toString();
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}.${month}.${day}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 shadow-lg rounded-b-3xl">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between">
        <Button 
          type="text" 
          shape="circle" 
          icon={<LeftOutlined />} 
          className="text-white hover:bg-white/20" 
          onClick={onGoBack} 
        />
        <h1 className="text-xl font-bold">{activity.name}</h1>
        <Button 
          type="text" 
          shape="circle" 
          icon={<InfoCircleOutlined />} 
          className="text-white hover:bg-white/20" 
          onClick={onShowIntro} 
        />
      </div>
      
      {/* 活动时间显示 */}
      <div className="text-center mt-3">
        <p className="text-sm opacity-80">活动时间</p>
        <p className="font-semibold tracking-wider">
          {formatDateRange(activity.start_date, activity.end_date)}
        </p>
      </div>
    </header>
  );
};

export default ActivityHeader;