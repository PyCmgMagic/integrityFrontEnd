import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Drawer, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { API } from '../../../services/api';
import { CoverUpload } from '../../../components';

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
      if (minDate && selectedDate.isBefore(minDate)) {
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
        <div className="p-4">
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
 * 时间选择器组件
 */
interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "请选择时间"
}) => {
  return (
    <input
      type="time"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:border-blue-400 focus:outline-none"
    />
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

  // 日期范围状态
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  // 每日打卡时间段状态
  const [dailyStartTime, setDailyStartTime] = useState<string>('');
  const [dailyEndTime, setDailyEndTime] = useState<string>('');

  // 当弹窗打开或初始数据变化时，同步表单数据
  useEffect(() => {
    if (visible) {
      if (initialData) {
        // 设置表单所有字段的值
        form.setFieldsValue({ ...initialData });

        if (initialData.avatar) {
          setImageUrl(initialData.avatar);
        }

        // 设置日期状态（从start_date和end_date数字格式转换）
        if (initialData.start_date) {
          const startDateStr = initialData.start_date.toString();
          const formattedStartDate = `${startDateStr.slice(0, 4)}-${startDateStr.slice(4, 6)}-${startDateStr.slice(6, 8)}`;
          setStartDate(dayjs(formattedStartDate));
        }
        if (initialData.end_date) {
          const endDateStr = initialData.end_date.toString();
          const formattedEndDate = `${endDateStr.slice(0, 4)}-${endDateStr.slice(4, 6)}-${endDateStr.slice(6, 8)}`;
          setEndDate(dayjs(formattedEndDate));
        }

        // 设置每日打卡时间
        if (initialData.start_time) {
          setDailyStartTime(initialData.start_time);
        }
        if (initialData.end_time) {
          setDailyEndTime(initialData.end_time);
        }
      } else {
        // 如果是新建栏目，则清空所有状态
        form.resetFields();
        setImageUrl('');
        setStartDate(null);
        setEndDate(null);
        setDailyStartTime('');
        setDailyEndTime('');
      }
    }
  }, [initialData, visible, form]);

  /**
   * 处理封面图片变化
   * @param url - 新的图片URL
   */
  const handleCoverChange = (url: string) => {
    setImageUrl(url);
    form.setFieldsValue({ avatar: url });
  };

  const handleFormSubmit = async (values: any) => {
    // 验证日期范围
    if (!startDate || !endDate) {
      message.error('请选择完整的栏目日期范围');
      return;
    }

    if (endDate.isBefore(startDate)) {
      message.error('结束日期不能早于开始日期');
      return;
    }

    // 验证每日打卡时间
    if (!dailyStartTime || !dailyEndTime) {
      message.error('请选择完整的每日打卡时间段');
      return;
    }

    if (dailyEndTime <= dailyStartTime) {
      message.error('每日打卡结束时间必须晚于开始时间');
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
        start_date: parseInt(startDate.format('YYYYMMDD')), // 转换为数字格式
        end_date: parseInt(endDate.format('YYYYMMDD')), // 转换为数字格式
        start_time: dailyStartTime, // 每日打卡开始时间
        end_time: dailyEndTime, // 每日打卡结束时间
        avatar: imageUrl, // 使用avatar字段名
        daily_punch_limit: parseInt(values.daily_punch_limit), // 每日可打卡次数
        point_earned: parseInt(values.point_earned), // 每次打卡获得积分
      };

      if (initialData?.id) {
        // 更新栏目
        await API.Column.updateColumn(initialData.id, apiData);
        message.success('栏目更新成功！');
      } else {
        // 创建栏目
        await API.Column.createColumn(apiData);
        message.success('栏目创建成功！');
      }

      // 调用父组件的回调函数
      if (onFinish) {
        onFinish({
          ...values,
          cover: imageUrl,
          start_date: parseInt(startDate.format('YYYYMMDD')),
          end_date: parseInt(endDate.format('YYYYMMDD')),
          start_time: dailyStartTime,
          end_time: dailyEndTime
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
          name="dateRange"
          label={<span className="font-semibold text-gray-700">栏目日期范围</span>}
          required
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-2">开始日期</div>
              <MobileDatePicker
                value={startDate || undefined}
                onChange={setStartDate}
                placeholder="请选择开始日期"
              />
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-px bg-gray-300 self-center"></div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">结束日期</div>
              <MobileDatePicker
                value={endDate || undefined}
                onChange={setEndDate}
                placeholder="请选择结束日期"
                minDate={startDate || undefined}
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item
          name="dailyTimeRange"
          label={<span className="font-semibold text-gray-700">每日打卡时间段</span>}
          required
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-2">每日开始时间</div>
              <TimePicker
                value={dailyStartTime}
                onChange={setDailyStartTime}
                placeholder="请选择每日开始时间"
              />
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-px bg-gray-300 self-center"></div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">每日结束时间</div>
              <TimePicker
                value={dailyEndTime}
                onChange={setDailyEndTime}
                placeholder="请选择每日结束时间"
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item
          name="avatar"
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

        <Form.Item
          name="daily_punch_limit"
          label={<span className="font-semibold text-gray-700">每日可打卡次数</span>}
          rules={[
            { required: true, message: '请输入每日可打卡次数' },
            { type: 'number', min: 1, max: 100, message: '请输入1-100之间的数字' }
          ]}
          initialValue={1}
        >
          <Input type="number" placeholder="请输入每日可打卡次数" min={1} max={100} />
        </Form.Item>

        <Form.Item
          name="point_earned"
          label={<span className="font-semibold text-gray-700">每次打卡获得积分</span>}
          rules={[
            { required: true, message: '请输入每次打卡获得积分' },
            { type: 'number', min: 1, max: 1000, message: '请输入1-1000之间的数字' }
          ]}
          initialValue={1}
        >
          <Input type="number" placeholder="请输入每次打卡获得积分" min={1} max={1000} />
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