/**
 * 网络请求组件使用示例
 * 展示如何使用封装的网络请求组件
 */

import React, { useState } from 'react';
import { Button, Card, Space, Input, Upload, message, Table, Pagination } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import useRequest, { usePaginatedRequest } from '../hooks/useRequest';
import API from '../services/api';
import { UserProfile, ActivityData } from '../types/types';

/**
 * 基础请求示例
 */
const BasicRequestExample: React.FC = () => {
  // 获取用户信息
  const {
    data: userProfile,
    loading: userLoading,
    error: userError,
    run: fetchUser,
    refresh: refreshUser,
  } = useRequest(API.User.getCurrentUser, {
    manual: true, // 手动触发
    showError: true,
    onSuccess: (data) => {
      console.log('用户信息获取成功:', data);
    },
  });

  // 登录请求
  const {
    loading: loginLoading,
    run: login,
  } = useRequest(API.Auth.login, {
    manual: true,
    showLoading: true,
    showSuccess: true,
    successMessage: '登录成功！',
    onSuccess: (data) => {
      console.log('登录成功:', data);
      // 登录成功后获取用户信息
      fetchUser();
    },
  });

  const handleLogin = () => {
    login({
      username: 'test@example.com',
      password: '123456',
    });
  };

  return (
    <Card title="基础请求示例" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button 
            type="primary" 
            onClick={handleLogin}
            loading={loginLoading}
          >
            模拟登录
          </Button>
          <Button 
            onClick={fetchUser}
            loading={userLoading}
          >
            获取用户信息
          </Button>
          <Button 
            onClick={refreshUser}
            disabled={!userProfile}
          >
            刷新用户信息
          </Button>
        </Space>

        {userError && (
          <div style={{ color: 'red' }}>
            错误: {userError.message}
          </div>
        )}

        {userProfile && (
          <div>
            <h4>用户信息:</h4>
            <pre>{JSON.stringify(userProfile, null, 2)}</pre>
          </div>
        )}
      </Space>
    </Card>
  );
};

/**
 * 分页请求示例
 */
const PaginatedRequestExample: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const {
    list: activities,
    loading,
    pagination,
    changePage,
    changeParams,
    reset,
    refresh,
  } = usePaginatedRequest(
    (params) => API.Activity.getActivityList(params),
    {
      defaultPageSize: 5,
      defaultParams: { keyword: '' },
      showError: true,
    }
  );

  const handleSearch = () => {
    changeParams({ keyword: searchKeyword });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      key: 'endDate',
    },
  ];

  return (
    <Card title="分页请求示例" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Input
            placeholder="搜索活动"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={reset}>
            重置
          </Button>
          <Button onClick={refresh}>
            刷新
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={activities}
          loading={loading}
          pagination={false}
          rowKey="id"
        />

        <Pagination
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={changePage}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }
        />
      </Space>
    </Card>
  );
};

/**
 * 文件上传示例
 */
const FileUploadExample: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    loading: uploading,
    run: uploadFile,
  } = useRequest(
    (file: File) => API.File.uploadFile(file, (percent) => {
      setUploadProgress(percent);
    }),
    {
      manual: true,
      showSuccess: true,
      successMessage: '文件上传成功！',
      onSuccess: (data) => {
        console.log('上传成功:', data);
        setUploadProgress(0);
      },
      onError: () => {
        setUploadProgress(0);
      },
    }
  );

  const handleUpload = (file: File) => {
    uploadFile(file);
    return false; // 阻止默认上传行为
  };

  return (
    <Card title="文件上传示例" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading ? `上传中 ${uploadProgress}%` : '选择文件上传'}
          </Button>
        </Upload>
      </Space>
    </Card>
  );
};

/**
 * 防抖和节流示例
 */
const DebounceThrottleExample: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

  // 防抖搜索
  const {
    data: debounceResult,
    loading: debounceLoading,
    run: debounceSearch,
  } = useRequest(
    (keyword: string) => API.Activity.getActivityList({ keyword }),
    {
      manual: true,
      debounceWait: 500, // 500ms 防抖
      showError: true,
    }
  );

  // 节流搜索
  const {
    data: throttleResult,
    loading: throttleLoading,
    run: throttleSearch,
  } = useRequest(
    (keyword: string) => API.Activity.getActivityList({ keyword }),
    {
      manual: true,
      throttleWait: 1000, // 1000ms 节流
      showError: true,
    }
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debounceSearch(value);
    throttleSearch(value);
  };

  return (
    <Card title="防抖和节流示例">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="输入搜索关键词"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        
        <div>
          <h4>防抖结果 (500ms):</h4>
          {debounceLoading ? (
            <div>搜索中...</div>
          ) : (
            <div>找到 {debounceResult?.total || 0} 条结果</div>
          )}
        </div>

        <div>
          <h4>节流结果 (1000ms):</h4>
          {throttleLoading ? (
            <div>搜索中...</div>
          ) : (
            <div>找到 {throttleResult?.total || 0} 条结果</div>
          )}
        </div>
      </Space>
    </Card>
  );
};

/**
 * 主示例组件
 */
const RequestExample: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1>网络请求组件使用示例</h1>
      <BasicRequestExample />
      <PaginatedRequestExample />
      <FileUploadExample />
      <DebounceThrottleExample />
    </div>
  );
};

export default RequestExample;