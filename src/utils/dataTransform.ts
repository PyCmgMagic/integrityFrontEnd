/**
 * 数据转换工具函数
 * 将后端API响应数据转换为前端使用的数据格式
 */

import type { ActivityItem } from '../types/api';
import type { Activity } from '../store/useAppStore';
import type { PunchRecord, CheckInData } from '../types/types';
import dayjs from 'dayjs';

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
 * 格式化日期范围显示
 * @param startDate 开始日期数字，格式如 20250607
 * @param endDate 结束日期数字，格式如 20250720
 * @returns 格式化的日期范围字符串，如 "6.7 - 7.20"
 */
export function formatDateRange(startDate: number, endDate: number): string {
  const startStr = startDate.toString();
  const endStr = endDate.toString();
  
  const startMonth = parseInt(startStr.substring(4, 6));
  const startDay = parseInt(startStr.substring(6, 8));
  const endMonth = parseInt(endStr.substring(4, 6));
  const endDay = parseInt(endStr.substring(6, 8));
  
  return `${startMonth}.${startDay} - ${endMonth}.${endDay}`;
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
  dailyPointLimit?: number;
  completionBonus?: number;
}) {
  const request: any = {
    name: activity.name,
    description: activity.description,
    avatar: activity.cover,
    start_date: formatDateToNumber(activity.startTime),
    end_date: formatDateToNumber(activity.endTime),
  };
  
  if (activity.dailyPointLimit !== undefined) {
    request.daily_point_limit = activity.dailyPointLimit;
  }
  if (activity.completionBonus !== undefined) {
    request.completion_bonus = activity.completionBonus;
  }
  
  return request;
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
  dailyPointLimit?: number;
  completionBonus?: number;
}) {
  const request: any = {};
  
  if (activity.name !== undefined) request.name = activity.name;
  if (activity.description !== undefined) request.description = activity.description;
  if (activity.cover !== undefined) request.avatar = activity.cover;
  if (activity.startTime !== undefined) request.start_date = formatDateToNumber(activity.startTime);
  if (activity.endTime !== undefined) request.end_date = formatDateToNumber(activity.endTime);
  if (activity.dailyPointLimit !== undefined) request.daily_point_limit = activity.dailyPointLimit;
  if (activity.completionBonus !== undefined) request.completion_bonus = activity.completionBonus;
  
  return request;
}

/**
 * 将后端打卡记录转换为前端组件所需格式
 * @param punchRecord 后端返回的打卡记录
 * @returns 前端组件使用的打卡记录格式
 */
export function transformPunchRecordToCheckInData(punchRecord: PunchRecord): CheckInData {
  const updatedAt  = dayjs(punchRecord.updated_at);
  return {
    id: punchRecord.ID,
    title: punchRecord.content || '打卡记录',
    time: updatedAt.format('HH:mm'),
    date: updatedAt.format('YYYY-MM-DD'),
    content: punchRecord.content || '',
    imgs: punchRecord.imgs || [],
    status:punchRecord.status,
    gradient: '',
  };
}

/**
 * 将打卡记录数组转换为前端CheckInData数组
 * @param punchRecords 打卡记录数组，可能为null
 * @returns CheckInData数组
 */
export function transformPunchRecordsToCheckInData(punchRecords: PunchRecord[] | null): CheckInData[] {
  // 处理null或undefined的情况，返回空数组
  if (!punchRecords || !Array.isArray(punchRecords)) {
    return [];
  }
  return punchRecords.map(transformPunchRecordToCheckInData);
}
