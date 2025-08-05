import React, { useState } from 'react';
import { ChevronLeft, Plus, Calendar } from 'lucide-react';

interface CreateProjectProps {
  onBack?: () => void;
  onNext?: (projectData: ProjectData) => void;
  onAddCover?: () => void;
}

interface ProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
}

const CreateNewProject: React.FC<CreateProjectProps> = ({
  onBack,
  onNext,
  onAddCover
}) => {
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: undefined
  });

  const handleInputChange = (field: keyof ProjectData, value: string) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (onNext) {
      onNext(projectData);
    }
  };

  const isFormValid = projectData.name.trim() !== '' && 
                     projectData.description.trim() !== '' &&
                     projectData.startDate !== '' &&
                     projectData.endDate !== '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-medium text-gray-900">
          项目新建
        </h1>
        <div className="w-8"></div> {/* 占位元素保持标题居中 */}
      </div>

      {/* Form Content */}
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
            placeholder="新项目"
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
            placeholder="请输入"
            rows={4}
            className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
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

        {/* 设置活动封面 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            设置活动封面
          </label>
          <button
            onClick={onAddCover}
            className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Plus size={24} className="text-blue-500" />
            </div>
            <span className="text-sm">添加封面</span>
          </button>
        </div>

        {/* 档目统计 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">下设</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-medium text-blue-500">2</span>
              <span className="text-sm text-gray-600">个档目</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            isFormValid
              ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default CreateNewProject;
