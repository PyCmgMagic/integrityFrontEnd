import { useState, useCallback } from 'react';
import { message } from 'antd';
import { API } from '../services/api';
import type { StarItem, StarListResponse } from '../types/types';

/**
 * 收藏列表Hook的配置选项
 */
export interface UseStarListOptions {
  /** 默认页码 */
  defaultPage?: number;
  /** 默认每页数量 */
  defaultPageSize?: number;
  /** 是否自动显示错误信息 */
  showError?: boolean;
  /** 成功获取数据时的回调 */
  onSuccess?: (data: StarItem[]) => void;
  /** 发生错误时的回调 */
  onError?: (error: any) => void;
}

/**
 * 收藏列表Hook的返回值
 */
export interface UseStarListReturn {
  /** 收藏列表数据 */
  starList: StarItem[];
  /** 加载状态 */
  loading: boolean;
  /** 分页信息 */
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  /** 获取收藏列表 */
  fetchStarList: (page?: number, pageSize?: number) => Promise<void>;
  /** 刷新当前页 */
  refresh: () => Promise<void>;
  /** 重置到第一页 */
  reset: () => Promise<void>;
  /** 设置分页信息 */
  setPagination: React.Dispatch<React.SetStateAction<{
    current: number;
    pageSize: number;
    total: number;
  }>>;
}

/**
 * 收藏列表管理Hook
 * @param options 配置选项
 * @returns 收藏列表相关的状态和方法
 */
export const useStarList = (options: UseStarListOptions = {}): UseStarListReturn => {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    showError = true,
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState<boolean>(false);
  const [starList, setStarList] = useState<StarItem[]>([]);
  const [pagination, setPagination] = useState({
    current: defaultPage,
    pageSize: defaultPageSize,
    total: 0,
  });

  /**
   * 获取收藏列表
   */
  const fetchStarList = useCallback(async (
    page: number = pagination.current,
    pageSize: number = pagination.pageSize
  ): Promise<void> => {
    setLoading(true);
    try {
      const response: StarListResponse = await API.Star.getStarList({
        page,
        page_size: pageSize,
      });

      if (response.code === 200) {
        const stars = response.data.stars || [];
        setStarList(stars);
        setPagination(prev => ({
          ...prev,
          current: response.data.page,
          pageSize: response.data.page_size,
          total: stars.length, // 注意：这里可能需要后端返回总数
        }));

        // 调用成功回调
        onSuccess?.(stars);
      } else {
        const errorMsg = response.msg || '获取收藏列表失败';
        if (showError) {
          message.error(errorMsg);
        }
        onError?.(new Error(errorMsg));
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      const errorMsg = '获取收藏列表失败，请重试';
      if (showError) {
        message.error(errorMsg);
      }
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, showError, onSuccess, onError]);

  /**
   * 刷新当前页
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchStarList(pagination.current, pagination.pageSize);
  }, [fetchStarList, pagination.current, pagination.pageSize]);

  /**
   * 重置到第一页
   */
  const reset = useCallback(async (): Promise<void> => {
    await fetchStarList(defaultPage, pagination.pageSize);
  }, [fetchStarList, defaultPage, pagination.pageSize]);

  return {
    starList,
    loading,
    pagination,
    fetchStarList,
    refresh,
    reset,
    setPagination,
  };
};

/**
 * 收藏列表Hook的简化版本，用于快速获取数据
 */
export const useStarListSimple = () => {
  return useStarList({
    defaultPage: 1,
    defaultPageSize: 10,
    showError: true,
  });
};
