/**
 * 网络请求组件测试页面
 * 展示网络请求组件的各种功能
 */

import React, { useState } from 'react';
import { Card, Button, Input, Form, Upload, Space, Divider, Typography, message } from 'antd';
import { UploadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRequest, usePaginatedRequest } from '../hooks/useRequest';
import API from '../services/api';

const { Title, Text } = Typography;

/**
 * 网络请求测试页面组件
 */
const NetworkTestPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');

  /**
   * 基础请求示例 - 获取用户信息
   */
  const {
    data: userInfo,
    loading: userLoading,
    error: userError,
    run: fetchUser,
    refresh: refreshUser
  } = useRequest(API.User.getCurrentUser, {
    manual: true,
    showError: true,
    onSuccess: () => {
      message.success('用户信息获取成功！');
    }
  });

  /**
   * 登录请求示例
   */
  const {
    loading: loginLoading,
    run: performLogin
  } = useRequest(API.Auth.login, {
    manual: true,
    showError: true,
    showSuccess: true,
    successMessage: '登录成功！',
    onSuccess: (data) => {
      console.log('登录成功:', data);
    }
  });

  /**
   * 分页请求示例 - 获取活动列表
   */
  const {
    data: activityData,
    loading: activityLoading,
    pagination,
    search,
    refresh: refreshActivities,
    reset: resetActivities
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

  /**
   * 文件上传示例
   */
  const {
    loading: uploadLoading,
    run: uploadFile
  } = useRequest(
    (file: File) => API.File.uploadFile(file, (percent) => {
      console.log(`上传进度: ${percent}%`);
    }),
    {
      manual: true,
      showError: true,
      showSuccess: true,
      successMessage: '文件上传成功！'
    }
  );

  /**
   * 防抖搜索示例
   */
  const {
    loading: searchLoading,
    run: performSearch
  } = useRequest(
    (keyword: string) => API.Activity.getActivityList({ keyword }),
    {
      manual: true,
      debounceWait: 500,
      showError: true
    }
  );

  /**
   * 处理登录表单提交
   */
  const handleLogin = async (values: { username: string; password: string }) => {
    await performLogin(values);
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = (info: any) => {
    if (info.file.status === 'done') {
      uploadFile(info.file.originFileObj);
    }
  };

  /**
   * 处理搜索
   */
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    performSearch(value);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>网络请求组件测试页面</Title>
      <Text type="secondary">
        这个页面展示了网络请求组件的各种功能，包括基础请求、分页请求、文件上传、防抖搜索等。
      </Text>

      <Divider />

      {/* 基础请求示例 */}
      <Card title="基础请求示例" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button 
              type="primary" 
              loading={userLoading} 
              onClick={fetchUser}
              icon={<SearchOutlined />}
            >
              获取用户信息
            </Button>
            <Button 
              loading={userLoading} 
              onClick={refreshUser}
              icon={<ReloadOutlined />}
            >
              刷新
            </Button>
          </Space>
          
          {userError && (
            <Text type="danger">错误: {userError.message}</Text>
          )}
          
          {userInfo && (
            <Card size="small" title="用户信息">
              <pre>{JSON.stringify(userInfo, null, 2)}</pre>
            </Card>
          )}
        </Space>
      </Card>

      {/* 登录请求示例 */}
      <Card title="登录请求示例" style={{ marginBottom: '24px' }}>
        <Form onFinish={handleLogin} layout="inline">
          <Form.Item 
            name="username" 
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名/邮箱" style={{ width: '200px' }} />
          </Form.Item>
          <Form.Item 
            name="password" 
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" style={{ width: '200px' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loginLoading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 分页请求示例 */}
      <Card title="分页请求示例 - 活动列表" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button 
              type="primary" 
              loading={activityLoading} 
              onClick={() => pagination.changePage(1)}
            >
              加载活动列表
            </Button>
            <Button 
              loading={activityLoading} 
              onClick={refreshActivities}
              icon={<ReloadOutlined />}
            >
              刷新
            </Button>
            <Button onClick={resetActivities}>
              重置
            </Button>
          </Space>

          <Input.Search
            placeholder="搜索活动..."
            onSearch={(value) => search({ keyword: value })}
            style={{ width: '300px' }}
            loading={activityLoading}
          />

          {activityData && (
            <Card size="small" title={`活动列表 (共 ${activityData.total} 条)`}>
              <div>
                <Text>当前页: {pagination.current}</Text>
                <br />
                <Text>每页条数: {pagination.pageSize}</Text>
                <br />
                <Text>总页数: {Math.ceil(activityData.total / pagination.pageSize)}</Text>
              </div>
              
              <Divider />
              
              <Space>
                <Button 
                  disabled={pagination.current <= 1}
                  onClick={() => pagination.changePage(pagination.current - 1)}
                >
                  上一页
                </Button>
                <Button 
                  disabled={pagination.current >= Math.ceil(activityData.total / pagination.pageSize)}
                  onClick={() => pagination.changePage(pagination.current + 1)}
                >
                  下一页
                </Button>
              </Space>

              {activityData.list.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <pre>{JSON.stringify(activityData.list.slice(0, 2), null, 2)}</pre>
                </div>
              )}
            </Card>
          )}
        </Space>
      </Card>

      {/* 文件上传示例 */}
      <Card title="文件上传示例" style={{ marginBottom: '24px' }}>
        <Upload
          beforeUpload={() => false}
          onChange={handleFileUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} loading={uploadLoading}>
            选择文件上传
          </Button>
        </Upload>
        <Text type="secondary" style={{ marginLeft: '12px' }}>
          选择文件后会自动开始上传
        </Text>
      </Card>

      {/* 防抖搜索示例 */}
      <Card title="防抖搜索示例" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="输入关键词搜索 (500ms 防抖)"
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            suffix={searchLoading ? <SearchOutlined spin /> : <SearchOutlined />}
            style={{ width: '400px' }}
          />
          <Text type="secondary">
            输入关键词后会在 500ms 后自动触发搜索，避免频繁请求
          </Text>
        </Space>
      </Card>

      {/* 网络请求配置信息 */}
      <Card title="网络请求配置信息">
        <Space direction="vertical">
          <Text><strong>Base URL:</strong> http://106.105.155.138:8080</Text>
          <Text><strong>超时时间:</strong> 10秒</Text>
          <Text><strong>重试次数:</strong> 最多3次</Text>
          <Text><strong>支持功能:</strong> 请求拦截、响应拦截、错误处理、请求取消、防抖节流、分页等</Text>
        </Space>
      </Card>
    </div>
  );
};

export default NetworkTestPage;