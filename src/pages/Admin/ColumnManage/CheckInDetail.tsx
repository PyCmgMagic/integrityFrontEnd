import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { transformPendingData, transformPunchDetail, type CheckInItem } from './utils/checkInDataTransform';
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
  
  // 获取当前打卡记录ID：review 路由使用 reviewId，punch 路由使用 punchId，其次使用状态中的 currentPunchId
  const punchId = parseInt(params.reviewId || params.punchId || '') || currentPunchId;
  const finalColumnId = columnId || parseInt(params.columnId || '0');
  
  const [items, setItems] = useState<CheckInItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSwipeLoading, setIsSwipeLoading] = useState<boolean>(false);
  const [currentPunchIndex, setCurrentPunchIndex] = useState<number>(0);
  const [transitionDir, setTransitionDir] = useState<1 | -1>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationRafRef = useRef<number | null>(null);

  // 使用自定义 hooks（非 punchIds 模式用 currentIndex/currentItem）
  const { currentIndex, currentItem, goToPrevious, goToNext } = useCheckInNavigation(items, currentPunchIndex);
  // punchIds 模式下以 currentPunchIndex 为准，保证滑动与页码正确
  const displayIndex = punchIds.length > 1 ? currentPunchIndex : currentIndex;
  const totalCount = punchIds.length > 1 ? punchIds.length : items.length;
  const effectiveCurrentItem =
    punchIds.length > 1
      ? (items[Math.min(currentPunchIndex, items.length - 1)] ?? items[0])
      : currentItem;
  const effectivePunchId = effectiveCurrentItem?.punchId;

  useEffect(() => {
    if (!effectivePunchId) return;
    setIsAnimating(true);
    if (animationRafRef.current) {
      cancelAnimationFrame(animationRafRef.current);
    }
    animationRafRef.current = requestAnimationFrame(() => {
      setIsAnimating(false);
    });
    return () => {
      if (animationRafRef.current) {
        cancelAnimationFrame(animationRafRef.current);
      }
    };
  }, [effectivePunchId]);

  /**
   * 从列表中移除当前项并处理导航
   */
  const removeCurrentItem = (): void => {
    const idx = items.length > 0 ? Math.min(displayIndex, items.length - 1) : 0;
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    
    if (newItems.length === 0) {
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

  const { handleApprove, handleReject, toggleStar,  isStarLoading } = useCheckInReview({
    currentItem: effectiveCurrentItem,
    onItemRemoved: removeCurrentItem,
    onStarChange: handleStarChange
  });

  /**
   * 获取单个打卡详情数据
   * @param keepPunchIndex - 为 true 时不重置 currentPunchIndex，用于 punchIds 模式下滑动时保持页码
   */
  type FetchPunchDetailOptions = {
    keepPunchIndex?: boolean;
    useSwipeLoading?: boolean;
  };

  const fetchPunchDetail = useCallback(async (
    targetPunchId: number,
    keepPunchIndexOrOptions: boolean | FetchPunchDetailOptions = false
  ) => {
    const options =
      typeof keepPunchIndexOrOptions === 'boolean'
        ? { keepPunchIndex: keepPunchIndexOrOptions }
        : keepPunchIndexOrOptions;
    const keepPunchIndex = options.keepPunchIndex ?? false;
    const useSwipeLoading = options.useSwipeLoading ?? keepPunchIndex;
    try {
      if (useSwipeLoading) {
        setIsSwipeLoading(true);
      } else {
        setLoading(true);
      }
      const response = await API.Column.getPunchDetail(targetPunchId);
      
      if (response && response.data) {
        const transformedItem = transformPunchDetail(response);
        setItems([transformedItem]);
        if (!keepPunchIndex) setCurrentPunchIndex(0);
      } else {
        setItems([]);
        Toast.show({ content: '获取打卡详情失败', icon: 'fail' });
      }
    } catch (error) {
      console.error('获取打卡详情失败:', error);
      Toast.show({ content: '获取数据失败', icon: 'fail' });
      setItems([]);
    } finally {
      if (useSwipeLoading) {
        setIsSwipeLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

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
      
      const punches = response.punches || [];
      if (punches.length > 0) {
        const transformedItems = transformPendingData(punches);
        setItems(transformedItems);
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
    if (isSwipeLoading) return;
    setTransitionDir(1);
    if (punchIds.length > 1 && currentPunchIndex < punchIds.length - 1) {
      const nextIndex = currentPunchIndex + 1;
      const nextPunchId = punchIds[nextIndex];
      setCurrentPunchIndex(nextIndex);
      fetchPunchDetail(nextPunchId, true);
    } else if (currentIndex < items.length - 1) {
      goToNext();
    }
  }, [isSwipeLoading, currentPunchIndex, currentIndex, punchIds, items.length, goToNext, fetchPunchDetail]);

  /**
   * 处理滑动到上一个打卡记录
   */
  const handleSwipePrevious = useCallback(() => {
    if (isSwipeLoading) return;
    setTransitionDir(-1);
    if (punchIds.length > 1 && currentPunchIndex > 0) {
      const prevIndex = currentPunchIndex - 1;
      const prevPunchId = punchIds[prevIndex];
      setCurrentPunchIndex(prevIndex);
      fetchPunchDetail(prevPunchId, true);
    } else if (currentIndex > 0) {
      goToPrevious();
    }
  }, [isSwipeLoading, currentPunchIndex, currentIndex, punchIds, goToPrevious, fetchPunchDetail]);

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
        const targetIndex = punchIds.indexOf(punchId);
        if (targetIndex >= 0) {
          setCurrentPunchIndex(targetIndex);
        }
        // 仅请求当前详情，避免一次性拉取全部
        fetchPunchDetail(punchId, { keepPunchIndex: true, useSwipeLoading: false });
      } else {
        // 只有单个打卡记录ID
        fetchPunchDetail(punchId);
      }
    } else {
      // 兼容旧版本，获取整个待审核列表
      fetchPendingList();
    }
  }, [punchId, punchIds, fetchPunchDetail, fetchPendingList]); // 使用稳定的函数引用

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
        currentItem={effectiveCurrentItem}
        isStarred={effectiveCurrentItem?.starred || false}
        isStarLoading={isStarLoading}
        onBack={() => navigate(-1)}
        onToggleStar={toggleStar}
      />
      
      {/* 内容区域 */}
      <div className="flex-1 flex flex-col relative">
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-out transform ${
            isAnimating
              ? transitionDir === 1
                ? 'translate-x-4 opacity-0'
                : '-translate-x-4 opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
          style={{ willChange: 'transform, opacity' }}
        >
          <CheckInContent 
            currentItem={effectiveCurrentItem}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>

      {isSwipeLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 pointer-events-none">
          <Spin size="small" />
        </div>
      )}
      
      {/* 导航箭头 - 响应式定位 */}
      {((punchIds.length > 1 && displayIndex > 0) || (punchIds.length <= 1 && currentIndex > 0)) && (
        <div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10">
          <button 
            onClick={handleSwipePrevious}
            disabled={isSwipeLoading}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-full flex items-center justify-center border border-gray-300 text-black hover:bg-white/80 transition-all duration-200 shadow-lg active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LeftOutlined className="text-sm sm:text-base" />
          </button>
        </div>
      )}
      
      {((punchIds.length > 1 && displayIndex < punchIds.length - 1) || (punchIds.length <= 1 && currentIndex < items.length - 1)) && (
        <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10">
          <button 
            onClick={handleSwipeNext}
            disabled={isSwipeLoading}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-full flex items-center justify-center border border-gray-300 text-black hover:bg-white/80 transition-all duration-200 shadow-lg active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RightOutlined className="text-sm sm:text-base" />
          </button>
        </div>
      )}
      
      {/* 页码指示器 - 响应式定位 */}
      {totalCount > 1 && (
        <div className="absolute bottom-32 sm:bottom-40 md:bottom-48 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 sm:py-3">
            {totalCount <= 7 ? (
              <div className="flex space-x-1.5 sm:space-x-2">
                {Array.from({ length: totalCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isSwipeLoading) return;
                      if (punchIds.length > 1) {
                        const targetPunchId = punchIds[i];
                        setTransitionDir(i > displayIndex ? 1 : -1);
                        setCurrentPunchIndex(i);
                        fetchPunchDetail(targetPunchId, true);
                      } else {
                        // 兼容旧版本：使用原有的切换逻辑
                        const diff = i - currentIndex;
                        if (diff !== 0) {
                          setTransitionDir(diff > 0 ? 1 : -1);
                        }
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
                      i === displayIndex 
                        ? 'bg-white shadow-lg scale-125 ring-2 ring-white/50' 
                        : 'bg-white/60 hover:bg-white/80 active:scale-110'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-white text-xs sm:text-sm font-medium px-1">
                {displayIndex + 1} / {totalCount}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInDetail;
