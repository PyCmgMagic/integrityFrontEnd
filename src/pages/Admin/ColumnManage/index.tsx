import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, List } from 'antd';
import { LeftOutlined, EditOutlined, StarOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { Dialog, SwipeAction, Toast } from 'antd-mobile';
import EditColumnModal from '../ProjectManage/EditColumnModal'; // Ensure this component can accept these props

// --- Type Definitions for TypeScript ---

// Describes the shape of a check-in item
interface CheckInItem {
  id: number;
  user: string;
  title: string;
  date: string;
  text: string;
  images: string[];
  starred: boolean;
  status: 'approved' | 'rejected' | 'pending'; // Added status field
}

// Describes the column's static information
interface ColumnInfo {
  name: string;
  activityTime: string;
  checkRequirement: string;
}

// Describes the audit statistics
interface AuditStats {
  reviewed: number;
  total: number;
}


// --- Mock Data with Explicit Types ---

const unreviewedData: CheckInItem[] = [
  { id: 1, user: 'aaa', title: 'aaa的打卡', date: '1.21', text: '今天学习了React Hooks，感觉收获满满。附上学习笔记。', images: ['https://pic.cloud.rpcrpc.com/data/6895bfea62b29.jpg', 'https://pic.cloud.rpcrpc.com/data/6895bfc03cfec.jpg'], starred: true, status: 'pending' },
  { id: 2, user: 'bbb', title: 'bbb的打卡', date: '1.21', text: '完成了今天的健身计划，跑步5公里。', images: ['https://pic.cloud.rpcrpc.com/data/6895bfc03cfec.jpg'], starred: false, status: 'pending' },
  { id: 4, user: '张三', title: '第8次打卡', date: '1.20', text: '阅读《三体》50页，做了些摘抄。', images: [], starred: true, status: 'pending' },
  { id: 5, user: '李四', title: '第8次打卡', date: '1.19', text: '练习了30分钟的吉他，录了一小段。', images: ['img8.png'], starred: false, status: 'pending' },
];

const reviewedData: CheckInItem[] = [
  // Example of a rejected item
  { id: 3, user: '王嘻嘻', title: '王嘻嘻打卡', date: '1.20', text: '今天背诵40个单词，这是截图记录。', images: ['https://pic.cloud.rpcrpc.com/data/6895bfea62b29.jpg', 'img5.png', 'img6.png', 'img7.png'], starred: false, status: 'rejected' },
  { id: 6, user: 'ccc', title: 'ccc的打卡', date: '1.19', text: '已完成今日的学习任务，效果很好。', images: ['https://pic.cloud.rpcrpc.com/data/6895bfea62b29.jpg'], starred: false, status: 'approved' },
  { id: 7, user: 'ddd', title: 'ddd的打卡', date: '1.18', text: '坚持打卡第10天，感觉进步明显。', images: [], starred: true, status: 'approved' },
];

/**
 * 打卡管理页面 - 管理员审核视角 
 */
const ColumnManage: React.FC = () => {
  
  const navigate = useNavigate();
  const [editColumnVisible, setEditColumnVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'unreviewed' | 'reviewed'>('unreviewed');
  const { activityId, projectId, columnId } = useParams();
  const parsedProjectId = parseInt(projectId || '0');
  const handleEditColumnFinish = (values: any): void => {
    console.log('Received values from edit form: ', values);
    setEditColumnVisible(false);
  };

  const column: ColumnInfo = {
    name: '单词打卡',
    activityTime: '1.3 - 1.31',
    checkRequirement: '打卡要求：每日背诵英文单词不少于20个，通过单词App学习单词，上传打卡信息截图，或对自己每日学习的成果（阅读笔记）进行拍照打卡，图片中需要附有自己的姓名以及当天日期，每日内容不得重复。（该项如提交笔记，不得与上一项自习笔记重复）。打卡时间为每日6时至22时。'
  };

  const auditStats: AuditStats = {
    reviewed: 56,
    total: 132
  };

  const unreviewedActions = (item: CheckInItem) => [
    {
      key: 'approve',
      text: <div className="flex flex-col justify-center items-center h-full"><CheckOutlined /><span className="text-xs mt-1">通过</span></div>,
      color: 'success',
      onClick: (): void => {
        // In a real app, you would update the state here to move the item to the reviewed list with 'approved' status
        Toast.show({ content: `已通过 "${item.title}"`, position: 'bottom' });
      },
    },
    {
      key: 'reject',
      text: <div className="flex flex-col justify-center items-center h-full"><CloseOutlined /><span className="text-xs mt-1">驳回</span></div>,
      color: 'danger',
      onClick: (): void => {
        // In a real app, you would update the state here to move the item to the reviewed list with 'rejected' status
        Toast.show({ content: `已驳回 "${item.title}"`, position: 'bottom' });
      },
    },
  ];

  const reviewedActions = (item: CheckInItem) => [
      {
        key: 'star',
        text: <div className="flex flex-col justify-center items-center h-full"><StarOutlined /><span className="text-xs mt-1">精华</span></div>,
        color: 'warning',
        onClick: (): void => {
            Toast.show({ content: `已将 "${item.title}" 设为精华`, position: 'bottom' });
        },
      },
      {
        key: 'delete',
        text: <div className="flex flex-col justify-center items-center h-full"><DeleteOutlined /><span className="text-xs mt-1">删除</span></div>,
        color: 'danger', 
        onClick: async (): Promise<void> => {
          const confirmed = await Dialog.confirm({ content: '确定要删除吗？' });
          if(confirmed) {
            // In a real app, you would update the state here to remove the item
            Toast.show({ content: `已删除 "${item.title}"`, position: 'bottom' });
          }
        },
      },
  ];

  const renderList = (data: CheckInItem[], type: 'unreviewed' | 'reviewed'): React.ReactElement => (
    <List
      dataSource={data}
      renderItem={(item, index) => (
        <SwipeAction rightActions={type === 'unreviewed' ? unreviewedActions(item) : reviewedActions(item)}>
            <List.Item 
              className={`rounded-l shadow-sm mb-3  cursor-pointer ${
                item.status === 'rejected' ? 'bg-gray-200' : 'bg-blue-100' // Apply grey background if rejected
              }`}
              onClick={() => {
                navigate(`/admin/activity/${activityId}/project/${projectId}/column/${columnId}/review/${item.id}`, { 
                  state: { 
                    items: data,
                    currentIndex: index,
                    reviewType: type
                  } 
                });
              }}
            >
                <div className="px-2 py-1 flex justify-between items-center w-full">
                    <span className={`text-gray-700 ${item.status === 'rejected' ? 'text-gray-500' : ''}`}>
                      {item.title}
                    </span>
                    {type === 'reviewed' && item.status === 'rejected' ? (
                      <span className="text-gray-500 font-semibold">未通过</span>
                    ) : (
                      item.starred && <StarOutlined className="text-orange-400" />
                    )}
                </div>
            </List.Item>
        </SwipeAction>
      )}
      split={false}
    />
  );


  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-blue-500 text-white p-6 shadow-lg rounded-b-3xl">
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">打卡管理</h1> 
          <Button type="text" shape="circle" icon={<EditOutlined />} className="text-white hover:bg-white/20" onClick={() => setEditColumnVisible(true)} />
        </div>
        <div className="text-center mt-3">
          <p className="text-sm opacity-80">活动时间</p>
          <p className="font-semibold tracking-wider">{column.activityTime}</p>
        </div>
      </header>

      <main className="p-4 pb-10">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">{column.checkRequirement}</p>
        </div>

        <div className="text-center my-4 text-gray-500">
          {`今日已审核：${auditStats.reviewed} / ${auditStats.total}`}
        </div>

        <div className="flex justify-center bg-gray-200 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('unreviewed')}
            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${activeTab === 'unreviewed' ? 'bg-white text-blue-500 shadow' : 'text-gray-500'}`}
          >
            未审核
          </button>
          <button
            onClick={() => setActiveTab('reviewed')}
            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${activeTab === 'reviewed' ? 'bg-white text-blue-500 shadow' : 'text-gray-500'}`}
          >
            已审核
          </button>
        </div>

        <div>
          {activeTab === 'unreviewed' ? renderList(unreviewedData, 'unreviewed') : renderList(reviewedData, 'reviewed')}
        </div>
      </main>

      <EditColumnModal
        visible={editColumnVisible}
        onClose={() => setEditColumnVisible(false)}
        onFinish={handleEditColumnFinish} 
        projectId={parsedProjectId}
      />
    </div>
  );
};

export default ColumnManage; 