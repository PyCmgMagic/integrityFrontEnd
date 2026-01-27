/**
 * 网络请求 Hook
 * 提供便捷的网络请求状态管理和错误处理
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import type { ApiError } from '../types/api';

// 请求状态接口
export interface RequestState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

// Hook 配置选项
export interface UseRequestOptions<T> {
  manual?: boolean; // 是否手动触发请求
  defaultData?: T; // 默认数据
  onSuccess?: (data: T) => void; // 成功回调
  onError?: (error: ApiError) => void; // 错误回调
  showError?: boolean; // 是否显示错误提示
  showSuccess?: boolean; // 是否显示成功提示
  successMessage?: string; // 成功提示信息
  retries?: number; // 重试次数
  retryDelay?: number; // 重试延迟（毫秒）
  deps?: any[]; // 依赖项，变化时重新请求
  refreshDeps?: any[]; // 刷新依赖项
  debounceWait?: number; // 防抖延迟
  throttleWait?: number; // 节流延迟
}

/**
 * 基础请求 Hook
 */
export function useRequest<T = any, P extends any[] = any[]>(
  requestFn: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {}
): {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
  run: (...args: P) => Promise<T | undefined>;
  runAsync: (...args: P) => Promise<T>;
  refresh: () => void;
  cancel: () => void;
  mutate: (data: T | ((oldData: T | null) => T)) => void;
} {
  const {
    manual = false,
    defaultData = null,
    onSuccess,
    onError,
    showError = true,
    showSuccess = false,
    successMessage,
    retries = 0,
    retryDelay = 1000,
    deps = [],
    refreshDeps = [],
    debounceWait,
    throttleWait,
  } = options;

  // 状态管理
  const [state, setState] = useState<RequestState<T>>({
    data: defaultData,
    loading: false,
    error: null,
    success: false,
  });

  // 引用管理
  const requestRef = useRef<(...args: P) => Promise<T>>(requestFn);
  const cancelRef = useRef<(() => void) | null>(null);
  const retryCountRef = useRef(0);
  const argsRef = useRef<P | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCallTimeRef = useRef(0);

  // 更新请求函数引用
  requestRef.current = requestFn;

  /**
   * 执行请求的核心函数
   */
  const executeRequest = useCallback(
    async (...args: P): Promise<T> => {
      // 取消之前的请求
      if (cancelRef.current) {
        cancelRef.current();
      }

      // 创建取消控制器
      let cancelled = false;
      cancelRef.current = () => {
        cancelled = true;
      };

      // 设置加载状态
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      try {
        const result = await requestRef.current(...args);

        // 检查是否已取消
        if (cancelled) {
          throw new Error('Request cancelled');
        }

        // 更新成功状态
        setState({
          data: result,
          loading: false,
          error: null,
          success: true,
        });

        // 重置重试计数
        retryCountRef.current = 0;

        // 执行成功回调
        onSuccess?.(result);

        // 显示成功提示
        if (showSuccess && successMessage) {
          message.success(successMessage);
        }

        return result;
      } catch (error) {
        // 检查是否已取消
        if (cancelled) {
          return Promise.reject(error);
        }

        const apiError = error as ApiError;

        // 重试逻辑
        if (retryCountRef.current < retries && shouldRetry(apiError)) {
          retryCountRef.current++;
          
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return executeRequest(...args);
        }

        // 更新错误状态
        setState({
          data: null,
          loading: false,
          error: apiError,
          success: false,
        });

        // 执行错误回调
        onError?.(apiError);

        // 显示错误提示
        if (showError) {
          message.error(apiError.message || '请求失败');
        }

        throw error;
      }
    },
    [onSuccess, onError, showError, showSuccess, successMessage, retries, retryDelay]
  );

  /**
   * 判断是否应该重试
   */
  const shouldRetry = useCallback((error: ApiError): boolean => {
    // 网络错误或服务器错误可以重试
    return error.code >= 500 || error.code === -1;
  }, []);

  /**
   * 防抖处理
   */
  const debouncedExecute = useCallback(
    (...args: P): Promise<T | undefined> => {
      return new Promise((resolve, reject) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
          try {
            const result = await executeRequest(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, debounceWait);
      });
    },
    [executeRequest, debounceWait]
  );

  /**
   * 节流处理
   */
  const throttledExecute = useCallback(
    (...args: P): Promise<T | undefined> => {
      return new Promise((resolve, reject) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTimeRef.current;

        if (timeSinceLastCall >= (throttleWait || 0)) {
          lastCallTimeRef.current = now;
          executeRequest(...args).then(resolve).catch(reject);
        } else {
          const remainingTime = (throttleWait || 0) - timeSinceLastCall;
          
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
          }

          throttleTimerRef.current = setTimeout(async () => {
            lastCallTimeRef.current = Date.now();
            try {
              const result = await executeRequest(...args);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, remainingTime);
        }
      });
    },
    [executeRequest, throttleWait]
  );

  /**
   * 运行请求（带错误处理）
   */
  const run = useCallback(
    async (...args: P): Promise<T | undefined> => {
      argsRef.current = args;

      try {
        if (debounceWait) {
          return await debouncedExecute(...args);
        } else if (throttleWait) {
          return await throttledExecute(...args);
        } else {
          return await executeRequest(...args);
        }
      } catch (error) {
        // 错误已在 executeRequest 中处理
        return undefined;
      }
    },
    [executeRequest, debouncedExecute, throttledExecute, debounceWait, throttleWait]
  );

  /**
   * 运行请求（抛出错误）
   */
  const runAsync = useCallback(
    async (...args: P): Promise<T> => {
      argsRef.current = args;

      if (debounceWait) {
        const result = await debouncedExecute(...args);
        if (result === undefined) {
          throw new Error('Request failed');
        }
        return result;
      } else if (throttleWait) {
        const result = await throttledExecute(...args);
        if (result === undefined) {
          throw new Error('Request failed');
        }
        return result;
      } else {
        return await executeRequest(...args);
      }
    },
    [executeRequest, debouncedExecute, throttledExecute, debounceWait, throttleWait]
  );

  /**
   * 刷新请求
   */
  const refresh = useCallback(() => {
    if (argsRef.current) {
      run(...argsRef.current);
    }
  }, [run]);

  /**
   * 取消请求
   */
  const cancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
    }
    
    // 清除定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }

    setState((prev) => ({
      ...prev,
      loading: false,
    }));
  }, []);

  /**
   * 手动更新数据
   */
  const mutate = useCallback((data: T | ((oldData: T | null) => T)) => {
    setState((prev) => ({
      ...prev,
      data: typeof data === 'function' ? (data as Function)(prev.data) : data,
      success: true,
    }));
  }, []);

  // 自动执行请求
  useEffect(() => {
    if (!manual) {
      // 对于无参数的请求函数，传递空数组作为参数
      run(...([] as unknown as P));
    }
  }, deps);

  // 刷新依赖项变化时刷新
  useEffect(() => {
    if (!manual && refreshDeps.length > 0) {
      refresh();
    }
  }, refreshDeps);

  // 清理函数
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    success: state.success,
    run,
    runAsync,
    refresh,
    cancel,
    mutate,
  };
}

