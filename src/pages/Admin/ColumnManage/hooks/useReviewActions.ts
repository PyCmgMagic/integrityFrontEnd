import { useState, useCallback } from 'react';
import { Toast } from 'antd-mobile';
import { API } from '../../../../services/api';
import type { CheckInItem } from '../utils/dataTransform';

/**
 * 审核操作类型
 */
type ReviewAction = 'approved' | 'rejected';

/**
 * 审核操作hooks的返回类型
 */
interface UseReviewActionsReturn {
  /** 处理审核操作 */
  handleReview: (item: CheckInItem, action: ReviewAction) => Promise<void>;
  /** 审核操作是否正在进行中 */
  isReviewing: boolean;
}

/**
 * 审核操作hooks的参数类型
 */
interface UseReviewActionsParams {
  /** 未审核数据列表 */
  unreviewedData: CheckInItem[];
  /** 已审核数据列表 */
  reviewedData: CheckInItem[];
  /** 更新未审核数据列表 */
  setUnreviewedData: React.Dispatch<React.SetStateAction<CheckInItem[]>>;
  /** 更新已审核数据列表 */
  setReviewedData: React.Dispatch<React.SetStateAction<CheckInItem[]>>;
}

/**
 * 审核操作自定义hook
 * 封装打卡记录的审核逻辑，包括通过和驳回操作
 * @param params - hook参数
 * @returns 审核操作相关的方法和状态
 */
export const useReviewActions = ({
  unreviewedData,
  reviewedData,
  setUnreviewedData,
  setReviewedData
}: UseReviewActionsParams): UseReviewActionsReturn => {
  const [isReviewing, setIsReviewing] = useState(false);

  /**
   * 处理审核操作
   * @param item - 要审核的打卡项
   * @param action - 审核动作（通过/驳回）
   */
  const handleReview = useCallback(async (item: CheckInItem, action: ReviewAction): Promise<void> => {
    if (isReviewing) return;
    
    setIsReviewing(true);
    
    try {
      console.log('开始审核，punchId:', item.id, '操作:', action);
      // 调用审核API
      const response = await API.Column.reviewPunchRecord(
        item.id,
        action === 'approved' ? 1 : 2
      );
      
      console.log('API响应:', response);
      
      // 更新本地状态，确保保持收藏状态
      const updatedItem = { ...item, status: action };
      
      // 从未审核列表中移除
      setUnreviewedData(prev => prev.filter(i => i.id !== item.id));
      
      // 添加到已审核列表，保持原有的收藏状态
      setReviewedData(prev => [updatedItem, ...prev]);
      
      // 显示成功提示
      const actionText = action === 'approved' ? '通过' : '驳回';
      Toast.show({ 
        content: `审核${actionText}成功`, 
        position: 'bottom' 
      });
      
    } catch (error: any) {
      console.error('审核失败:', error);
      Toast.show({ 
        content: error?.message || '网络错误，请稍后重试', 
        position: 'bottom' 
      });
    } finally {
      setIsReviewing(false);
    }
  }, [isReviewing, setUnreviewedData, setReviewedData]);

  return {
    handleReview,
    isReviewing
  };
};