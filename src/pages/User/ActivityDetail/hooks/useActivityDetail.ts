import {  useEffect } from 'react';
import { message } from 'antd';
import { ActivityAPI } from '../../../../services/api';
import { useRequest } from '../../../../hooks/useRequest';
import type {  UserStats} from '../types';

/**
 * useActivityDetail Hook - 活动详情页面数据管理
 * 管理活动详情数据获取和相关状态
 */
export const useActivityDetail = (activityId: string | undefined) => {
  // 使用useRequest hook获取活动详情
  const { data: activityData, loading, run: fetchActivityDetail } = useRequest(
    (id: number) => ActivityAPI.getActivityDetail(id),
    {
      manual: true,
      onError: (error) => {
        message.error('获取活动详情失败：' + error.message); 
      }
    }
  );

  /**
   * 获取活动详情数据
   */
  const loadActivityDetail = () => {
    if (activityId) {
      const id = parseInt(activityId, 10);
      if (!isNaN(id)) {
        fetchActivityDetail(id);
      } else {
        message.error('无效的活动ID');
      }
    }
  };

  // 当activityId变化时获取数据
  useEffect(() => {
    loadActivityDetail();
  }, [activityId]);

  return {
    activityData,
    loading,
    refetch: loadActivityDetail
  };
};

/**
 * useUserStats Hook - 用户统计数据管理
 * 管理用户统计相关数据
 */
export const useUserStats = (activityID: number) => {
  // 使用useRequest hook获取用户统计数据
  const { data: userStats, loading, run: fetchUserStats } = useRequest(
    (id: number) => ActivityAPI.getActivityStaticDetail(id),
    {
      manual: true,
      onSuccess: (res) => {
        if (res.code !== 200) {
          message.error('获取用户统计数据失败：' + res.msg);
        }
      },
      onError: (error) => {
        message.error('获取用户统计数据失败：' + error.message);
      }
    }
  );

  /**
   * 获取用户统计数据
   */
  const loadUserStats = () => {
    if (activityID && !isNaN(activityID)) {
      fetchUserStats(activityID);
    }
  };

  // 当activityID变化时获取数据
  useEffect(() => {
    loadUserStats();
  }, [activityID]);

  // 返回处理后的数据，如果请求成功则返回data，否则返回默认值
  const processedUserStats: UserStats = userStats?.code === 200 
    ? userStats.data 
    : {
        rank: 0, 
        today_punched_user_count: 0, 
        total_score: 0, 
        activity_id: 0, 
        current: 0, 
        max: 0, 
        total: 0
      };

  return {
    userStats: processedUserStats,
    loading,
    refetch: loadUserStats
  };
};


