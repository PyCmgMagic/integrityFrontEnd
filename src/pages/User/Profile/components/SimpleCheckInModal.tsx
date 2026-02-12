import React, { useState, useEffect } from 'react';
import { Modal, Image, Typography, Button, Input,  message, Space, Tag } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, EditOutlined, SaveOutlined, CloseOutlined, CheckCircleOutlined, CloseCircleOutlined as CloseCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import type { CheckInData } from '../../../../types/types';
import { API } from '../../../../services/api';
import ImageUpload from '../../../../components/Upload/ImageUpload';
import '../../../../styles/SimpleCheckInModal.css';
import { FIELD_LIMITS } from '../../../../utils/fieldLimits';
import { formatInBeijing, isBeijingToday } from '../../../../utils/beijingTime';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SimpleCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  checkInData: CheckInData;
  onUpdate?: (updatedData: CheckInData) => void;
  onRefresh?: () => void; // 新增：用于触发父组件重新获取数据
}

/**
 * 获取状态标签配置
 * @param status 状态值：0-待审核，1-已通过，2-未通过
 * @returns 状态配置对象
 */
const getStatusTagConfig = (status?: number) => {
  switch (status) {
    case 0:
      return {
        text: '待审核',
        color: 'warning',
        icon: <ExclamationCircleOutlined />
      };
    case 1:
      return {
        text: '已通过',
        color: 'success',
        icon: <CheckCircleOutlined />
      };
    case 2:
      return {
        text: '未通过',
        color: 'error',
        icon: <CloseCircleFilled />
      };
    default:
      return {
        text: '未知',
        color: 'default',
        icon: <ExclamationCircleOutlined />
      };
  }
};

/**
 * 简单的打卡详情弹窗组件
 * 专门用于显示CheckInData格式的打卡记录详情，支持编辑功能
 */
