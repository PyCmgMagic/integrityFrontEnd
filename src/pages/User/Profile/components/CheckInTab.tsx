import React from 'react';
import { Typography } from 'antd';
import { Dialog, SwipeAction, Toast } from 'antd-mobile';
import type { CheckInData } from '../../../../types/types';

const { Text } = Typography;

interface CheckInTabProps {
  checkInData: CheckInData[];
  onDelete: (id: number) => void;
  formatDate: (dateString: string) => string;
}

/**
 * 打卡记录标签页组件
 * 显示最近的打卡记录，支持滑动删除
 */
const CheckInTab: React.FC<CheckInTabProps> = ({ checkInData, onDelete, formatDate }) => {
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
          onDelete(id);
          Toast.show({ content: '删除成功', position: 'bottom' });
        }
      },
    },
  ];

  return (
    <div className="p-0 pt-0">
      {checkInData.map((item, index) => (
        <SwipeAction
          key={item.id}
          style={{ ['--adm-swipe-action-actions-border-radius' as string]: '0.75rem' }}
          rightActions={createRightActions(item.id)}
          className={index === checkInData.length - 1 ? '' : 'mb-3'}
        >
          <div className="w-full bg-blue-50 rounded-xl p-4 transition-all hover:bg-blue-100 hover:shadow-md">
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
  );
};

export default CheckInTab;