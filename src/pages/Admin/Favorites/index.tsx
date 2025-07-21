import { Card, Typography } from 'antd';

const { Title } = Typography;

const FavoritesPage = () => {
  return (
    <div>
      <Title level={2}>我的收藏</Title>
      <Card>
        <p>这里将展示已收藏的打卡内容，支持查看详情和导出功能</p>
      </Card>
    </div>
  );
};

export default FavoritesPage; 