import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin } from 'antd';
import { LeftOutlined, EditOutlined } from '@ant-design/icons';
import EditColumnModal from '../ProjectManage/EditColumnModal';
import { API } from '../../../services/api';

// 导入重构后的模块
import { transformPendingData, calculateAuditStats } from './utils/dataTransform';
import { useReviewActions } from './hooks/useReviewActions';
import { CheckInList } from './components/CheckInList';
import { AuditStatsDisplay } from './components/AuditStatsDisplay';
import { ReviewTabs, type ReviewTabType } from './components/ReviewTabs';
import type { CheckInItem, ColumnInfo, AuditStats } from './utils/dataTransform';
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
  const { activityId, projectId, columnId } = useParams();
  const parsedProjectId = parseInt(projectId || '0');
  
  // 使用ref来跟踪当前请求
  const currentRequestRef = useRef<number>(0);
  
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
      
      // 检查是否是最新的请求
      if (requestId !== currentRequestRef.current) {
        return; // 忽略过期的请求
      }
      
      // 处理直接返回数组的情况
      if (Array.isArray(response)) {
        if (response.length > 0) {
          const transformedData = response.map(transformPendingData);
          setUnreviewedData(transformedData);
        } else {
          setUnreviewedData([]);
        }
      } else if (response && typeof response === 'object' && 'code' in response) {
        // 处理标准API响应格式
        if (response.code === 200) {
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            const transformedData = response.data.map(transformPendingData);
            setUnreviewedData(transformedData);
          } else {
            setUnreviewedData([]);
          }
        } else {
          Toast.show({ content: response.msg || '获取数据失败', position: 'bottom' });
        }
      } else {
        setUnreviewedData([]);
      }
    } catch (error) {
      // 检查是否是最新的请求
      if (requestId !== currentRequestRef.current) {
        return; // 忽略过期的请求错误
      }
      console.error('获取待审核列表失败:', error);
      Toast.show({ content: '网络错误，请稍后重试', position: 'bottom' });
    } finally {
      // 只有最新请求才更新loading状态
      if (requestId === currentRequestRef.current) {
        setLoading(false);
      }
    }
  }, [columnId]);
  

  
  /**
   * 组件挂载时获取数据
   */
  useEffect(() => {
    fetchPendingListStable();
  }, [fetchPendingListStable]);
  
  const handleEditColumnFinish = (values: ColumnInfo): void => {
    console.log('Received values from edit form: ', values);
    setEditColumnVisible(false);
  };

  const column: ColumnInfo = {
    name: '单词打卡',
    activityTime: '1.3 - 1.31',
    checkRequirement: '打卡要求：每日背诵英文单词不少于20个，通过单词App学习单词，上传打卡信息截图，或对自己每日学习的成果（阅读笔记）进行拍照打卡，图片中需要附有自己的姓名以及当天日期，每日内容不得重复。（该项如提交笔记，不得与上一项自习笔记重复）。打卡时间为每日6时至22时。'
  };

  // 计算审核统计信息
  const auditStats: AuditStats = calculateAuditStats(reviewedData.length, unreviewedData.length);

  // 使用审核操作hook
  const { handleReview } = useReviewActions({
    unreviewedData,
    reviewedData,
    setUnreviewedData,
    setReviewedData
  });

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
          <p className="font-semibold tracking-wider">{column.activityTime}</p>
        </div>
      </header>

      <main className="p-4 pb-10">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">{column.checkRequirement}</p>
        </div>

        {/* 审核统计信息 */}
        <AuditStatsDisplay stats={auditStats} />

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
            />
          )}
        </div>
      </main>

      <EditColumnModal
        visible={editColumnVisible}
        onClose={() => setEditColumnVisible(false)}
        onFinish={handleEditColumnFinish} 
        projectId={parsedProjectId}
      />
    </div>
  );
};

export default ColumnManage;