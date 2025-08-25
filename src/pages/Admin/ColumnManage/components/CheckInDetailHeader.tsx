import React from 'react';
import { Button } from 'antd';
import { LeftOutlined, StarOutlined } from '@ant-design/icons';
import type { CheckInItem } from '../utils/checkInDataTransform';

interface CheckInDetailHeaderProps {
  currentItem: CheckInItem | undefined;
  isStarred: boolean;
  onBack: () => void;
  onToggleStar: () => void;
}

/**
 * 打卡详情页面头部组件
 * @param currentItem - 当前打卡项目
 * @param isStarred - 是否已标记为精华
 * @param onBack - 返回按钮点击回调
 * @param onToggleStar - 精华按钮点击回调
 */
const CheckInDetailHeader: React.FC<CheckInDetailHeaderProps> = ({
  currentItem,
  isStarred,
  onBack,
  onToggleStar
}) => {
  return (
    <header className="text-white p-4 flex items-center justify-between">
      <Button 
        type="text" 
        shape="circle" 
        icon={<LeftOutlined />} 
        className="text-white hover:bg-white/20 border-0"
        onClick={onBack} 
      />
      
      <h1 className="text-lg font-medium">
        {currentItem ? `${currentItem.username} - ${currentItem.date}` : '加载中...'}
      </h1>
      
      <Button 
        type="text" 
        shape="circle" 
        icon={
          <StarOutlined 
            style={{ 
              color: isStarred ? '#FFD700' : 'white',
              fontSize: '18px'
            }} 
          />
        } 
        className="text-white hover:bg-white/20 border-0"
        onClick={onToggleStar} 
      />
    </header>
  );
};

export default CheckInDetailHeader;