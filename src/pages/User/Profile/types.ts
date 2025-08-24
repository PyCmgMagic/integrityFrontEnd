/**
 * Profile页面相关类型定义
 */

import type { ParticipationActivityItem } from '../../../types/api';
import type { CheckInData, UserProfile } from '../../../types/types';

// 重新导出全局类型，方便本地使用
export type { UserProfile, CheckInData, ActivityHistoryData } from '../../../types/types';
export type { ParticipationActivityItem } from '../../../types/api';

/**
 * Profile页面特有的类型定义
 */

// 用户信息卡片组件Props
export interface UserInfoCardProps {
  user: UserProfile;
  onEditClick: () => void;
}

// 打卡记录标签页组件Props
export interface CheckInTabProps {
  checkInData: CheckInData[];
  onDeleteCheckIn: (id: number) => void;
}

// 活动历史标签页组件Props
export interface ActivityHistoryTabProps {
  activityHistoryData: ParticipationActivityItem[];
  activityHistoryLoading: boolean;
  formatDate: (dateString: string) => string;
}

// 编辑个人信息模态框Props
export interface EditProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (updatedData: UserProfile) => Promise<void>;
  currentUser: UserProfile | null;
}

// 滑动操作配置
export interface SwipeActionConfig {
  key: string;
  text: string;
  color: 'danger' | 'primary' | 'warning';
  onClick: () => void;
}

// 渐变卡片样式类型
export type GradientCardType = 'gradient-card-purple' | 'gradient-card-yellow' | 'gradient-card-blue' | 'gradient-card-pink';

// 标签页类型
export type TabType = '1' | '2'; // '1' 为打卡记录，'2' 为活动历史