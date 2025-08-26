import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Spin } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';
import { Toast } from 'antd-mobile';
import { useSwipeable } from 'react-swipeable';
import { API } from '../../../services/api';

// 导入重构后的模块
import { transformPendingData, type CheckInItem } from './utils/checkInDataTransform';
import { useCheckInReview } from './hooks/useCheckInReview';
import { useCheckInNavigation } from './hooks/useCheckInNavigation';
import CheckInDetailHeader from './components/CheckInDetailHeader';
import CheckInContent from './components/CheckInContent';

// 类型定义
interface LocationState {
  columnId?: number;
  columnName?: string;
}

/**
 * 打卡审批详情页面
 */
const CheckInDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // 从路由状态或参数中获取栏目信息
  const { columnId } = (location.state as LocationState) || {};
  const finalColumnId = columnId || parseInt(params.columnId || '0');
  
  const [items, setItems] = useState<CheckInItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 使用自定义 hooks
  const { currentIndex, currentItem, goToPrevious, goToNext } = useCheckInNavigation(items, parseInt(params.index || '0'), navigate);
  
  /**
   * 从列表中移除当前项并处理导航
   */
  const removeCurrentItem = (): void => {
    const newItems = items.filter((_, i) => i !== currentIndex);
    setItems(newItems);
    
    if (newItems.length === 0) {
      // 如果没有更多记录，返回上一页
      navigate(-1);
      return;
    }
  };
  
  const { handleApprove, handleReject, toggleStar, isStarred } = useCheckInReview({
    currentItem,
    onItemRemoved: removeCurrentItem
  });

  /**
   * 获取待审核列表数据
   */
  const fetchPendingList = async () => {
    if (!finalColumnId) {
      Toast.show({ content: '缺少栏目ID参数', icon: 'fail' });
      navigate(-1);
      return;
    }

    try {
      setLoading(true);
      const response = await API.Column.getPendingList(finalColumnId);
      
      // 处理直接返回数组的情况
      if (Array.isArray(response)) {
        if (response.length > 0) {
          const transformedItems = transformPendingData(response);
          setItems(transformedItems);
        } else {
          setItems([]);
        }
      } else if (response && typeof response === 'object' && 'code' in response) {
        // 处理标准API响应格式
        if (response.code === 200 && response.data) {
          const transformedItems = transformPendingData(response.data);
          setItems(transformedItems);
        } else {
          Toast.show({ content: response.msg || '获取数据失败', icon: 'fail' });
        }
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('获取待审核列表失败:', error);
      Toast.show({ content: '获取数据失败', icon: 'fail' });
    } finally {
      setLoading(false);
    }
  };



  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < items.length - 1) {
        goToNext();
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        goToPrevious();
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  /**
   * 组件挂载时获取数据
   */
  useEffect(() => {
    fetchPendingList();
  }, [finalColumnId]);

  // 加载状态
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 px-4">
        <Spin size="large" />
        <p className="mt-4 text-gray-600 text-center">加载中...</p>
      </div>
    );
  }

  // 如果没有数据，则返回提示
  if (items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center max-w-sm w-full mx-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CloudDownloadOutlined className="text-xl sm:text-2xl text-gray-400" />
          </div>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">没有可供审核的打卡记录</p>
          <Button 
            type="primary" 
            size="large" 
            shape="round"
            className="w-full h-10 sm:h-12"
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-blue-500 flex flex-col relative overflow-hidden" {...swipeHandlers}>
      {/* 头部 */}
      <CheckInDetailHeader 
        currentItem={currentItem}
        isStarred={isStarred}
        onBack={() => navigate(-1)}
        onToggleStar={toggleStar}
      />
      
      {/* 内容区域 */}
      <div className="flex-1 flex flex-col relative">
        <CheckInContent 
          currentItem={currentItem}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
      
      {/* 导航箭头 - 响应式定位 */}
      {currentIndex > 0 && (
        <div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10">
          <button 
            onClick={goToPrevious}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-full flex items-center justify-center border border-gray-300 text-black hover:bg-white/80 transition-all duration-200 shadow-lg active:scale-95 touch-manipulation"
          >
            <LeftOutlined className="text-sm sm:text-base" />
          </button>
        </div>
      )}
      
      {currentIndex < items.length - 1 && (
        <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10">
          <button 
            onClick={goToNext}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-full flex items-center justify-center border border-gray-300 text-black hover:bg-white/80 transition-all duration-200 shadow-lg active:scale-95 touch-manipulation"
          >
            <RightOutlined className="text-sm sm:text-base" />
          </button>
        </div>
      )}
      
      {/* 页码指示器 - 响应式定位 */}
      {items.length > 1 && (
        <div className="absolute bottom-32 sm:bottom-40 md:bottom-48 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex space-x-1.5 sm:space-x-2">
              {Array.from({ length: items.length }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const diff = i - currentIndex;
                    if (diff > 0) {
                      for (let j = 0; j < diff; j++) {
                        setTimeout(() => goToNext(), j * 100);
                      }
                    } else if (diff < 0) {
                      for (let j = 0; j < Math.abs(diff); j++) {
                        setTimeout(() => goToPrevious(), j * 100);
                      }
                    }
                  }}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 touch-manipulation ${
                    i === currentIndex 
                      ? 'bg-white shadow-lg scale-125 ring-2 ring-white/50' 
                      : 'bg-white/60 hover:bg-white/80 active:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInDetail;