import { useState, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import { API } from '../../../../services/api';
import type { ParticipationActivityItem, ParticipationHistoryResponse } from '../../../../types/api';

/**
 * 活动历史管理自定义Hook
 * 处理用户参与活动历史的获取等操作
 */
export const useActivityHistory = () => {
  const [activityHistoryData, setActivityHistoryData] = useState<ParticipationActivityItem[]>([]);
  const [activityHistoryLoading, setActivityHistoryLoading] = useState<boolean>(false);

  /**
   * 获取用户参与活动历史
   */
  const fetchActivityHistory = async () => {
    try {
      setActivityHistoryLoading(true);
      const response: ParticipationHistoryResponse = await API.User.getParticipationHistory();
      
      console.log('活动历史API响应:', response); // 调试日志
      
      // 根据ParticipationHistoryResponse类型处理数据
      if (response && response.activities && Array.isArray(response.activities)) {
        console.log('活动历史数据:', response.activities);
        setActivityHistoryData(response.activities);
      } else {
        console.warn('获取活动历史数据格式异常:', response);
        setActivityHistoryData([]);
      }
    } catch (error) {
      console.error('获取活动历史失败:', error);
      Toast.show({ content: '获取活动历史失败', position: 'bottom' });
      setActivityHistoryData([]);
    } finally {
      setActivityHistoryLoading(false);
    }
  };

  /**
   * 组件挂载时获取活动历史
   */
  useEffect(() => {
    fetchActivityHistory();
  }, []);

  return {
    activityHistoryData,
    activityHistoryLoading,
    fetchActivityHistory,
  };
};