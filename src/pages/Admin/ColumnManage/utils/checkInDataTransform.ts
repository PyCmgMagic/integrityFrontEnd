import type { PendingPunchItem } from '../../../../types/api';
import { formatInBeijing } from '../../../../utils/beijingTime';

// 审核状态：未审核、已通过、已拒绝
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

// 类型定义
export interface CheckInItem {
  id: number;
  date: string;
  title: string;
  text: string;
  images: string[];
  starred?: boolean;// 兼容旧API
  stared?: boolean;
  username: string;
  time: string;
  punchId: number;
  userId: number;
  /** 审核状态：pending=未审核，approved=已通过，rejected=已拒绝 */
  status?: ReviewStatus;
}

// 新API返回的打卡详情数据类型
export interface PunchDetailResponse {
  code: number;
  msg: string;
  data: {
    imgs: string[];
    punch: {
      ID: number;
      created_at: string;
      updated_at: string;
      deleted_at: null;
      column_id: number;
      user_id: number | string;
      content: string;
      status: number;
    };
    stared: boolean;
  };
  timestamp?: number;
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
    date:
      formatInBeijing(item.punch.created_at, { year: 'numeric', month: '2-digit', day: '2-digit' }) ||
      item.punch.created_at,
    time:
      formatInBeijing(item.punch.created_at, { hour: '2-digit', minute: '2-digit' }) ||
      item.punch.created_at,
    title: '打卡记录',
    text: item.punch.content,
    images: item.imgs.map(img => {
      // 清理图片URL：移除空格、反引号等特殊字符
      return img.trim().replace(/[`'"\s]/g, '');
    }).filter(img => img.length > 0), // 过滤掉空字符串
    starred: item.stared,
    username: item.nick_name,
    status: 'pending' as ReviewStatus
  }));
};

/** 根据后端 punch.status 数字转换为审核状态：0=未审核，1=已通过，2=已拒绝 */
const parseReviewStatus = (n: number | undefined): ReviewStatus => {
  if (n === 1) return 'approved';
  if (n === 2) return 'rejected';
  return 'pending';
};

/**
 * 将新API返回的打卡详情数据转换为CheckInItem格式
 * @param response - 新API返回的打卡详情响应
 * @param username - 用户名（可选，如果API没有返回用户名）
 * @returns 转换后的打卡项目
 */
export const transformPunchDetail = (response: PunchDetailResponse, username: string = '未知用户'): CheckInItem => {
  const { data } = response;
  return {
    id: 0, // 单个详情页面不需要索引
    punchId: data.punch.ID,
    userId: (Number)(data.punch.user_id),
    date:
      formatInBeijing(data.punch.created_at, { year: 'numeric', month: '2-digit', day: '2-digit' }) ||
      data.punch.created_at,
    time:
      formatInBeijing(data.punch.created_at, { hour: '2-digit', minute: '2-digit' }) ||
      data.punch.created_at,
    title: '打卡记录',
    text: data.punch.content,
    images: data.imgs.map(img => {
      // 清理图片URL：移除空格、反引号等特殊字符
      return img.trim().replace(/[`'"\s]/g, '');
    }).filter(img => img.length > 0), // 过滤掉空字符串
    starred: data.stared, // 使用API返回的收藏状态
    username: username,
    status: parseReviewStatus(data.punch.status)
  };
};
