import { useState, useEffect, useCallback, useRef } from 'react';
import { ProjectAPI } from '../services/api';
import type { ProjectDetail } from '../types/api';

/**
 * 项目详情 Hook
 * @param projectId 项目ID
 * @returns 项目详情数据和相关状态
 */
export const useProjectDetail = (projectId?: number) => {
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  /**
   * 获取项目详情
   */
  const fetchProjectDetail = useCallback(async (isRetry = false) => {
    if (!projectId) {
      setLoading(false);
      setIsRetrying(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setIsRetrying(false);
        setProjectDetail(null);
        retryCountRef.current = 0;
      } else {
        setIsRetrying(true);
      }
      
      setError(null);
      
      const projectData = await ProjectAPI.getProjectDetail(projectId);
      setProjectDetail(projectData);
      retryCountRef.current = 0; // 成功后重置重试计数
      setLoading(false);
      setIsRetrying(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取项目详情失败';
      
      // 如果还有重试次数，延迟后自动重试
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        // 第一次重试延迟较短，后续递增
        const delay = retryCountRef.current === 1 ? 200 : 500 * retryCountRef.current;
        console.log(`项目详情获取失败，${delay}ms后进行第${retryCountRef.current}次重试`);
        
        // 重试期间保持loading状态
        setTimeout(() => {
          fetchProjectDetail(true);
        }, delay);
        return;
      }
      
      // 所有重试都失败后才显示错误
      setError(errorMessage);
      setLoading(false);
      setIsRetrying(false);
    }
  }, [projectId]);

  /**
   * 手动重新获取数据
   */
  const refetch = useCallback(() => {
    retryCountRef.current = 0; // 重置重试计数
    fetchProjectDetail(false);
  }, [fetchProjectDetail]);

  useEffect(() => {
    fetchProjectDetail(false);
  }, [fetchProjectDetail]);

  return {
    projectDetail,
    loading,
    error,
    isRetrying,
    refetch,
  };
};

export default useProjectDetail;