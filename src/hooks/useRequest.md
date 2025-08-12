# useRequest Hook 使用指南

## 概述

`useRequest` 是一个强大的 React Hook，用于管理网络请求的状态、错误处理、重试机制等。它简化了在 React 组件中进行 API 调用的复杂性。

## 主要功能

### 🚀 核心功能
- **自动状态管理**: 自动管理 loading、error、success 状态
- **错误处理**: 统一的错误处理和用户提示
- **重试机制**: 支持自动重试失败的请求
- **请求取消**: 支持取消进行中的请求
- **数据缓存**: 支持手动更新缓存数据

### ⚡ 高级功能
- **防抖/节流**: 防止频繁请求
- **分页支持**: 内置分页请求支持
- **依赖更新**: 依赖项变化时自动重新请求
- **成功/失败回调**: 自定义成功和失败处理逻辑

## 基本用法

### 1. 自动执行请求

```typescript
import { useRequest } from '../hooks/useRequest';
import { ActivityAPI } from '../services/api';

const MyComponent = () => {
  const { data, loading, error, refresh } = useRequest(
    () => ActivityAPI.getActivityList(),
    {
      showError: true, // 自动显示错误提示
      onSuccess: (data) => {
        console.log('请求成功:', data);
      },
    }
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      <button onClick={refresh}>刷新</button>
      <div>数据: {JSON.stringify(data)}</div>
    </div>
  );
};
```

### 2. 手动执行请求

```typescript
const MyComponent = () => {
  const { data, loading, run } = useRequest(
    (id: number) => ActivityAPI.getActivityDetail(id),
    {
      manual: true, // 不自动执行
      showSuccess: true,
      successMessage: '获取成功！',
    }
  );

  const handleClick = () => {
    run(123); // 手动执行请求
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? '加载中...' : '获取详情'}
      </button>
      {data && <div>{data.activity.name}</div>}
    </div>
  );
};
```

### 3. 带参数的请求

```typescript
const SearchComponent = () => {
  const [keyword, setKeyword] = useState('');
  
  const { data, loading, run } = useRequest(
    (searchKeyword: string, page: number) => 
      ActivityAPI.getActivityList({ keyword: searchKeyword, page }),
    {
      manual: true,
      debounceWait: 500, // 防抖500ms
    }
  );

  const handleSearch = (value: string) => {
    setKeyword(value);
    if (value.trim()) {
      run(value.trim(), 1); // 传递多个参数
    }
  };

  return (
    <input 
      value={keyword}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="搜索..."
    />
  );
};
```

## 配置选项

### UseRequestOptions 接口

```typescript
interface UseRequestOptions<T> {
  manual?: boolean;           // 是否手动触发请求，默认 false
  defaultData?: T;           // 默认数据
  onSuccess?: (data: T) => void;     // 成功回调
  onError?: (error: ApiError) => void; // 错误回调
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
  data: T | null;            // 请求返回的数据
  loading: boolean;          // 加载状态
  error: ApiError | null;    // 错误信息
  success: boolean;          // 是否成功
  run: (...args) => Promise<T | undefined>;     // 执行请求（不抛出错误）
  runAsync: (...args) => Promise<T>;            // 执行请求（抛出错误）
  refresh: () => void;       // 刷新请求
  cancel: () => void;        // 取消请求
  mutate: (data) => void;    // 手动更新数据
}
```

## 高级用法

### 1. 重试机制

```typescript
const { data, loading, run } = useRequest(
  () => ProjectAPI.deleteProject(123),
  {
    manual: true,
    retries: 3,        // 失败时重试3次
    retryDelay: 2000,  // 每次重试间隔2秒
    showError: true,
    onError: (error) => {
      console.log('删除失败，已重试3次:', error);
    },
  }
);
```

### 2. 防抖请求

```typescript
const { data, loading, run } = useRequest(
  (keyword: string) => ActivityAPI.getActivityList({ keyword }),
  {
    manual: true,
    debounceWait: 500, // 用户停止输入500ms后才发起请求
  }
);
```

### 3. 依赖更新

