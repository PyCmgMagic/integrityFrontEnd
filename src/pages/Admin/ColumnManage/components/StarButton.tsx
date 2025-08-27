import React from 'react';
import { StarOutlined, StarFilled, LoadingOutlined } from '@ant-design/icons';
import { useStarManagement, type UseStarManagementProps } from '../hooks/useStarManagement';

/**
 * 收藏/精华按钮组件的属性接口
 */
export interface StarButtonProps extends UseStarManagementProps {
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 是否显示文字 */
  showText?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 点击事件处理函数 */
  onClick?: (event: React.MouseEvent) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 收藏/精华按钮组件
 * 提供可视化的收藏状态切换功能
 * @param props - 组件属性
 * @returns 收藏按钮组件
 */
export const StarButton: React.FC<StarButtonProps> = ({
  punchId,
  initialStarred = false,
  onStarChange,
  size = 'medium',
  showText = false,
  className = '',
  onClick,
  disabled = false
}) => {
  const { isStarred, isLoading, toggleStar } = useStarManagement({
    punchId,
    initialStarred,
    onStarChange
  });

  /**
   * 处理按钮点击事件
   */
  const handleClick = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation(); // 阻止事件冒泡
    
    if (disabled || isLoading) return;
    
    // 执行自定义点击处理函数
    onClick?.(event);
    
    // 切换收藏状态
    await toggleStar();
  };

  /**
   * 获取图标大小样式
   */
  const getIconSize = (): string => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  /**
   * 获取按钮样式
   */
  const getButtonStyles = (): string => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 cursor-pointer';
    const sizeStyles = size === 'small' ? 'p-1' : size === 'large' ? 'p-3' : 'p-2';
    const stateStyles = disabled || isLoading 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:bg-gray-100 active:bg-gray-200';
    
    return `${baseStyles} ${sizeStyles} ${stateStyles} ${className}`;
  };

  /**
   * 获取图标颜色样式
   */
  const getIconColor = (): string => {
    if (disabled || isLoading) return 'text-gray-400';
    return isStarred ? 'text-yellow-500' : 'text-gray-500';
  };

  /**
   * 渲染图标
   */
  const renderIcon = (): React.ReactNode => {
    if (isLoading) {
      return <LoadingOutlined className={`${getIconSize()} ${getIconColor()}`} />;
    }
    
    const IconComponent = isStarred ? StarFilled : StarOutlined;
    return <IconComponent className={`${getIconSize()} ${getIconColor()}`} />;
  };

  /**
   * 获取按钮文字
   */
  const getButtonText = (): string => {
    if (isLoading) return '处理中...';
    return isStarred ? '已精华' : '精华';
  };

  return (
    <button
      type="button"
      className={getButtonStyles()}
      onClick={handleClick}
      disabled={disabled || isLoading}
      title={isStarred ? '取消精华' : '设为精华'}
      aria-label={isStarred ? '取消精华' : '设为精华'}
    >
      {renderIcon()}
      {showText && (
        <span className={`ml-1 text-xs ${getIconColor()}`}>
          {getButtonText()}
        </span>
      )}
    </button>
  );
};

export default StarButton;
