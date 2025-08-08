import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar, Progress } from 'antd';
import { LeftOutlined, InfoCircleOutlined, BookOutlined, ExperimentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { SwipeAction ,Dialog, Toast } from 'antd-mobile';

const ChenkInData = ({ columns = [], column = {} }: { columns: any[], column: any }) => {
      const rightActions = (id: number) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger' as const, // antd-mobile 需要一个常量类型
      onClick: async () => {
        const result = await Dialog.confirm({
          content: '确定要删除这条打卡记录吗？',
          confirmText: '确认',
          cancelText: '取消',
        });
        if (result) {
          //删除操作
          Toast.show({ content: '删除成功', position: 'bottom' });
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
          <p className="text-gray-600 text-sm leading-relaxed">{column.checkRequirement}</p>
        </div>
          <div className='flex items-center justify-between mb-4'>
            <p>今日打卡人数</p>
            <p>我已打卡：次</p>
          </div>
        </div>
       
        <div className="space-y-4">
          {columns.map((column,index) => (
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
          ))}
        </div>
        </>
    )
}
export default ChenkInData;