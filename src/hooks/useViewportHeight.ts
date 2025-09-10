import { useState, useEffect } from 'react';

/**
 * 获取视口高度的自定义Hook
 * @returns 当前视口高度值
 */
const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    /**
     * 处理窗口大小变化的函数
     */
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);

    // 清理函数，移除监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewportHeight;
};

export default useViewportHeight;