import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const ReviewDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div>
      <Title level={2}>审核详情</Title>
      <Card>
        <Text>打卡记录ID: {id}</Text>
        <p>这里将展示打卡详情、图片预览、审核按钮等功能</p>
      </Card>
    </div>
  );
};

export default ReviewDetailPage; 