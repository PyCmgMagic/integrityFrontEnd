import { useCallback } from 'react';
import { API } from '../../../../services/api';
import type { CheckInItem } from '../utils/dataTransform';

/**
 * 收藏状态加载器 Hook
 */
export interface UseStarStatusLoaderReturn {
  /** 加载并更新收藏状态 */
  loadStarStatus: (items: CheckInItem[]) => Promise<CheckInItem[]>;
  /** 批量获取收藏状态映射表 */
  loadStarStatusMap: (punchIds: number[]) => Promise<Map<number, boolean>>;
}

/**
 * 收藏状态加载器 Hook
 * 用于批量获取打卡记录的收藏状态
 * @returns 收藏状态加载相关的方法
 */
export const useStarStatusLoader = (): UseStarStatusLoaderReturn => {
  
  /**
   * 加载并更新收藏状态
   * @param items - 打卡记录列表
   * @returns 更新了收藏状态的打卡记录列表
   */
  const loadStarStatus = useCallback(async (items: CheckInItem[]): Promise<CheckInItem[]> => {
    if (!items || items.length === 0) {
      return items;
    }

    try {
      // 提取所有打卡记录ID
      const punchIds = items.map(item => item.id);
      console.log('批量获取打卡记录的收藏状态:', punchIds);
      const starStatusPromises = punchIds.map(async (punchId) => {
        try {
          const response = await API.Star.checkStarStatus(punchId);
          console.log(`获取打卡记录 ${punchId} 的收藏状态成功:`, response);
          return {
            punchId,
            isStarred: response.code === 200 ? response.data : false
          };
        } catch (error) {
          console.warn(`获取打卡记录 ${punchId} 的收藏状态失败:`, error);
          return {
            punchId,
            isStarred: false
          };
        }
      });

      // 等待所有查询完成
      const starStatusResults = await Promise.all(starStatusPromises);
      
      // 创建收藏状态映射
      const starStatusMap = new Map<number, boolean>();
      starStatusResults.forEach(({ punchId, isStarred }) => {
        starStatusMap.set(punchId, isStarred);
      });

      // 更新打卡记录的收藏状态
      const updatedItems = items.map(item => ({
        ...item,
        starred: starStatusMap.get(item.id) || false
      }));

      return updatedItems;
    } catch (error) {
      console.error('批量获取收藏状态失败:', error);
      // 如果批量获取失败，返回原始数据
      return items;
    }
  }, []);

  /**
   * 批量获取收藏状态映射表
   * @param punchIds - 打卡记录ID列表
   * @returns 收藏状态映射表
   */
  const loadStarStatusMap = useCallback(async (punchIds: number[]): Promise<Map<number, boolean>> => {
    if (!punchIds || punchIds.length === 0) {
      return new Map();
    }

    try {
      // 逐个查询收藏状态
      const starStatusPromises = punchIds.map(async (punchId) => {
        try {
          const response = await API.Star.checkStarStatus(punchId);
          return {
            punchId,
            isStarred: response.code === 200 ? response.data : false
          };
        } catch (error) {
          console.warn(`获取打卡记录 ${punchId} 的收藏状态失败:`, error);
          return {
            punchId,
            isStarred: false
          };
        }
      });

      // 等待所有查询完成
      const starStatusResults = await Promise.all(starStatusPromises);
      
      // 创建收藏状态映射
      const starStatusMap = new Map<number, boolean>();
      starStatusResults.forEach(({ punchId, isStarred }) => {
        starStatusMap.set(punchId, isStarred);
      });

      return starStatusMap;
    } catch (error) {
      console.error('批量获取收藏状态失败:', error);
      return new Map();
    }
  }, []);

  return {
    loadStarStatus,
    loadStarStatusMap
  };
};
