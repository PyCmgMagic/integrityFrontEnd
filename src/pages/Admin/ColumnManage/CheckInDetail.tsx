import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { transformPendingData, transformPunchDetail, type CheckInItem, type PunchDetailResponse } from './utils/checkInDataTransform';
import { useCheckInReview } from './hooks/useCheckInReview';
import { useCheckInNavigation } from './hooks/useCheckInNavigation';
import CheckInDetailHeader from './components/CheckInDetailHeader';
import CheckInContent from './components/CheckInContent';

// 类型定义
interface LocationState {
  columnId?: number;
  columnName?: string;
  punchIds?: number[]; // 打卡记录ID列表，用于支持滑动切换
  currentPunchId?: number; // 当前查看的打卡记录ID
}

/**
 * 打卡审批详情页面
 */
const CheckInDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // 从路由状态中获取信息
  const locationState = (location.state as LocationState) || {};
  const { columnId, currentPunchId } = locationState;
  
  // 使用useMemo稳定punchIds数组引用，避免无限重渲染
  const punchIds = useMemo(() => locationState.punchIds || [], [locationState.punchIds]);
  
  // 获取当前打卡记录ID，优先使用路由参数，其次使用状态中的ID
  const punchId = parseInt(params.punchId || '') || currentPunchId;
  const finalColumnId = columnId || parseInt(params.columnId || '0');
  
  const [items, setItems] = useState<CheckInItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPunchIndex, setCurrentPunchIndex] = useState<number>(0);

  // 使用自定义 hooks
  const { currentIndex, currentItem, goToPrevious, goToNext } = useCheckInNavigation(items, currentPunchIndex, navigate);
  
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
  
  /**
   * 处理收藏状态变化
   */
  const handleStarChange = useCallback((punchId: number, isStarred: boolean): void => {
    // 更新当前项目的收藏状态
    setItems(prevItems =>
      prevItems.map(item =>
        item.punchId === punchId ? { ...item, starred: isStarred } : item
      )
    );
  }, []);

  const { handleApprove, handleReject, toggleStar, isStarred, isStarLoading } = useCheckInReview({
    currentItem,
    onItemRemoved: removeCurrentItem,
    onStarChange: handleStarChange
  });

  /**
   * 获取单个打卡详情数据
   */
  const fetchPunchDetail = useCallback(async (targetPunchId: number) => {
    try {
      setLoading(true);
      const response = await API.CheckIn.getPunchDetail(targetPunchId);
      console.log('获取打卡详情:', response);
      
      if (response && response.data) {
        // 转换单个打卡详情数据
        const transformedItem = transformPunchDetail(response);
        setItems([transformedItem]);
        setCurrentPunchIndex(0);
      } else {
        setItems([]);
        Toast.show({ content: '获取打卡详情失败', icon: 'fail' });
      }
    } catch (error) {
      console.error('获取打卡详情失败:', error);
      Toast.show({ content: '获取数据失败', icon: 'fail' });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []); // fetchPunchDetail不依赖任何外部变量

  /**
   * 获取多个打卡详情数据（支持滑动切换）
   */
  const fetchMultiplePunchDetails = useCallback(async (targetPunchIds: number[], currentId: number) => {
    try {
      setLoading(true);
      const promises = targetPunchIds.map(id => API.CheckIn.getPunchDetail(id));
      const responses = await Promise.all(promises);
      
      const transformedItems: CheckInItem[] = [];
      let currentIndex = 0;
      
      responses.forEach((response, index) => {
        if (response && response.data) {
          const transformedItem = transformPunchDetail(response);
          transformedItems.push(transformedItem);
          
          // 找到当前打卡记录的索引
          if (targetPunchIds[index] === currentId) {
            currentIndex = transformedItems.length - 1;
          }
        }
      });
      
      setItems(transformedItems);
      setCurrentPunchIndex(currentIndex);
    } catch (error) {
      console.error('获取打卡详情列表失败:', error);
      Toast.show({ content: '获取数据失败', icon: 'fail' });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []); // fetchMultiplePunchDetails不依赖任何外部变量

  /**
   * 获取待审核列表数据（兼容旧版本）
   */
  const fetchPendingList = useCallback(async () => {
    if (!finalColumnId) {
      Toast.show({ content: '缺少栏目ID参数', icon: 'fail' });
      navigate(-1);
      return;
    }

    try {
      setLoading(true);
      const response = await API.Column.getPendingList(finalColumnId);
      console.log('获取待审核列表:', response);
      
      // 处理直接返回数组的情况
      if (Array.isArray(response)) {
        if (response.length > 0) {
          const transformedItems = transformPendingData(response);
          setItems(transformedItems);
        } else {
          setItems([]);
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
  }, [finalColumnId, navigate]); // fetchPendingList依赖finalColumnId和navigate



  /**
   * 处理滑动到下一个打卡记录
   */
  const handleSwipeNext = useCallback(() => {
    if (punchIds.length > 1 && currentIndex < punchIds.length - 1) {
      // 如果有多个打卡记录ID，切换到下一个
      const nextIndex = currentIndex + 1;
      const nextPunchId = punchIds[nextIndex];
      setCurrentPunchIndex(nextIndex);
      
      // 动态加载下一个打卡详情
      fetchPunchDetail(nextPunchId);
    } else if (currentIndex < items.length - 1) {
      // 兼容旧版本的列表切换
      goToNext();
    }
  }, [currentIndex, punchIds, items.length, goToNext]);

  /**
   * 处理滑动到上一个打卡记录
   */
  const handleSwipePrevious = useCallback(() => {
    if (punchIds.length > 1 && currentIndex > 0) {
      // 如果有多个打卡记录ID，切换到上一个
      const prevIndex = currentIndex - 1;
      const prevPunchId = punchIds[prevIndex];
      setCurrentPunchIndex(prevIndex);
      
      // 动态加载上一个打卡详情
      fetchPunchDetail(prevPunchId);
    } else if (currentIndex > 0) {
      // 兼容旧版本的列表切换
      goToPrevious();
    }
  }, [currentIndex, punchIds, goToPrevious]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeNext,
    onSwipedRight: handleSwipePrevious,
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  /**
   * 组件挂载时获取数据
   */
  useEffect(() => {
    // 如果有具体的打卡记录ID，使用新的API获取详情
    if (punchId) {
      if (punchIds.length > 1) {
        // 如果有多个打卡记录ID，支持滑动切换
        fetchMultiplePunchDetails(punchIds, punchId);
      } else {
        // 只有单个打卡记录ID
        fetchPunchDetail(punchId);
      }
    } else {
      // 兼容旧版本，获取整个待审核列表
      fetchPendingList();
    }
  }, [punchId, punchIds, fetchPunchDetail, fetchMultiplePunchDetails, fetchPendingList]); // 使用稳定的函数引用

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
        isStarred={currentItem?.starred || false}
        isStarLoading={isStarLoading}
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
      {((punchIds.length > 1 && currentIndex > 0) || (punchIds.length <= 1 && currentIndex > 0)) && (
        <div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10">
          <button 
            onClick={handleSwipePrevious}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-full flex items-center justify-center border border-gray-300 text-black hover:bg-white/80 transition-all duration-200 shadow-lg active:scale-95 touch-manipulation"
          >
            <LeftOutlined className="text-sm sm:text-base" />
          </button>
        </div>
      )}
      
      {((punchIds.length > 1 && currentIndex < punchIds.length - 1) || (punchIds.length <= 1 && currentIndex < items.length - 1)) && (
        <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10">
          <button 
            onClick={handleSwipeNext}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-full flex items-center justify-center border border-gray-300 text-black hover:bg-white/80 transition-all duration-200 shadow-lg active:scale-95 touch-manipulation"
          >
            <RightOutlined className="text-sm sm:text-base" />
          </button>
        </div>
      )}
      
      {/* 页码指示器 - 响应式定位 */}
      {((punchIds.length > 1) || (punchIds.length <= 1 && items.length > 1)) && (
        <div className="absolute bottom-32 sm:bottom-40 md:bottom-48 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex space-x-1.5 sm:space-x-2">
              {Array.from({ length: punchIds.length > 1 ? punchIds.length : items.length }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (punchIds.length > 1) {
                      // 新版本：直接跳转到指定的打卡记录
                      const targetPunchId = punchIds[i];
                      setCurrentPunchIndex(i);
                      fetchPunchDetail(targetPunchId);
                    } else {
                      // 兼容旧版本：使用原有的切换逻辑
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