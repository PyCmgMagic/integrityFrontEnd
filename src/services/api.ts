/**
 * API 服务类
 * 封装所有的 API 接口调用
 */

import request from '../utils/request';
import { formatBeijingDateYmd } from '../utils/beijingTime';
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
  ApiResponse,
  PunchListData,
} from '../types/api';
import type { UserProfile, ActivityData, CheckInData, PunchRecordsData, MyPunchListResponse } from '../types/types';

import type { UserStats } from '../pages/User/ActivityDetail/types';

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
   * 获取活动统计详情
   */
  static async getActivityStaticDetail(id: number): Promise<ApiResponse<UserStats>> {
    return request.getFull<UserStats>(`/stats/activity/${id}/brief`);
  }
/**
   * 获取活动排行榜
   */
  static async getActivityRank(id: number, params: { page?: number; page_size?: number; force?: boolean } = {}): Promise<import('../pages/User/ActivityDetail/types').RankingListResponse> {
    const { page = 1, page_size = 20, force = false } = params;
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safePageSize = Number.isFinite(page_size) ? Math.max(1, Math.floor(page_size)) : 20;
    const response = await request.postFull<{
      count: number;
      rank_list: import('../pages/User/ActivityDetail/types').RankingItem[];
      total: number;
    }>(`/stats/activity/${id}/rank`, {
      page: safePage,
      page_size: safePageSize,
      force
    });
    return {
      ...response,
      data: {
        count: response.data?.count ?? 0,
        rank_list: response.data?.rank_list ?? [],
        total: response.data?.total ?? 0
      },
      timestamp: response.timestamp ?? Date.now()
    };
  }

  /**
   * 导出活动排行榜
   */
  static async exportActivityRanking(id: number, filename?: string): Promise<void> {
    const defaultFilename = filename || `活动排行榜_${id}_${formatBeijingDateYmd(Date.now())}.xlsx`;
    return request.download(`/stats/activity/${id}/rank/export`, defaultFilename, {
      showLoading: true,
      showError: true,
    });
  }
    /**
   * 导出活动数据（admin）
   */
  static async exportActivity(id: number, filename?: string): Promise<void> {
    const defaultFilename = filename || `活动数据_${id}_${formatBeijingDateYmd(Date.now())}.xlsx`;
    return request.download(`/stats/activity/${id}/export`, defaultFilename, {
      showLoading: true,
      showError: true,
    });
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
  static async deleteActivity(id: number): Promise<ApiResponse<void>> {
    return request.deleteFull<void>(`/activity/delete/${id}`, undefined, {
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

  /**
   * 获取我创建的活动列表 - 使用完整GET方法
   */
  static async getMyActivities(): Promise<{
    code: number;
    msg: string;
    data: Array<{
      ID: number;
      created_at: string;
      updated_at: string;
      deleted_at: null;
      name: string;
      description: string;
      owner_id: string;
      start_date: number;
      end_date: number;
      avatar: string;
    }>;
    timestamp?: number;
  }> {
    return request.getFull<Array<{
      ID: number;
      created_at: string;
      updated_at: string;
      deleted_at: null;
      name: string;
      description: string;
      owner_id: string;
      start_date: number;
      end_date: number;
      avatar: string;
    }>>('/activity/mine', undefined, {
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
      completion_bonus?: number;
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
    completion_bonus?: number;
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
    if (files.length === 0) {
      return [];
    }
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
    min_word_limit: number; // 打卡内容最小字数
    max_word_limit: number; // 打卡内容最大字数
    optional?: boolean; // 是否为特殊栏目
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
      min_word_limit?: number; // 打卡内容最小字数
      max_word_limit?: number; // 打卡内容最大字数
      optional?: boolean; // 是否为特殊栏目
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
static async getColumnInfo(id: number): Promise<ApiResponse<{
  id: number;
  name: string;
  description: string;
  avatar: string; // 栏目封面
  daily_punch_limit: number; // 每日可打卡次数
  point_earned: number; // 每次打卡获得积分
  min_word_limit: number; // 打卡内容最小字数
  max_word_limit: number; // 打卡内容最大字数
  optional?: boolean; // 是否为特殊栏目
  end_time: string; // 结束时间
  start_time: string; // 开始时间
  start_date: number; // 开始日期
  end_date: number; // 结束日期
  today_punch_count: number; // 今日打卡次数
  owner_id: string;
  project_id: number;
  punched_today: boolean;
}>> {
  return request.getFull<{
  id: number;
  name: string;
  description: string;
  avatar: string; // 栏目封面
  daily_punch_limit: number; // 每日可打卡次数
  point_earned: number; // 每次打卡获得积分
  min_word_limit: number; // 打卡内容最小字数
  max_word_limit: number; // 打卡内容最大字数
  end_time: string; // 结束时间
  start_time: string; // 开始时间
  start_date: number; // 开始日期
  end_date: number; // 结束日期
  today_punch_count: number; // 今日打卡次数
  owner_id: string;
  project_id: number;
  punched_today: boolean;
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
  static async getPendingList(columnId: number): Promise<PunchListData> {
    return request.get<PunchListData>('/punch/pending-list', {
      column_id: columnId
    }, {
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 获取已审核列表
   */
  static async getReviewedList(columnId: number): Promise<ApiResponse<PunchListData>> {
    return request.getFull<PunchListData>('/punch/reviewed', {
      column_id: columnId
    }, {
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
   * 获取打卡详细信息
   * @param id - 打卡记录ID
   * @returns 打卡详细信息
   */
  static async getPunchDetail(id: number): Promise<ApiResponse<{
      imgs: string[];
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
      stared: boolean;
    timestamp: number;
  }>> {
    return request.getFull<{
        imgs: string[];
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
        stared: boolean;
      timestamp: number;
    }>(`/punch/get/${id}`, {}, {
      showLoading: true,
      showError: true,
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

  /**
   * 更新打卡记录
   */
  static async updatePunchRecord(id: number, data: {
    column_id: number;
    content: string;
    images?: string[];
    imgs?: string[];
  }): Promise<{
      ID: number;
      created_at: string;
      updated_at: string;
      deleted_at: null;
      column_id: number;
      user_id: string;
      content: string;
      status: number;
      imgs: string[];
  }> {
    return request.put(`/punch/update/${id}`, data, {
      showLoading: true,
      showError: true,
    });
  }
}

/**
 * 收藏/精华相关 API
 */
export class StarAPI {
  /**
   * 添加到收藏/精华
   * @param punchId 打卡记录ID
   * @returns 操作结果
   */
  static async addStar(punchId: number): Promise<{ code: number; msg: string; timestamp: number }> {
    const response = await request.postFull<null>(`/star/add?punch_id=${punchId}`, undefined, {
      showLoading: false,
      showError: false,
    });
    return {
      code: response.code,
      msg: response.msg,
      timestamp: response.timestamp || Date.now()
    };
  }

  /**
   * 取消收藏/精华
   * @param punchId 打卡记录ID
   * @returns 操作结果
   */
  static async cancelStar(punchId: number): Promise<{ code: number; msg: string; timestamp: number }> {
    const response = await request.deleteFull<null>(`/star/cancel?punch_id=${punchId}`, undefined, {
      showLoading: false,
      showError: false,
    });
    return {
      code: response.code,
      msg: response.msg,
      timestamp: response.timestamp || Date.now()
    };
  }

  /**
   * 批量查询收藏状态
   * @param punchIds 打卡记录ID数组
   * @returns 收藏状态映射
   */
  static async checkMultipleStarStatus(punchIds: number[]): Promise<{ code: number; data: Record<number, boolean>; msg: string; timestamp: number }> {
    const response = await request.postFull<Record<number, boolean>>('/star/batch-ask', {
      punch_ids: punchIds
    }, {
      showLoading: false,
      showError: false,
    });
    return {
      code: response.code,
      data: response.data,
      msg: response.msg,
      timestamp: response.timestamp || Date.now()
    };
  }

  /**
   * 获取收藏列表
   * @param params 查询参数
   * @param params.page 页码，默认为1
   * @param params.page_size 每页数量，默认为10
   * @returns 收藏列表响应
   */
  static async getStarList(params?: { page?: number; page_size?: number }): Promise<ApiResponse<import('../types/types').StarListData>> {
    const { page = 1, page_size = 10 } = params || {};

    return request.getFull<import('../types/types').StarListData>('/star/list', {
      page,
      page_size
    }, {
      showLoading: false,
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
  Star: StarAPI,
};

export default API;