```typescript
const [userId, setUserId] = useState(1);

const { data, loading } = useRequest(
  () => UserAPI.getUserProfile(userId),
  {
    deps: [userId], // userId 变化时自动重新请求
  }
);
```

### 4. 数据变更

```typescript
const { data, mutate } = useRequest(() => ActivityAPI.getActivityList());

// 手动更新数据，不发起请求
const addActivity = (newActivity) => {
  mutate((oldData) => ({
    ...oldData,
    activities: [...oldData.activities, newActivity],
  }));
};
```

## 分页请求

### usePaginatedRequest

```typescript
const {
  list,           // 当前页数据
  loading,
  pagination,     // 分页信息 { page, pageSize, total }
  changePage,     // 切换页码
  changeParams,   // 更改查询参数
  refresh,        // 刷新当前页
} = usePaginatedRequest(
  (params) => ActivityAPI.getActivityList(params),
  {
    defaultPageSize: 10,
    defaultParams: { status: 'active' },
  }
);

// 切换页码
const handlePageChange = (page: number) => {
  changePage(page);
};

// 更改查询条件
const handleSearch = (keyword: string) => {
  changeParams({ keyword, status: 'active' });
};
```

## 错误处理

### 1. 自动错误提示

```typescript
const { data, loading, error } = useRequest(
  () => ActivityAPI.getActivityList(),
  {
    showError: true, // 自动显示错误 Toast
  }
);
```

### 2. 自定义错误处理

```typescript
const { data, loading, error } = useRequest(
  () => ActivityAPI.getActivityList(),
  {
    showError: false, // 关闭自动提示
    onError: (error) => {
      // 自定义错误处理
      if (error.code === 401) {
        // 跳转到登录页
        navigate('/login');
      } else {
        message.error(`请求失败: ${error.message}`);
      }
    },
  }
);
```

## 最佳实践

### 1. 组件卸载时取消请求

```typescript
useEffect(() => {
  return () => {
    cancel(); // 组件卸载时取消请求
  };
}, [cancel]);
```

### 2. 条件请求

```typescript
const [shouldFetch, setShouldFetch] = useState(false);

const { data, loading } = useRequest(
  () => ActivityAPI.getActivityList(),
  {
    manual: !shouldFetch, // 根据条件决定是否自动执行
  }
);
```

### 3. 请求串联

```typescript
const { data: user } = useRequest(() => UserAPI.getCurrentUser());

const { data: activities } = useRequest(
  () => ActivityAPI.getActivityList({ userId: user?.id }),
  {
    manual: !user?.id, // 等待用户信息加载完成
    deps: [user?.id],   // 用户ID变化时重新请求
  }
);
```

### 4. 乐观更新

```typescript
const { data, mutate, run } = useRequest(() => ActivityAPI.getActivityList());

const handleDelete = async (id: number) => {
  // 乐观更新：先更新UI
  mutate((oldData) => ({
    ...oldData,
    activities: oldData.activities.filter(item => item.id !== id),
  }));

  try {
    await ProjectAPI.deleteProject(id);
    // 成功后可以选择刷新数据或保持乐观更新
  } catch (error) {
    // 失败时恢复数据
    refresh();
    message.error('删除失败');
  }
};
```

## 注意事项

1. **内存泄漏**: Hook 会自动处理组件卸载时的清理工作
2. **请求取消**: 新请求会自动取消之前的请求
3. **错误边界**: 建议在应用层面设置错误边界来捕获未处理的错误
4. **TypeScript**: 充分利用 TypeScript 的类型推导，为请求函数和返回数据定义准确的类型

## 与其他状态管理的对比

| 特性 | useRequest | useState + useEffect | React Query |
|------|------------|---------------------|-------------|
| 学习成本 | 低 | 低 | 中 |
| 功能完整性 | 高 | 低 | 很高 |
| 包大小 | 小 | 无 | 大 |
| 缓存策略 | 简单 | 无 | 复杂 |
| 适用场景 | 中小型项目 | 简单请求 | 大型项目 |

这个 `useRequest` Hook 为你的项目提供了一个轻量级但功能完整的网络请求解决方案！