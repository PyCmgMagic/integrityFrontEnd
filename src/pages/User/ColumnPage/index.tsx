import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar, Progress } from 'antd';
import { LeftOutlined, InfoCircleOutlined, BookOutlined, ExperimentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { SwipeAction ,Dialog, Toast } from 'antd-mobile';
import ChenkInData from './ChenkInData';
import CheckIn from '../../../components/CheckIn'
// 模拟用户信息，可以从 context 或 props 获取
const currentUser = { name: "1", avatarUrl: "/path/to/avatar.png" };

/**
 * 美化后的活动详情页面
 * @returns 
 */
const ColumnPage = () => {
  // const { activityId, projectId, columnId } = useParams();
  const navigate = useNavigate();
  // 添加打卡状态管理
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [gotoCheckIn, setGotoCheckIn] = useState(false);
  
  /**
   * 处理打卡按钮点击事件
   * 如果未打卡，则跳转到打卡页面
   * 如果已打卡，则显示提示信息
   */
  const handleCheckIn = () => {
    if (isCheckedIn) {
      // 已经打卡，显示提示
      Toast.show({
        content: '今日已完成打卡！',
        position: 'bottom',
      });
      return;
    }
    
    //这里显示打卡组件
    setGotoCheckIn(true);
  }


  // --- 模拟数据 ---
  const column = {
    name: '单词打卡',
    time: '每日',
    description: '这是一个鼓励每日阅读的打卡项目，旨在帮助用户养成良好的阅读习惯。',
    checkRequirement: '每日完成100个单词的背诵，并提交打卡截图。'
  };

  const userStats = {
    totalScore: 23,
    maxStreak: 7,
    rank: 21,
    todayProgress: { completed: 3, total: 5 } // 今日打卡进度
  };


  const columns = [
    {
      id: 1,
      title: '第8次打卡',
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      id: 2,
      title: '第7次打卡',
      gradient: 'from-blue-400 to-blue-600',
    },
  ];
  // const handleColumnClick = (columnId: string) => {
  //   navigate(`/user/activity/${activityId}/project/${projectId}/column/${columnId}`);
  // };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 shadow-lg rounded-b-3xl">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">{column.name}</h1>
          <Button type="text" shape="circle"  className="text-white hover:bg-white/20" />
        </div>
        {/* 打卡列时间显示*/}
        <div className="text-center mt-3">
            <p className="text-sm opacity-80">打卡时间</p>
            <p className="font-semibold tracking-wider">{column.time}</p>
        </div>
   
      </header>

      {/* 主内容区域 */}
      <main className="p-4 pb-20">
        {/* 打卡信息 */}
        {gotoCheckIn ? 
          <CheckIn setIsCheckedIn={setIsCheckedIn} setGotoCheckIn={setGotoCheckIn} /> : 
          <ChenkInData columns={columns} column={column} />
        }
      </main>
      {/* 底部固定的打卡按钮 */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center z-10" style={{visibility: gotoCheckIn ? 'hidden' : 'visible'}}>
        <Button 
          size="large" 
          shape="round"
          icon={<CheckCircleOutlined style={{ fontSize: '28px' }} />}
          style={{ height: 'auto', padding: '10px 24px' }}
          onClick={handleCheckIn}
        >
          {isCheckedIn ? '已完成打卡' : '立即打卡'}
        </Button>
      </div>
    </div>
  );
};

export default ColumnPage;