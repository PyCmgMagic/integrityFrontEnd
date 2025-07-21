import { Card, Typography } from 'antd';

const { Title } = Typography;

const ExportDataPage = () => {
  return (
    <div>
      <Title level={2}>导出数据</Title>
      <Card>
        <p>这里将支持按活动/项目/栏目多选导出打卡记录表格</p>
      </Card>
    </div>
  );
};

export default ExportDataPage; 