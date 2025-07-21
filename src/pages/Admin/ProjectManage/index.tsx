import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const ProjectManagePage = () => {
  const { id } = useParams();
  
  return (
    <div>
      <Title level={2}>项目管理</Title>
      <Card>
        <Text>项目ID: {id}</Text>
        <p>这里将支持修改项目、添加栏目等功能</p>
      </Card>
    </div>
  );
};

export default ProjectManagePage; 