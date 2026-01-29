
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select } from 'antd';
import AvatarUpload from './Upload/AvatarUpload';
import type { UserProfile, UserProfileForm } from '../types/types'; 
import { COLLEGE_MAJOR_PRESETS } from '../constants/profilePresets';

const GRADE_YEARS = [2019,2020, 2021, 2022, 2023, 2024, 2025] as const;

const normalizeUnsetToUndefined = (v?: string) => {
  if (!v) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  if (s === '未设置' || s === '暂无' || s === '暂无信息') return undefined;
  return s;
};

const normalizeGradeToYear = (grade?: string) => {
  const s = normalizeUnsetToUndefined(grade);
  if (!s) return undefined;

  const match = s.match(/\b(20\d{2})\b/);
  if (!match) return s;

  const year = match[1];
  return GRADE_YEARS.includes(Number(year) as (typeof GRADE_YEARS)[number]) ? year : s;
};

// 定义组件的 props 类型
interface EditProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (data: UserProfile) => void;
  currentUser: UserProfile;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onCancel, onSave, currentUser }) => {
  const [form] = Form.useForm<UserProfileForm>();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser?.avatar);
  const selectedCollege = Form.useWatch('college', form);
  const selectedMajor = Form.useWatch('major', form);
  const selectedGrade = Form.useWatch('grade', form);

  const collegeOptions = useMemo(() => {
    const options = Object.keys(COLLEGE_MAJOR_PRESETS).map((college) => ({ label: college, value: college }));
    const current = normalizeUnsetToUndefined(currentUser?.college);
    if (current && !options.some((o) => o.value === current)) return [{ label: current, value: current }, ...options];
    return options;
  }, [currentUser?.college]);

  const gradeOptions = useMemo(() => {
    const options = GRADE_YEARS.map((year) => ({ label: String(year), value: String(year) }));
    const current = normalizeGradeToYear((selectedGrade as string | undefined) ?? currentUser?.grade);
    if (current && !options.some((o) => o.value === current)) return [{ label: current, value: current }, ...options];
    return options;
  }, [selectedGrade, currentUser?.grade]);

  const majorOptions = useMemo(() => {
    const college = normalizeUnsetToUndefined(selectedCollege);
    const majors = (college && COLLEGE_MAJOR_PRESETS[college]) || [];
    const options = majors.map((m) => ({ label: m, value: m }));
    const current = normalizeUnsetToUndefined(selectedMajor);
    if (current && !options.some((o) => o.value === current)) return [{ label: current, value: current }, ...options];
    return options;
  }, [selectedCollege, selectedMajor]);

  useEffect(() => {
    if (currentUser && visible) {
      setAvatarUrl(currentUser.avatar);
      form.setFieldsValue({
        ...currentUser,
        grade: normalizeGradeToYear(currentUser.grade),
        college: normalizeUnsetToUndefined(currentUser.college),
        major: normalizeUnsetToUndefined(currentUser.major),
      });
    }
  }, [currentUser, visible, form]);

  /**
   * 处理表单保存
   */
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        const updatedData = {
          ...currentUser,
          ...values,
          // 使用上传后的头像URL，如果没有则保留旧头像或设置默认值
          avatar: avatarUrl || '/assets/默认头像.png',
          // 将Dayjs对象转换为字符串格式
          dob: values.dob ? (typeof values.dob === 'string' ? values.dob : values.dob.format('YYYY-MM-DD')) : null,
        };
        onSave(updatedData);
      })
      .catch(() => {});
  };



  return (
    <Modal
      title="编辑个人信息"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" onClick={handleSave}>保存</Button>,
      ]}

    >
      <Form form={form} layout="vertical">
        <Form.Item label="" className="flex justify-center">
            <AvatarUpload
                value={avatarUrl}
                onChange={setAvatarUrl}
                size={100}
                maxSize={5}
                className="avatar-uploader"
            />
        </Form.Item>

        <Form.Item
          name="name"
          label="姓名"
          tooltip="姓名不可修改"
          rules={[{ required: true, message: '姓名缺失，请联系管理员补全' }]}
        >
          <Input placeholder="姓名" disabled />
        </Form.Item>

        <Form.Item name="nick_name" label="昵称">
          <Input placeholder="请输入昵称" />
        </Form.Item>

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="college" label="学院">
                    <Select
                      placeholder="请选择学院"
                      options={collegeOptions}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={(nextCollege) => {
                        const majors = (nextCollege && COLLEGE_MAJOR_PRESETS[String(nextCollege)]) || [];
                        const currentMajor = selectedMajor;
                        if (currentMajor && !majors.includes(String(currentMajor))) {
                          form.setFieldValue('major', undefined);
                        }
                      }}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="major" label="专业">
                    <Select
                      placeholder={selectedCollege ? '请选择专业' : '请先选择学院'}
                      options={majorOptions}
                      allowClear
                      disabled={!selectedCollege}
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                </Form.Item>
            </Col>
        </Row>

        <Form.Item name="grade" label="年级">
            <Select placeholder="请选择年级" options={gradeOptions} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
