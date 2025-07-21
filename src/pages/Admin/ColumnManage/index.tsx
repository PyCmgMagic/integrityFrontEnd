import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const ColumnManagePage = () => {
  const { id } = useParams();
  
  return (
    <div>
      <Title level={2}>栏目管理</Title>
      <Card>
        <Text>栏目ID: {id}</Text>
        <p>这里将支持修改栏目、按日期筛选打卡记录、审核状态管理等功能</p>
      </Card>
    </div>
  );
};

export default ColumnManagePage; 