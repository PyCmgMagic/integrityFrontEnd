import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const ProjectDetailPage = () => {
  const { activityId, projectId } = useParams();
  
  return (
    <div className="p-4">
      <Card>
        <Title level={2}>项目详情页</Title>
        <Text>活动ID: {activityId}</Text>
        <br />
        <Text>项目ID: {projectId}</Text>
        <p>这里将展示项目简介、打卡规则、栏目列表等</p>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;