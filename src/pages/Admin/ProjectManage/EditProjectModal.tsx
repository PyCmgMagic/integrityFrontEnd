import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Drawer, Space, Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { DEFAULT_PROJECT_ICON_NAME, PROJECT_ICON_OPTIONS } from '../../../utils/projectIcons';
import { FIELD_LIMITS } from '../../../utils/fieldLimits';

const { TextArea } = Input;
const PROJECT_ICON_SELECT_OPTIONS = PROJECT_ICON_OPTIONS.map((option) => ({
  value: option.name,
  label: (
    <span className="flex items-center gap-2">
      <option.Icon />
      {option.label}
    </span>
  ),
}));

/**
 * 移动端友好的日期时间选择器组件?
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
      message.error('选择的时间不能早于开始时间。');
        return;
      }
      onChange?.(combinedDateTime);
      setPickerVisible(false);
    } else {
      message.error('请选择日期和时间。');
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
interface EditProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onFinish?: (values: any) => void;
  initialData?: any;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ visible, onClose, onFinish, initialData }) => {
  const [form] = Form.useForm();
  
  // 时间范围状态?
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        // initialData 中的日期字符串转换为 dayjs 对象
        const initialTimeRange = initialData.timeRange 
          ? [dayjs(initialData.timeRange[0]), dayjs(initialData.timeRange[1])]
          : [null, null];

        const resolvedInitialData = {
          ...initialData,
          avatar: initialData.avatar || DEFAULT_PROJECT_ICON_NAME,
        };
        // 设置表单所有字段的信息?
        form.setFieldsValue(resolvedInitialData);
        
        // 设置时间状态?
        setStartTime(initialTimeRange[0]);
        setEndTime(initialTimeRange[1]);
      } else {
        // 如果是新建活动，则清空所有状态?
        form.resetFields();
        form.setFieldsValue({ avatar: DEFAULT_PROJECT_ICON_NAME });
        setStartTime(null);
        setEndTime(null);
      }
    }
  }, [initialData, visible, form]);

  const handleFormSubmit = (values: any) => {
    // 验证时间范围
    if (!startTime || !endTime) {
      message.error('请选择项目时间范围。');
      return;
    }
    
    if (endTime.isBefore(startTime)) {
      message.error('结束时间不能早于开始时间。');
      return;
    }

    if (onFinish) {
      onFinish({ 
        ...values, 
        timeRange: [startTime, endTime]
      });
    }
  };

  return (
    <Modal
      title={initialData ? "编辑项目" : "新建项目"}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={380}
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item 
          name="name" 
          label={<span className="font-semibold text-gray-700">项目名称</span>} 
          rules={[
            { required: true, message: '请输入项目名称(不超过75字)' },
            { max: FIELD_LIMITS.name, message: `项目名称最多 ${FIELD_LIMITS.name} 个字符` },
          ]}
        >
          <Input placeholder="请输入项目名称（不超过75字）" maxLength={FIELD_LIMITS.name} showCount />
        </Form.Item>

        <Form.Item 
          name="description" 
          label={<span className="font-semibold text-gray-700">项目详情说明</span>} 
          rules={[
            { required: true, message: '请输入项目详情说明（不超过200字）' },
            { max: FIELD_LIMITS.description, message: `项目描述最多 ${FIELD_LIMITS.description} 个字符` },
          ]}
        >
          <TextArea rows={8} placeholder="请输入项目详情说明（不超过200字）" maxLength={FIELD_LIMITS.description} showCount />
        </Form.Item>

        <Form.Item
          name="avatar"
          label={<span className="font-semibold text-gray-700">项目图标</span>}
          rules={[{ required: true, message: '请选择项目图标' }]}
        >
          <Select
            options={PROJECT_ICON_SELECT_OPTIONS}
            optionLabelProp="label"
            placeholder="选择项目图标"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">项目时间</span>}
          required
        >
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-2">请选择开始时间</div>
              <MobileDateTimePicker
                value={startTime || undefined}
                onChange={setStartTime}
                placeholder="请选择开始时间" />
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

                <Form.Item
          name="completion_bonus"
          label={<span className="font-semibold text-gray-700">完成奖励</span>}
          rules={[
            {
              validator: (_, value) => {
                if (value === undefined || value === null || value === '') {
                  return Promise.resolve();
                }

                const numValue = Number(value);
                if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
                  return Promise.reject('请输入非负整数');
                }

                return Promise.resolve();
              }
            }
          ]}
          extra="0 表示无奖励"
        >
          <Input
            type="number"
            placeholder="请输入完成奖励（0 表示无）"
            min={0}
          />
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

export default EditProjectModal;






