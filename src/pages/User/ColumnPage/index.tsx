import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const ColumnPage = () => {
  const { id } = useParams();
  
  return (
    <div className="p-4">
      <Card>
        <Title level={2}>栏目页</Title>
        <Text>栏目ID: {id}</Text>
        <p>这里将展示栏目简介、打卡记录、我要打卡按钮等</p>
      </Card>
    </div>
  );
};

export default ColumnPage; 