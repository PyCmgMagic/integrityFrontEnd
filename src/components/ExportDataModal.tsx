import React, { useState } from 'react';
import { Modal, Form, DatePicker, Button, Checkbox, Radio, Space, Divider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

// 导出选项类型定义
interface ExportOptions {
  dateRange: [Dayjs, Dayjs] | null;
  format: 'csv' | 'excel' | 'pdf';
  dataTypes: string[];
}

// 组件Props类型定义
interface ExportDataModalProps {
  visible: boolean;
  onCancel: () => void;
  onExport: (options: ExportOptions) => void;
}

/**
 * 导出活动数据的模态框组件
 * @param visible 是否显示模态框
 * @param onCancel 取消回调函数
 * @param onExport 导出回调函数
 */
const ExportDataModal: React.FC<ExportDataModalProps> = ({ visible, onCancel, onExport }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 重置表单
  const resetForm = () => {
    form.resetFields();
  };

  // 处理取消
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // 处理导出
  const handleExport = () => {
    setLoading(true);
    form.validateFields()
      .then(values => {
        const exportOptions: ExportOptions = {
          dateRange: values.dateRange,
          format: values.format,
          dataTypes: values.dataTypes,
        };
        onExport(exportOptions);
        resetForm();
        setLoading(false);
      })
      .catch(info => {
        console.log('表单验证失败:', info);
        setLoading(false);
      });
  };

  return (
    <Modal
      title="导出活动数据"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>取消</Button>,
        <Button 
          key="submit" 
          type="primary" 
          icon={<DownloadOutlined />}
          loading={loading} 
          onClick={handleExport}
        >
          导出
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ format: 'excel', dataTypes: ['activities', 'checkins'] }}>
        <Form.Item name="dateRange" label="时间范围" rules={[{ required: true, message: '请选择时间范围!' }]}>
          <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
        </Form.Item>

        <Divider orientation="left">导出格式</Divider>
        <Form.Item name="format" label="文件格式">
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="csv">CSV 格式</Radio>
              <Radio value="excel">Excel 格式</Radio>
              <Radio value="pdf">PDF 格式</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Divider orientation="left">数据选择</Divider>
        <Form.Item name="dataTypes" label="导出数据类型" rules={[{ required: true, message: '请至少选择一种数据类型!' }]}>
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="activities">活动基本信息</Checkbox>
              <Checkbox value="checkins">打卡记录</Checkbox>
              <Checkbox value="participants">参与者信息</Checkbox>
              <Checkbox value="comments">评论数据</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExportDataModal;