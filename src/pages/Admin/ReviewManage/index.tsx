import { Card, Typography } from 'antd';

const { Title } = Typography;

const ReviewManagePage = () => {
  return (
    <div>
      <Title level={2}>审核管理</Title>
      <Card>
        <p>这里将展示活动-项目-栏目结构树，选择栏目后显示打卡记录</p>
      </Card>
    </div>
  );
};

export default ReviewManagePage; 