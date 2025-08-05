import React, { useState, useRef } from 'react';
import { ChevronLeft, Plus, Calendar, X } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';


interface CreateProjectProps {
  onBack?: () => void;
  // onNext 不再需要，因为导航逻辑在此组件中处理
}

interface ProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  categoryCount: number;
}

const CreateNewProject: React.FC<CreateProjectProps> = ({ onBack }) => {
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: undefined,
    categoryCount: 2
  });
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 从URL中获取 activityId
  const { activityId } = useParams();

  const handleInputChange = (field: keyof ProjectData, value: string | number) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCoverUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProjectData(prev => ({ ...prev, coverImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    setProjectData(prev => ({ ...prev, coverImage: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    // 1. 在这里调用API，根据 projectData 创建新项目，并获取返回的 projectId
    // const newProject = await api.createProject(projectData);
    // const projectId = newProject.id;
    
    // 为了演示，我们使用一个固定的 projectId
    const projectId = '123';
    console.log('新建的项目ID:', projectId);
    console.log('将要创建的栏目总数:', projectData.categoryCount);

    // 2. 导航到第一个栏目的创建页面
    // 我们将总栏目数通过 navigation state 传递给下一个页面
    navigate(
      `/admin/create/activity/${activityId}/project/${projectId}/column/1`,
      {
        state: { totalCategories: projectData.categoryCount }
      }
    );
  };

  const isFormValid = projectData.name.trim() !== '' && 
                     projectData.description.trim() !== '' &&
                     projectData.startDate !== '' &&
                     projectData.endDate !== '' &&
                     projectData.categoryCount > 0;
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
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {projectData.coverImage ? (
            <div className="relative w-full h-32 bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden">
              <img
                src={projectData.coverImage}
                alt="项目封面"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemoveCover}
                className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleCoverUpload}
              className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Plus size={24} className="text-blue-500" />
              </div>
              <span className="text-sm">添加封面</span>
            </button>
          )}
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
    </div>
  ); 
}; 

export default CreateNewProject;