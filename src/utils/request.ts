
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import type { ApiResponse, RequestConfig, ApiError } from '../types/api';

// 扩展 Axios 类型定义以支持自定义 metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// 基础配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000;
const MAX_RETRIES = 3;

/**
 * 创建 Axios 实例
 */
class RequestService {
  private instance: AxiosInstance;
  private pendingRequests: Map<string, AbortController> = new Map();

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加取消请求的控制器
        const controller = new AbortController();
        const requestKey = this.getRequestKey(config);
        
        // 取消之前相同的请求
        if (this.pendingRequests.has(requestKey)) {
          this.pendingRequests.get(requestKey)?.abort();
        }
        
        this.pendingRequests.set(requestKey, controller);
        config.signal = controller.signal;

        // 添加认证 token
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加请求时间戳
        config.metadata = { startTime: Date.now() };

        console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
          params: config.params,
          data: config.data,
        });

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const requestKey = this.getRequestKey(response.config);
        this.pendingRequests.delete(requestKey);

        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url} (${duration}ms)`, {
          status: response.status,
          data: response.data,
        });

        // 检查业务状态码
        if (response.data && typeof response.data === 'object') {
          if (response.data.success === false || (response.data.code && response.data.code !== 200)) {
            const error: ApiError = {
              code: response.data.code || -1,
              message: response.data.message || '请求失败',
              details: response.data,
            };
            return Promise.reject(error);
          }
        }

        return response;
      },
      (error: AxiosError) => {
        const requestKey = this.getRequestKey(error.config);
        this.pendingRequests.delete(requestKey);

        console.error(`❌ [${error.config?.method?.toUpperCase()}] ${error.config?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });

        return this.handleError(error);
      }
    );
  }

  /**
   * 生成请求的唯一标识
   */
  private getRequestKey(config: any): string {
    return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
  }

  /**
   * 获取认证 token
   */
  private getAuthToken(): string | null {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return null;
  }

  /**
   * 错误处理
   */
  private handleError(error: AxiosError): Promise<never> {
    let apiError: ApiError;

    // 检查是否为请求取消
    if (error.name === 'AbortError' || error.message === 'canceled') {
      // 请求被取消，不显示错误信息
      apiError = {
        code: -2,
        message: 'Request canceled',
        silent: true, // 标记为静默错误，不显示给用户
      };
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      apiError = {
        code: -1,
        message: '请求超时，请检查网络连接',
      };
    } else if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      apiError = {
        code: status,
        message: this.getErrorMessage(status, data),
        details: data,
      };

      // 处理特殊状态码
      if (status === 401) {
        this.handleUnauthorized();
      }
    } else if (error.request) {
      // 网络错误
      apiError = {
        code: -1,
        message: '网络连接失败，请检查网络设置',
      };
    } else {
      // 其他错误
      apiError = {
        code: -1,
        message: error.message || '未知错误',
      };
    }

    return Promise.reject(apiError);
  }

  /**
   * 获取错误信息
   */
  private getErrorMessage(status: number, data: any): string {
    if (data && data.message) {
      return data.message;
    }

    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '拒绝访问',
      404: '请求的资源不存在',
      405: '请求方法不允许',
      408: '请求超时',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
    };

    return statusMessages[status] || `请求失败 (${status})`;
  }

  /**
   * 处理未授权错误
   */
  private handleUnauthorized(): void {
    // 清除本地存储的认证信息
    localStorage.removeItem('auth-storage');
    
    // 显示错误提示
    message.error('登录已过期，请重新登录');
    
    // 跳转到登录页面
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(
    config: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    const {
      showLoading = false,
      showError = true,
      retries = 0,
      ...axiosConfig
    } = config;

    try {
      if (showLoading) {
        // 这里可以集成全局 loading 状态
        console.log('Loading...');
      }

      const response = await this.instance.request<ApiResponse<T>>(axiosConfig);
      return response.data.data;
    } catch (error) {
      if (showError && error instanceof Object && 'message' in error) {
        message.error(error.message as string);
      }

      // 重试机制
      if (retries > 0 && this.shouldRetry(error)) {
        console.log(`Retrying request... (${retries} attempts left)`);
        return this.request({ ...config, retries: retries - 1 });
      }

      throw error;
    } finally {
      if (showLoading) {
        console.log('Loading finished');
      }
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    if (!error || typeof error !== 'object') return false;
    
    // 网络错误或超时错误可以重试
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'NETWORK_ERROR' ||
      (error.code >= 500 && error.code < 600)
    );
  }

  /**
   * GET 请求
   */
  get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...config,
    });
  }

  /**
   * POST 请求
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  /**
   * PUT 请求
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      params,
      ...config,
    });
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  /**
   * 文件上传
   */
  upload<T = any>(
    url: string,
    file: File,
    onProgress?: (percent: number) => void,
    config?: RequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
      ...config,
    });
  }

  /**
   * 取消所有待处理的请求
   */
  cancelAllRequests(): void {
    this.pendingRequests.forEach((controller) => {
      controller.abort();
    });
    this.pendingRequests.clear();
  }

  /**
   * 取消特定请求
   */
  cancelRequest(config: AxiosRequestConfig): void {
    const requestKey = this.getRequestKey(config);
    const controller = this.pendingRequests.get(requestKey);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(requestKey);
    }
  }
}

// 创建请求实例
export const request = new RequestService();

// 导出默认实例
export default request;