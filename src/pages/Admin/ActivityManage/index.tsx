import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const ActivityManagePage = () => {
  const { id } = useParams();
  
  return (
    <div>
      <Title level={2}>活动管理</Title>
      <Card>
        <Text>活动ID: {id}</Text>
        <p>这里将支持修改活动、新增项目、导出排行榜、设置额外加分等功能</p>
      </Card>
    </div>
  );
};

export default ActivityManagePage; 