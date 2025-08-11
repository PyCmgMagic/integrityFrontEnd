# 网络请求组件使用指南

## 概述

本项目已成功集成了完善的网络请求组件，基于 Axios 封装，提供了统一的请求处理、错误处理、拦截器等功能。

## 🚀 快速开始

### 基础配置

- **Base URL**: `http://106.105.155.138:8080`
- **超时时间**: 10秒
- **重试次数**: 最多3次（仅对5xx错误和网络错误重试）

### 基础使用

```typescript
import { useRequest } from '../hooks/useRequest';
import API from '../services/api';

// 基础请求
const { data, loading, error, run } = useRequest(API.User.getCurrentUser, {
  manual: true,
  showError: true,
  onSuccess: (data) => {
    console.log('请求成功:', data);
  }
});

// 手动触发请求
const handleClick = () => {
  run();
};
```

## 📁 文件结构

```
src/
├── types/
│   └── api.ts              # API 相关类型定义
├── utils/
│   └── request.ts          # Axios 请求工具类
├── services/
│   └── api.ts              # API 服务类
├── hooks/
│   └── useRequest.ts       # 网络请求 Hook
├── examples/
│   └── RequestExample.tsx  # 使用示例
└── pages/
    └── NetworkTest.tsx     # 测试页面
```

## 🔧 核心功能

### 1. 请求工具类 (RequestService)

**位置**: `src/utils/request.ts`

**功能特性**:
- ✅ 统一的请求配置和拦截器
- ✅ 自动添加认证 token
- ✅ 请求和响应日志记录
- ✅ 业务状态码检查
- ✅ 错误统一处理
- ✅ 请求取消机制
- ✅ 重试机制
- ✅ 401 自动处理（清除登录状态）

### 2. API 服务类

**位置**: `src/services/api.ts`

**包含模块**:
- `AuthAPI` - 认证相关（登录、注册、登出等）
- `UserAPI` - 用户相关（获取信息、更新资料等）
- `ActivityAPI` - 活动相关（CRUD操作）
- `CheckInAPI` - 打卡相关
- `FileAPI` - 文件上传
- `StatisticsAPI` - 统计数据

### 3. 网络请求 Hook

**位置**: `src/hooks/useRequest.ts`

#### useRequest Hook

```typescript
const {
  data,           // 响应数据
  loading,        // 加载状态
  error,          // 错误信息
  success,        // 成功状态
  run,            // 手动触发请求
  runAsync,       // 异步触发请求
  refresh,        // 刷新请求
  cancel,         // 取消请求
  mutate          // 手动更新数据
} = useRequest(requestFn, options);
```

**配置选项**:
```typescript
{
  manual?: boolean;           // 是否手动触发
  defaultData?: T;           // 默认数据
  onSuccess?: (data: T) => void;     // 成功回调
  onError?: (error: ApiError) => void; // 错误回调
  showError?: boolean;       // 显示错误提示
  showSuccess?: boolean;     // 显示成功提示
  successMessage?: string;   // 成功提示信息
  retries?: number;          // 重试次数
  retryDelay?: number;       // 重试延迟
  deps?: any[];              // 依赖项
  refreshDeps?: any[];       // 刷新依赖项
  debounceWait?: number;     // 防抖延迟
  throttleWait?: number;     // 节流延迟
}
```

#### usePaginatedRequest Hook

```typescript
const {
  data,           // 分页数据
  loading,        // 加载状态
  error,          // 错误信息
  pagination,     // 分页控制
  search,         // 搜索功能
  refresh,        // 刷新
  reset           // 重置
} = usePaginatedRequest(requestFn, options);
```

## 📝 使用示例

### 1. 基础请求

```typescript
// 获取用户信息
const { data: userInfo, loading, run: fetchUser } = useRequest(
  API.User.getCurrentUser,
  {
    manual: true,
    showError: true,
    onSuccess: (data) => {
      message.success('获取成功！');
    }
  }
);
```

### 2. 登录请求

```typescript
// 登录
const { loading: loginLoading, run: performLogin } = useRequest(
  API.Auth.login,
  {
    manual: true,
    showError: true,
    showSuccess: true,
    successMessage: '登录成功！',
    onSuccess: (data) => {
      // 处理登录成功逻辑
      login(data.user);
      navigate('/dashboard');
    }
  }
);

// 使用
await performLogin({ username: 'user@example.com', password: '123456' });
```

### 3. 分页请求

```typescript
// 获取活动列表
const {
  data: activityData,
  loading,
  pagination,
  search,
  refresh
} = usePaginatedRequest(
  (params) => API.Activity.getActivityList(params),
  {
    defaultPageSize: 10,
    showError: true,
    formatResult: (response) => ({
      list: response.list || [],
      total: response.total || 0
    })
  }
);

// 分页操作
pagination.changePage(2);           // 跳转到第2页
pagination.changePageSize(20);      // 修改每页条数
search({ keyword: '关键词' });       // 搜索
refresh();                          // 刷新
```

### 4. 文件上传

```typescript
// 文件上传
const { loading: uploadLoading, run: uploadFile } = useRequest(
  (file: File) => API.File.uploadFile(file, (percent) => {
    console.log(`上传进度: ${percent}%`);
  }),
  {
    manual: true,
    showError: true,
    showSuccess: true,
    successMessage: '上传成功！'
  }
);

// 使用
const handleUpload = (file: File) => {
  uploadFile(file);
};
```

### 5. 防抖搜索

```typescript
// 防抖搜索
const { loading: searchLoading, run: performSearch } = useRequest(
  (keyword: string) => API.Activity.getActivityList({ keyword }),
  {
    manual: true,
    debounceWait: 500,  // 500ms 防抖
    showError: true
  }
);

// 使用
const handleSearch = (value: string) => {
  performSearch(value);
};
```

## 🔒 认证处理

网络请求组件自动处理认证相关逻辑：

1. **自动添加 Token**: 请求拦截器会自动从 localStorage 中获取 token 并添加到请求头
2. **401 处理**: 当收到 401 响应时，自动清除本地存储并提示用户重新登录
3. **Token 刷新**: 支持 refresh token 机制（需要后端配合）

## 🚨 错误处理

### 错误类型

```typescript
interface ApiError {
  code: number;      // 错误码
  message: string;   // 错误信息
  details?: any;     // 详细信息
}
```

### 错误处理策略

1. **网络错误**: 显示"网络连接失败"提示
2. **超时错误**: 显示"请求超时"提示
3. **业务错误**: 显示后端返回的具体错误信息
4. **401 错误**: 自动清除登录状态并跳转登录页
5. **5xx 错误**: 自动重试（最多3次）

## 🔄 重试机制

- **触发条件**: 5xx 服务器错误或网络错误
- **重试次数**: 最多3次
- **重试延迟**: 1秒（可配置）
- **指数退避**: 支持配置指数退避策略

## ⚡ 性能优化

### 1. 防抖和节流

```typescript
// 防抖 - 适用于搜索
const { run } = useRequest(searchAPI, {
  debounceWait: 500
});

// 节流 - 适用于按钮点击
const { run } = useRequest(submitAPI, {
  throttleWait: 1000
});
```

### 2. 请求取消

```typescript
const { cancel } = useRequest(API.getData);

// 组件卸载时自动取消请求
useEffect(() => {
  return () => {
    cancel();
  };
}, []);
```

### 3. 缓存机制

```typescript
// 使用依赖项控制请求缓存
const { data } = useRequest(API.getData, {
  deps: [userId], // 只有 userId 变化时才重新请求
});
```

## 🧪 测试页面

访问 `/network-test` 页面可以查看所有功能的演示：

- 基础请求示例
- 登录请求示例  
- 分页请求示例
- 文件上传示例
- 防抖搜索示例

## 🛠️ 自定义配置

### 修改 Base URL

在 `src/utils/request.ts` 中修改：

```typescript
const BASE_URL = 'http://your-api-domain.com';
```

### 添加自定义拦截器

```typescript
// 在 RequestService 类中添加
this.instance.interceptors.request.use((config) => {
  // 自定义请求拦截逻辑
  return config;
});
```

### 扩展 API 服务

在 `src/services/api.ts` 中添加新的 API 类：

```typescript
export class CustomAPI {
  static async customMethod(data: any): Promise<any> {
    return request.post('/custom/endpoint', data);
  }
}
```

## 📋 最佳实践

1. **统一错误处理**: 使用 `showError: true` 让组件自动处理错误提示
2. **合理使用 manual**: 对于需要用户触发的操作使用 `manual: true`
3. **善用依赖项**: 使用 `deps` 和 `refreshDeps` 控制请求时机
4. **防抖节流**: 对于搜索和频繁操作使用防抖节流
5. **请求取消**: 在组件卸载时取消未完成的请求
6. **类型安全**: 充分利用 TypeScript 类型定义

## 🐛 调试方法

1. **查看控制台**: 所有请求都会在控制台输出详细日志
2. **网络面板**: 在浏览器开发者工具中查看实际的网络请求
3. **错误信息**: 错误会自动显示在页面上，也会输出到控制台
4. **状态检查**: 使用 React DevTools 查看 Hook 状态

## 📞 技术支持

如有问题，请检查：
1. 网络连接是否正常
2. API 服务器是否可访问
3. 认证 token 是否有效
4. 请求参数是否正确

---

**注意**: 本组件已经过充分测试，可以直接在生产环境中使用。如需修改配置，请谨慎操作并进行充分测试。