const SimpleCheckInModal: React.FC<SimpleCheckInModalProps> = ({
  visible,
  onClose,
  checkInData,
  onUpdate,
  onRefresh
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // 当弹窗打开或数据变化时，重置编辑状态
  useEffect(() => {
    if (visible && checkInData) {
      setEditContent(checkInData.content || '');
      setEditImages(checkInData.imgs || []);
      setIsEditing(false);
    }
  }, [visible, checkInData]);

  /**
   * 格式化日期显示
   * @param dateString 日期字符串
   * @returns 格式化后的日期
   */
  const formatDisplayDate = (dateString: string) => {
    const formatted = formatInBeijing(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    return formatted || dateString;
  };

  /**
   * 判断传入日期是否为“北京时间的今天”
   */
  const isTodayCheckIn = (dateString: string) => {
    if (!dateString) return false;
    return isBeijingToday(dateString);
  };

  /**
   * 处理保存更新
   */
  const handleSave = async () => {
    if (!checkInData.id) {
      message.error('缺少必要的更新参数');
      return;
    }
    if (imageUploading) {
      message.warning('图片上传中，请稍后保存');
      return;
    }
    if (editContent.trim().length > FIELD_LIMITS.checkInContent) {
      message.error(`打卡内容不能超过 ${FIELD_LIMITS.checkInContent} 个字符`);
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        column_id: checkInData.column_id ?? 0,
        content: editContent,
        images: editImages,
        imgs: editImages
      };

      const response = await API.Column.updatePunchRecord(checkInData.id, updateData);
      
      
      // 兼容不同接口返回格式

      const responseAny = response as Partial<CheckInData> & { ID?: number; id?: number; imgs?: string[] };
      const nextImages = Array.isArray(responseAny?.imgs) ? responseAny.imgs : editImages;
      const nextContent = responseAny?.content ?? editContent;

      message.success('更新成功');

      const updatedCheckInData: CheckInData = {
        ...checkInData,
        content: nextContent,
        imgs: nextImages
      };

      onUpdate?.(updatedCheckInData);
      onRefresh?.();

      setIsEditing(false);
    } catch (error) {
      console.error('更新打卡记录失败:', error);
      message.error('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理取消编辑
   */
  const handleCancelEdit = () => {
    setEditContent(checkInData.content || '');
    setEditImages(checkInData.imgs || []);
    setIsEditing(false);
  };



  /**
   * 处理图片变更
   */
  const handleImageChange = (urls: string[]) => {
    setEditImages(urls);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="95%"
      centered
      className="simple-checkin-modal"
      style={{ 
        top: window.innerWidth <= 768 ? 10 : 20,
        maxWidth: window.innerWidth <= 768 ? '100%' : '600px'
      }}
      title={
        <div className="flex justify-between items-center">
          <span>打卡详情</span>
          <Space>
            {!isEditing ? (
              // 只有待审核状态 (status === 0) 允许编辑
              checkInData.status === 0 && isTodayCheckIn(checkInData.date) && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => setIsEditing(true)}
                  size="small"
                >
                  编辑
                </Button>
              )
            ) : (
              <>
                <Button 
                  icon={<SaveOutlined />} 
                  onClick={handleSave}
                  loading={loading}
                  disabled={imageUploading}
                  type="primary"
                  size="small"
                >
                  保存
                </Button>
                <Button 
                  icon={<CloseOutlined />} 
                  onClick={handleCancelEdit}
                  size="small"
                >
                  取消
                </Button>
              </>
            )}
          </Space>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* 上半部分：内容区域 */}
        <div className="flex-1 p-6 bg-white">
          {/* 标题区域 */}
          <div className="mb-6 text-center">
            <Title level={3} className="mb-2 text-gray-800">
              {checkInData.title}
            </Title>
            <div className="flex justify-center items-center gap-4 text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <ClockCircleOutlined />
                <Text type="secondary">{checkInData.time ?? ''}</Text>
              </div>
              <div className="flex items-center gap-1">
                <CalendarOutlined />
                <Text type="secondary">{formatDisplayDate(checkInData.date)}</Text>
              </div>
            </div>
            {/* 状态标签 */}
            {checkInData.status !== undefined && (() => {
              const statusConfig = getStatusTagConfig(checkInData.status);
              return (
                <div className="flex justify-center">
                  <Tag 
                    color={statusConfig.color} 
                    icon={statusConfig.icon}
                    className="px-4 py-1 text-base font-medium"
                  >
                    {statusConfig.text}
                  </Tag>
                </div>
              );
            })()}
          </div>

          {/* 打卡内容 */}
          <div className="mt-4">
            <Title level={5} className="mb-2 text-gray-700">
              打卡内容
            </Title>
            {isEditing ? (
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="请输入打卡内容...（不超过500字）"
                rows={6}
                maxLength={FIELD_LIMITS.checkInContent}
                showCount
                className="resize-none"
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 h-40 overflow-y-auto">
                {checkInData.content ? (
                  <Text className="text-gray-800 whitespace-pre-wrap">
                    {checkInData.content}
                  </Text>
                ) : (
                  <Text type="secondary" italic>
                    用户未填写任何文字内容
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 下半部分：图片区域 */}
        {(isEditing || (checkInData.imgs && checkInData.imgs.length > 0)) && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <Title level={5} className="mb-3 text-gray-700">
              打卡图片
            </Title>
            {isEditing ? (
              <ImageUpload
                value={editImages}
                onChange={handleImageChange}
                onUploadingChange={setImageUploading}
                maxCount={9}
                className="w-full"
              />
            ) : (
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {(checkInData.imgs || []).map((img, index) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg w-24 h-24 md:w-32 md:h-32">
                    <Image
                      src={img}
                      alt={`打卡图片 ${index + 1}`}
                      wrapperClassName="w-full h-full"
                      className="transition-all duration-300 group-hover:scale-105 group-active:scale-95"
                      preview={true}
                      placeholder={
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-3 h-3 md:w-6 md:h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500">加载中</p>
                          </div>
                        </div>
                      }
                      fallback="/assets/cancel-test.png"
                    />
                    {/* 图片序号标识 */}
                    <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SimpleCheckInModal;
