import { Dayjs } from 'dayjs';

// 用户信息的核心数据结构
export interface UserProfile {
  name: string;
  nick_name?: string;
  avatar: string;
  bio?: string; 
  studentId?: string;
  grade?: string;
  college?: string;
  major?: string;
  dob?: string | null;
  gender?: '男' | '女'; 
}

// 用于 Ant Design 表单的数据结构，日期字段使用 Dayjs 类型
export interface UserProfileForm extends Omit<UserProfile, 'dob'> {
    dob?: Dayjs | null;
}

// 打卡记录的类型（前端组件使用）
export interface CheckInData {
  id: number;
  title: string;
  time: string;
  date: string;
}

// API 返回的打卡记录详细数据结构
export interface PunchItem {
  punch: {
    ID: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    column_id: number;
    user_id: string;
    content: string;
    status: number;
  };
  imgs: string[];
  column_name: string;
  project_name: string;
  activity_name: string;
}

// 用户打卡记录 API 响应结构
export interface MyPunchListResponse {
  code: number;
  msg: string;
  data: PunchItem[];
  timestamp: number;
}

// 后端返回的打卡记录原始数据结构
export interface PunchRecord {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  column_id: number;
  user_id: string;
  content: string;
  status: number;
  img_url: string;
}

// 后端API响应的完整数据结构
export interface PunchRecordsResponse {
  code: number;
  msg: string;
  data: {
    my_count: number;
    records: PunchRecord[];
    user_count: number;
  };
  timestamp: number;
}

// request工具返回的数据部分（已提取data字段）
export interface PunchRecordsData {
  my_count: number;
  punched_today: boolean;
  records: PunchRecord[];
  user_count: number;
}

// 活动历史的类型
export interface ActivityHistoryData {
    id: number;
    type: 'join' | 'post';
    title: string;
    date: string;
}

// 活动数据类型
export interface ActivityData {
  id?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  coverImage?: string;
  rules?: string;
}