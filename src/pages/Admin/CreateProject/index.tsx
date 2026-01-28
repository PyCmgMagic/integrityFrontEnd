import React, { useState } from 'react';
import { ChevronLeft,  } from 'lucide-react';
import {  useNavigate, useParams } from 'react-router-dom';
import { ProjectAPI } from '../../../services/api';
import { message, Select } from 'antd';
import { DEFAULT_PROJECT_ICON_NAME, PROJECT_ICON_OPTIONS } from '../../../utils/projectIcons';
import { FIELD_LIMITS } from '../../../utils/fieldLimits';


interface CreateProjectProps {
  onBack?: () => void;
  // onNext 不再需要，因为导航逻辑在此组件中处理
}

interface ProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  avatar: string;
  completionBonus?: number;
  categoryCount: number;
}

const CreateNewProject: React.FC<CreateProjectProps> = () => {
  const projectIconSelectOptions = PROJECT_ICON_OPTIONS.map((option) => ({
    value: option.name,
    label: (
      <span className="flex items-center gap-2">
        <option.Icon />
        {option.label}
      </span>
    ),
  }));
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    avatar: DEFAULT_PROJECT_ICON_NAME,
    completionBonus: undefined,
    categoryCount: 2
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // 从URL中获取 activityId
  const { activityId } = useParams();

  const handleInputChange = (field: keyof ProjectData, value: string | number) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 将日期字符串转换为数字格式 (YYYYMMDD)
   * @param dateString 日期字符串 (YYYY-MM-DD)
   * @returns 数字格式的日期
   */
  const formatDateToNumber = (dateString: string): number => {
    return parseInt(dateString.replace(/-/g, ''));
  };

  /**
   * 处理项目创建和导航到下一步
   */
  const handleNext = async () => {
    if (!activityId) {
      message.error('活动ID不存在');
      return;
    }

    if (projectData.name.length > FIELD_LIMITS.name) {
      message.error(`项目名称不能超过 ${FIELD_LIMITS.name} 个字符`);
      return;
    }
    if (projectData.description.length > FIELD_LIMITS.description) {
      message.error(`项目描述不能超过 ${FIELD_LIMITS.description} 个字符`);
      return;
    }

    setLoading(true);
    try {
      // 准备API请求数据
      const createData = {
        name: projectData.name,
        description: projectData.description,
        activity_id: parseInt(activityId),
        start_date: formatDateToNumber(projectData.startDate),
        end_date: formatDateToNumber(projectData.endDate),
        avatar: projectData.avatar,
        completion_bonus: projectData.completionBonus
      };

      console.log('创建项目请求数据:', createData);

      // 调用API创建项目
      const response = await ProjectAPI.CreateNewProject(createData);
      const projectId = response.project_id;

      console.log('项目创建成功，项目ID:', projectId);
      console.log('将要创建的栏目总数:', projectData.categoryCount);

      message.success('项目创建成功！');

      // 导航到第一个栏目的创建页面
      // 使用replace避免在浏览器历史中堆积创建页面
      navigate(
        `/admin/create/activity/${activityId}/project/${projectId}/column/1`,
        {
          state: { 
            totalCategories: projectData.categoryCount,
            projectStartDate: projectData.startDate,
            projectEndDate: projectData.endDate
          },
          replace: true
        }
      );
    } catch (error) {
      console.error('创建项目失败:', error);
      message.error('创建项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = projectData.name.trim() !== '' && 
                     projectData.description.trim() !== '' &&
                     projectData.name.length <= FIELD_LIMITS.name &&
                     projectData.description.length <= FIELD_LIMITS.description &&
                     projectData.startDate !== '' &&
                     projectData.endDate !== '' &&
                     projectData.categoryCount > 0;
    return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-medium text-gray-900">
          项目新建
        </h1>
        <div className="w-8"></div>  
      </div>
 
      {/* Form Content */}
      <div className='mb-10'>
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* 项目名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            项目名称
          </label>
          <input
            type="text"
            value={projectData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="新项目(不超过75字)"
            maxLength={FIELD_LIMITS.name}
            className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* 项目详情说明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            项目详情说明
          </label>
          <textarea
            value={projectData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="请输入（不超过200字）"
            rows={4}
            maxLength={FIELD_LIMITS.description}
            className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
          />
        </div>

        {/* 项目图标 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            项目图标
          </label>
          <Select
            value={projectData.avatar}
            onChange={(value) => handleInputChange('avatar', value)}
            options={projectIconSelectOptions}
            optionLabelProp="label"
            className="w-full"
          />
        </div>

        {/* 完成全部栏目奖励积分 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            完成全部栏目奖励积分
          </label>
          <input
            type="number"
            min="0"
            value={projectData.completionBonus ?? 0}
            onChange={(e) => handleInputChange('completionBonus', parseInt(e.target.value, 10) || 0)}
            placeholder="请输入完成全部栏目奖励积分，0代表不设置奖励"
            className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* 活动时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            活动时间
          </label>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="date"
                value={projectData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="text-gray-400 text-lg">—</div>
            <div className="flex-1 relative">
              <input
                type="date"
                value={projectData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 栏目数量设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            栏目数量
          </label>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">下设</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={projectData.categoryCount}
                  onChange={(e) => handleInputChange('categoryCount', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center text-lg font-medium text-blue-500 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                <span className="text-sm text-gray-600">个栏目</span>
              </div>
            </div>
          </div>
        </div> 
      </div>

      {/* Bottom Button */}
      <div className="p-4 pb-10   border-gray-200">
        <button
            onClick={handleNext}
            disabled={!isFormValid || loading}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              isFormValid && !loading
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? '创建中...' : '下一步'}
          </button>
      </div>
      </div>
    </div>
  ); 
}; 

export default CreateNewProject;
