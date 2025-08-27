import React, { useState } from 'react';
import { Typography } from 'antd';
import { Dialog, SwipeAction, Toast } from 'antd-mobile';
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
        {checkInData.map((item, index) => (
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
                <div className="flex items-center">
                  <div>
                    <Text strong className="text-gray-800">{item.title}</Text>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-500 text-sm m-0">{item.time}</p>
                      <Text type="secondary" className="font-semibold ml-4">{formatDate(item.date)}</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwipeAction>
        ))}
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