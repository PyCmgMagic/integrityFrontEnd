import { Card, Typography } from 'antd';

const { Title } = Typography;

const CreateColumnPage = () => {
  return (
    <div>
      <Title level={2}>创建栏目</Title>
      <Card>
        <p>这里将包含栏目创建表单：栏目名称、简介、封面、得分设置等</p>
      </Card>
    </div>
  );
};

export default CreateColumnPage; 