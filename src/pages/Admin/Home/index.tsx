import { Card, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AdminHomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <Title level={2}>管理端首页</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/create/activity')}
        >
          创建活动
        </Button>
      </div>
      
      <Card>
        <p>这里将展示与用户端首页一致的活动列表，增加管理功能</p>
      </Card>
    </div>
  );
};

export default AdminHomePage; 