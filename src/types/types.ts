import { Dayjs } from 'dayjs';

// 用户信息的核心数据结构
export interface UserProfile {
  name: string;
  avatar: string;
  bio?: string; // bio 是一个可选字段
  studentId?: string;
  grade?: string;
  college?: string;
  major?: string;
  dob?: string | null; // 以 'YYYY-MM-DD' 格式的字符串存储
  gender?: '男' | '女'; // 性别只能是 '男' 或 '女'
}

// 用于 Ant Design 表单的数据结构，日期字段使用 Dayjs 类型
export interface UserProfileForm extends Omit<UserProfile, 'dob'> {
    dob?: Dayjs | null;
}

// 打卡记录的类型
export interface CheckInData {
  id: number;
  title: string;
  time: string;
  date: string;
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