import type { PendingPunchItem } from '../../../../types/api';

// 类型定义
export interface CheckInItem {
  id: number;
  date: string;
  title: string;
  text: string;
  images: string[];
  starred: boolean;
  username: string;
  time: string;
  punchId: number;
  userId: string;
}

/**
 * 将后端数据转换为前端所需格式
 * @param data - 后端返回的待审核打卡数据
 * @returns 转换后的打卡项目数组
 */
export const transformPendingData = (data: PendingPunchItem[]): CheckInItem[] => {
  return data.map((item, idx) => ({
    id: idx,
    punchId: item.punch.ID,
    userId: item.punch.user_id,
    date: new Date(item.punch.created_at).toLocaleDateString('zh-CN'),
    time: new Date(item.punch.created_at).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    title: '打卡记录',
    text: item.punch.content,
    images: item.imgs.map(img => {
      // 清理图片URL：移除空格、反引号等特殊字符
      return img.trim().replace(/[`'"\s]/g, '');
    }).filter(img => img.length > 0), // 过滤掉空字符串
    starred: false,
    username: item.nick_name
  }));
};