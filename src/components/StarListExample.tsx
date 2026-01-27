import React, { useEffect } from 'react';
import { Card, List, Button, Typography, Tag } from 'antd';
import { StarFilled, ReloadOutlined } from '@ant-design/icons';
import { useStarList } from '../hooks/useStarList';
import type { StarItem } from '../types/types';

const { Title, Text } = Typography;

/**
 * 收藏列表组件示例
 * 展示如何在其他组件中使用收藏列表功能
 */
const StarListExample: React.FC = () => {
  const {
    starList,
    loading,
    pagination,
    fetchStarList,
    refresh,
  } = useStarList({
    defaultPage: 1,
    defaultPageSize: 5, // 示例中只显示5条
    showError: true,
    onSuccess: () => {},
    onError: (error) => {
      console.error('收藏列表加载失败:', error);
    },
  });

  // 组件挂载时自动加载数据
  useEffect(() => {
    fetchStarList();
  }, [fetchStarList]);

  /**
   * 格式化日期为简短格式
   */
  const formatShortDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
      }
    } catch {
      return dateString;
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0: return 'orange';
      case 1: return 'green';
      case 2: return 'red';
      default: return 'default';
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <StarFilled className="text-yellow-500 mr-2" />
            <Title level={4} className="mb-0">我的收藏</Title>
          </div>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={refresh}
            loading={loading}
            size="small"
          >
            刷新
          </Button>
        </div>
      }
      size="small"
      className="w-full max-w-md"
    >
      <List
        loading={loading}
        dataSource={starList}
        locale={{ emptyText: '暂无收藏内容' }}
        renderItem={(item: StarItem) => (
          <List.Item className="px-0 py-2">
            <div className="w-full">
              <div className="flex items-start justify-between mb-1">
                <Text strong className="text-sm">
                  打卡 #{item.punch.ID}
                </Text>
                <div className="flex items-center space-x-1">
                  <Tag 
                    color={getStatusColor(item.punch.status)} 
                  >
                    {item.punch.status === 0 ? '待审' : 
                     item.punch.status === 1 ? '通过' : '拒绝'}
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    {formatShortDate(item.created_at)}
                  </Text>
                </div>
              </div>
              <Text 
                type="secondary" 
                className="text-xs block"
                ellipsis={{ tooltip: item.punch.content }}
              >
                {item.punch.content || '暂无内容'}
              </Text>
            </div>
          </List.Item>
        )}
      />
      
      {starList.length > 0 && (
        <div className="mt-3 text-center">
          <Button 
            type="link" 
            size="small"
            onClick={() => fetchStarList(pagination.current + 1)}
            disabled={loading}
          >
            查看更多
          </Button>
        </div>
      )}
    </Card>
  );
};

export default StarListExample;
