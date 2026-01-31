import { useCallback } from 'react';

/**
 * 涟漪效果 Hook
 * 为按钮或元素添加点击涟漪动画效果
 * 
 * @param color 涟漪颜色（可选，默认为白色半透明）
 * @param duration 动画持续时间（毫秒，默认600ms）
 * @returns 涟漪事件处理器
 * 
 * 使用示例：
 * const ripple = useRipple();
 * <button {...ripple} className="ripple-container">点击我</button>
 */
export function useRipple(color?: string, duration = 600) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const target = event.currentTarget;
      
      // 获取点击位置
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // 创建涟漪元素
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      // 设置涟漪大小（取宽高中较大的值，确保覆盖整个元素）
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;
      
      // 自定义颜色
      if (color) {
        ripple.style.backgroundColor = color;
      }
      
      // 添加到目标元素
      target.appendChild(ripple);
      
      // 动画结束后移除元素
      setTimeout(() => {
        ripple.remove();
      }, duration);
    },
    [color, duration]
  );

  return {
    onClick: handleClick,
    className: 'ripple-container',
  };
}

/**
 * 暗色涟漪效果
 * 适用于浅色背景的按钮
 */
export function useRippleDark(duration = 600) {
  return useRipple('rgba(0, 0, 0, 0.15)', duration);
}

/**
 * 自定义涟漪效果（高级用法）
 * 允许完全自定义涟漪属性
 */
export interface RippleOptions {
  color?: string;
  duration?: number;
  size?: number;
  className?: string;
}

export function useCustomRipple(options: RippleOptions = {}) {
  const { color, duration = 600, size, className = '' } = options;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = `ripple ${className}`.trim();

      const rippleSize = size || Math.max(rect.width, rect.height) * 2;
      ripple.style.width = `${rippleSize}px`;
      ripple.style.height = `${rippleSize}px`;
      ripple.style.left = `${x - rippleSize / 2}px`;
      ripple.style.top = `${y - rippleSize / 2}px`;

      if (color) {
        ripple.style.backgroundColor = color;
      }

      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, duration);
    },
    [color, duration, size, className]
  );

  return {
    onClick: handleClick,
    className: 'ripple-container',
  };
}

export default useRipple;
