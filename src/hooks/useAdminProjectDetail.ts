import { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectAPI } from '../services/api';
import type { ProjectDetail } from '../types/api';

/**
 * 管理员项目详情Hook的返回类型
 */
interface UseAdminProjectDetailReturn {
  /** 项目详情数据 */
  projectDetail: ProjectDetail | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 是否正在重试 */
  isRetrying: boolean;
  /** 错误信息 */
  error: string | null;
  /** 重新获取项目详情 */
  refetch: () => Promise<void>;
  /** 更新项目信息 */
  updateProject: (data: {
    name: string;
    description: string;
    activity_id: number;
    start_date: number;
    end_date: number;
    avatar: string;
    completion_bonus?: number;
  }) => Promise<boolean>;
  /** 是否正在更新 */
  updating: boolean;
}

/**
 * 管理员项目详情Hook
 * @param projectId 项目ID
 * @returns 项目详情状态和操作方法
 */
export const useAdminProjectDetail = (projectId: number | undefined): UseAdminProjectDetailReturn => {
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // 重试相关状态
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  /**
   * 获取项目详情
   * @param isRetry 是否为重试请求
   */
  const fetchProjectDetail = useCallback(async (isRetry = false) => {
    if (!projectId) {
      setError('项目ID无效');
      return;
    }

    try {
      // 如果不是重试，初始化状态
      if (!isRetry) {
        setLoading(true);
        setError(null);
        setIsRetrying(false);
        retryCountRef.current = 0;
      } else {
        // 重试时设置重试状态
        setIsRetrying(true);
      }

      const response = await ProjectAPI.getProjectDetail(projectId);
      
      // 请求成功，更新数据并重置状态
      setProjectDetail(response);
      setError(null);
      retryCountRef.current = 0;
      setLoading(false);
      setIsRetrying(false);
    } catch (err: any) {
      console.error('获取项目详情失败:', err);
      
      // 如果还有重试次数，进行重试
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        const delay = retryCountRef.current === 1 ? 200 : 500 * retryCountRef.current;
        
        setTimeout(() => {
          fetchProjectDetail(true);
        }, delay);
      } else {
        // 所有重试都失败，设置错误状态
        setError(err.message || '获取项目详情失败');
        setLoading(false);
        setIsRetrying(false);
      }
    }
  }, [projectId]);

  /**
   * 重新获取项目详情
   */
  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchProjectDetail(false);
  }, [fetchProjectDetail]);

  /**
   * 更新项目信息
   * @param data 更新数据
   * @returns 是否更新成功
   */
  const updateProject = useCallback(async (data: {
    name: string;
    description: string;
    activity_id: number;
    start_date: number;
    end_date: number;
    avatar: string;
    completion_bonus?: number;
  }): Promise<boolean> => {
    if (!projectId) {
      return false;
    }

    try {
      setUpdating(true);
      await ProjectAPI.updateProject(projectId, data);
      
      // 更新成功后重新获取项目详情
      await refetch();
      return true;
    } catch (err: any) {
      console.error('更新项目失败:', err);
      setError(err.message || '更新项目失败');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [projectId, refetch]);

  // 当项目ID变化时，重新获取数据
  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(false);
    } else {
      setProjectDetail(null);
      setError(null);
      setLoading(false);
      setIsRetrying(false);
    }
  }, [projectId, fetchProjectDetail]);

  return {
    projectDetail,
    loading,
    isRetrying,
    error,
    refetch,
    updateProject,
    updating,
  };
};

export default useAdminProjectDetail;
