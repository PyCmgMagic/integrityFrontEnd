import React from 'react';
import { Button, Card, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * 活动详情页面测试组件
 * 用于测试不同的活动ID和路由参数
 */
const ActivityTest: React.FC = () => {
  const navigate = useNavigate();

  /**
   * 测试不同的活动ID
   */
  const testActivityIds = [1, 2, 3, 999, -1];

  /**
   * 跳转到活动详情页面
   */
  const goToActivity = (id: number) => {
    const url = `/admin/activity/${id}`;
    console.log('🔗 跳转到活动详情页面:', url);
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card title="活动详情页面测试" className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <p className="text-gray-600">
            点击下面的按钮测试不同活动ID的详情页面加载情况：
          </p>
          
          <Space wrap>
            {testActivityIds.map(id => (
              <Button 
                key={id}
                type={id > 0 ? "primary" : "default"}
                danger={id < 0}
                onClick={() => goToActivity(id)}
              >
                测试活动 {id}
              </Button>
            ))}
          </Space>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">测试说明：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 正常ID (1, 2, 3): 应该正常加载或显示"活动不存在"</li>
              <li>• 大ID (999): 测试不存在的活动</li>
              <li>• 负数ID (-1): 测试无效参数处理</li>
            </ul>
          </div>

          <div className="mt-4">
            <Button onClick={() => navigate('/admin/home')}>
              返回管理首页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityTest;