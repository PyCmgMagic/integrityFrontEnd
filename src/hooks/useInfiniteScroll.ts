/**
 * 无限滚动 Hook
 * 提供无限滚动分页功能，支持自动加载更多数据
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import type { ApiError } from '../types/api';

// 无限滚动配置选项
export interface UseInfiniteScrollOptions<T> {
  pageSize?: number; // 每页数据量，默认20
  threshold?: number; // 触发加载的距离阈值（像素），默认100
  manual?: boolean; // 是否手动触发首次加载
  onSuccess?: (data: T[], page: number) => void; // 成功回调
  onError?: (error: ApiError) => void; // 错误回调
  showError?: boolean; // 是否显示错误提示，默认true
  hasMore?: (data: T[], total?: number) => boolean; // 自定义是否还有更多数据的判断
  deps?: any[]; // 依赖项数组，当依赖项变化时重新加载数据
}

// API响应接口
export interface InfiniteScrollResponse<T> {
  list?: T[]; // 数据列表
  activitys?: T[]; // 兼容现有API的字段名
  total?: number; // 总数
  page: number; // 当前页
  pageSize: number; // 每页大小
  hasMore?: boolean; // 是否还有更多数据
}

/**
 * 无限滚动Hook
 * @param requestFn 请求函数，接收page和pageSize参数
 * @param options 配置选项
 */
export function useInfiniteScroll<T = any>(
  requestFn: (params: { page: number; page_size: number }) => Promise<InfiniteScrollResponse<T>>,
  options: UseInfiniteScrollOptions<T> = {}
) {
  const {
    pageSize = 20,
    threshold = 100,
    manual = false,
    onSuccess,
    onError,
    showError = true,
    hasMore: customHasMore,
    deps = []
  } = options;

  // 状态管理
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 引用
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  /**
   * 执行数据加载
   * @param currentPage 当前页码
   * @param isLoadMore 是否为加载更多
   */
  const loadData = useCallback(async (currentPage: number, isLoadMore = false) => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setError(null);
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await requestFn({
        page: currentPage,
        page_size: pageSize
      });

      // 兼容不同的API响应格式
      const list = response.list || response.activitys || [];
      const responseTotal = response.total || 0;
      
      if (isLoadMore) {
        // 加载更多：追加数据
        setData(prevData => [...prevData, ...list]);
      } else {
        // 首次加载：替换数据
        setData(list);
      }

      setTotal(responseTotal);
      setPage(currentPage);

      // 判断是否还有更多数据
      let hasMoreData = true;
      if (customHasMore) {
        hasMoreData = customHasMore(list, responseTotal);
      } else {
        const currentTotal = isLoadMore ? data.length + list.length : list.length;
        hasMoreData = currentTotal < responseTotal && list.length === pageSize;
      }
      setHasMore(hasMoreData);

      // 成功回调
      onSuccess?.(list, currentPage);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      if (showError) {
        message.error(apiError.message || '加载数据失败，请稍后重试');
      }
      
      onError?.(apiError);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [requestFn, pageSize, data.length, customHasMore, onSuccess, onError, showError]);

  /**
   * 加载更多数据
   */
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;
    loadData(page + 1, true);
  }, [hasMore, page, loadData]);

  /**
   * 刷新数据（重新加载第一页）
   */
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadData(1, false);
  }, [loadData]);

  /**
   * 重置所有状态
   */
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setTotal(0);
    setHasMore(true);
    setError(null);
    setLoading(false);
    setLoadingMore(false);
  }, []);

  /**
   * 滚动事件处理
   */
  const handleScroll = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;

    const container = containerRef.current;
    let scrollTop: number;
    let scrollHeight: number;
    let clientHeight: number;

    if (container) {
      // 如果有指定容器，使用容器的滚动信息
      scrollTop = container.scrollTop;
      scrollHeight = container.scrollHeight;
      clientHeight = container.clientHeight;
    } else {
      // 如果没有指定容器，使用window的滚动信息
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    }

    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceToBottom <= threshold) {
      loadMore();
    }
  }, [hasMore, threshold, loadMore]);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    
    if (container) {
      // 监听指定容器的滚动事件
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    } else {
      // 监听window的滚动事件
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // 首次加载和依赖项变化时重新加载
  useEffect(() => {
    if (!manual) {
      // 重置状态并重新加载第一页
      setData([]);
      setPage(1);
      setHasMore(true);
      setError(null);
      loadData(1, false);
    }
  }, [manual, ...deps]); // 当manual或deps中的任何值变化时重新执行

  return {
    // 数据状态
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    total,
    
    // 操作方法
    loadMore,
    refresh,
    reset,
    
    // 容器引用（需要绑定到滚动容器）
    containerRef,
    
    // 手动触发首次加载（当manual=true时使用）
    run: () => loadData(1, false)
  };
}

export default useInfiniteScroll;