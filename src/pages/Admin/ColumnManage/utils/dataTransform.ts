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
    ID: number,
    name: string,
    description: string,
    avatar: string,
    daily_punch_limit: number,
    point_earned: number,
    end_time: string,
    start_time: string,
    start_date: number,
    today_punch_count: number,
    owner_id: string,
    project_id: number,
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
 * @param starredStatus - 可选的收藏状态，如果提供则使用该状态，否则默认为false
 * @returns 转换后的打卡项
 */
export const transformPendingData = (item: PendingPunchItem, starredStatus?: boolean): CheckInItem => {
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
    starred: starredStatus ?? false, // 使用传入的收藏状态，如果未提供则默认为false
    status: 'pending'
  };
};

/**
 * 批量转换待审核数据并应用收藏状态
 * @param items - 后端返回的待审核打卡项列表
 * @param starStatusMap - 收藏状态映射表，key为punchId，value为是否收藏
 * @returns 转换后的打卡项列表
 */
export const transformPendingDataWithStarStatus = (
  items: PendingPunchItem[], 
  starStatusMap: Map<number, boolean>
): CheckInItem[] => {
  return items.map(item => 
    transformPendingData(item, starStatusMap.get(item.punch.ID))
  );
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