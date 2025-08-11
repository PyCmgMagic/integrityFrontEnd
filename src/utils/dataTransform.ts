/**
 * 数据转换工具函数
 * 将后端API响应数据转换为前端使用的数据格式
 */

import type { ActivityItem } from '../types/api';
import type { Activity } from '../store/useAppStore';

/**
 * 将日期数字转换为字符串格式
 * @param dateNumber 日期数字，格式如 20250607
 * @returns 日期字符串，格式如 "2025-06-07"
 */
export function formatDateFromNumber(dateNumber: number): string {
  const dateStr = dateNumber.toString();
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}

/**
 * 将日期字符串转换为数字格式
 * @param dateString 日期字符串，格式如 "2025-06-07"
 * @returns 日期数字，格式如 20250607
 */
export function formatDateToNumber(dateString: string): number {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`);
}

/**
 * 将后端活动数据转换为前端Activity格式
 * @param apiActivity 后端活动数据
 * @returns 前端Activity格式
 */
export function transformActivityFromAPI(apiActivity: ActivityItem): Activity {
  return {
    id: apiActivity.ID.toString(),
    name: apiActivity.name,
    description: apiActivity.description,
    cover: apiActivity.avatar,
    startTime: formatDateFromNumber(apiActivity.start_date),
    endTime: formatDateFromNumber(apiActivity.end_date),
    projects: [], // 项目数据需要单独获取
    createdAt: apiActivity.CreatedAt,
  };
}

/**
 * 将前端Activity数据转换为后端创建活动请求格式
 * @param activity 前端Activity数据
 * @returns 后端创建活动请求格式
 */
export function transformActivityToCreateRequest(activity: {
  name: string;
  description: string;
  cover: string;
  startTime: string;
  endTime: string;
}) {
  return {
    name: activity.name,
    description: activity.description,
    avatar: activity.cover,
    start_date: formatDateToNumber(activity.startTime),
    end_date: formatDateToNumber(activity.endTime),
  };
}

/**
 * 将前端Activity数据转换为后端更新活动请求格式
 * @param activity 前端Activity数据
 * @returns 后端更新活动请求格式
 */
export function transformActivityToUpdateRequest(activity: {
  name?: string;
  description?: string;
  cover?: string;
  startTime?: string;
  endTime?: string;
}) {
  const request: any = {};
  
  if (activity.name !== undefined) request.name = activity.name;
  if (activity.description !== undefined) request.description = activity.description;
  if (activity.cover !== undefined) request.avatar = activity.cover;
  if (activity.startTime !== undefined) request.start_date = formatDateToNumber(activity.startTime);
  if (activity.endTime !== undefined) request.end_date = formatDateToNumber(activity.endTime);
  
  return request;
}