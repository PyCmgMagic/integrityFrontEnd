import React from 'react';
import { Modal } from 'antd';

/**
 * 活动数据接口
 */
interface Activity {
  /** 活动名称 */
  name: string;
  /** 活动描述 */
  description: string;
  /** 活动开始日期（数字格式：20250103） */
  start_date: number;
  /** 活动结束日期（数字格式：20250810） */
  end_date: number;
}

/**
 * ActivityIntroModal组件的属性接口
 */
interface ActivityIntroModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 活动数据 */
  activity: Activity;
  /** 关闭弹窗事件 */
  onClose: () => void;
}

/**
 * ActivityIntroModal组件 - 活动介绍弹窗
 * 显示活动的详细介绍信息
 */
const ActivityIntroModal: React.FC<ActivityIntroModalProps> = ({
  visible,
  activity,
  onClose
}) => {
  /**
   * 格式化日期显示
   * @param startDate 开始日期（数字格式：20250103）
   * @param endDate 结束日期（数字格式：20250810）
   * @returns 格式化后的日期字符串
   */
  const formatDateRange = (startDate: number, endDate: number): string => {
    const formatDate = (date: number): string => {
      const dateStr = date.toString();
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}.${month}.${day}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <Modal 
      title={null}
      open={visible} 
      onCancel={onClose} 
      footer={null}
      width={320}
      centered
      className="activity-intro-modal"
      styles={{
        body: { padding: '24px 20px' },
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
      }}
    >
      <div className="text-center">
        {/* 标题 */}
        <h2 className="text-xl font-bold text-gray-800">{activity.name}</h2>
            
        {/* 活动时间 */}
        <p className="text-gray-600 mb-6">
          活动时间：{formatDateRange(activity.start_date, activity.end_date)}
        </p>
        
        {/* 活动描述 */}
        <div className="text-left space-y-4 text-sm text-gray-700 leading-relaxed">
          <h3 className="font-semibold text-gray-800 mb-2">活动描述：</h3>
          <p>{activity.description}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ActivityIntroModal;
export type { Activity };