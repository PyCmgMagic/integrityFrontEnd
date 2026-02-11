

import { useState } from 'react';
import {  BookOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';
import { SwipeAction ,Dialog, Toast } from 'antd-mobile';
import SimpleCheckInModal from '../../../pages/User/Profile/components/SimpleCheckInModal';
import type { CheckInData } from '../../../types/types';

interface ChenkInDataProps {
  columns: CheckInData[];
  column: any;
  onDeleteRecord?: (recordId: number) => Promise<void>;
  totalRecords?: number;
  currentUserCheckInCount?: number;
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
        borderColor: 'border-yellow-200',
        icon: <ExclamationCircleOutlined className="text-yellow-600" />
      };
    case 1:
      return {
        text: '已通过',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircleOutlined className="text-green-600" />
      };
    case 2:
      return {
        text: '未通过',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <CloseCircleOutlined className="text-red-600" />
      };
    default:
      return {
        text: '未知',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: <ClockCircleOutlined className="text-gray-600" />
      };
  }
};

/**
 * 打卡数据展示组件
 * @param props 组件属性
 * @returns JSX元素
 */
const ChenkInData = ({ 
  columns = [], 
  column = {}, 
  onDeleteRecord,
  totalRecords = 0,
  currentUserCheckInCount = 0,
  onUpdate,
  onRefresh 
}: ChenkInDataProps) => {
  // 弹窗状态管理
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInData | null>(null);

  /**
   * 处理打卡记录点击事件
   * @param checkInRecord 打卡记录数据
   */
  const handleCheckInClick = (checkInRecord: CheckInData) => {
    // 将打卡记录数据转换为 CheckInData 格式
    
    const checkInData: CheckInData = {
      id: checkInRecord.id || 0,
      title: checkInRecord.title || '打卡记录',
      content: checkInRecord.content || '',
      date: checkInRecord.date || new Date().toISOString(),
      time: checkInRecord.time || '',
      imgs: checkInRecord.imgs || [],
      column_id: checkInRecord.column_id || 0,
      status: checkInRecord.status,
    };

    setSelectedCheckIn(checkInData);
    setModalVisible(true);
  };

  /**
   * 关闭弹窗
   */
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCheckIn(null);
    onRefresh?.();
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
   * 右滑删除操作配置
   * @param id 记录ID
   * @returns 操作配置数组
   */
  const rightActions = (id: number) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger' as const, // antd-mobile 需要一个常量类型
      onClick: async () => {
        if (onDeleteRecord) {
          await onDeleteRecord(id);
        } else {
          // 如果没有传入删除回调，使用默认行为
          const result = await Dialog.confirm({
            content: '确定要删除这条打卡记录吗？',
            confirmText: '确认',
            cancelText: '取消',
          });
          if (result) {
            Toast.show({ content: '删除成功', position: 'bottom' });
          }
        }
      },
    },
  ];
    return (
        <>
        {/* 打卡列卡片 */}
        <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
            <p className="font-bold">打卡要求:</p>
          <p className="text-gray-600 text-sm leading-relaxed">{column.description}</p>
        </div>
          <div className='flex items-center justify-between mb-4'>
            <p>今日已有{totalRecords}人打卡~</p>
            <p>我已打卡：{currentUserCheckInCount}次</p>
          </div>
        </div>
       
        <div className="space-y-4">
          {columns.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <BookOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />
              </div>
              <p className="text-gray-500 text-lg mb-2">暂无打卡记录</p>
              <p className="text-gray-400 text-sm">完成你的第一次打卡吧！↓</p>
            </div>
          ) : (
            columns.map((column) => {
              const statusConfig = getStatusConfig(column.status);
              return (
                <SwipeAction
                  key={column.id}
                  rightActions={rightActions(column.id)}
                >
                  <div 
                    className={`bg-gradient-to-r ${column.gradient} p-5 shadow-lg cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => handleCheckInClick(column)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">  
                        <h2 className="text-xl font-bold text-white mb-2">{column.title}</h2>
                        <div className="flex items-center gap-3 text-white/90 text-sm">
                          {/* 打卡时间 */}
                          <div className="flex items-center gap-1">
                            <ClockCircleOutlined />
                            <span>{column.date} {column.time}</span>
                          </div>
                        </div>
                      </div>
                      {/* 状态标签 */}
                      <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm`}>
                        {statusConfig.icon}
                        <span className={`${statusConfig.color} font-semibold text-sm`}>
                          {statusConfig.text}
                        </span>
                      </div>
                    </div> 
                  </div> 
                </SwipeAction>
              );
            })
          )}
        </div>
 
        {/* 打卡详情弹窗 */}
        {selectedCheckIn && (
          <SimpleCheckInModal
            visible={modalVisible}
            onClose={handleCloseModal}
            checkInData={selectedCheckIn}
            onUpdate={handleCheckInUpdate}
            onRefresh={onRefresh}
          />
        )}
        </>
    )
}
export default ChenkInData;
