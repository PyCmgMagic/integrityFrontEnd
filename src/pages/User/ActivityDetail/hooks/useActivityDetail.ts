import {  useEffect } from 'react';
import { message } from 'antd';
import { ActivityAPI } from '../../../../services/api';
import { useRequest } from '../../../../hooks/useRequest';
import type {  UserStats, ScoreRecord, RankingItem } from '../types';

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
 * 管理用户统计相关数据（模拟数据，后续可接入真实API）
 */
export const useUserStats = (): UserStats => {
  // 模拟用户统计数据（后续可以从API获取）
  const userStats: UserStats = {
    totalScore: 23,
    maxStreak: 7,
    rank: 21,
    todayProgress: { completed: 3, total: 5 }
  };

  return userStats;
};

/**
 * useScoreRecords Hook - 得分记录数据管理
 * 管理用户得分记录数据（模拟数据，后续可接入真实API）
 */
export const useScoreRecords = (): ScoreRecord[] => {
  // 模拟得分记录数据
  const scoreRecords: ScoreRecord[] = [
    { task: '完成"瑞蛇衔知"项目打卡', score: 5, date: '2023-01-15' },
    { task: '完成"灵蛇展跃"项目打卡', score: 3, date: '2023-01-14' },
    { task: '连续打卡3天奖励', score: 10, date: '2023-01-13' },
    { task: '首次完成打卡', score: 5, date: '2023-01-11' },
  ];

  return scoreRecords;
};

/**
 * useRankingData Hook - 排行榜数据管理
 * 管理排行榜数据（模拟数据，后续可接入真实API）
 */
export const useRankingData = (): RankingItem[] => {
  // 模拟排行榜数据
  const rankingData: RankingItem[] = Array.from({ length: 30 }, (_, i) => ({
    rank: i + 1,
    name: `用户${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    score: 100 - i * 2,
    avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`
  }));

  return rankingData;
};