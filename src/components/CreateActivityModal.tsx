import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button,  message, Drawer, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { ActivityAPI } from '../services/api';
import { transformActivityToCreateRequest } from '../utils/dataTransform';
import CoverUpload from './Upload/CoverUpload';
import { FIELD_LIMITS } from '../utils/fieldLimits';

const { TextArea } = Input;

// 导入活动类型定义

/**
 * 移动端友好的日期选择器组件
 */
interface MobileDatePickerProps {
  value?: Dayjs;
  onChange?: (date: Dayjs | null) => void;
  placeholder?: string;
  minDate?: Dayjs;
}

const MobileDatePicker: React.FC<MobileDatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "请选择日期",
  minDate 
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<string>('');

  useEffect(() => {
    if (value) {
      setTempDate(value.format('YYYY-MM-DD'));
    }
  }, [value]);

  const handleConfirm = () => {
    if (tempDate) {
      const selectedDate = dayjs(tempDate);
      if (minDate && selectedDate.isBefore(minDate, 'day')) {
        message.error('选择的日期不能早于开始日期');
        return;
      }
      onChange?.(selectedDate);
      setPickerVisible(false);
    } else {
      message.error('请选择日期');
    }
  };

  const displayValue = value ? value.format('YYYY-MM-DD') : '';

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
        title="选择日期"
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
      
      if (endTime.isBefore(startTime, 'day')) {
        message.error('结束日期不能早于开始日期');
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
        dailyPointLimit: values.daily_point_limit !== undefined && values.daily_point_limit !== null ? parseInt(values.daily_point_limit) : undefined,
        completionBonus: values.completion_bonus !== undefined && values.completion_bonus !== null ? parseInt(values.completion_bonus) : undefined,
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
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="活动标题"
          rules={[
            { required: true, message: '请输入活动标题(不超过75字)' },
            { max: FIELD_LIMITS.name, message: `活动标题最多 ${FIELD_LIMITS.name} 个字符` },
          ]}
        >
          <Input placeholder="请输入活动标题(不超过75字)" maxLength={FIELD_LIMITS.name} showCount />
        </Form.Item>

        <Form.Item
          name="description"
          label="活动描述"
          rules={[
            { required: true, message: '请输入活动描述（不超过200字）!' },
            { max: FIELD_LIMITS.description, message: `活动描述最多 ${FIELD_LIMITS.description} 个字符` },
          ]}
        >
          <TextArea rows={3} placeholder="请描述活动内容...（不超过200字）" maxLength={FIELD_LIMITS.description} showCount />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">活动时间</span>}
          required
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-2">请选择开始时间</div>
              <MobileDatePicker
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
              <MobileDatePicker
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

<Form.Item name="daily_point_limit" label="每日积分上限" 
          rules={[
            { 
              validator: (_, value) => {
                // 如果值为空或undefined，允许通过
                if (value === undefined || value === null || value === '') {
                  return Promise.resolve();
                }
                
                // 转换为数字进行验证
                const numValue = Number(value);
                
                // 验证是否为有效数字且大于等于0的整数
                if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
                  return Promise.reject('请输入大于等于0的整数');
                }
                
                return Promise.resolve();
              }
            }
          ]}
          extra="0代表不设置上限">
          <Input 
            type="number" 
            placeholder="请输入每日积分上限，0代表不设置上限" 
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="completion_bonus"
          label="完成全部栏目奖励积分"
          rules={[
            {
              validator: (_, value) => {
                // 如果值为空或undefined，允许通过
                if (value === undefined || value === null || value === '') {
                  return Promise.resolve();
                }

                // 转换为数字进行验证
                const numValue = Number(value);

                // 验证是否为有效数字且大于等于0的整数
                if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
                  return Promise.reject('请输入大于等于0的整数');
                }

                return Promise.resolve();
              }
            }
          ]}
          extra="0代表不设置奖励"
        >
          <Input
            type="number"
            placeholder="请输入完成全部栏目奖励积分，0代表不设置奖励"
            min={0}
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
