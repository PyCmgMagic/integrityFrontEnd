import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar, Progress } from 'antd';
import { LeftOutlined, InfoCircleOutlined, BookOutlined, ExperimentOutlined } from '@ant-design/icons';

// 模拟用户信息，可以从 context 或 props 获取
const currentUser = { name: "1", avatarUrl: "/path/to/avatar.png" };

/**
 * 美化后的活动详情页面
 * @returns 
 */
const ActivityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isIntroVisible, setIntroVisible] = useState(false);
  const [isScoresVisible, setScoresVisible] = useState(false);
  const [isRankingVisible, setRankingVisible] = useState(false);

  // --- 模拟数据 ---
  const activity = {
    name: '寒假打卡活动',
    time: '1.3 - 1.31',
    description: '这是一个旨在鼓励用户在寒假期间坚持学习和锻炼的打卡活动。通过完成每日任务，不仅可以获得积分，还能养成良好习惯。',
  };

  const userStats = {
    totalScore: 23,
    maxStreak: 7,
    rank: 21,
    todayProgress: { completed: 3, total: 5 } // 今日打卡进度
  };

  const projects = [
    {
      id: '1',
      title: '“瑞蛇衔知”',
      subtitle: '勤学善思',
      icon: <BookOutlined className="text-4xl text-white" />,
      // 为每个项目卡片应用不同的渐变色
      gradient: 'from-orange-500 to-red-500',
    },
    {
      id: '2',
      title: '“灵蛇展跃”',
      subtitle: '运动不止',
      icon: <ExperimentOutlined className="text-4xl text-white" />,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const scoreRecords = [
    { task: '完成“瑞蛇衔知”项目打卡', score: 5, date: '2023-01-15' },
    { task: '完成“灵蛇展跃”项目打卡', score: 3, date: '2023-01-14' },
    { task: '连续打卡3天奖励', score: 10, date: '2023-01-13' },
    { task: '首次完成打卡', score: 5, date: '2023-01-11' },
  ];

  const rankingData = Array.from({ length: 30 }, (_, i) => ({
    rank: i + 1,
    name: `用户${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    score: 100 - i * 2,
    avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}` // 使用 placeholder 头像
  }));

  const handleProjectClick = (projectId: string) => {
    navigate(`/user/activity/${id}/project/${projectId}`);
  };

  return (
    // 使用更柔和的背景色
    <div className="bg-slate-50 min-h-screen font-sans">
           {/* 头部区域：应用了核心的橙红色渐变 */}
      <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 shadow-lg rounded-b-3xl">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">{activity.name}</h1>
          <Button type="text" shape="circle" icon={<InfoCircleOutlined />} className="text-white hover:bg-white/20" onClick={() => setIntroVisible(true)} />
        </div>
        {/* 活动时间显示*/}
        <div className="text-center mt-3">
            <p className="text-sm opacity-80">活动时间</p>
            <p className="font-semibold tracking-wider">{activity.time}</p>
        </div>
   
      </header>

      {/* 主内容区域 */}
      <main className="p-4 pb-20">
              {/* 数据统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-6"> 
          
          {/* 左侧大卡片：累计得分 */}
          <div 
            className="col-span-2 bg-white p-3 rounded-2xl shadow-md flex flex-col justify-center items-center cursor-pointer transform hover:-translate-y-1 transition-transform" 
            onClick={() => setScoresVisible(true)}
          >
            <p className="text-4xl font-bold text-orange-500">{userStats.totalScore}</p>
            <p className="text-gray-500 text-sm mt-1">累计得分</p>
          </div>

          {/* 右侧小卡片容器 */}
          <div className="col-span-1 flex flex-col space-y-3">
            
            {/* 上方小卡片：最长连签 */}
            <div className="bg-white p-3 rounded-2xl shadow-md text-center">
              <p className="text-2xl font-bold text-orange-500">{userStats.maxStreak}</p>
              <p className="text-gray-500 text-xs mt-1">最长连签</p>
            </div>

            {/* 下方小卡片：我的排名 */}
            <div 
              className="bg-white p-3 rounded-2xl shadow-md text-center cursor-pointer transform hover:-translate-y-1 transition-transform" 
              onClick={() => setRankingVisible(true)}
            >
              <p className="text-2xl font-bold text-orange-500">{userStats.rank}</p>
              <p className="text-gray-500 text-xs mt-1">我的排名</p>
            </div>

          </div>
        </div>
        {/* 打卡项目卡片 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-700 px-2">打卡项目</h3>
          {projects.map((project) => (
            <div key={project.id} className={`bg-gradient-to-r ${project.gradient} p-6 rounded-2xl shadow-lg flex items-center justify-between`}>
              <div className="flex items-center">
                <div className="mr-4 bg-white/20 p-3 rounded-full">{project.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-white">{project.title}</h2>
                  <p className="text-white/90">{project.subtitle}</p>
                </div>
              </div>
              <Button  
                shape="round" 
                className="bg-white text-red-500 font-bold border-none hover:bg-white/90"
                onClick={() => handleProjectClick(project.id)}
              >
                去打卡
              </Button>
            </div>
          ))}
        </div>
      </main>

      {/* --- 弹窗 --- */}
      <Modal title="活动简介" open={isIntroVisible} onCancel={() => setIntroVisible(false)} footer={null}>
        <p className="text-gray-600 leading-relaxed">{activity.description}</p>
      </Modal>

      <Modal title="我的分数" open={isScoresVisible} onCancel={() => setScoresVisible(false)} footer={null}>
        <div className="text-center mb-4">
          <p className="text-gray-500">总分数</p>
          <p className="text-5xl font-bold text-orange-500">{userStats.totalScore}</p>
        </div>
        <List
          header={<div className="font-semibold">得分记录</div>}
          dataSource={scoreRecords}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.task} description={item.date} />
              <div className="font-bold text-green-500 text-lg">+{item.score}</div>
            </List.Item>
          )}
        />
      </Modal>

      <Modal title="排行榜" open={isRankingVisible} onCancel={() => setRankingVisible(false)} footer={null} width={360}>
        <List
          dataSource={rankingData}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar className={item.rank <= 3 ? 'bg-amber-400 text-white font-bold' : 'bg-gray-200 text-gray-600'}>{item.rank}</Avatar>}
                title={<span className="font-semibold">{item.name}</span>}
                description={<><Avatar size={20} src={item.avatar} className="mr-2"/>{item.name}</>}
              />
              <div className="font-bold text-gray-700">{item.score}分</div>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default ActivityDetailPage;