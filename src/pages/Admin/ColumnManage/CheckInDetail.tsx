import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button,Image  } from 'antd';
import { 
  LeftOutlined, 
  StarOutlined, 
  CloudDownloadOutlined,
  RightOutlined 
} from '@ant-design/icons';
import { Toast, Dialog, Divider } from 'antd-mobile';
import { useSwipeable } from 'react-swipeable';

// 类型定义
interface CheckInItem {
  id: string;
  date: string;
  title: string;
  text: string;
  images: string[];
  starred: boolean;
  username?: string;
  time?: string;
}

interface LocationState {
  items: CheckInItem[];
  currentIndex: number;
}

/**
 * 打卡审批详情页面
 */
const CheckInDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 从路由状态中获取打卡列表和当前点击的索引
  const { items = [], currentIndex = 0 } = (location.state as LocationState) || {};
  
  const [index, setIndex] = useState<number>(currentIndex);
  
  // 如果没有数据，则返回提示
  if (items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 px-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CloudDownloadOutlined className="text-2xl text-gray-400" />
          </div>
          <p className="text-gray-600 mb-6">没有可供审核的打卡记录</p>
          <Button 
            type="primary" 
            size="large" 
            shape="round"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </div>
      </div>
    );
  }

  const currentItem = items[index];
  const [isStarred, setIsStarred] = useState<boolean>(currentItem.starred);

  const handleNext = (): void => {
    if (index < items.length - 1) {
      setIndex(index + 1);
      setIsStarred(items[index + 1].starred);
    } else {
      Toast.show({ content: '已经是最后一条了', position: 'bottom' });
    }
  };

  const handlePrev = (): void => {
    if (index > 0) {
      setIndex(index - 1);
      setIsStarred(items[index - 1].starred);
    } else {
      Toast.show({ content: '已经是第一条了', position: 'bottom' });
    }
  };
  
  const handleApprove = (): void => {
    Toast.show({ icon: 'success', content: '已通过' });
    handleNext();
  };

  const handleReject = async (): Promise<void> => {
    const result = await Dialog.confirm({
      content: '确定要驳回此条打卡吗？',
    });
    if (result) {
      Toast.show({ icon: 'fail', content: '已驳回' });
      handleNext();
    }
  };
  
  const toggleStar = (): void => {
    setIsStarred(!isStarred);
    Toast.show({ 
      content: !isStarred ? '已设为精华' : '已取消精华', 
      position: 'bottom' 
    });
  };

  // react-swipeable hook
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  return (
    <div className="flex flex-col h-screen bg-blue-500 font-sans rounded-3xl">
      {/* 顶部导航栏 */}
      <header className=" text-white p-4 flex items-center justify-between">
        <Button 
          type="text" 
          shape="circle" 
          icon={<LeftOutlined />} 
          className="text-white hover:bg-white/20 border-0"
          onClick={() => navigate(-1)} 
        />
        
        <h1 className="text-lg font-medium">{currentItem.date} {currentItem.title}</h1>
        
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
          onClick={toggleStar} 
        />
      </header>

      {/* 主内容区域 - 白色卡片 */}
      <div className="flex-1  bg-blue-300 p-4  rounded-3xl">

        <div {...swipeHandlers} className="bg-white  rounded-3xl h-full relative overflow-hidden">
          {/* 左箭头 */}
          {index > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <LeftOutlined className="text-gray-600 text-sm" />
            </button>
          )}

          {/* 右箭头 */}
          {index < items.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <RightOutlined className="text-gray-600 text-sm" />
            </button>
          )}

          {/* 内容区域 */}
          <div className="p-6 h-full flex flex-col">
            {/* 文字内容区域 */}
            <div className="flex-1 mb-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-gray-800 text-base leading-relaxed flex-1 pr-4">
                  {currentItem.text}
                </p>
                <CloudDownloadOutlined className="text-gray-400 mt-1 flex-shrink-0" />
              </div>
            </div>

            {/* 分割线 */}
            <Divider />
            {/* 图片网格区域 */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {Array.from({ length: 6 }, (_, i) => (
                  <div 
                    key={i} 
                    className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    {currentItem.images[i] ? (
                      <Image  
                        src={currentItem.images[i]} 
                        alt={`图片 ${i + 1}`} 
                        height={80}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">
                        图片 {i + 1}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 分页指示器 */}
            <div className="flex justify-center mb-6">
              <div className="w-3 h-3  rounded-full"></div>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-4 pb-4 mb-10">
              <Button
                danger
                shape="round"
                size="large"
                className="flex-1 h-12 font-medium"
                onClick={handleReject}
              >
                不通过
              </Button>
              <Button
                type="primary"
                shape="round"
                size="large"
                className="flex-1 h-12 font-medium bg-green-500 hover:bg-green-600 border-green-500"
                onClick={handleApprove}
              >
                通过
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInDetail;