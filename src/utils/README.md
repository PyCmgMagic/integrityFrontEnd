# 网络请求组件使用指南

本项目封装了一套完整的网络请求解决方案，基于 Axios 和 React Hooks，提供了便捷的 API 调用、状态管理、错误处理等功能。

## 📁 文件结构

```
src/
├── types/
│   └── api.ts              # API 相关类型定义
├── utils/
│   └── request.ts          # Axios 封装和拦截器
├── services/
│   └── api.ts              # API 服务类
├── hooks/
│   └── useRequest.ts       # 网络请求 Hook
└── examples/
    └── RequestExample.tsx  # 使用示例
```

## 🚀 快速开始

### 1. 基础请求

```tsx
import useRequest from '../hooks/useRequest';
import API from '../services/api';

const MyComponent = () => {
  const { data, loading, error, run } = useRequest(API.User.getCurrentUser, {
    manual: true, // 手动触发
    showError: true, // 显示错误提示
    onSuccess: (data) => {
      console.log('请求成功:', data);
    },
  });

  return (
    <div>
      <button onClick={run} disabled={loading}>
        {loading ? '加载中...' : '获取用户信息'}
      </button>
      {data && <div>用户名: {data.name}</div>}
    </div>
  );
};
```

### 2. 分页请求

```tsx
import { usePaginatedRequest } from '../hooks/useRequest';
import API from '../services/api';

const ActivityList = () => {
  const {
    list,
    loading,
    pagination,
    changePage,
    changeParams,
  } = usePaginatedRequest(
    (params) => API.Activity.getActivityList(params),
    {
      defaultPageSize: 10,
      showError: true,
    }
  );

  return (
    <div>
      <Table dataSource={list} loading={loading} />
      <Pagination
        current={pagination.page}
        total={pagination.total}
        onChange={changePage}
      />
    </div>
  );
};
```

### 3. 文件上传

```tsx
import useRequest from '../hooks/useRequest';
import API from '../services/api';

const FileUpload = () => {
  const [progress, setProgress] = useState(0);

  const { loading, run: uploadFile } = useRequest(
    (file: File) => API.File.uploadFile(file, setProgress),
    {
      manual: true,
      showSuccess: true,
      successMessage: '上传成功！',
    }
  );

  const handleUpload = (file: File) => {
    uploadFile(file);
  };

  return (
    <Upload beforeUpload={handleUpload}>
      <Button loading={loading}>
        {loading ? `上传中 ${progress}%` : '选择文件'}
      </Button>
    </Upload>
  );
};
```

## 🔧 配置说明

### BaseURL 配置

在 `src/utils/request.ts` 中修改 `BASE_URL`：

```typescript
const BASE_URL = 'http://106.105.155.138:8080';
```

### 请求拦截器

自动添加以下功能：
- 认证 token
- 请求取消控制
- 请求日志
- 请求时间戳

### 响应拦截器

自动处理：
- 业务状态码检查
- 错误信息提取
- 401 未授权处理
- 响应日志

## 📋 API 服务类

### AuthAPI - 认证相关

```typescript
// 登录
await API.Auth.login({ username, password });

// 注册
await API.Auth.register({ username, password, email, name });

// 登出
await API.Auth.logout();

// 获取验证码
await API.Auth.getCaptcha();
```

### UserAPI - 用户相关

```typescript
// 获取当前用户信息
await API.User.getCurrentUser();

// 更新用户信息
await API.User.updateProfile(data);

// 上传头像
await API.User.uploadAvatar(file, onProgress);

// 修改密码
await API.User.changePassword({ oldPassword, newPassword });
```

### ActivityAPI - 活动相关

```typescript
// 获取活动列表
await API.Activity.getActivityList(params);

// 获取活动详情
await API.Activity.getActivityDetail(id);

// 创建活动
await API.Activity.createActivity(data);

// 更新活动
await API.Activity.updateActivity(id, data);

// 删除活动
await API.Activity.deleteActivity(id);
```

## 🎯 Hook 配置选项

### useRequest 选项

```typescript
interface UseRequestOptions<T> {
  manual?: boolean;           // 是否手动触发，默认 false
  defaultData?: T;           // 默认数据
  onSuccess?: (data: T) => void;  // 成功回调
  onError?: (error: ApiError) => void;  // 错误回调
  showError?: boolean;       // 是否显示错误提示，默认 true
  showSuccess?: boolean;     // 是否显示成功提示，默认 false
  successMessage?: string;   // 成功提示信息
  retries?: number;          // 重试次数，默认 0
  retryDelay?: number;       // 重试延迟（毫秒），默认 1000
  deps?: any[];              // 依赖项，变化时重新请求
  refreshDeps?: any[];       // 刷新依赖项
  debounceWait?: number;     // 防抖延迟
  throttleWait?: number;     // 节流延迟
}
```

### 返回值

```typescript
{
  data: T | null;           // 响应数据
  loading: boolean;         // 加载状态
  error: ApiError | null;   // 错误信息
  success: boolean;         // 成功状态
  run: (...args) => Promise<T | undefined>;     // 执行请求（带错误处理）
  runAsync: (...args) => Promise<T>;            // 执行请求（抛出错误）
  refresh: () => void;      // 刷新请求
  cancel: () => void;       // 取消请求
  mutate: (data) => void;   // 手动更新数据
}
```

## 🛡️ 错误处理

### 自动错误处理

- 网络错误：显示"网络连接失败"
- 超时错误：显示"请求超时"
- 401 错误：自动跳转登录页
- 服务器错误：显示具体错误信息

### 自定义错误处理

```typescript
const { error, run } = useRequest(API.User.getCurrentUser, {
  showError: false, // 关闭自动错误提示
  onError: (error) => {
    // 自定义错误处理
    if (error.code === 404) {
      message.warning('用户不存在');
    } else {
      message.error(error.message);
    }
  },
});
```

## 🔄 重试机制

```typescript
const { run } = useRequest(API.User.getCurrentUser, {
  retries: 3,        // 最多重试 3 次
  retryDelay: 1000,  // 每次重试间隔 1 秒
});
```

## ⏱️ 防抖和节流

### 防抖（Debounce）

```typescript
const { run } = useRequest(API.Activity.getActivityList, {
  manual: true,
  debounceWait: 500, // 500ms 防抖
});

// 在输入框中使用
<Input onChange={(e) => run({ keyword: e.target.value })} />
```

### 节流（Throttle）

```typescript
const { run } = useRequest(API.Activity.getActivityList, {
  manual: true,
  throttleWait: 1000, // 1000ms 节流
});
```

## 📊 请求状态管理

### 全局加载状态

可以结合 Zustand 或其他状态管理库来管理全局加载状态：

```typescript
// 在 store 中
interface AppState {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

// 在请求中
const { run } = useRequest(API.User.getCurrentUser, {
  onBefore: () => setGlobalLoading(true),
  onFinally: () => setGlobalLoading(false),
});
```

## 🔐 认证处理

### Token 管理

Token 会自动从 localStorage 中的 `auth-storage` 获取并添加到请求头：

```typescript
// 自动添加到请求头
headers: {
  Authorization: `Bearer ${token}`
}
```

### 401 处理

当收到 401 响应时，会自动：
1. 清除本地认证信息
2. 显示"登录已过期"提示
3. 跳转到登录页面

## 📝 最佳实践

### 1. API 接口定义

```typescript
// 在 services/api.ts 中定义接口
export class UserAPI {
  static async getCurrentUser(): Promise<UserProfile> {
    return request.get<UserProfile>('/user/profile');
  }
}
```

### 2. 类型安全

```typescript
// 使用 TypeScript 类型
const { data } = useRequest(API.User.getCurrentUser);
// data 的类型会自动推断为 UserProfile | null
```

### 3. 错误边界

```typescript
// 在组件中处理错误
const { error } = useRequest(API.User.getCurrentUser);

if (error) {
  return <ErrorComponent error={error} />;
}
```

### 4. 加载状态

```typescript
// 统一的加载状态处理
const { loading } = useRequest(API.User.getCurrentUser);

return (
  <Spin spinning={loading}>
    <YourComponent />
  </Spin>
);
```

## 🐛 调试

### 请求日志

所有请求都会在控制台输出详细日志：

```
🚀 [POST] /auth/login { username: "test@example.com" }
✅ [POST] /auth/login (1234ms) { status: 200, data: {...} }
```

### 错误日志

```
❌ [GET] /user/profile { status: 401, message: "Unauthorized" }
```

## 📚 更多示例

查看 `src/examples/RequestExample.tsx` 文件获取更多使用示例。

## 🤝 贡献

如果您发现问题或有改进建议，请提交 Issue 或 Pull Request。