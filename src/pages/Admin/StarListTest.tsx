import React, { useState } from 'react';
import { Card, Button, Typography, Space, Input, message, Spin, List, Tag } from 'antd';
import { StarFilled,  SearchOutlined } from '@ant-design/icons';
import { API } from '../../services/api';
import type { StarItem, StarListResponse } from '../../types/types';

const { Title, Text, Paragraph } = Typography;

/**
 * 收藏列表API测试页面
 * 用于测试和验证收藏列表API的功能
 */
const StarListTest: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [starList, setStarList] = useState<StarItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [apiResponse, setApiResponse] = useState<StarListResponse | null>(null);

  /**
   * 测试获取收藏列表API
   */
  const testGetStarList = async () => {
    setLoading(true);
    try {
      console.log('正在调用收藏列表API...', { page, pageSize });
      
      const response: StarListResponse = await API.Star.getStarList({
        page,
        page_size: pageSize,
      });

      console.log('API响应:', response);
      setApiResponse(response);

      if (response.code === 200) {
        setStarList(response.data.stars || []);
        message.success(`成功获取 ${response.data.stars?.length || 0} 条收藏记录`);
      } else {
        message.error(`API返回错误: ${response.msg}`);
      }
    } catch (error) {
      console.error('API调用失败:', error);
      message.error('API调用失败，请检查网络连接和后端服务');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    } catch {
      return dateString;
    }
  };

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="orange">待审核</Tag>;
      case 1:
        return <Tag color="green">已通过</Tag>;
      case 2:
        return <Tag color="red">已拒绝</Tag>;
      default:
        return <Tag>未知状态({status})</Tag>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="flex items-center mb-6">
          <StarFilled className="text-yellow-500 mr-2" />
          收藏列表API测试
        </Title>

        {/* 测试控制面板 */}
        <Card title="API测试控制面板" className="mb-6">
          <Space direction="vertical" size="middle" className="w-full">
            <div className="flex items-center space-x-4">
              <div>
                <Text strong>页码:</Text>
                <Input
                  type="number"
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value) || 1)}
                  min={1}
                  className="w-20 ml-2"
                />
              </div>
              <div>
                <Text strong>每页数量:</Text>
                <Input
                  type="number"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value) || 10)}
                  min={1}
                  max={100}
                  className="w-20 ml-2"
                />
              </div>
            </div>
            
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={testGetStarList}
              loading={loading}
              size="large"
            >
              测试获取收藏列表
            </Button>
          </Space>
        </Card>

        {/* API响应信息 */}
        {apiResponse && (
          <Card title="API响应信息" className="mb-6">
            <div className="space-y-2">
              <div><Text strong>状态码:</Text> <Tag color={apiResponse.code === 200 ? 'green' : 'red'}>{apiResponse.code}</Tag></div>
              <div><Text strong>消息:</Text> {apiResponse.msg}</div>
              <div><Text strong>时间戳:</Text> {apiResponse.timestamp}</div>
              <div><Text strong>用户ID:</Text> {apiResponse.data.user_id}</div>
              <div><Text strong>当前页:</Text> {apiResponse.data.page}</div>
              <div><Text strong>每页数量:</Text> {apiResponse.data.page_size}</div>
              <div><Text strong>收藏数量:</Text> {apiResponse.data.stars?.length || 0}</div>
            </div>
          </Card>
        )}

        {/* 收藏列表展示 */}
        <Card title={`收藏列表 (${starList.length} 条记录)`}>
          <Spin spinning={loading}>
            {starList.length === 0 ? (
              <div className="text-center py-8">
                <Text type="secondary">
                  {loading ? '正在加载...' : '暂无收藏记录，请先调用API获取数据'}
                </Text>
              </div>
            ) : (
              <List
                dataSource={starList}
                renderItem={(item: StarItem, index: number) => (
                  <List.Item
                    key={`${item.punch.ID}-${item.created_at}`}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <Text strong>打卡记录 #{item.punch.ID}</Text>
                          {getStatusTag(item.punch.status)}
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          <Paragraph
                            ellipsis={{ rows: 2, expandable: true }}
                            className="text-gray-600"
                          >
                            {item.punch.content || '暂无内容'}
                          </Paragraph>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                            <div>用户ID: {item.punch.user_id}</div>
                            <div>栏目ID: {item.punch.column_id}</div>
                            <div>收藏时间: {formatDate(item.created_at)}</div>
                            <div>打卡时间: {formatDate(item.punch.created_at)}</div>
                            <div>更新时间: {formatDate(item.punch.updated_at)}</div>
                            <div>删除时间: {item.punch.deleted_at || '未删除'}</div>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </Card>

        {/* 使用说明 */}
        <Card title="使用说明" className="mt-6">
          <div className="space-y-2">
            <div><Text strong>API端点:</Text> <code>/star/list</code></div>
            <div><Text strong>请求方法:</Text> <code>GET</code></div>
            <div><Text strong>查询参数:</Text></div>
            <ul className="ml-4 space-y-1">
              <li><code>page</code> - 页码 (默认: 1)</li>
              <li><code>page_size</code> - 每页数量 (默认: 10)</li>
            </ul>
            <div><Text strong>响应格式:</Text></div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "code": 200,
  "msg": "Success",
  "data": {
    "user_id": "1",
    "page_size": 10,
    "page": 1,
    "stars": [
      {
        "created_at": "2025-08-27T17:26:19.623+08:00",
        "punch": {
          "ID": 23,
          "created_at": "2025-08-27T12:45:51.285+08:00",
          "updated_at": "2025-08-27T12:45:51.285+08:00",
          "deleted_at": null,
          "column_id": 13,
          "user_id": "2",
          "content": "打卡内容...",
          "status": 0
        }
      }
    ]
  },
  "timestamp": 1756291770
}`}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StarListTest;
