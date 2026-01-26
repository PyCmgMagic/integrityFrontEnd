import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, message, Drawer, Space } from 'antd';
import { LoadingOutlined, CalendarOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs, { type Dayjs } from 'dayjs';
import { ActivityAPI } from '../../../services/api';
import { transformActivityToUpdateRequest } from '../../../utils/dataTransform';

const { TextArea } = Input;

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

/**
 * 活动编辑弹窗组件
 */
interface EditActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  activityId?: number;
  initialData?: any;
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({ visible, onClose, onSuccess,  activityId, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // 时间范围状态
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  // 当弹窗打开或初始数据变化时，同步表单数据
  useEffect(() => {
    if (visible) {
      if (initialData) {
// 设置表单字段值
        form.setFieldsValue({
          name: initialData.name,
          description: initialData.description,
          cover: initialData.cover || initialData.avatar,
          daily_point_limit: initialData.daily_point_limit,
          completion_bonus: initialData.completion_bonus
        });

        // 设置封面图片
        const coverUrl = initialData.cover || initialData.avatar;
        if (coverUrl) {
          setImageUrl(coverUrl);
        }
        
        // 处理时间数据 - 支持多种格式
        let startTimeValue = null;
        let endTimeValue = null;
        
        if (initialData.startTime && initialData.endTime) {
          // 如果是字符串格式的时间
          startTimeValue = dayjs(initialData.startTime);
          endTimeValue = dayjs(initialData.endTime);
        } else if (initialData.timeRange && Array.isArray(initialData.timeRange)) {
          // 如果是时间范围数组
          startTimeValue = dayjs(initialData.timeRange[0]);
          endTimeValue = dayjs(initialData.timeRange[1]);
        }
        
        setStartTime(startTimeValue);
        setEndTime(endTimeValue);
      } else {
        // 如果是新建活动，则清空所有状态
        form.resetFields();
        setImageUrl(null);
        setStartTime(null);
        setEndTime(null);
      }
    }
  }, [initialData, visible, form]);

  // 文件上传相关的函数
  const getBase64 = (img: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as File, (url: string) => {
        setLoading(false);
        setImageUrl(url);
        form.setFieldsValue({ cover: url });
      });
      message.success(`${info.file.name} 文件上传成功`);
    } else if (info.file.status === 'error') {
      setLoading(false);
      message.error(`${info.file.name} 文件上传失败.`);
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('你只能上传 JPG/PNG 格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小必须小于 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  // 自定义的上传按钮
  const uploadButton = (
    <div className="w-full h-full bg-sky-100 bg-opacity-50 flex flex-col items-center justify-center rounded-lg hover:bg-sky-200 transition-colors">
      {loading ? (
        <LoadingOutlined />
      ) : (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center my-2 border-2 border-dashed border-gray-300 bg-white">
            <span className="text-4xl font-bold text-gray-400">+</span>
          </div>
          <p className="text-gray-500">上传封面</p>
        </>
      )}
    </div>
  );

  /**
   * 处理表单提交
   */
  const handleFormSubmit = async (values: any) => {
    // 验证时间范围
    if (!startTime || !endTime) {
      message.error('请选择完整的活动时间范围');
      return;
    }
    
    if (endTime.isBefore(startTime, 'day')) {
      message.error('结束日期不能早于开始日期');
      return;
    }

    // 验证活动ID
    if (!activityId) {
      message.error('缺少活动ID，无法更新活动');
      return;
    }

    // 验证封面图片
    if (!imageUrl) {
      message.error('请上传活动封面');
      return;
    }

    try {
      setSubmitting(true);

// 准备更新数据
      const updateData = transformActivityToUpdateRequest({
        name: values.name,
        description: values.description,
        cover: imageUrl,
        startTime: startTime.format('YYYY-MM-DD'),
        endTime: endTime.format('YYYY-MM-DD'),
        dailyPointLimit: values.daily_point_limit !== undefined && values.daily_point_limit !== null ? parseInt(values.daily_point_limit) : undefined,
        completionBonus: values.completion_bonus !== undefined && values.completion_bonus !== null ? parseInt(values.completion_bonus) : undefined,
      });

      // 调用API更新活动
      await ActivityAPI.updateActivity(activityId, updateData);

      message.success('活动更新成功');
      
      // 重置表单状态
      form.resetFields();
      setImageUrl(null);
      setStartTime(null);
      setEndTime(null);
      
      // 关闭弹窗
      onClose();
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('更新活动失败:', error);
      message.error(error.message || '更新活动失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={initialData ? "编辑活动" : "新建活动"}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={380}
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item 
          name="name" 
          label={<span className="font-semibold text-gray-700">活动名称</span>} 
          rules={[{ required: true, message: '请输入活动名称' }]}
        >
          <Input placeholder="请输入活动名称" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label={<span className="font-semibold text-gray-700">活动详情说明</span>} 
          rules={[{ required: true, message: '请输入活动详情' }]}
        >
          <TextArea rows={8} placeholder="请输入活动详情说明" />
        </Form.Item>
        <Form.Item
          label={<span className="font-semibold text-gray-700">活动时间</span>}
          required
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-2">请选择开始</div>
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
              <div className="text-sm text-gray-600 mb-2">请选择结束</div>
              <MobileDatePicker
                value={endTime || undefined}
                onChange={setEndTime}
                placeholder="请选择结束时间"
                minDate={startTime || undefined}
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item 
          name="cover" 
          label={<span className="font-semibold text-gray-700">设置活动封面</span>} 
          rules={[{ required: true, message: '请上传活动封面' }]}
        >
          <Upload
            name="cover-uploader"
            listType="picture-card"
            className="activity-cover-uploader"
            showUploadList={false}
            action="pic.cloud.rpcrpc.com"
            beforeUpload={beforeUpload}
            onChange={handleChange}
            style={{ width: '100%', height: '100%' }}
          >
            {imageUrl ? (
              <div className="relative w-full h-full group">
                <img src={imageUrl} alt="activity-cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity rounded-lg">
                  <span className="text-white">更换封面</span>
                </div>
              </div>
            ) : (
              uploadButton
            )}
          </Upload>
</Form.Item>

        <Form.Item 
          name="daily_point_limit" 
          label={<span className="font-semibold text-gray-700">每日积分上限</span>}
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
          extra="0代表不设置上限"
        >
          <Input 
            type="number" 
            placeholder="请输入每日积分上限，0代表不设置上限" 
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="completion_bonus"
          label={<span className="font-semibold text-gray-700">完成全部栏目奖励积分</span>}
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

        <Form.Item style={{ marginTop: '20px' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="small" 
            shape="default"
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? '更新中...' : '完成'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditActivityModal;
