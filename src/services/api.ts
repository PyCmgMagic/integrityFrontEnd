/**
 * API 服务类
 * 封装所有的 API 接口调用
 */

import request from '../utils/request';
import type {
  LoginRequest,
  LoginResponse,
  UpdateUserRequest,
  PaginatedResponse,
  UploadFile,
  ActivityListParams,
  ActivityListResponse,
  ActivityDetailResponse,
  CreateActivityRequest,
  CreateActivityResponse,
  UpdateActivityRequest,
  ProjectDetail,
} from '../types/api';
import type { UserProfile, ActivityData, CheckInData } from '../types/types';
import CreateNewProject from '../pages/Admin/CreateProject';
import { data } from 'react-router-dom';

/**
 * 认证相关 API
 */
export class AuthAPI {
  /**
   * 用户登录
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    return request.post<LoginResponse>('/user/login', data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 用户注册
   */
  static async register(data: {
    username: string;
    password: string;
    email?: string;
    name: string;
  }): Promise<LoginResponse> {
    return request.post<LoginResponse>('/auth/register', data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 刷新 token
   */
  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return request.post<{ token: string }>('/auth/refresh', {
      refreshToken,
    });
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    return request.post<void>('/auth/logout');
  }

  /**
   * 获取验证码
   */
  static async getCaptcha(): Promise<{ captcha: string; key: string }> {
    return request.get<{ captcha: string; key: string }>('/auth/captcha');
  }
}

/**
 * 用户相关 API
 */
export class UserAPI {
  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<UserProfile> {
    return request.get<UserProfile>('/user/profile');
  }

