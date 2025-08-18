import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, message, Drawer, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { ActivityAPI } from '../services/api';
import { transformActivityToCreateRequest } from '../utils/dataTransform';
import SingleImageUpload from './Upload/SingleImageUpload';
import CoverUpload from './Upload/CoverUpload';

const { TextArea } = Input;

// 导入活动类型定义

/**
 * 移动端友好的日期时间选择器组件
 */
interface MobileDateTimePickerProps {
  value?: Dayjs;
  onChange?: (date: Dayjs | null) => void;
  placeholder?: string;
  minDate?: Dayjs;
}

const MobileDateTimePicker: React.FC<MobileDateTimePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "请选择日期",
  minDate 
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<string>('');
  const [tempTime, setTempTime] = useState<string>('');

  useEffect(() => {
    if (value) {
      setTempDate(value.format('YYYY-MM-DD'));
      setTempTime(value.format('HH:mm'));
    }
  }, [value]);

  const handleConfirm = () => {
    if (tempDate && tempTime) {
      const combinedDateTime = dayjs(`${tempDate} ${tempTime}`);
      if (minDate && combinedDateTime.isBefore(minDate)) {
        message.error('选择的时间不能早于开始时间');
        return;
      }
      onChange?.(combinedDateTime);
      setPickerVisible(false);
    } else {
      message.error('请选择完整的日期和时间');
    }
  };

  const displayValue = value ? value.format('YYYY-MM-DD HH:mm') : '';

  return (
    <>
      <div 
        className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => setPickerVisible(true)}
      >
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <CalendarOutlined className="text-gray-400" />
      </div>

      <Drawer
        title="选择日期时间"
        placement="bottom"
        open={pickerVisible}
        onClose={() => setPickerVisible(false)}
        height="auto"
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setPickerVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleConfirm}>确定</Button>
          </Space>
        }
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择日期</label>
            <input
              type="date"
              value={tempDate}
              min={minDate ? minDate.format('YYYY-MM-DD') : undefined}
              onChange={(e) => setTempDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择时间</label>
            <input
              type="time"
              value={tempTime}
              onChange={(e) => setTempTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg"
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};

// 组件Props类型定义
interface CreateActivityModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

/**
 * 创建活动的模态框组件
 * @param visible 是否显示模态框
 * @param onCancel 取消回调函数
 * @param onSuccess 成功回调函数
 */
const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  // 时间范围状态
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  /**
   * 重置表单和所有状态
   */
  const resetForm = () => {
    form.resetFields();
    setCoverImageUrl(undefined);
    setStartTime(null);
    setEndTime(null);
  };

  // 处理取消
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // 处理保存
  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      
      // 验证时间范围
      if (!startTime || !endTime) {
        message.error('请选择完整的活动时间范围');
        setLoading(false);
        return;
      }
      
      if (endTime.isBefore(startTime)) {
        message.error('结束时间不能早于开始时间');
        setLoading(false);
        return;
      }
      // 使用封面图片URL，如果没有上传则使用默认图片
      const avatar = coverImageUrl || `https://picsum.photos/300/200?random=${Date.now()}`;
      
      const createData = transformActivityToCreateRequest({
        name: values.title,
        description: values.description,
        cover: avatar,
        startTime: startTime.format('YYYY-MM-DD'),
        endTime: endTime.format('YYYY-MM-DD'),
      });

      await ActivityAPI.createActivity(createData);
      
      message.success('活动创建成功！');
      resetForm();
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('创建活动失败:', error);
      message.error('创建活动失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理封面图片变化
   * @param url 图片URL
   */
  const handleCoverImageChange = (url: string) => {
    setCoverImageUrl(url);
    form.setFieldsValue({ avatar: url });
  };

  return (
    <Modal
      title="创建新活动"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSave}
        >
          创建活动
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="活动标题" rules={[{ required: true, message: '请输入活动标题!' }]}>
          <Input placeholder="请输入活动标题" />
        </Form.Item>

        <Form.Item name="description" label="活动描述" rules={[{ required: true, message: '请输入活动描述!' }]}>
          <TextArea rows={3} placeholder="请描述活动内容..." />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">活动时间</span>}
          required
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-2">请选择开始时间</div>
              <MobileDateTimePicker
                value={startTime || undefined}
                onChange={setStartTime}
                placeholder="请选择开始时间"
              />
            </div>
            
            <div className="flex justify-center">
              <div className="w-8 h-px bg-gray-300 self-center"></div>
            </div>
             
            <div> 
              <div className="text-sm text-gray-600 mb-2">请选择结束时间</div>
              <MobileDateTimePicker
                value={endTime || undefined}
                onChange={setEndTime}
                placeholder="请选择结束时间"
                minDate={startTime || undefined}
              />
            </div>
          </div>
        </Form.Item>
        <Form.Item name="coverImage" label="活动封面">
          <CoverUpload
            value={coverImageUrl}
            onChange={handleCoverImageChange}
          />
        </Form.Item>

        <Form.Item name="rules" label="活动规则">
          <TextArea rows={4} placeholder="请输入活动规则..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateActivityModal;