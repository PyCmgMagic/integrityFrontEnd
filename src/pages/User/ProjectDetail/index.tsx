import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar, Progress, Spin, Result } from 'antd';
import { LeftOutlined, InfoCircleOutlined, BookOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useProjectDetail } from '../../../hooks/useProjectDetail';
import { formatDateRange } from '../../../utils/dataTransform';

// 模拟用户信息，可以从 context 或 props 获取
const currentUser = { name: "1", avatarUrl: "/path/to/avatar.png" };

/**
 * 美化后的项目详情页面
 * @returns 
 */
const ProjectDetailPage = () => {
  const { activityId, projectId } = useParams();
  const navigate = useNavigate();
  const [isIntroVisible, setIntroVisible] = useState(false);
  const [isScoresVisible, setScoresVisible] = useState(false);
  const [isRankingVisible, setRankingVisible] = useState(false);

  // 记忆化处理路由参数，确保参数解析的稳定性
  const parsedProjectId = useMemo(() => {
    if (!projectId) return undefined;
    const id = parseInt(projectId, 10);
    return isNaN(id) ? undefined : id;
  }, [projectId]);

  // 获取项目详情数据
  const { projectDetail, loading, error, isRetrying, refetch } = useProjectDetail(parsedProjectId);


  // 模拟用户统计数据（后续可接入真实API）
  const userStats = {
    totalScore: 23,
    maxStreak: 7,
    rank: 21,
    todayProgress: { completed: 3, total: 5 } // 今日打卡进度
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
   * 处理栏目点击事件
   * @param columnId 栏目ID
   */
  const handleColumnClick = (columnId: number) => {
    navigate(`/user/activity/${activityId}/project/${projectId}/column/${columnId}`);
  };
  const Icons = [
    <BookOutlined />,
    <ExperimentOutlined />,
    <InfoCircleOutlined />,
  ]
  const getIcons = (index: number) => {
    return Icons[index % Icons.length]
  }
  // 加载状态
  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 shadow-lg rounded-b-3xl">
          <div className="flex items-center justify-between">
            <Button 
              type="text" 
              shape="circle" 
              icon={<LeftOutlined />} 
              className="text-white hover:bg-white/20" 
              onClick={() => navigate(-1)} 
            />
            <h1 className="text-xl font-bold">项目详情</h1>
            <div className="w-8"></div>
          </div>
        </header>
        <div className="flex flex-col justify-center items-center h-64">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">
            {isRetrying ? '正在重试加载...' : '正在加载项目详情...'}
          </div>
        </div>
      </div>
    );
  }

  // 错误状态处理
  if (error || (!loading && !projectDetail)) {
    // 区分不同的错误情况
    let errorTitle = "加载失败";
    let errorSubTitle = error || "项目不存在或已被删除";
    
    if (!parsedProjectId) {
      errorTitle = "参数错误";
      errorSubTitle = "项目ID无效";
    }

    return (
      <div className="bg-slate-50 min-h-screen">
        <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 shadow-lg rounded-b-3xl">
          <div className="flex items-center justify-between">
            <Button 
              type="text" 
              shape="circle" 
              icon={<LeftOutlined />} 
              className="text-white hover:bg-white/20" 
              onClick={() => navigate(-1)} 
            />
            <h1 className="text-xl font-bold">项目详情</h1>
            <div className="w-8"></div>
          </div>
        </header>
        <div className="p-4">
          <Result
            status="error"
            title={errorTitle}
            subTitle={errorSubTitle}
            extra={
              parsedProjectId && (
                <Button type="primary" onClick={refetch}>
                  重试
                </Button>
              )
            }
          />
        </div>
      </div>
    );
  }

  // 此时 projectDetail 已确保不为 null
  if (!projectDetail) {
    return null; // 这行代码永远不会执行，但能让 TypeScript 推断出下面的 projectDetail 不为 null
  }

  return (
    // 使用更柔和的背景色
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 shadow-lg rounded-b-3xl">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">{projectDetail.name}</h1>
          <Button type="text" shape="circle" icon={<InfoCircleOutlined />} className="text-white hover:bg-white/20" onClick={() => setIntroVisible(true)} />
        </div>
        {/* 项目时间显示*/}
        <div className="text-center mt-3">
            <p className="text-sm opacity-80">项目时间</p>
            <p className="font-semibold tracking-wider">
              {formatDateRange(projectDetail.start_date, projectDetail.end_date)}
            </p>
        </div>
   
      </header>

      {/* 主内容区域 */}
      <main className="p-4 pb-20">
        {/* 打卡栏目卡片 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-700 px-2">打卡栏目</h3>
          {projectDetail.columns.map((column, index) => ( 
            <div key={column.id} className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 rounded-2xl shadow-lg flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{column.name}</h2>
                </div>
              </div>
              <Button  
                shape="round" 
                className="bg-white text-red-500 font-bold border-none hover:bg-white/90"
                onClick={() => handleColumnClick(column.id)}
              >
                进入栏目
              </Button>
            </div>
          ))}
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
          <h2 className="text-xl font-bold text-gray-800 ">{projectDetail.name}</h2>
              
            {/* 活动时间 */}
            <p className="text-gray-600 mb-6">
              活动时间：{formatDateRange(projectDetail.start_date, projectDetail.end_date)}
            </p>
          {/* 活动描述 */}
          <div className="text-left space-y-4 text-sm text-gray-700 leading-relaxed">
            <h3 className="font-semibold text-gray-800 mb-2">活动描述：</h3>
            <p>{projectDetail.description}</p>
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

export default ProjectDetailPage;
