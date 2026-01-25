import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import CreateColumn from './index'; // 确保路径正确
import { API } from '../../../services/api';
import { useAppStore } from '../../../store/useAppStore';

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
  const projectStartDate = location.state?.projectStartDate;
  const projectEndDate = location.state?.projectEndDate;
  
  // 使用全局状态管理栏目创建数据
  const {
    saveColumnData,
    getAllColumnData,
    isAllColumnDataSaved,
    clearColumnCreationData,
    setIsCreatingColumn,
    isCreatingColumn
  } = useAppStore();

  // 组件挂载时清除之前的创建数据
  useEffect(() => {
    clearColumnCreationData();
  }, [clearColumnCreationData]);
  
  /**
   * 将日期字符串转换为 YYYYMMDD 格式
   * @param dateStr - 日期字符串 (YYYY-MM-DD)
   * @returns 格式化后的日期数字
   */
  const formatDateToNumber = (dateStr: string): number => {
    return parseInt(dateStr.replace(/-/g, ''), 10);
  };

  /**
   * 批量创建所有栏目
   * @param allColumnData - 所有栏目数据
   */
  const createAllColumns = async (allColumnData: any[]) => {
    const createdColumns = [];
    const failedColumns = [];
    
    for (let i = 0; i < allColumnData.length; i++) {
      const columnData = allColumnData[i];
      try {
        // 准备API请求数据
        const apiData = {
          name: columnData.name,
          description: columnData.description,
          project_id: projectId ? parseInt(projectId, 10) : 0,
          start_date: formatDateToNumber(columnData.startDate),
          end_date: formatDateToNumber(columnData.endDate),
          avatar: '',
          daily_punch_limit: columnData.dailyCheckinLimit,
          point_earned: columnData.pointsPerCheckin,
          start_time: columnData.start_time,
          end_time: columnData.end_time,
        };

        console.log(`正在创建第 ${i + 1} 个栏目:`, apiData);
        
        // 调用后端API创建栏目
        const response = await API.Column.createColumn(apiData);
        
        console.log(`第 ${i + 1} 个栏目创建成功:`, response);
        createdColumns.push({ index: i + 1, data: columnData, response });
        
      } catch (error) {
        console.error(`第 ${i + 1} 个栏目创建失败:`, error);
        failedColumns.push({ index: i + 1, data: columnData, error });
      }
    }
    
    return { createdColumns, failedColumns };
  };

  /**
   * 处理下一步操作
   * @param columnData - 当前步骤的栏目数据
   */
  const handleNext = async (columnData: any) => {
    // 保存当前步骤的数据
    saveColumnData(currentStep, columnData);
    
    if (currentStep < totalSteps) {
      // 如果不是最后一个栏目，则导航到下一个栏目的创建页面
      navigate(
        `/admin/create/activity/${activityId}/project/${projectId}/column/${currentStep + 1}`,
        {
          // 再次传递总数和日期，以防用户刷新页面
          state: { 
            totalCategories: totalSteps,
            projectStartDate,
            projectEndDate
          },
          // 使用replace避免在浏览器历史中堆积创建页面
          replace: true
        }
      );
    } else {
      // 最后一步，检查是否正在创建中
      if (isCreatingColumn) {
        message.warning('栏目正在创建中，请勿重复提交');
        return;
      }
      
      // 检查是否所有栏目数据都已保存
      if (!isAllColumnDataSaved(totalSteps)) {
        message.error('请确保所有栏目信息都已填写完整');
        return;
      }
      
      setLoading(true);
      setIsCreatingColumn(true);
      
      try {
        // 获取所有栏目数据
        const allColumnData = getAllColumnData();
        console.log('开始批量创建栏目，总数:', Object.keys(allColumnData).length);
        
        // 批量创建所有栏目
        const { createdColumns, failedColumns } = await createAllColumns(Object.values(allColumnData));
        
        if (failedColumns.length === 0) {
          // 所有栏目创建成功
          message.success(`所有 ${createdColumns.length} 个栏目创建成功！`);
          console.log('所有栏目创建完毕！');
          
          // 导航到成功页面，使用replace清理创建流程的历史记录
          // 这样确保用户从成功页面返回时不会回到创建页面
          navigate(`/admin/create/activity/${activityId}/project/${projectId}/success`, { replace: true });
        } else {
          // 部分栏目创建失败
          const successCount = createdColumns.length;
          const failCount = failedColumns.length;
          
          message.error(`创建完成：成功 ${successCount} 个，失败 ${failCount} 个。请检查失败的栏目信息后重试。`);
          console.log('创建结果:', { createdColumns, failedColumns });
        }
        
      } catch (error) {
        console.error('批量创建栏目失败:', error);
        message.error('批量创建栏目失败，请重试');
      } finally {
        setLoading(false);
        setIsCreatingColumn(false);
      }
    }
  };
  // 处理"上一步"点击事件
  const handleBack = () => {
    if (currentStep > 1) {
      // 如果不是第一个栏目，则返回上一个栏目的创建页面
      navigate(
        `/admin/create/activity/${activityId}/project/${projectId}/column/${currentStep - 1}`,
        {
          state: { 
            totalCategories: totalSteps,
            projectStartDate,
            projectEndDate
          }
        }
      );
    } else {
      // 如果是第一个栏目，返回到项目创建页面，使用replace避免历史记录问题
      navigate(`/admin/create/activity/${activityId}/project`, { replace: true });
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
      projectStartDate={projectStartDate}
      projectEndDate={projectEndDate}
    />
  );
};

export default CreateColumnFlow;