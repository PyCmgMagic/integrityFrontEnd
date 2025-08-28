import React, { useState, useEffect } from 'react';
import { Modal, Image, Typography, Spin, message } from 'antd';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { API } from '../../../../services/api';
import StarButton from '../../ColumnManage/components/StarButton';
import '../../../../styles/SimpleCheckInModal.css';

const { Title, Text } = Typography;

interface CheckInDetailModalProps {
  visible: boolean;
  onClose: () => void;
  punchId: number;
}

interface PunchDetailData {
  imgs: string[];
  punch: {
    ID: number;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    column_id: number;
    user_id: string;
    content: string;
    status: number;
  };
  stared: boolean;
}

/**
 * 打卡详情弹窗组件
 * 用于显示打卡记录详情，数据通过API获取
 */
const CheckInDetailModal: React.FC<CheckInDetailModalProps> = ({
  visible,
  onClose,
  punchId
}) => {
  const [punchDetail, setPunchDetail] = useState<PunchDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // 获取打卡详情数据
  const fetchPunchDetail = async () => {
    if (!punchId) return;
    
    setLoading(true);
    try {
      const response = await API.Column.getPunchDetail(punchId);
      console.log('获取打卡详情成功:', response);
      if (response.code && response.data) {
        setPunchDetail(response.data);
        setIsStarred(response.data.stared);
      } else {
        message.error('获取打卡详情失败');
      }
    } catch (error) {
      console.error('获取打卡详情失败:', error);
      message.error('获取打卡详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗打开时获取数据
  useEffect(() => {
    if (visible && punchId) {
      fetchPunchDetail();
    } else {
      setPunchDetail(null);
      setIsStarred(false);
    }
  }, [visible, punchId]);

  /**
   * 处理收藏状态变化
   * @param punchId 打卡记录ID
   * @param starred 新的收藏状态
   */
  const handleStarChange = (punchId: number, starred: boolean) => {
    setIsStarred(starred);
    if (punchDetail) {
      setPunchDetail({
        ...punchDetail,
        stared: starred
      });
    }
  };

  /**
   * 格式化日期显示
   * @param dateString 日期字符串
   * @returns 格式化后的日期
   */
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch {
      return dateString;
    }
  };

  /**
   * 格式化时间显示
   * @param dateString 日期字符串
   * @returns 格式化后的时间
   */
  const formatDisplayTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // 如果没有数据且正在加载，显示加载状态
  if (loading) {
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
        title="打卡详情"
      >
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  // 如果没有数据，不显示弹窗
  if (!punchDetail) {
    return null;
  }

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
      title="打卡详情"
    >
      <div className="flex flex-col h-full">
        {/* 上半部分：内容区域 */}
        <div className="flex-1 p-6 bg-white">
          {/* 时间信息区域 */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="flex-1 flex justify-center items-center gap-4 text-gray-500">
                <div className="flex items-center gap-1">
                  <ClockCircleOutlined />
                  <Text type="secondary">{formatDisplayTime(punchDetail.punch.created_at)}</Text>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarOutlined />
                  <Text type="secondary">{formatDisplayDate(punchDetail.punch.created_at)}</Text>
                </div>
              </div>
              {/* 收藏按钮 */}
              <div className="flex-shrink-0">
                <StarButton
                  key={`star-${punchId}-${isStarred}`}
                  punchId={punchId}
                  initialStarred={isStarred}
                  onStarChange={handleStarChange}
                  size="medium"
                  showText={true}
                />
              </div>
            </div>
          </div>

          {/* 打卡内容 */}
          <div className="mt-4">
            <Title level={5} className="mb-2 text-gray-700">
              打卡内容
            </Title>
            <div className="bg-gray-50 rounded-lg p-4 h-40 overflow-y-auto">
              {punchDetail.punch.content ? (
                <Text className="text-gray-800 whitespace-pre-wrap">
                  {punchDetail.punch.content}
                </Text>
              ) : (
                <Text type="secondary" italic>
                  用户未填写任何文字内容
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* 下半部分：图片区域 */}
        {punchDetail.imgs && punchDetail.imgs.length > 0 && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <Title level={5} className="mb-3 text-gray-700">
              打卡图片
            </Title>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {punchDetail.imgs.map((img, index) => (
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
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CheckInDetailModal;