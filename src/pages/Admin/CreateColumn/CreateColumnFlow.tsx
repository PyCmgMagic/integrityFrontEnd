import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import CreateColumn from './index'; // 确保路径正确
import type { ColumnData } from './index'; // 假设你导出了这个类型
import { API } from '../../../services/api';

const CreateColumnFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { activityId, projectId, columnIndex } = useParams<{
    activityId: string;
    projectId: string;
    columnIndex: string;
  }>();

  const currentStep = parseInt(columnIndex || '1', 10);
  
  // 从上一个页面（项目创建页）的 state 中获取总数
  // 如果用户直接访问此URL，state可能为空，需要提供一个备用值或重定向
  const totalSteps = location.state?.totalCategories || 1;

  /**
   * 将日期字符串转换为 YYYYMMDD 格式
   * @param dateStr - 日期字符串 (YYYY-MM-DD)
   * @returns 格式化后的日期数字
   */
  const formatDateToNumber = (dateStr: string): number => {
    return parseInt(dateStr.replace(/-/g, ''), 10);
  };

  /**
   * 处理"下一步"点击事件
   * @param columnData - 栏目数据
   */
  const handleNext = async (columnData: ColumnData) => {
    if (!projectId) {
      message.error('项目ID不存在');
      return;
    }

    setLoading(true);
    
    try {
      // 准备API请求数据
      const apiData = {
        name: columnData.name,
        description: columnData.description,
        project_id: parseInt(projectId, 10),
        start_date: formatDateToNumber(columnData.startDate),
        end_date: formatDateToNumber(columnData.endDate),
        avatar: columnData.coverImage || '',
        daily_punch_limit: columnData.dailyCheckinLimit,
        point_earned: columnData.pointsPerCheckin,
      };

      console.log(`正在保存第 ${currentStep} 个栏目的数据:`, apiData);
      
      // 调用后端API创建栏目
      const response = await API.Column.createColumn(apiData);
      
      console.log('栏目创建成功，返回数据:', response);
      message.success(`第 ${currentStep} 个栏目创建成功！`);

      if (currentStep < totalSteps) {
        // 如果不是最后一个栏目，则导航到下一个栏目的创建页面
        navigate(
          `/admin/create/activity/${activityId}/project/${projectId}/column/${currentStep + 1}`,
          {
            // 再次传递总数，以防用户刷新页面
            state: { totalCategories: totalSteps }
          }
        );
      } else {
        // 如果是最后一个栏目，则完成创建流程
        console.log('所有栏目创建完毕！');
        message.success('所有栏目创建完毕！');
        // 导航到一个成功页面 
        navigate(`/admin/create/activity/${activityId}/project/${projectId}/success`);
      }
    } catch (error) {
      console.error('创建栏目失败:', error);
      message.error('创建栏目失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  // 处理“上一步”点击事件
  const handleBack = () => {
    if (currentStep > 1) {
      // 如果不是第一个栏目，则返回上一个栏目的创建页面
      navigate(
        `/admin/create/activity/${activityId}/project/${projectId}/column/${currentStep - 1}`,
        {
          state: { totalCategories: totalSteps }
        }
      );
    } else {
      // 如果是第一个栏目，则返回项目创建页面
      // 使用 navigate(-1) 更简单，它会返回历史记录的上一页
      navigate(-1);
    }
  };

  return (
    <CreateColumn
        key={currentStep} 
      onBack={handleBack}
      onNext={handleNext}
      columnIndex={currentStep}
      totalColumns={totalSteps}
      loading={loading}
    />
  );
};

export default CreateColumnFlow;