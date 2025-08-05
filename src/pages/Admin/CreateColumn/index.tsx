import React, { useState, useRef } from 'react';
import { ChevronLeft, Plus, Calendar, Clock, X } from 'lucide-react';

export interface CreateColumnProps {
  onBack?: () => void;
  onNext?: (columnData: ColumnData) => void;
  columnIndex?: number;
  totalColumns?: number;
}

export interface ColumnData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  checkinStartTime: string;
  checkinEndTime: string;
  coverImage?: string;
  dailyCheckinLimit: number;
  pointsPerCheckin: number;
}

const CreateColumn: React.FC<CreateColumnProps> = ({
  onBack,
  onNext,
  columnIndex = 1,
  totalColumns = 1
}) => {
  const [columnData, setColumnData] = useState<ColumnData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    checkinStartTime: '',
    checkinEndTime: '',
    coverImage: undefined,
    dailyCheckinLimit: 1,
    pointsPerCheckin: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ColumnData, value: string | number) => {
    setColumnData(prev => ({
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
        setColumnData(prev => ({
          ...prev,
          coverImage: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    setColumnData(prev => ({
      ...prev,
      coverImage: undefined
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext(columnData);
    }
  };

  const isFormValid = columnData.name.trim() !== '' && 
                     columnData.description.trim() !== '' &&
                     columnData.startDate !== '' &&
                     columnData.endDate !== '' &&
                     columnData.checkinStartTime !== '' &&
                     columnData.checkinEndTime !== '' &&
                     columnData.dailyCheckinLimit > 0 &&
                     columnData.pointsPerCheckin > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <h1 className="flex-1 text-center text-lg font-medium text-gray-900">
          栏目{columnIndex}创建
        </h1>
        <div className="w-8"></div> {/* 占位元素保持标题居中 */}
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* 栏目名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            栏目名称
          </label>
          <input
            type="text"
            value={columnData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="新栏目1"
            className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* 栏目打卡详情说明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            栏目打卡详情说明
          </label>
          <textarea
            value={columnData.description}
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
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={columnData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="text-gray-400 text-lg">—</div>
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={columnData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 一天内打卡时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            一天内打卡时间
          </label>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="time"
                value={columnData.checkinStartTime}
                onChange={(e) => handleInputChange('checkinStartTime', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="text-gray-400 text-lg">—</div>
            <div className="flex-1 relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="time"
                value={columnData.checkinEndTime}
                onChange={(e) => handleInputChange('checkinEndTime', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 设置活动封面 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            设置活动封面
          </label>
          
          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {columnData.coverImage ? (
            // 显示已上传的封面
            <div className="relative w-full h-32 bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden">
              <img
                src={columnData.coverImage}
                alt="栏目封面"
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
            // 显示上传按钮
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

        {/* 限制每日打卡 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">限制每日打卡</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="10"
                value={columnData.dailyCheckinLimit}
                onChange={(e) => handleInputChange('dailyCheckinLimit', parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-center text-lg font-medium text-blue-500 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <span className="text-sm text-gray-600">次</span>
            </div>
          </div>
        </div>

        {/* 每日打卡获得 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">每日打卡获得</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={columnData.pointsPerCheckin}
                onChange={(e) => handleInputChange('pointsPerCheckin', parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-center text-lg font-medium text-blue-500 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <span className="text-sm text-gray-600">分</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="p-4 mb-15 bg-white border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            上一步
          </button> 
          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
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

export default CreateColumn;
