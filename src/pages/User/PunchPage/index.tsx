import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const PunchPage = () => {
  const { id } = useParams();
  
  return (
    <div className="p-4">
      <Card>
        <Title level={2}>打卡页</Title>
        <Text>栏目ID: {id}</Text>
        <p>这里将包含打卡表单：文本输入、图片上传、提交功能</p>
      </Card>
    </div>
  );
};

export default PunchPage; 