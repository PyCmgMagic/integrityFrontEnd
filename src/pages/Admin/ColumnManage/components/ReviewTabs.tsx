import React from 'react';

/**
 * 审核标签页类型
 */
export type ReviewTabType = 'unreviewed' | 'reviewed';

/**
 * 审核标签页组件的属性接口
 */
interface ReviewTabsProps {
  /** 当前激活的标签页 */
  activeTab: ReviewTabType;
  /** 标签页切换回调函数 */
  onTabChange: (tab: ReviewTabType) => void;
  /** 未审核数量 */
  unreviewedCount?: number;
  /** 已审核数量 */
  reviewedCount?: number;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 审核标签页组件
 * 负责显示和切换未审核/已审核状态，支持显示数量徽章
 * @param props - 组件属性
 * @returns 审核标签页组件
 */
export const ReviewTabs: React.FC<ReviewTabsProps> = ({
  activeTab,
  onTabChange,
  unreviewedCount,
  reviewedCount,
  className = ''
}) => {
  /**
   * 获取标签页按钮的样式类名
   * @param tabType - 标签页类型
   * @returns 样式类名
   */
  const getTabClassName = (tabType: ReviewTabType): string => {
    const baseClasses = 'w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 relative';
    const activeClasses = 'bg-white text-blue-500 shadow';
    const inactiveClasses = 'text-gray-500 hover:text-gray-700';
    
    return `${baseClasses} ${activeTab === tabType ? activeClasses : inactiveClasses}`;
  };

  /**
   * 渲染数量徽章
   * @param count - 数量
   * @returns 徽章元素或null
   */
  const renderBadge = (count?: number): React.ReactElement | null => {
    if (count === undefined || count === 0) return null;
    
    return (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  /**
   * 处理标签页点击事件
   * @param tabType - 点击的标签页类型
   */
  const handleTabClick = (tabType: ReviewTabType): void => {
    if (activeTab !== tabType) {
      onTabChange(tabType);
    }
  };

  return (
    <div className={`flex justify-center bg-gray-200 rounded-lg p-1 mb-4 ${className}`}>
      {/* 未审核标签页 */}
      <button
        onClick={() => handleTabClick('unreviewed')}
        className={getTabClassName('unreviewed')}
        aria-label={`未审核${unreviewedCount ? ` (${unreviewedCount}条)` : ''}`}
      >
        未审核
        {renderBadge(unreviewedCount)}
      </button>
      
      {/* 已审核标签页 */}
      <button
        onClick={() => handleTabClick('reviewed')}
        className={getTabClassName('reviewed')}
        aria-label={`已审核${reviewedCount ? ` (${reviewedCount}条)` : ''}`}
      >
        已审核
        {renderBadge(reviewedCount)}
      </button>
    </div>
  );
};