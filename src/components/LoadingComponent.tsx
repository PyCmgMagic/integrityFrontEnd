import React from 'react';
import { Spin } from 'antd';

/**
 * 全局加载组件
 * @returns 一个在屏幕中央显示的大号加载指示器
 */
const LoadingComponent: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Spin size="large" />
  </div>
);

export default LoadingComponent;