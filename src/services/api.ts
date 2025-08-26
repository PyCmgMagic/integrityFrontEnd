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
  ParticipationHistoryResponse,
} from '../types/api';
import type { UserProfile, ActivityData, CheckInData, PunchRecordsData, MyPunchListResponse } from '../types/types';
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
  static async updateProfile(data: UpdateUserRequest): Promise<{ code: number; msg: string; timestamp: number }> {
    try {
      await request.put<{ code: number; msg: string; timestamp: number }>('/user/update', data, {
        showLoading: true,
        showError: false, // 关闭自动错误提示，由调用方处理
      });
      return { code: 200, msg: '更新成功', timestamp: Date.now() };
    } catch (error: any) {
      // 处理API错误响应
      if (error && typeof error === 'object') {
        return {
          code: error.code || 500,
          msg: error.message || '更新失败',
          timestamp: Date.now()
        };
      }
      return { code: 500, msg: '网络错误，请重试', timestamp: Date.now() };
    }
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

  /**
   * 获取用户参与活动历史
   */
  static async getParticipationHistory(): Promise<ParticipationHistoryResponse> {
    return request.get<ParticipationHistoryResponse>('/punch/recent-participation', undefined, {
      showLoading: true,
      showError: true,
    });
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
   * @returns 创建结果，包含新创建的项目ID
   */
  static async CreateNewProject(data: {
    name: string;
    description: string;
    activity_id: number;
    start_date: number;
    end_date: number;
    avatar: string;
  }): Promise<{ project_id: number }> {
    return request.post<{ project_id: number }>('/project/create', data, {
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
 * 栏目相关 API
 */
export class ColumnAPI {
  /**
   * 创建栏目
   */
  static async createColumn(data: {
    name: string;
    description: string;
    project_id: number;
    start_date: number;
    end_date: number;
    start_time: string;
    end_time: string;
    avatar: string;
    daily_punch_limit: number; // 每日可打卡次数
    point_earned: number; // 每次打卡获得积分
  }): Promise<{ column_id: number }> {
    return request.post<{ column_id: number }>('/column/create', data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 更新栏目
   */
  static async updateColumn(
    id: number,
    data: {
      name?: string;
      description?: string;
      start_date?: number;
      end_date?: number;
      avatar?: string;
      daily_punch_limit?: number; // 每日可打卡次数
      point_earned?: number; // 每次打卡获得积分
    }
  ): Promise<void> {
    return request.put<void>(`/column/update/${id}`, data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 删除栏目
   */
  static async deleteColumn(id: number): Promise<void> {
    return request.delete<void>(`/column/delete/${id}`, undefined, {
      showLoading: true,
      showError: true,
    });
  }
/**
 * 获取栏目信息
 */
  static async getColumnInfo(id: number): Promise<{
        ID: number;
        CreatedAt: string;
        UpdatedAt: string;
        DeletedAt: null;
        name: string;
        description: string;
        owner_id: string;
        project_id: number;
  }> {
    return request.get<{
        ID: number;
        CreatedAt: string;
        UpdatedAt: string;
        DeletedAt: null;
        name: string;
        description: string;
        owner_id: string;
        project_id: number;
    }>(`/column/get/${id}`, {
      showLoading: true,
      showError: true,
    });
  }
  /**
   * 获取栏目下的打卡记录
   */
  static async getPunchRecords(columnId: number): Promise<PunchRecordsData> {
    return request.get<PunchRecordsData>(`/punch/${columnId}`, {
      showLoading: true,
      showError: true,
    });
  }  /**
   * 获取栏目下的打卡记录
   */
  static async getTodayTotalPunchRecords(columnId: number): Promise<{today_punch_count: number}> {
    return request.get<{today_punch_count: number}>(`/punch/today/${columnId}`, {
      showLoading: true,
      showError: true,
    });
  }
  /**
   * 删除打卡记录
   */
    static async deletePunchRecord(punchId: number): Promise<void> {
    return request.delete<void>(`/punch/delete/${punchId}`, undefined, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 提交打卡记录
   */
  static async insertPunchRecord(data: {
    column_id: number;
    content: string;
    images: string[];
  }): Promise<{
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: null;
    column_id: number;
    user_id: string;
    content: string;
    status: number;
  }> {
    return request.post<{
      ID: number;
      CreatedAt: string;
      UpdatedAt: string;
      DeletedAt: null;
      column_id: number;
      user_id: string;
      content: string;
      status: number;
    }>('/punch/insert', data, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 获取待审核列表
   */
  static async getPendingList(columnId: number): Promise<{
    code: number;
    msg: string;
    data: Array<{
      punch: {
        ID: number;
        created_at: string;
        updated_at: string;
        deleted_at: null;
        column_id: number;
        user_id: string;
        content: string;
        status: number;
      };
      imgs: string[];
      nick_name: string;
    }>;
    timestamp: number;
  }> {
    return request.get<{
      code: number;
      msg: string;
      data: Array<{
        punch: {
          ID: number;
          created_at: string;
          updated_at: string;
          deleted_at: null;
          column_id: number;
          user_id: string;
          content: string;
          status: number;
        };
        imgs: string[];
        nick_name: string;
      }>;
      timestamp: number;
    }>(`/punch/pending-list?column_id=${columnId}`, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 审核打卡记录
   */
  static async reviewPunchRecord(punchId: number, status: number): Promise<{
    code: number;
    msg: string;
    timestamp: number;
  }> {
    return request.post<{
      code: number;
      msg: string;
      timestamp: number;
    }>('/punch/review', {
      punch_id: punchId,
      status: status // 1: 通过, 2: 不通过
    }, {
      showLoading: true,
      showError: false, // 让组件自己处理错误消息
    });
  }

  /**
   * 获取用户的打卡记录列表
   * @returns 用户打卡记录列表
   */
  static async getMyPunchList(): Promise<MyPunchListResponse> {
    return request.get<MyPunchListResponse>('/punch/my-list', {}, {
      showLoading: true,
      showError: true,
    });
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
  Column: ColumnAPI,
  CheckIn: CheckInAPI,
  File: FileAPI,
  Statistics: StatisticsAPI,
};

export default API;