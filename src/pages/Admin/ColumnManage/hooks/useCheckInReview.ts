import { useState } from 'react';
import { Toast, Dialog } from 'antd-mobile';
import { API } from '../../../../services/api';
import type { CheckInItem } from '../utils/checkInDataTransform';

interface UseCheckInReviewProps {
  currentItem: CheckInItem | undefined;
  onItemRemoved: () => void;
}

interface UseCheckInReviewReturn {
  isStarred: boolean;
  setIsStarred: (starred: boolean) => void;
  handleApprove: () => Promise<void>;
  handleReject: () => Promise<void>;
  toggleStar: () => void;
}

/**
 * 打卡审核操作的自定义 Hook
 * @param currentItem - 当前打卡项目
 * @param onItemRemoved - 项目移除后的回调函数
 * @returns 审核操作相关的状态和方法
 */
export const useCheckInReview = ({
  currentItem,
  onItemRemoved
}: UseCheckInReviewProps): UseCheckInReviewReturn => {
  const [isStarred, setIsStarred] = useState<boolean>(currentItem?.starred || false);

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
  const toggleStar = (): void => {
    if (!currentItem) {
      Toast.show({ icon: 'fail', content: '当前项目不存在' });
      return;
    }
    
    setIsStarred(!isStarred);
    Toast.show({ 
      content: !isStarred ? '已设为精华' : '已取消精华', 
      position: 'bottom' 
    });
  };

  return {
    isStarred,
    setIsStarred,
    handleApprove,
    handleReject,
    toggleStar
  };
};