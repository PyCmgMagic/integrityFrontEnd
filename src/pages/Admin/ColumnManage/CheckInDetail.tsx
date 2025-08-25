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
import ReviewButtons from './components/ReviewButtons';

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



  // react-swipeable hook
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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

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



  return (
    <div className="min-h-screen bg-gray-50" {...swipeHandlers}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* 头部组件 */}
          <CheckInDetailHeader
            currentItem={currentItem}
            isStarred={isStarred}
            onBack={() => navigate(-1)}
            onToggleStar={toggleStar}
          />

          {/* 内容区域 */}
          <div className="flex-1 p-4">
            {currentItem && (
              <CheckInContent currentItem={currentItem} />
            )}
          </div>

          {/* 底部审核按钮 */}
          <div className="bg-white p-4 border-t">
            <ReviewButtons
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>

          {/* 导航按钮 */}
          <div className="fixed bottom-20 left-4 right-4 flex justify-between pointer-events-none">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<LeftOutlined />}
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={`pointer-events-auto ${currentIndex === 0 ? 'opacity-30' : ''}`}
            />
            <div className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {items.length}
            </div>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<RightOutlined />}
              onClick={goToNext}
              disabled={currentIndex === items.length - 1}
              className={`pointer-events-auto ${currentIndex === items.length - 1 ? 'opacity-30' : ''}`}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CheckInDetail;