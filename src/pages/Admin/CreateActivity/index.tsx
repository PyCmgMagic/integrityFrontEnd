import { Card, Typography } from 'antd';

const { Title } = Typography;

const CreateActivityPage = () => {
  return (
    <div>
      <Title level={2}>创建活动</Title>
      <Card>
        <p>这里将包含活动创建表单：活动名称、简介、时间范围、封面等</p>
      </Card>
    </div>
  );
};

export default CreateActivityPage; 