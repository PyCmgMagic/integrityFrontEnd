import type { PendingPunchItem } from '../../../../types/api';

/**
 * 打卡项目接口定义
 */
export interface CheckInItem {
  id: number;
  username: string;
  title: string;
  date: string;
  time: string;
  content: string;
  images: string[];
  starred: boolean;
  status: 'approved' | 'rejected' | 'pending';
}

/**
 * 专栏信息接口定义
 */
export interface ColumnInfo {
  name: string;
  activityTime: string;
  checkRequirement: string;
}

/**
 * 审核统计信息接口定义
 */
export interface AuditStats {
  reviewed: number;
  total: number;
}

/**
 * 将后端返回的PendingPunchItem转换为前端CheckInItem格式
 * @param item - 后端返回的待审核打卡项
 * @returns 转换后的打卡项
 */
export const transformPendingData = (item: PendingPunchItem): CheckInItem => {
  const createdAt = new Date(item.punch.created_at);
  const date = createdAt.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  const time = createdAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  
  // 清理图片URL中的空格和反引号
  const cleanImages = (item.imgs || []).map(url => 
    url.trim().replace(/`/g, '')
  );
  
  return {
    id: item.punch.ID,
    username: item.nick_name,
    title: `${item.nick_name}的打卡`,
    date: date,
    time: time,
    content: item.punch.content,
    images: cleanImages,
    starred: false,
    status: 'pending'
  };
};

/**
 * 计算审核统计信息
 * @param reviewedCount - 已审核数量
 * @param unreviewedCount - 未审核数量
 * @returns 审核统计信息
 */
export const calculateAuditStats = (reviewedCount: number, unreviewedCount: number): AuditStats => {
  return {
    reviewed: reviewedCount,
    total: reviewedCount + unreviewedCount
  };
};