  /**
   * 更新用户信息
   */
  static async updateProfile(data: UpdateUserRequest): Promise<UserProfile> {
    return request.put<UserProfile>('/user/profile', data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string }> {
    return request.upload<{ url: string }>('/user/avatar', file, onProgress, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 修改密码
   */
  static async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> {
    return request.put<void>('/user/password', data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 获取用户列表（管理员）
   */
  static async getUserList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    role?: string;
  }): Promise<PaginatedResponse<UserProfile>> {
    return request.get<PaginatedResponse<UserProfile>>('/admin/users', params);
  }
}

/**
 * 活动相关 API
 */
export class ActivityAPI {
  /**
   * 获取活动列表
   */
  static async getActivityList(params?: ActivityListParams): Promise<ActivityListResponse> {
    return request.get<ActivityListResponse>('/activity/list', params);
  }

  /**
   * 获取活动详情
   */
  static async getActivityDetail(id: number): Promise<ActivityDetailResponse> {
    return request.get<ActivityDetailResponse>(`/activity/get/${id}`);
  }

  /**
   * 创建活动
   */
  static async createActivity(data: CreateActivityRequest): Promise<CreateActivityResponse> {
    return request.post<CreateActivityResponse>('/activity/create', data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 更新活动
   */
  static async updateActivity(
    id: number,
    data: UpdateActivityRequest
  ): Promise<void> {
    return request.put<void>(`/activity/update/${id}`, data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 删除活动
   */
  static async deleteActivity(id: number): Promise<void> {
    return request.delete<void>(`/activity/delete/${id}`, undefined, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 加入活动
   */
  static async joinActivity(id: number): Promise<void> {
    return request.post<void>(`/activity/join/${id}`, undefined, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 还原删除的活动
   */
  static async restoreActivity(id: number): Promise<void> {
    return request.put<void>(`/activity/restore/${id}`, undefined, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 退出活动
   */
  static async leaveActivity(id: number): Promise<void> {
    return request.post<void>(`/activities/${id}/leave`, undefined, {
      showLoading: true,
      showError: true,
    });
  }
}

/**
 * 项目相关 API
 */
export class ProjectAPI {
  /**
   * 获取项目详情
   * @param id 项目ID
   * @returns 项目详情数据
   */
  static async getProjectDetail(id: number): Promise<ProjectDetail> {
    return request.get<ProjectDetail>(`/project/get/${id}`, undefined, {
      showLoading: false,
      showError: false,
      retries: 1, // 添加重试机制
    });
  }

  /**
   * 更新项目信息（管理员）
   * @param id 项目ID
   * @param data 项目更新数据
   * @returns 更新结果
   */
  static async updateProject(
    id: number,
    data: {
      name: string;
      description: string;
      activity_id: number;
      start_date: number;
      end_date: number;
      avatar: string;
    }
  ): Promise<void> {
    return request.put<void>(`/project/update/${id}`, data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 删除项目（管理员）
   * @param id 项目ID
   * @returns 删除结果
   */
  static async deleteProject(id: number): Promise<void> {
    return request.delete<void>(`/project/delete/${id}`, undefined, {
      showLoading: true,
      showError: true,
    });
  }
  /** 
   * 新增项目（管理员）
   * @param data 项目创建数据
   * @returns 创建结果
   */
  static async CreateNewProject(data: {
    name: string;
    description: string;
    activity_id: number;
    start_date: number;
    end_date: number;
    avatar: string;
  }): Promise<void> {
    return request.post<void>('/project/create', data, {
      showLoading: true,
      showError: true,
    });
  };
}
/**
 * 打卡相关 API
 */
export class CheckInAPI {
  /**
   * 获取打卡记录
   */
  static async getCheckInList(params?: {
    page?: number;
    pageSize?: number;
    activityId?: number;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<CheckInData>> {
    return request.get<PaginatedResponse<CheckInData>>('/checkins', params);
  }

  /**
   * 创建打卡记录
   */
  static async createCheckIn(data: {
    activityId: number;
    title: string;
    content?: string;
    images?: string[];
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  }): Promise<CheckInData> {
    return request.post<CheckInData>('/checkins', data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 获取打卡详情
   */
  static async getCheckInDetail(id: number): Promise<CheckInData> {
    return request.get<CheckInData>(`/checkins/${id}`);
  }

  /**
   * 更新打卡记录
   */
  static async updateCheckIn(
    id: number,
    data: Partial<CheckInData>
  ): Promise<CheckInData> {
    return request.put<CheckInData>(`/checkins/${id}`, data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 删除打卡记录
   */
  static async deleteCheckIn(id: number): Promise<void> {
    return request.delete<void>(`/checkins/${id}`, undefined, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 审核打卡记录（管理员）
   */
  static async reviewCheckIn(
    id: number,
    data: {
      status: 'approved' | 'rejected';
      comment?: string;
    }
  ): Promise<void> {
    return request.post<void>(`/admin/checkins/${id}/review`, data, {
      showLoading: true,
      showError: true,
    });
  }
}

/**
 * 文件上传相关 API
 */
export class FileAPI {
  /**
   * 上传单个文件
   */
  static async uploadFile(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string; filename: string }> {
    return request.upload<{ url: string; filename: string }>(
      '/files/upload',
      file,
      onProgress,
      {
        showLoading: true,
        showError: true,
      }
    );
  }

  /**
   * 批量上传文件
   */
  static async uploadFiles(
    files: UploadFile[]
  ): Promise<{ url: string; filename: string }[]> {
    const uploadPromises = files.map((fileItem) =>
      this.uploadFile(fileItem.file, fileItem.onProgress)
    );
    return Promise.all(uploadPromises);
  }

  /**
   * 删除文件
   */
  static async deleteFile(url: string): Promise<void> {
    return request.delete<void>('/files', { url }, {
      showError: true,
    });
  }
}

/**
 * 统计相关 API
 */
export class StatisticsAPI {
  /**
   * 获取用户统计数据
   */
  static async getUserStats(userId?: string): Promise<{
    totalCheckIns: number;
    totalActivities: number;
    totalPoints: number;
    weeklyCheckIns: number[];
    monthlyCheckIns: number[];
  }> {
    return request.get<any>('/statistics/user', { userId });
  }

  /**
   * 获取活动统计数据
   */
  static async getActivityStats(activityId: number): Promise<{
    totalParticipants: number;
    totalCheckIns: number;
    dailyCheckIns: { date: string; count: number }[];
    topUsers: { userId: string; userName: string; checkInCount: number }[];
  }> {
    return request.get<any>(`/statistics/activity/${activityId}`);
  }

  /**
   * 获取系统统计数据（管理员）
   */
  static async getSystemStats(): Promise<{
    totalUsers: number;
    totalActivities: number;
    totalCheckIns: number;
    activeUsers: number;
    recentActivities: ActivityData[];
  }> {
    return request.get<any>('/admin/statistics');
  }
}

/**
 * 导出所有 API 类
 */
export const API = {
  Auth: AuthAPI,
  User: UserAPI,
  Activity: ActivityAPI,
  Project: ProjectAPI,
  CheckIn: CheckInAPI,
  File: FileAPI,
  Statistics: StatisticsAPI,
};

export default API;