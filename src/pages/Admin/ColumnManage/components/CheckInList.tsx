import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {SwipeAction} from 'antd-mobile';
import type { CheckInItem } from '../utils/dataTransform';
import { StarButton } from './StarButton';

/**
 * 打卡列表组件的属性接口
 */
interface CheckInListProps {
  /** 打卡数据列表 */
  data: CheckInItem[];
  /** 列表类型 */
  type: 'unreviewed' | 'reviewed';
  /** 审核操作处理函数 */
  onReview?: (item: CheckInItem, action: 'approved' | 'rejected') => void;
  /** 活动ID */
  activityId: string;
  /** 项目ID */
  projectId: string;
  /** 专栏ID */
  columnId: string;
  /** 收藏状态变化回调 */
  onStarChange?: (punchId: number, isStarred: boolean) => void;
}

/**
 * 打卡列表组件
 * 负责渲染打卡记录列表，包括滑动操作和点击跳转功能
 * @param props - 组件属性
 * @returns 打卡列表组件
 */
export const CheckInList: React.FC<CheckInListProps> = ({
  data,
  type,
  onReview,
  activityId,
  projectId,
  columnId,
  onStarChange
}) => {
  const navigate = useNavigate();

  const getStatusMeta = (status?: 'approved' | 'rejected' | 'pending') => {
    switch (status) {
      case 'approved':
        return {
          text: '已通过',
          className: 'bg-green-100 text-green-700 border border-green-200'
        };
      case 'rejected':
        return {
          text: '已拒绝',
          className: 'bg-red-100 text-red-700 border border-red-200'
        };
      default:
        return {
          text: '待审核',
          className: 'bg-yellow-100 text-yellow-700 border border-yellow-200'
        };
    }
  };

  /**
   * 获取未审核项目的滑动操作
   * @param item - 打卡项
   * @returns 滑动操作配置
   */
  const getUnreviewedActions = (item: CheckInItem) => [
    {
      key: 'approve',
      text: (
        <div className="flex flex-col justify-center items-center h-full">
          <CheckOutlined />
          <span className="text-xs mt-1">通过</span>
        </div>
      ),
      color: 'success',
      onClick: (): void => {
        onReview?.(item, 'approved');
      },
    },
    {
      key: 'reject',
      text: (
        <div className="flex flex-col justify-center items-center h-full">
          <CloseOutlined />
          <span className="text-xs mt-1">驳回</span>
        </div>
      ),
      color: 'danger',
      onClick: (): void => {
        onReview?.(item, 'rejected');
      },
    },
  ];

  // /**
  //  * 获取已审核项目的滑动操作
  //  * @param item - 打卡项
  //  * @returns 滑动操作配置
  //  */
  // const getReviewedActions = (item: CheckInItem) => [
  //   {
  //     key: 'delete',
  //     text: (
  //       <div className="flex flex-col justify-center items-center h-full">
  //         <DeleteOutlined />
  //         <span className="text-xs mt-1">删除</span>
  //       </div>
  //     ),
  //     color: 'danger',
  //     onClick: async (): Promise<void> => {
  //       const confirmed = await Dialog.confirm({ content: '确定要删除吗？' });
  //       if (confirmed) {
  //         // 在实际应用中，这里应该更新状态来移除项目
  //         Toast.show({
  //           content: `已删除 "${item.title}"`,
  //           position: 'bottom'
  //         });
  //       }
  //     },
  //   },
  // ];

  /**
   * 处理列表项点击事件 - 待审核与已审核均支持点击查看打卡详情
   * 列表在有多条时会传入 punchIds，以便详情页支持左右滑动切换
   * @param item - 点击的打卡项
   * @param index - 项目索引
   */
  const handleItemClick = (item: CheckInItem, index: number): void => {
    const state: Record<string, unknown> = {
      items: data,
      currentIndex: index,
      reviewType: type
    };
    // 有多条时传入 punchIds，详情页可左右滑动查看
    if (data.length > 1) {
      state.punchIds = data.map((i) => i.id);
      state.currentPunchId = item.id;
    }
    navigate(
      `/admin/activity/${activityId}/project/${projectId}/column/${columnId}/review/${item.id}`,
      { state }
    );
  };

  // 空状态渲染
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>
          {type === 'unreviewed' ? '暂无待审核的打卡记录' : '暂无已审核的打卡记录'}
        </p>
      </div>
    );
  }

  return (
    <List
      dataSource={data}
      renderItem={(item, index) => (
        <SwipeAction
          key={item.id} 
          rightActions={
            type === 'unreviewed'
              ? getUnreviewedActions(item)
              : [] // 已审核项目暂不支持滑动操作
          }
        >
          <List.Item
            className={`rounded-l shadow-sm mb-3 cursor-pointer ${
              item.status === 'rejected' ? 'bg-gray-200' : 'bg-blue-100'
            }`}
            onClick={() => handleItemClick(item, index)}
          >
            <div className="px-2 py-1 flex justify-between items-center w-full">
              <div className="flex flex-col">
                <span
                  className={`text-gray-700 ${
                    item.status === 'rejected' ? 'text-gray-500' : ''
                  }`}
                >
                  {item.title}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {item.date} {item.time}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {(() => {
                  const statusKey = item.status ?? (type === 'unreviewed' ? 'pending' : 'approved');
                  const statusMeta = getStatusMeta(statusKey);
                  return (
                    <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${statusMeta.className}`}>
                      {statusMeta.text}
                    </span>
                  );
                })()}
                {!(type === 'reviewed' && item.status === 'rejected') && (
                  <StarButton
                    className={` ${item.starred ? 'text-yellow-500' : 'text-gray-400'}`}
                    punchId={item.id}
                    initialStarred={item.starred}
                    onStarChange={onStarChange}
                    size="small"
                  />
                )}
              </div>
            </div>
          </List.Item>
        </SwipeAction>
      )}
      split={false}
    />
  );
};
