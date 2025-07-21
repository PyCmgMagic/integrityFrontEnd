import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const EditPunchPage = () => {
  const { id } = useParams();
  
  return (
    <div className="p-4">
      <Card>
        <Title level={2}>打卡修改页</Title>
        <Text>打卡记录ID: {id}</Text>
        <p>这里将复用打卡页组件，加载现有数据并支持修改</p>
      </Card>
    </div>
  );
};

export default EditPunchPage; 