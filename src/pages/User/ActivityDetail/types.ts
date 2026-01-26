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
  /** 项目图标名称 */
  avatar: string;
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
  rank: number,
  today_punched_user_count: number,
  total_score: number,
  activity_id: number,
  current: number,
  max: number,
  total: number
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
 * 排行榜数据项接口
 */
export interface RankingItem {
  rank: number;
  score: number;
  user: {
    user_id: number;
    student_id: string;
    role_id: number;
    nick_name: string;
    avatar: string;
    college: string;
    major: string;
    grade: string;
  };
}

/**
 * 排行榜API响应接口
 */
export interface RankingListResponse {
  code: number;
  msg: string;
  data: {
    count: number;
    rank_list: RankingItem[];
    total: number;
  };
  timestamp: number;
}
