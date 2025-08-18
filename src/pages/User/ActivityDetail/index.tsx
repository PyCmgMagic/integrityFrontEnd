import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar, Progress, Spin, message, Space } from 'antd';
import { LeftOutlined, InfoCircleOutlined, BookOutlined, ExperimentOutlined } from '@ant-design/icons';
import { ActivityAPI } from '../../../services/api';
import { useRequest } from '../../../hooks/useRequest';
import type { ActivityDetailResponse, ProjectItem } from '../../../types/api';

// 模拟用户信息，可以从 context 或 props 获取
const currentUser = { name: "1", avatarUrl: "/path/to/avatar.png" };

/**
 * 
 * @returns 
 */
const ActivityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isIntroVisible, setIntroVisible] = useState(false);
  const [isScoresVisible, setScoresVisible] = useState(false);
  const [isRankingVisible, setRankingVisible] = useState(false);

  // 使用useRequest hook获取活动详情
  const { data: activityData, loading, error, run: fetchActivityDetail } = useRequest(
    (activityId: number) => ActivityAPI.getActivityDetail(activityId),
    {
      manual: true,
      onError: (error) => {
        message.error('获取活动详情失败：' + error.message); 
      }
    }
  );

  // 当组件挂载或id变化时获取数据
  useEffect(() => {
    if (id) {
      const activityId = parseInt(id, 10);
      if (!isNaN(activityId)) {
        fetchActivityDetail(activityId);
      } else {
        message.error('无效的活动ID');
        navigate('/user/activities');
      }
    }
  }, [id]); // 只依赖id变化

  /**
   * 格式化日期显示
   * @param startDate 开始日期（数字格式：20250103）
   * @param endDate 结束日期（数字格式：20250810）
   * @returns 格式化后的日期字符串
   */
  const formatDateRange = (startDate: number, endDate: number): string => {
    const formatDate = (date: number): string => {
      const dateStr = date.toString();
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${month}.${day}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // 模拟用户统计数据（后续可以从API获取）
  const userStats = {
    totalScore: 23,
    maxStreak: 7,
    rank: 21,
    todayProgress: { completed: 3, total: 5 } // 今日打卡进度
  };

  /**
   * 生成项目卡片的渐变色
   * @param index 项目索引
   * @returns 渐变色类名
   */
  const getProjectGradient = (index: number): string => {
    const gradients = [
      'from-orange-500 to-red-500',
      'from-amber-500 to-orange-500',
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
    ];
    return gradients[index % gradients.length];
  };

  /**
   * 生成项目图标
   * @param index 项目索引
   * @returns 图标组件
   */
  const getProjectIcon = (index: number) => {
    const icons = [
      <BookOutlined className="text-4xl text-white" />,
      <ExperimentOutlined className="text-4xl text-white" />,
    ];
    return icons[index % icons.length];
  };

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

  /**
   * 处理项目卡片点击
   * @param projectId 项目ID
   */
  const handleProjectClick = useCallback((projectId: number) => {
    navigate(`/user/activity/${id}/project/${projectId}`);
  }, [navigate, id]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // 如果没有数据，显示错误状态
  if (!activityData) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">活动数据加载失败</p>
          <Button type="primary" onClick={() => navigate(-1)}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  const { activity, projects } = activityData;

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
            <p className="font-semibold tracking-wider">{formatDateRange(activity.start_date, activity.end_date)}</p>
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
          {projects.length > 0 ? (
            projects.map((project, index) => (
           <div key={project.id} className={`bg-gradient-to-r ${getProjectGradient(index)} p-6 rounded-2xl shadow-lg flex items-center justify-between h-32`}>
           <div className="flex items-center">
            <div className="mr-4 bg-white/20 p-3 rounded-full">{getProjectIcon(index)}</div>
            <div>
            <h2 className="text-xl font-bold text-white">{project.name}</h2>
           <p className="text-gray-100 text-sm h-10 overflow-hidden line-clamp-2">{project.description}</p>
    </div>
  </div> 
  <Button
    shape="round"
    className="bg-white text-red-500 font-bold border-none hover:bg-white/90 "
    onClick={() => handleProjectClick(project.id)}
  >
    去打卡
  </Button>
</div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无打卡项目</p>
            </div>
          )}
        </div>
      </main>

      {/* --- 弹窗 --- */}
      <Modal 
        title={null}
        open={isIntroVisible} 
        onCancel={() => setIntroVisible(false)} 
        footer={null}
        width={320}
        centered
        className="activity-intro-modal"
        styles={{
          body: { padding: '24px 20px' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        <div className="text-center">
          {/* 标题 */}
          <h2 className="text-xl font-bold text-gray-800 ">{activity.name}</h2>
              
            {/* 活动时间 */}
            <p className="text-gray-600 mb-6">
              活动时间：{formatDateRange(activity.start_date, activity.end_date)}
            </p>
          {/* 活动描述 */}
          <div className="text-left space-y-4 text-sm text-gray-700 leading-relaxed">
            <h3 className="font-semibold text-gray-800 mb-2">活动描述：</h3>
            <p>{activity.description}</p>
          </div>
        </div>
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