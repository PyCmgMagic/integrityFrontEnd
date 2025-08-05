import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar, Progress, Space, message } from 'antd';
import { LeftOutlined, InfoCircleOutlined, BookOutlined, ExperimentOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';

// 导入外部的编辑弹窗组件
import EditActivityModal from './EditActivityModal';

// 模拟用户信息，可以从 context 或 props 获取
const currentUser = { name: "1", avatarUrl: "/path/to/avatar.png" };

/**
 * 美化后的活动详情页面
 * @returns 
 */
const ActivityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- State 管理 ---
  const [isIntroVisible, setIntroVisible] = useState(false);
  const [isScoresVisible, setScoresVisible] = useState(false);
  const [isRankingVisible, setRankingVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false); // 控制编辑弹窗的 state

  // --- 模拟数据 ---
  const activity = {
    name: '寒假打卡活动',
    time: '1.3 - 1.31',
    description: '这是一个旨在鼓励用户在寒假期间坚持学习和锻炼的打卡活动。通过完成每日任务，不仅可以获得积分，还能养成良好习惯。',
  };
  
  // 为编辑表单准备的详细数据，包含了 moment 对象
  const activityInitialData = {
    name: '寒假打卡活动',
    description: `寒假打卡活动设有多个项目, 不同主题项目下设有一个或多个栏目, 完成栏目打卡任务则可以活动对应积分, 活动时间为1.3~1.31
累计得分: 点击后弹窗显示此活动中获得的总分数以及每一分的打卡记录项;
我的排名: 每日更新, 点击后显示前30名总分最高的用户名称;
最多连续打卡: 点击后可以查看每日是否打卡情况;
各项目: 点击后进入项目详情页`,
    cover: 'https://i.111666.best/image/HajJhEnP8OGD1NR1Of0IqZ.jpg',
    timeRange: [moment('2025-01-03'), moment('2025-01-31')],
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
    avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`
  }));


  const handleProjectClick = (projectId: string) => {

    navigate(`/user/activity/${id}/project/${projectId}`);
  };
  const handleNewProjectClick = () => {
    navigate(`/admin/create/activity/${id}/project`);
  }

  // 从编辑弹窗接收表单数据的处理函数
  const handleEditFinish = (values: typeof activityInitialData) => {
    console.log('表单数据已成功提交到父组件:', {
        ...values,
        // 实际提交时格式化日期
        timeRange: [
            values.timeRange[0].format('YYYY-MM-DD'),
            values.timeRange[1].format('YYYY-MM-DD'),
        ],
    });
    message.success('活动信息已成功更新!');
    setEditModalVisible(false); // 在这里处理关闭弹窗的逻辑
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white pt-6 px-4 pb-4shadow-lg rounded-b-3xl">
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">{activity.name}</h1>
          <Button type="text" shape="circle" icon={<EditOutlined />} className="text-white hover:bg-white/20" onClick={() => setEditModalVisible(true)} />
        </div>
        <div className='flex items-center justify-between mt-6'>
          <Space className='flex items-between'>
              <Button size='small' className="px-1 py-1 text-sm h-auto bg-white text-red-500 font-light border-none hover:bg-white/90">导出排行榜</Button>
              <Button size='small' className="px-1 py-1 text-sm h-auto bg-white text-red-500 font-light border-none hover:bg-white/90">额外加分</Button>
          </Space>
            <div className="text-center mt-3">
                <p className="text-sm opacity-80">活动时间</p>
                <p className="font-semibold tracking-wider pb-2">{activity.time}</p>
            </div>
        </div>
      </header>

      <main className="p-4 pb-20">
        <div className="space-y-4">
            <div  className={`bg-gradient-to-r from-orange-500 to-red-500 p-3 flex-col rounded-2xl shadow-lg border-4 border-white/50 border-dashed  flex items-center justify-center`}>
              <div className="flex items-center"></div>
            <div onClick={() => navigate(`/admin/create/activity/${id}/project`)} className=" w-16 h-16 rounded-full flex items-center justify-center mb-2 border-2 border-white/50 border-dashed shadow">
              <span className="text-4xl font-bold text-white">+</span>
            </div> 
            <p onClick={handleNewProjectClick} className="text-lg font-semibold text-white">新增项目</p> 
            </div>
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
                查看
              </Button>
            </div>
          ))}
        </div>
      </main>

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

      {/* --- 使用提取出来的编辑组件 --- */}
      <EditActivityModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        onFinish={handleEditFinish}
        initialData={activityInitialData}
      />
    </div> 
  );
}; 

export default ActivityDetailPage;