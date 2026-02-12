import React, { useEffect } from 'react';
import { Card, Typography, List, Pagination, Spin, Empty, Tag, Button, message } from 'antd';
import { StarFilled, CalendarOutlined, UserOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useStarList } from '../../../hooks/useStarList';
import type { StarItem } from '../../../types/types';
import { formatInBeijing } from '../../../utils/beijingTime';

const { Title, Text, Paragraph } = Typography;

const FavoritesPage: React.FC = () => {
  const {
    starList,
    loading,
    pagination,
    fetchStarList,
    refresh,
  } = useStarList({
    defaultPage: 1,
    defaultPageSize: 10,
    showError: true,
    onSuccess: (data) => {
      console.log('成功获取收藏列表:', data.length, '条记录');
    },
  });

  /**
   * 处理分页变化
   */
  const handlePageChange = (page: number, pageSize?: number) => {
    fetchStarList(page, pageSize || pagination.pageSize);
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string): string => {
    const formatted = formatInBeijing(dateString, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return formatted || dateString;
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
        return <Tag>未知状态</Tag>;
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchStarList();
  }, [fetchStarList]);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Title level={2} className="flex items-center mb-2">
            <StarFilled className="text-yellow-500 mr-2" />
            我的收藏
          </Title>
          <Text type="secondary">
            这里展示您收藏的所有打卡内容，您可以查看详情和管理收藏
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={refresh}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          {starList.length === 0 && !loading ? (
            <Empty
              description="暂无收藏内容"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <List
                dataSource={starList}
                renderItem={(item: StarItem) => (
                  <List.Item
                    key={`${item.punch.ID}-${item.created_at}`}
                    className="border-b border-gray-100 last:border-b-0"
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          // 这里可以添加查看详情的逻辑
                          message.info('查看详情功能待实现');
                        }}
                      >
                        查看详情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                          <StarFilled className="text-white text-lg" />
                        </div>
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <Text strong className="text-lg">
                            打卡记录 #{item.punch.ID}
                          </Text>
                          {getStatusTag(item.punch.status)}
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          <Paragraph
                            ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
                            className="text-gray-600 mb-2"
                          >
                            {item.punch.content || '暂无内容'}
                          </Paragraph>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <UserOutlined className="mr-1" />
                              用户ID: {item.punch.user_id}
                            </span>
                            <span className="flex items-center">
                              <CalendarOutlined className="mr-1" />
                              收藏时间: {formatDate(item.created_at)}
                            </span>
                            <span className="flex items-center">
                              <CalendarOutlined className="mr-1" />
                              打卡时间: {formatDate(item.punch.created_at)}
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />

              {starList.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) =>
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }
                  />
                </div>
              )}
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default FavoritesPage;
