import { Card, Typography } from 'antd';

const { Title } = Typography;

const CreateProjectPage = () => {
  return (
    <div>
      <Title level={2}>创建项目</Title>
      <Card>
        <p>这里将包含项目创建表单：项目名称、简介、时间范围、封面等</p>
      </Card>
    </div>
  );
};

export default CreateProjectPage; 