import React from 'react';
import { Image, Button } from 'antd';
import type { CheckInItem } from '../utils/checkInDataTransform';

interface CheckInContentProps {
  currentItem: CheckInItem | undefined;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

/**
 * 打卡内容展示组件，包含审核按钮
 * @param currentItem - 当前打卡项目
 * @param onApprove - 审核通过回调函数
 * @param onReject - 审核驳回回调函数
 */
const CheckInContent: React.FC<CheckInContentProps> = ({ currentItem, onApprove, onReject }) => {
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
    <div className="bg-white min-h-[24rem] max-h-[90vh] sm:h-96 rounded-2xl sm:rounded-3xl shadow-lg mx-2 sm:mx-3 mt-1 flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 px-3 sm:px-5 pt-3 sm:pt-5 overflow-y-auto">
        {/* 用户信息和时间 */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-md flex-shrink-0">
              <span className="text-white font-bold text-base sm:text-lg">
                {currentItem.username.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">{currentItem.username}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{currentItem.date} {currentItem.time}</p>
            </div>
          </div>
        </div>

        {/* 文字内容区域 */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 min-h-[150px] sm:min-h-[200px] max-h-[250px] sm:max-h-[300px] overflow-y-auto">
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {currentItem.text}
            </p>
          </div>
        </div>

        {/* 图片网格区域 */}
        {currentItem.images.length > 0 && (
          <div className="mt-6 sm:mt-10 mb-4 sm:mb-5">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {currentItem.images.slice(0, 9).map((imageUrl, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-sm w-full max-w-[120px] sm:max-w-[130px]"
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
        
        {/* 无图片时的占位 */}
        {currentItem.images.length === 0 && (
          <div className="mt-6 sm:mt-10 mb-4 sm:mb-5 h-20 sm:h-24 flex items-center justify-center">
            <p className="text-gray-400 text-sm">暂无图片</p>
          </div>
        )}
        
        {/* 分割线 */}
        <div className="border-b border-gray-200 mt-4 mb-4"></div>
      </div>
      
      {/* 审核按钮 */}
      <div className="bg-white pb-16 sm:pb-20 md:pb-24 px-3 sm:px-4 py-4 sm:py-6 shadow-lg border-t border-gray-100 rounded-b-2xl flex-shrink-0">
        <div className="flex gap-3 sm:gap-4">
          <Button
            danger
            shape="round"
            size="large"
            className="flex-1 h-11 sm:h-12 md:h-14 font-semibold text-sm sm:text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-200 touch-manipulation active:scale-95"
            onClick={onReject}
          >
            不通过
          </Button>
          <Button
            type="primary"
            shape="round"
            size="large"
            className="flex-1 h-11 sm:h-12 md:h-14 font-semibold text-sm sm:text-base md:text-lg bg-green-500 hover:bg-green-600 border-0 shadow-md hover:shadow-lg transition-all duration-200 touch-manipulation active:scale-95"
            onClick={onApprove}
          >
            通过
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckInContent;