import React, { useState } from 'react';
import { Typography } from 'antd';
import { Dialog, SwipeAction, Toast } from 'antd-mobile';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { CheckInData } from '../../../../types/types';
import SimpleCheckInModal from './SimpleCheckInModal';

const { Text } = Typography;

interface CheckInTabProps {
  checkInData: CheckInData[];
  onDelete: (id: number) => Promise<void>;
  formatDate: (dateString: string) => string;
  onUpdate?: (updatedData: CheckInData) => void;
  onRefresh?: () => void; // 新增：用于触发数据刷新
}

/**
 * 获取状态标签配置
 * @param status 状态值：0-待审核，1-已通过，2-未通过
 * @returns 状态配置对象
 */
const getStatusConfig = (status?: number) => {
  switch (status) {
    case 0:
      return {
        text: '待审核',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        icon: <ExclamationCircleOutlined className="text-yellow-600" />
      };
    case 1:
      return {
        text: '已通过',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        icon: <CheckCircleOutlined className="text-green-600" />
      };
    case 2:
      return {
        text: '未通过',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        icon: <CloseCircleOutlined className="text-red-600" />
      };
    default:
      return {
        text: '未知',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300',
        icon: <ClockCircleOutlined className="text-gray-600" />
      };
  }
};

/**
 * 打卡记录标签页组件
 * 显示最近的打卡记录，支持滑动删除和点击查看详情
 */
const CheckInTab: React.FC<CheckInTabProps> = ({ checkInData, onDelete, formatDate, onUpdate, onRefresh }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInData | null>(null);

  /**
   * 处理点击打卡记录，显示详情弹窗
   * @param checkInItem 打卡记录数据
   */
  const handleCheckInClick = (checkInItem: CheckInData) => {
    setSelectedCheckIn(checkInItem);
    setModalVisible(true);
  };

  /**
   * 关闭详情弹窗
   */
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCheckIn(null);
  };

  /**
   * 处理打卡记录更新
   * @param updatedData 更新后的打卡数据
   */
  const handleCheckInUpdate = (updatedData: CheckInData) => {
    // 更新本地选中的打卡记录
    setSelectedCheckIn(updatedData);
    // 通知父组件更新数据
    if (onUpdate) {
      onUpdate(updatedData);
    }
  };
  /**
   * 创建滑动操作按钮
   * @param id 打卡记录ID
   * @returns 滑动操作配置
   */
  const createRightActions = (id: number) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger' as const,
      onClick: async () => {
        const result = await Dialog.confirm({
          content: '确定要删除这条打卡记录吗？',
          confirmText: '确认',
          cancelText: '取消',
        });
        if (result) {
          try {
            await onDelete(id);
            Toast.show({ content: '删除成功', position: 'bottom' });
          } catch (error: any) {
            console.error('删除打卡记录失败:', error);
            Toast.show({ 
              content: error.message || '删除失败，请稍后重试', 
              position: 'bottom' 
            });
          }
        }
      },
    },
  ];

  return (
    <>
      <div className="p-0 pt-0">
        {checkInData.map((item, index) => {
          const statusConfig = getStatusConfig(item.status);
          return (
            <SwipeAction
              key={item.id}
              style={{ ['--adm-swipe-action-actions-border-radius' as string]: '0.75rem' }}
              rightActions={createRightActions(item.id)}
              className={index === checkInData.length - 1 ? '' : 'mb-3'}
            >
              <div 
                className="w-full bg-blue-50 rounded-xl p-4 transition-all hover:bg-blue-100 hover:shadow-md cursor-pointer"
                onClick={() => handleCheckInClick(item)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Text strong className="text-gray-800 text-base">{item.title}</Text>
                    <div className="flex items-center gap-3 mt-2">
                      {/* 打卡日期和时间 */}
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <ClockCircleOutlined />
                        <span>{formatDate(item.date)} {item.time}</span>
                      </div>
                    </div>
                  </div>
                  {/* 状态标签 */}
                  <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg px-2.5 py-1 flex items-center gap-1.5 ml-3 flex-shrink-0`}>
                    {statusConfig.icon}
                    <span className={`${statusConfig.color} font-medium text-xs whitespace-nowrap`}>
                      {statusConfig.text}
                    </span>
                  </div>
                </div>
              </div>
            </SwipeAction>
          );
        })}
      </div>
      
      {/* 打卡详情弹窗 */}
      {selectedCheckIn && (
        <SimpleCheckInModal
          visible={modalVisible}
          onClose={handleModalClose}
          checkInData={selectedCheckIn}
          onUpdate={handleCheckInUpdate}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};

export default CheckInTab;