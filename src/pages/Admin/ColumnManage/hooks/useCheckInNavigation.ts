import { useState, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import type { NavigateFunction } from 'react-router-dom';
import type { CheckInItem } from '../utils/checkInDataTransform';

interface UseCheckInNavigationReturn {
  currentIndex: number;
  currentItem: CheckInItem | undefined;
  goToPrevious: () => void;
  goToNext: () => void;
  removeCurrentItem: () => void;
}

/**
 * 打卡详情导航控制的自定义 Hook
 * @param items - 打卡项目列表
 * @param initialIndex - 初始索引
 * @param navigate - 路由导航函数
 * @returns 导航控制相关的状态和方法
 */
export const useCheckInNavigation = (
  items: CheckInItem[],
  initialIndex: number,
  navigate: NavigateFunction
): UseCheckInNavigationReturn => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  // 当 items 变化时，确保索引在有效范围内
  useEffect(() => {
    if (items.length > 0 && currentIndex >= items.length) {
      setCurrentIndex(items.length - 1);
    }
  }, [items.length, currentIndex]);

  // 获取当前项目，添加安全检查
  const currentItem = items.length > 0 ? items[currentIndex] : undefined;

  /**
   * 切换到下一条记录
   */
  const goToNext = (): void => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Toast.show({ content: '已经是最后一条了', position: 'bottom' });
    }
  };

  /**
   * 切换到上一条记录
   */
  const goToPrevious = (): void => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      Toast.show({ content: '已经是第一条了', position: 'bottom' });
    }
  };

  /**
   * 从列表中移除当前项的回调函数
   * 注意：实际的移除逻辑应该在父组件中处理
   */
  const removeCurrentItem = (): void => {
    // 这个函数将在父组件中被重新定义
    // 这里只是一个占位符
    console.warn('removeCurrentItem should be overridden by parent component');
  };
  return {
    currentIndex,
    currentItem,
    goToPrevious,
    goToNext,
    removeCurrentItem
  };
};