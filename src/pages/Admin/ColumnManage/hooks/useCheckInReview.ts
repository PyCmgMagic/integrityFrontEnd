import { Toast, Dialog } from 'antd-mobile';
import { API } from '../../../../services/api';
import { useStarManagement } from './useStarManagement';
import type { CheckInItem } from '../utils/checkInDataTransform';

interface UseCheckInReviewProps {
  currentItem: CheckInItem | undefined;
  onItemRemoved: () => void;
  onStarChange?: (punchId: number, isStarred: boolean) => void;
}

interface UseCheckInReviewReturn {
  isStarred: boolean;
  setIsStarred: (starred: boolean) => void;
  handleApprove: () => Promise<void>;
  handleReject: () => Promise<void>;
  toggleStar: () => Promise<void>;
  isStarLoading: boolean;
}

/**
 * 打卡审核操作的自定义 Hook
 * @param currentItem - 当前打卡项目
 * @param onItemRemoved - 项目移除后的回调函数
 * @param onStarChange - 收藏状态变化回调
 * @returns 审核操作相关的状态和方法
 */
export const useCheckInReview = ({
  currentItem,
  onItemRemoved,
  onStarChange
}: UseCheckInReviewProps): UseCheckInReviewReturn => {
  // 使用收藏管理 Hook
  const {
    isStarred,
    isLoading: isStarLoading,
    toggleStar: toggleStarAPI
  } = useStarManagement({
    punchId: currentItem?.punchId || 0,
    initialStarred: currentItem?.starred || false,
    onStarChange
  });

  /**
   * 审核通过
   */
  const handleApprove = async (): Promise<void> => {
    if (!currentItem) {
      Toast.show({ icon: 'fail', content: '当前项目不存在' });
      return;
    }
    
    try {
      console.log('开始审核通过，punchId:', currentItem.punchId);
      const response = await API.Column.reviewPunchRecord(currentItem.punchId, 1);
      console.log('审核通过API响应:', response);
      Toast.show({ icon: 'success', content: '审核通过' });
      onItemRemoved();
    } catch (error: any) {
      console.error('审核通过失败:', error);
      console.error('错误详情:', {
        message: error?.message,
        msg: error?.msg,
        code: error?.code,
        details: error?.details
      });
      const errorMessage = error?.message || error?.msg || '审核失败';
      Toast.show({ icon: 'fail', content: errorMessage });
    }
  };

  /**
   * 审核驳回
   */
  const handleReject = async (): Promise<void> => {
    if (!currentItem) {
      Toast.show({ icon: 'fail', content: '当前项目不存在' });
      return;
    }
    
    const result = await Dialog.confirm({
      content: '确定要驳回此条打卡吗？',
    });
    
    if (result) {
      try {
        console.log('开始审核驳回，punchId:', currentItem.punchId);
        const response = await API.Column.reviewPunchRecord(currentItem.punchId, 2);
        console.log('审核驳回API响应:', response);
        Toast.show({ icon: 'success', content: '已驳回' });
        onItemRemoved();
      } catch (error: any) {
        console.error('审核驳回失败:', error);
        console.error('错误详情:', {
          message: error?.message,
          msg: error?.msg,
          code: error?.code,
          details: error?.details
        });
        const errorMessage = error?.message || error?.msg || '驳回失败';
        Toast.show({ icon: 'fail', content: errorMessage });
      }
    }
  };
  
  /**
   * 切换精华状态
   */
  const toggleStar = async (): Promise<void> => {
    if (!currentItem) {
      Toast.show({ icon: 'fail', content: '当前项目不存在' });
      return;
    }

    await toggleStarAPI();
  };

  /**
   * 设置收藏状态（兼容性方法）
   */
  const setIsStarred = (starred: boolean): void => {
    // 这个方法保留用于兼容性，但实际状态由 useStarManagement 管理
    console.log('setIsStarred called with:', starred);
  };

  return {
    isStarred,
    setIsStarred,
    handleApprove,
    handleReject,
    toggleStar,
    isStarLoading
  };
};