/**
 * 分页请求 Hook
 */
export function usePaginatedRequest<T = any>(
  requestFn: (params: { page: number; pageSize: number; [key: string]: any }) => Promise<{
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  }>,
  options: UseRequestOptions<{ list: T[]; total: number; page: number; pageSize: number }> & {
    defaultPageSize?: number;
    defaultParams?: Record<string, any>;
  } = {}
) {
  const { defaultPageSize = 10, defaultParams = {}, ...restOptions } = options;
  
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
  });

  const [params, setParams] = useState(defaultParams);

  const request = useRequest(
    () => requestFn({ ...params, page: pagination.page, pageSize: pagination.pageSize }),
    {
      ...restOptions,
      onSuccess: (data) => {
        setPagination((prev) => ({
          ...prev,
          total: data.total,
        }));
        restOptions.onSuccess?.(data);
      },
    }
  );

  const changePage = useCallback((page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  const changeParams = useCallback((newParams: Record<string, any>) => {
    setParams(newParams);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const reset = useCallback(() => {
    setParams(defaultParams);
    setPagination({
      page: 1,
      pageSize: defaultPageSize,
      total: 0,
    });
  }, [defaultParams, defaultPageSize]);

  return {
    ...request,
    pagination,
    params,
    changePage,
    changeParams,
    reset,
    list: request.data?.list || [],
  };
}

export default useRequest;
