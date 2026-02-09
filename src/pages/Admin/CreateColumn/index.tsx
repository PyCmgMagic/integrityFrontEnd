import React, { useState, useEffect } from 'react';
import {  Calendar, Clock } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { FIELD_LIMITS } from '../../../utils/fieldLimits';

export interface CreateColumnProps {
  onBack?: () => void;
  onNext?: (columnData: ColumnData) => void;
  columnIndex?: number;
  totalColumns?: number;
  loading?: boolean;
  projectStartDate?: string;
  projectEndDate?: string;
}

export interface ColumnData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  start_time: string;
  end_time: string;
  coverImage?: string;
  dailyCheckinLimit: number;
  pointsPerCheckin: number;
  minWordLimit: number;
  maxWordLimit: number;
  optional: boolean;
}

type ColumnFormData = Omit<
  ColumnData,
  'dailyCheckinLimit' | 'pointsPerCheckin' | 'minWordLimit' | 'maxWordLimit'
> & {
  // Keep numeric inputs as strings so users can clear/edit without being forced to 0.
  dailyCheckinLimit: string;
  pointsPerCheckin: string;
  minWordLimit: string;
  maxWordLimit: string;
};

const CreateColumn: React.FC<CreateColumnProps> = ({
  onBack,
  onNext,
  columnIndex = 1,
  loading = false,
  projectStartDate,
  projectEndDate
}) => {
  const { getColumnData } = useAppStore();
  const params = useParams();
  
  // 从URL参数中获取当前步骤
  const currentStep = params.columnIndex ? parseInt(params.columnIndex, 10) : columnIndex;
  
  const [columnData, setColumnData] = useState<ColumnFormData>({
    name: '',
    description: '',
    startDate: projectStartDate || '',
    endDate: projectEndDate || '',
    start_time: '00:00',
    end_time: '23:59',
    dailyCheckinLimit: '1',
    pointsPerCheckin: '1',
    minWordLimit: '0',
    maxWordLimit: '500',
    optional: false
  });

  // 组件挂载时恢复之前保存的数据
  useEffect(() => {
    const savedData = getColumnData(currentStep);
    if (savedData) {
      setColumnData({
        ...savedData,
        dailyCheckinLimit: String(savedData.dailyCheckinLimit ?? ''),
        pointsPerCheckin: String(savedData.pointsPerCheckin ?? ''),
        minWordLimit: String(savedData.minWordLimit ?? 0),
        maxWordLimit: String(savedData.maxWordLimit ?? 500),
      });
    }
  }, [currentStep, getColumnData]);

  /**
   * 处理输入字段变化
   * @param field - 字段名
   * @param value - 字段值
   */
  const handleInputChange = <K extends keyof ColumnFormData>(
    field: K,
    value: ColumnFormData[K]
  ) => {
    setColumnData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    const dailyCheckinLimitNum = parseInt(columnData.dailyCheckinLimit, 10);
    if (
      !Number.isFinite(dailyCheckinLimitNum) ||
      dailyCheckinLimitNum < 0 ||
      dailyCheckinLimitNum > 10
    ) {
      message.error('限制每日打卡次数必须是 0-10 的整数');
      return;
    }

    const pointsPerCheckinNum = parseInt(columnData.pointsPerCheckin, 10);
    if (!Number.isFinite(pointsPerCheckinNum) || pointsPerCheckinNum < 0) {
      message.error('每日打卡获得积分必须是非负整数');
      return;
    }

    const minWordLimitNum = parseInt(columnData.minWordLimit, 10);
    if (!Number.isFinite(minWordLimitNum) || minWordLimitNum < 0) {
      message.error('打卡内容最小字数必须是非负整数');
      return;
    }

    const maxWordLimitNum = parseInt(columnData.maxWordLimit, 10);
    if (!Number.isFinite(maxWordLimitNum) || maxWordLimitNum < 0) {
      message.error('打卡内容最大字数必须是非负整数');
      return;
    }

    if (maxWordLimitNum < minWordLimitNum) {
      message.error('打卡内容最大字数不能小于最小字数');
      return;
    }

    if (columnData.name.length > FIELD_LIMITS.name) {
      message.error(`栏目名称不能超过 ${FIELD_LIMITS.name} 个字符`);
      return;
    }
    if (columnData.description.length > FIELD_LIMITS.description) {
      message.error(`栏目描述不能超过 ${FIELD_LIMITS.description} 个字符`);
      return;
    }

    // 验证日期范围是否在项目范围内
    if (projectStartDate && columnData.startDate < projectStartDate) {
      message.error(`栏目开始日期不能早于项目开始日期 (${projectStartDate})`);
      return;
    }
    if (projectEndDate && columnData.endDate > projectEndDate) {
      message.error(`栏目结束日期不能晚于项目结束日期 (${projectEndDate})`);
      return;
    }
    if (columnData.endDate < columnData.startDate) {
      message.error('栏目结束日期不能早于开始日期');
      return;
    }

    if (onNext) {
      onNext({
        ...columnData,
        dailyCheckinLimit: dailyCheckinLimitNum,
        pointsPerCheckin: pointsPerCheckinNum,
        minWordLimit: minWordLimitNum,
        maxWordLimit: maxWordLimitNum,
      });
    }
  };

  const dailyCheckinLimitForValid = parseInt(columnData.dailyCheckinLimit, 10);
  const pointsPerCheckinForValid = parseInt(columnData.pointsPerCheckin, 10);
  const minWordLimitForValid = parseInt(columnData.minWordLimit, 10);
  const maxWordLimitForValid = parseInt(columnData.maxWordLimit, 10);
  const isFormValid = columnData.name.trim() !== '' && 
                     columnData.description.trim() !== '' &&
                     columnData.name.length <= FIELD_LIMITS.name &&
                     columnData.description.length <= FIELD_LIMITS.description &&
                     columnData.startDate !== '' &&
                     columnData.endDate !== '' &&
                     Number.isFinite(dailyCheckinLimitForValid) &&
                     dailyCheckinLimitForValid >= 0 &&
                     dailyCheckinLimitForValid <= 10 &&
                     Number.isFinite(pointsPerCheckinForValid) &&
                     pointsPerCheckinForValid >= 0 &&
                     Number.isFinite(minWordLimitForValid) &&
                     minWordLimitForValid >= 0 &&
                     Number.isFinite(maxWordLimitForValid) &&
                     maxWordLimitForValid >= minWordLimitForValid;

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
            placeholder="新栏目(不超过75个字)"
            maxLength={FIELD_LIMITS.name}
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
            placeholder="请输入（不超过200字）"
            rows={4}
            maxLength={FIELD_LIMITS.description}
            className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
          />
        </div>

        {/* 是否为特殊栏目 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <label className="flex items-center justify-between text-sm text-gray-700 font-medium">
            是否为特殊栏目
            <input
              type="checkbox"
              checked={columnData.optional}
              onChange={(e) => handleInputChange('optional', e.target.checked)}
              className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
            />
          </label>
        </div>

        {/* 活动时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            活动时间
          </label>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="relative min-w-0">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={columnData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="text-gray-400 text-lg px-1">—</div>
            <div className="relative min-w-0">
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
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="relative min-w-0">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="time"
                value={columnData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="text-gray-400 text-lg px-1">—</div>
            <div className="relative min-w-0">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="time"
                value={columnData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 限制每日打卡 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">限制每日打卡</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="10"
                value={columnData.dailyCheckinLimit}
                onChange={(e) =>
                  handleInputChange('dailyCheckinLimit', e.target.value.replace(/\D/g, ''))
                }
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
                min="0"
                value={columnData.pointsPerCheckin}
                onChange={(e) =>
                  handleInputChange('pointsPerCheckin', e.target.value.replace(/\D/g, ''))
                }
                className="w-16 px-2 py-1 text-center text-lg font-medium text-blue-500 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <span className="text-sm text-gray-600">分</span>
            </div>
          </div>
        </div>

        {/* 打卡内容最小字数 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">打卡内容最小字数</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={columnData.minWordLimit}
                onChange={(e) =>
                  handleInputChange('minWordLimit', e.target.value.replace(/\D/g, ''))
                }
                className="w-20 px-2 py-1 text-center text-lg font-medium text-blue-500 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <span className="text-sm text-gray-600">字</span>
            </div>
          </div>
        </div>

        {/* 打卡内容最大字数 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">打卡内容最大字数</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={columnData.maxWordLimit}
                onChange={(e) =>
                  handleInputChange('maxWordLimit', e.target.value.replace(/\D/g, ''))
                }
                className="w-20 px-2 py-1 text-center text-lg font-medium text-blue-500 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <span className="text-sm text-gray-600">字</span>
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
            disabled={!isFormValid || loading}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
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

export default CreateColumn;
