import React from 'react';
import { Button } from 'antd';
import { LeftOutlined, StarOutlined, StarFilled, LoadingOutlined } from '@ant-design/icons';
import type { CheckInItem, ReviewStatus } from '../utils/checkInDataTransform';

const STATUS_MAP: Record<ReviewStatus, { label: string; className: string }> = {
  pending: { label: '未审核', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved: { label: '已通过', className: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: '已拒绝', className: 'bg-red-100 text-red-800 border-red-200' },
};

const StatusBadge: React.FC<{ status?: ReviewStatus }> = ({ status }) => {
  const s = status ?? 'pending';
  const { label, className } = STATUS_MAP[s];
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
};

interface CheckInDetailHeaderProps {
  currentItem: CheckInItem | undefined;
  isStarred: boolean;
  isStarLoading?: boolean;
  onBack: () => void;
  onToggleStar: () => void;
}

/**
 * 打卡详情页面头部组件
 * @param currentItem - 当前打卡项目
 * @param isStarred - 是否已标记为精华
 * @param isStarLoading - 是否正在加载收藏状态
 * @param onBack - 返回按钮点击回调
 * @param onToggleStar - 精华按钮点击回调
 */
const CheckInDetailHeader: React.FC<CheckInDetailHeaderProps> = ({
  currentItem,
  isStarred,
  isStarLoading = false,
  onBack,
  onToggleStar
}) => {
  return (
    <header className="bg-blue-500 text-white p-4 sm:p-6 shadow-lg rounded-b-2xl sm:rounded-b-3xl">
      <div className="flex items-center justify-between">
        <Button 
          type="text" 
          shape="circle" 
          icon={<LeftOutlined />} 
          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center touch-manipulation"
          onClick={onBack} 
        />
        <h1 className="text-lg sm:text-xl font-bold truncate mx-4">打卡审核</h1>
        <Button
          type="text"
          shape="circle"
          icon={
            isStarLoading ? (
              <LoadingOutlined
                style={{
                  color: 'white',
                  fontSize: window.innerWidth >= 640 ? '18px' : '16px'
                }}
              />
            ) : (
              isStarred ? (
                <StarFilled
                  style={{
                    color: '#FFD700',
                    fontSize: window.innerWidth >= 640 ? '18px' : '16px'
                  }}
                />
              ) : (
                <StarOutlined
                  style={{
                    color: 'white',
                    fontSize: window.innerWidth >= 640 ? '18px' : '16px'
                  }}
                />
              )
            )
          }
          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center touch-manipulation"
          onClick={onToggleStar}
          disabled={isStarLoading}
        />
      </div>
      <div className="text-center mt-2 sm:mt-3">
        <p className="text-xs sm:text-sm opacity-80">审核时间</p>
        <p className="font-semibold tracking-wider text-sm sm:text-base">
          {currentItem ? `${currentItem.date} ${currentItem.time}` : '加载中...'}
        </p>
        {/* 审核状态：未审核 / 已通过 / 已拒绝 */}
        <div className="mt-2">
          <StatusBadge status={currentItem?.status} />
        </div>
      </div>
    </header>
  );
};

export default CheckInDetailHeader;