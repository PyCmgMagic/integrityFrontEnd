/**
 * API 相关的类型定义
 */

// 基础 API 响应结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp?: number;
}

// 分页响应结构
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 请求配置
export interface RequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// HTTP 方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求参数类型
export interface RequestParams {
  [key: string]: any;
}

// 文件上传类型
export interface UploadFile {
  file: File;
  name?: string;
  onProgress?: (percent: number) => void;
}

// 错误类型
export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

// 登录相关类型
export interface LoginRequest {
  student_id: string;
  password: string;
  captcha?: string;
}

export interface LoginResponse {
  role_id: number;
  student_id: string;
  token: string;
}

// 用户信息更新请求
export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  bio?: string;
  studentId?: string;
  grade?: string;
  college?: string;
  major?: string;
  dob?: string;
  gender?: '男' | '女';
}

// 活动相关类型定义
export interface ActivityUser {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  student_id: string;
  role_id: number;
  nick_name: string;
  avatar: string;
  password: string;
}

export interface ActivityItem {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  description: string;
  owner_id: string;
  start_date: number;
  end_date: number;
  avatar: string;
  user: ActivityUser;
}

export interface ActivityListResponse {
  activitys: ActivityItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 项目类型定义
export interface ProjectItem {
  id: number;
  name: string;
  avatar: string;
  description: string;
}

export interface ActivityDetailResponse {
  activity: ActivityItem;
  projects: ProjectItem[];
}

export interface CreateActivityRequest {
  name: string;
  description: string;
  start_date: number;
  end_date: number;
  avatar: string;
}

export interface CreateActivityResponse {
  activity_id: number;
}

export interface UpdateActivityRequest {
  name?: string;
  description?: string;
  start_date?: number;
  end_date?: number;
  avatar?: string;
}

export interface ActivityListParams {
  owner_id?: string;
  page?: number;
  page_size?: number;
  name?: string;
}

// 项目详情相关类型定义
export interface ProjectColumn {
  id: number;
  name: string;
  avatar: string;
}

export interface ProjectDetail {
  id: number;
  name: string;
  avatar: string;
  description: string;
  start_date: number;
  end_date: number;
  columns: ProjectColumn[];
}

export interface ProjectDetailResponse {
  code: number;
  msg: string;
  data: ProjectDetail;
  timestamp: number;
}

// 栏目相关类型定义
export interface CreateColumnRequest {
  name: string;
  description: string;
  project_id: number;
  start_date: number;
  end_date: number;
  avatar: string;
}

export interface CreateColumnResponse {
  column_id: number;
}

export interface UpdateColumnRequest {
  name?: string;
  description?: string;
  start_date?: number;
  end_date?: number;
  avatar?: string;
}