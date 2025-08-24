import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar, Progress } from 'antd';
import { LeftOutlined, InfoCircleOutlined, BookOutlined, ExperimentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { SwipeAction ,Dialog, Toast } from 'antd-mobile';
import API from '../../../services/api';

interface ChenkInDataProps {
  columns: any[];
  column: any;
  onDeleteRecord?: (recordId: number) => Promise<void>;
  totalRecords?: number;
  currentUserCheckInCount?: number;
}

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
  currentUserCheckInCount = 0 
}: ChenkInDataProps) => {
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
            <p>总打卡记录：{totalRecords}条</p>
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
            columns.map((column,index) => (
               <SwipeAction
                key={column.id}
                rightActions={rightActions(column.id)}
              >
              <div key={column.id} className={`bg-gradient-to-r ${column.gradient} p-5  shadow-lg flex items-center justify-between`}>
                <div className="flex items-center">
                  <div>  
                    <h2 className="text-xl font-bold text-white">{column.title}</h2>
                  </div>
                </div>
              </div> 
          </SwipeAction>
            ))
          )}
        </div>
        </>
    )
}
export default ChenkInData;