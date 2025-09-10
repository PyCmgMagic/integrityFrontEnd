import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin } from 'antd';
import { LeftOutlined, EditOutlined } from '@ant-design/icons';
import EditColumnModal from '../ProjectManage/EditColumnModal';
import { API } from '../../../services/api';

// 导入重构后的模块
import {  transformPendingDataWithStarStatus, transformReviewedDataList } from './utils/dataTransform';
import { useReviewActions } from './hooks/useReviewActions';
import { useStarStatusLoader } from './hooks/useStarStatusLoader';
import { CheckInList } from './components/CheckInList';
import { ReviewTabs, type ReviewTabType } from './components/ReviewTabs';
import type { CheckInItem, ColumnInfo } from './utils/dataTransform';
import { Toast } from 'antd-mobile';

// 接口和工具函数已移至独立模块

/**
 * 打卡管理页面 - 管理员审核视角 
 */
const ColumnManage: React.FC = () => {
  
  const navigate = useNavigate();
  const [editColumnVisible, setEditColumnVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ReviewTabType>('unreviewed');
  const [unreviewedData, setUnreviewedData] = useState<CheckInItem[]>([]);
  const [reviewedData, setReviewedData] = useState<CheckInItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [columnInfo, setColumnInfo] = useState<ColumnInfo>({
    ID: 0,
    name: '',
    description: '',
    avatar: '',
    daily_punch_limit: 0,
    point_earned: 0,
    end_time: '',
    start_time: '',
    start_date: 0,
    today_punch_count: 0,
    owner_id: '',
    project_id: 0,
  });
  const { activityId, projectId, columnId } = useParams();
  const parsedProjectId = parseInt(projectId || '0');
  
  // 使用ref来跟踪当前请求
  const currentRequestRef = useRef<number>(0);

  // 使用收藏状态加载器
  const { loadStarStatusMap } = useStarStatusLoader();
  
  /**
   * 获取待审核列表数据 - 使用useCallback避免重复创建
   */
  const fetchPendingListStable = useCallback(async (): Promise<void> => {
    if (!columnId) {
      Toast.show({ content: '缺少专栏ID参数', position: 'bottom' });
      return;
    }
    
    // 生成请求ID
    const requestId = ++currentRequestRef.current;
    
    setLoading(true);
    try {
      const response = await API.Column.getPendingList(parseInt(columnId));
      const columnInfoResponse = await API.Column.getColumnInfo(parseInt(columnId));
      if(columnInfoResponse.code === 200) {
        setColumnInfo(columnInfoResponse.data);
      }
      // 检查是否是最新的请求
      if (requestId !== currentRequestRef.current) {
        return; // 忽略过期的请求
      }
      
      // 处理直接返回数组的情况
      if (Array.isArray(response)) {
        if (response.length > 0) {
          // 提取所有打卡记录ID
          const punchIds = response.map(item => item.punch.ID);
          // 批量获取收藏状态
          const starStatusMap = await loadStarStatusMap(punchIds);
          // 使用优化的转换方法，一次性应用收藏状态
          console.log(starStatusMap);
          
          const transformedData = transformPendingDataWithStarStatus(response, starStatusMap);
          console.log('transformedData:', transformedData);
          setUnreviewedData(transformedData);
        } else {
          setUnreviewedData([]);
        }
      }  else {
        setUnreviewedData([]);
      }
    } catch (error) {
      // 检查是否是最新的请求
      if (requestId !== currentRequestRef.current) {
        return;
      }
      console.error('获取待审核列表失败:', error);
      Toast.show({ content: '网络错误，请稍后重试', position: 'bottom' });
    } finally {
      // 只有最新请求才更新loading状态
      if (requestId === currentRequestRef.current) {
        setLoading(false);
      }
    }
  }, [columnId, loadStarStatusMap]);

  /**
   * 获取已审核列表数据
   */
  const fetchReviewedListStable = useCallback(async (): Promise<void> => {
    if (!columnId) {
      Toast.show({ content: '缺少专栏ID参数', position: 'bottom' });
      return;
    }
    
    // 生成请求ID
    const requestId = ++currentRequestRef.current;
    
    setLoading(true);
    try {
      const response = await API.Column.getReviewedList(parseInt(columnId));
      
      // 检查是否是最新的请求
      if (requestId !== currentRequestRef.current) {
        return; // 忽略过期的请求
      }
      
      // 处理API返回的完整响应结构
      if (response && response.code === 200 && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          const transformedData = transformReviewedDataList(response.data);
          console.log('已审核数据:', transformedData);
          setReviewedData(transformedData);
        } else {
          setReviewedData([]);
        }
      } else {
        setReviewedData([]);
      }
    } catch (error) {
      // 检查是否是最新的请求
      if (requestId !== currentRequestRef.current) {
        return;
      }
      console.error('获取已审核列表失败:', error);
      Toast.show({ content: '获取已审核列表失败，请稍后重试', position: 'bottom' });
    } finally {
      // 只有最新请求才更新loading状态
      if (requestId === currentRequestRef.current) {
        setLoading(false);
      }
    }
  }, [columnId]);
  
  

  /**
   * 标签页切换时获取对应数据
   */
  useEffect(() => {
    if (activeTab === 'reviewed') {
      fetchReviewedListStable();
    } else {
      fetchPendingListStable();
    }
  }, [activeTab, fetchPendingListStable, fetchReviewedListStable]);
  
  const handleEditColumnFinish = (values: ColumnInfo): void => {
    console.log('Received values from edit form: ', values);
    setEditColumnVisible(false);
  };




  // 使用审核操作hook
  const { handleReview } = useReviewActions({
    unreviewedData,
    reviewedData,
    setUnreviewedData,
    setReviewedData
  });

  /**
   * 处理收藏状态变化
   */
  const handleStarChange = useCallback((punchId: number, isStarred: boolean): void => {
    // 更新未审核数据中的收藏状态
    setUnreviewedData(prevData =>
      prevData.map(item =>
        item.id === punchId ? { ...item, starred: isStarred } : item
      )
    );

    // 更新已审核数据中的收藏状态
    setReviewedData(prevData =>
      prevData.map(item =>
        item.id === punchId ? { ...item, starred: isStarred } : item
      )
    );
  }, []);

  // 列表渲染和滑动操作逻辑已移至CheckInList组件
 

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-blue-500 text-white p-6 shadow-lg rounded-b-3xl">
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">打卡管理</h1> 
          <Button type="text" shape="circle" icon={<EditOutlined />} className="text-white hover:bg-white/20" onClick={() => setEditColumnVisible(true)} />
        </div>
        <div className="text-center mt-3">
          <p className="text-sm opacity-80">活动时间</p>
          <p className="font-semibold tracking-wider">{columnInfo.start_time} - {columnInfo.end_time}</p>
        </div>
      </header>

      <main className="p-4 pb-10">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">{columnInfo.description}</p>
        </div>

        {/* 审核统计信息 */}

        {/* 审核标签页 */}
        <ReviewTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreviewedCount={unreviewedData.length}
          reviewedCount={reviewedData.length}
        />

        {/* 打卡列表 */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <CheckInList
              data={activeTab === 'unreviewed' ? unreviewedData : reviewedData}
              type={activeTab}
              onReview={handleReview}
              activityId={activityId!}
              projectId={projectId!}
              columnId={columnId!}
              onStarChange={handleStarChange}
            />
          )}
        </div>
      </main>

      <EditColumnModal
        visible={editColumnVisible}
        onClose={() => setEditColumnVisible(false)}
        onFinish={handleEditColumnFinish} 
        projectId={parsedProjectId}
        initialData={columnInfo}
      />
    </div>
  );
};

export default ColumnManage;