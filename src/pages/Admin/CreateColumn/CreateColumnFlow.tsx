import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CreateColumn from './index'; // 确保路径正确
import type { ColumnData } from './index'; // 假设你导出了这个类型

const CreateColumnFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activityId, projectId, columnIndex } = useParams<{
    activityId: string;
    projectId: string;
    columnIndex: string;
  }>();

  const currentStep = parseInt(columnIndex || '1', 10);
  
  // 从上一个页面（项目创建页）的 state 中获取总数
  // 如果用户直接访问此URL，state可能为空，需要提供一个备用值或重定向
  const totalSteps = location.state?.totalCategories || 1;

  // 处理“下一步”点击事件
  const handleNext = (columnData: ColumnData) => {
    // 在这里，你可以调用API来保存当前栏目的数据
    console.log(`正在保存第 ${currentStep} 个栏目的数据:`, columnData);
    // await api.createCategory(projectId, categoryData);

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
      // 导航到一个成功页面 
      navigate(`/admin/create/activity/${activityId}/project/${projectId}/success`);
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
    />
  );
};

export default CreateColumnFlow;