import React from 'react';
import { Image } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { Divider } from 'antd-mobile';
import type { CheckInItem } from '../utils/checkInDataTransform';

interface CheckInContentProps {
  currentItem: CheckInItem | undefined;
}

/**
 * 打卡内容展示组件
 * @param currentItem - 当前打卡项目
 */
const CheckInContent: React.FC<CheckInContentProps> = ({ currentItem }) => {
  if (!currentItem) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* 用户信息和时间 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-medium">
              {currentItem.username.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{currentItem.username}</p>
            <p className="text-sm text-gray-500">{currentItem.date} {currentItem.time}</p>
          </div>
        </div>
        <CloudDownloadOutlined className="text-gray-400" />
      </div>

      {/* 文字内容区域 */}
      <div className="flex-1 mb-6">
        <div className="mb-4">
          <p className="text-gray-800 text-base leading-relaxed">
            {currentItem.text}
          </p>
        </div>
      </div>

      {/* 分割线 */}
      <Divider />
      
      {/* 图片网格区域 */}
      {currentItem.images.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {currentItem.images.slice(0, 9).map((imageUrl, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
              >
                <Image  
                  src={imageUrl} 
                  alt={`图片 ${i + 1}`} 
                  className="w-full h-full object-cover"
                  preview={{
                    src: imageUrl
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="w-3 h-3 rounded-full"></div>
      </div>
    </div>
  );
};

export default CheckInContent;