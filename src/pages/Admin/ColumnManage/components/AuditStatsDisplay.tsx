import React from 'react';
import type { AuditStats } from '../utils/dataTransform';

/**
 * 审核统计显示组件的属性接口
 */
interface AuditStatsDisplayProps {
  /** 审核统计数据 */
  stats: AuditStats;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 审核统计显示组件
 * 负责显示今日审核进度和统计信息
 * @param props - 组件属性
 * @returns 审核统计显示组件
 */
export const AuditStatsDisplay: React.FC<AuditStatsDisplayProps> = ({
  stats,
  className = ''
}) => {
  /**
   * 计算审核完成百分比
   * @returns 完成百分比（0-100）
   */
  const getCompletionPercentage = (): number => {
    if (stats.total === 0) return 0;
    return Math.round((stats.reviewed / stats.total) * 100);
  };

  /**
   * 获取进度条颜色
   * @returns 进度条颜色类名
   */
  const getProgressColor = (): string => {
    const percentage = getCompletionPercentage();
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className={`text-center my-4 ${className}`}>
      {/* 基础统计信息 */}
      <div className="text-gray-600 mb-2">
        <span className="text-sm">
          今日已审核：
          <span className="font-semibold text-blue-600">{stats.reviewed}</span>
          {' / '}
          <span className="font-semibold">{stats.total}</span>
        </span>
      </div>

      {/* 进度条 */}
      {stats.total > 0 && (
        <div className="w-full max-w-xs mx-auto">
          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            完成度：{getCompletionPercentage()}%
          </div>
        </div>
      )}

      {/* 完成状态提示 */}
      {stats.total > 0 && stats.reviewed === stats.total && (
        <div className="mt-2 text-green-600 text-sm font-medium">
          🎉 今日审核任务已全部完成！
        </div>
      )}

      {/* 无数据提示 */}
      {stats.total === 0 && (
        <div className="text-gray-400 text-sm">
          暂无打卡记录需要审核
        </div>
      )}
    </div>
  );
};