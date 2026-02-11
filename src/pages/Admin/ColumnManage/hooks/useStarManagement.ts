import { useState, useCallback, useRef, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import { API } from '../../../../services/api';

/**
 * 收藏/精华管理的自定义 Hook
 */
export interface UseStarManagementProps {
  /** 打卡记录ID */
  punchId: number;
  /** 初始收藏状态 */
  initialStarred?: boolean;
  /** 收藏状态变化回调 */
  onStarChange?: (punchId: number, isStarred: boolean) => void;
}

export interface UseStarManagementReturn {
  /** 当前收藏状态 */
  isStarred: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 切换收藏状态 */
  toggleStar: () => Promise<void>;
  /** 设置收藏状态 */
  setStarred: (starred: boolean) => Promise<void>;
}

/**
 * 收藏/精华管理 Hook
 * @param props - Hook 配置参数
 * @returns 收藏管理相关的状态和方法
 */
export const useStarManagement = ({
  punchId,
  initialStarred = false,
  onStarChange
}: UseStarManagementProps): UseStarManagementReturn => {
  const [isStarred, setIsStarredState] = useState<boolean>(initialStarred);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 使用 ref 来存储最新的 onStarChange 回调，避免依赖变化
  const onStarChangeRef = useRef(onStarChange);
  onStarChangeRef.current = onStarChange;

  /**
   * 当 punchId 或 initialStarred 变化时，更新收藏状态
   */
  useEffect(() => {
    setIsStarredState(initialStarred);
  }, [punchId, initialStarred]);

  /**
   * 设置收藏状态
   */
  const setStarred = useCallback(async (starred: boolean): Promise<void> => {
    if (!punchId || isLoading) return;

    try {
      setIsLoading(true);
      
      let response;
      if (starred) {
        response = await API.Star.addStar(punchId);
        console.log(response);
      } else {
        response = await API.Star.cancelStar(punchId);
        console.log(response);

      }

      if (response.code === 200) {
        setIsStarredState(starred);
        onStarChangeRef.current?.(punchId, starred);

        Toast.show({
          content: starred ? '已添加到精华' : '已取消精华',
          position: 'bottom',
          duration: 1500
        });
      } else {
        Toast.show({
          content: response.msg || (starred ? '添加精华失败' : '取消精华失败'),
          position: 'bottom',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('设置收藏状态失败:', error);
      Toast.show({
        content: starred ? '添加精华失败，请重试' : '取消精华失败，请重试',
        position: 'bottom',
        duration: 2000
      });
    } finally {
      setIsLoading(false);
    }
  }, [punchId, isLoading]);

  /**
   * 切换收藏状态
   */
  const toggleStar = useCallback(async (): Promise<void> => {
    await setStarred(!isStarred);
  }, [isStarred, setStarred]);

  return {
    isStarred,
    isLoading,
    toggleStar,
    setStarred
  };
};
