import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, message, Drawer, Space } from 'antd';
import { LoadingOutlined, CalendarOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs, { type Dayjs } from 'dayjs';

const { TextArea } = Input;

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

/**
 * 活动编辑弹窗组件
 */
interface EditColumnModalProps {

  visible: boolean;
  onClose: () => void;
  onFinish?: (values: any) => void;
  initialData?: any;
}

const EditColumnModal: React.FC<EditColumnModalProps> = ({ visible, onClose, onFinish, initialData }) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // 时间范围状态
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  // 当弹窗打开或初始数据变化时，同步表单数据
  useEffect(() => {
    if (visible) {
      if (initialData) {
        // 将 initialData 中的日期字符串转换为 dayjs 对象
        const initialTimeRange = initialData.timeRange 
          ? [dayjs(initialData.timeRange[0]), dayjs(initialData.timeRange[1])]
          : [null, null];

        // 设置表单所有字段的值
        form.setFieldsValue({ ...initialData });

        if (initialData.cover) {
          setImageUrl(initialData.cover);
        }
        
        // 设置时间状态
        setStartTime(initialTimeRange[0]);
        setEndTime(initialTimeRange[1]);
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

  const handleFormSubmit = (values: any) => {
    // 验证时间范围
    if (!startTime || !endTime) {
      message.error('请选择完整的活动时间范围');
      return;
    }
    
    if (endTime.isBefore(startTime)) {
      message.error('结束时间不能早于开始时间');
      return;
    }

    if (onFinish) {
      onFinish({ 
        ...values, 
        cover: imageUrl,
        timeRange: [startTime, endTime]
      });
    }
  };

  return (
    <Modal
      title={initialData ? "编辑栏目" : "新建栏目"}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={380}
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item 
          name="name" 
          label={<span className="font-semibold text-gray-700">栏目名称</span>} 
          rules={[{ required: true, message: '请输入栏目名称' }]} 
        >
          <Input placeholder="请输入栏目名称" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label={<span className="font-semibold text-gray-700">栏目详情说明</span>} 
          rules={[{ required: true, message: '请输入栏目详情' }]}
        >
          <TextArea rows={8} placeholder="请输入栏目详情说明" />
        </Form.Item>
        <Form.Item
          name="timeRange"
          label={<span className="font-semibold text-gray-700">栏目时间</span>}
          required
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-2">请选择开始</div>
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
              <div className="text-sm text-gray-600 mb-2">请选择结束</div>
              <MobileDateTimePicker
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
          label={<span className="font-semibold text-gray-700">设置栏目封面</span>} 
          rules={[{ required: true, message: '请上传栏目封面' }]}
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
        
        <Form.Item style={{ marginTop: '20px' }}>
          <Button type="primary" htmlType="submit" block size="small" shape="default">
            完成
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditColumnModal;