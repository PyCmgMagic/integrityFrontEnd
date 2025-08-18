import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Drawer, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { API } from '../../../services/api';
import { CoverUpload } from '../../../components';

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
 * 栏目编辑弹窗组件
 */
interface EditColumnModalProps {
  visible: boolean;
  onClose: () => void;
  onFinish?: (values: any) => void;
  initialData?: any;
  projectId: number; // 项目ID，用于创建栏目
}

const EditColumnModal: React.FC<EditColumnModalProps> = ({ visible, onClose, onFinish, initialData, projectId }) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

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
        setImageUrl('');
        setStartTime(null);
        setEndTime(null);
      }
    }
  }, [initialData, visible, form]);

  /**
   * 处理封面图片变化
   * @param url - 新的图片URL
   */
  const handleCoverChange = (url: string) => {
    setImageUrl(url);
    form.setFieldsValue({ cover: url });
  };

  const handleFormSubmit = async (values: any) => {
    // 验证时间范围
    if (!startTime || !endTime) {
      message.error('请选择完整的活动时间范围');
      return;
    }

    if (endTime.isBefore(startTime)) {
      message.error('结束时间不能早于开始时间');
      return;
    }

    if (!imageUrl) {
      message.error('请上传栏目封面');
      return;
    }

    try {
      setLoading(true);

      // 准备API请求数据
      const apiData = {
        name: values.name,
        description: values.description,
        project_id: projectId,
        start_date: parseInt(startTime.format('YYYYMMDD')), // 转换为数字格式
        end_date: parseInt(endTime.format('YYYYMMDD')), // 转换为数字格式
        avatar: imageUrl, // 使用avatar字段名
      };

      if (initialData?.id) {
        // 更新栏目
        await API.Column.updateColumn(initialData.id, apiData);
        message.success('栏目更新成功！');
      } else {
        // 创建栏目
        const result = await API.Column.createColumn(apiData);
        message.success('栏目创建成功！');
      }

      // 调用父组件的回调函数
      if (onFinish) {
        onFinish({
          ...values,
          cover: imageUrl,
          timeRange: [startTime, endTime]
        });
      }

      onClose();
    } catch (error: any) {
      console.error('栏目操作失败:', error);
      message.error(error.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? "编辑栏目" : "新建栏目"}
      open={visible}
      onCancel={onClose}
      footer={null}
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
          <CoverUpload
            value={imageUrl}
            onChange={handleCoverChange}
            placeholder="上传栏目封面"
            height="h-40"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: '20px' }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="small"
            shape="default"
            loading={loading}
          >
            {loading ? '提交中...' : '完成'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditColumnModal;