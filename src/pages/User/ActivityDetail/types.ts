/**
 * ActivityDetail页面相关类型定义
 */

/**
 * 活动数据接口
 */
export interface Activity {
  /** 活动ID */
  id: number;
  /** 活动名称 */
  name: string;
  /** 活动描述 */
  description: string;
  /** 活动开始日期（数字格式：20250103） */
  start_date: number;
  /** 活动结束日期（数字格式：20250810） */
  end_date: number;
}

/**
 * 项目数据接口
 */
export interface Project {
  /** 项目ID */
  id: number;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
}

/**
 * 活动详情API响应接口
 */
export interface ActivityDetailResponse {
  /** 活动信息 */
  activity: Activity;
  /** 项目列表 */
  projects: Project[];
}

/**
 * 用户统计数据接口
 */
export interface UserStats {
  /** 累计得分 */
  totalScore: number;
  /** 最长连签天数 */
  maxStreak: number;
  /** 排名 */
  rank: number;
  /** 今日打卡进度 */
  todayProgress: {
    /** 已完成数量 */
    completed: number;
    /** 总数量 */
    total: number;
  };
}

/**
 * 得分记录接口
 */
export interface ScoreRecord {
  /** 任务描述 */
  task: string;
  /** 得分 */
  score: number;
  /** 日期 */
  date: string;
}

/**
 * 排行榜数据接口
 */
export interface RankingItem {
  /** 排名 */
  rank: number;
  /** 用户名 */
  name: string;
  /** 得分 */
  score: number;
  /** 头像URL */
  avatar: string;
}