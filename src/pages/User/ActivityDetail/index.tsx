import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin} from 'antd';
// import { type UserStats } from './types';

// 导入组件
import {
  ActivityHeader,
  StatsCards,
  ProjectList,
  ActivityIntroModal,
  // ScoresModal,
  RankingModal
} from './components';

// 导入hooks
import {
  useActivityDetail,
  useUserStats,
} from './hooks';
/**
 * ActivityDetailPage组件 - 活动详情页面
 * 使用拆分后的子组件和自定义hooks实现
 */
const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 弹窗状态管理
  const [isIntroVisible, setIntroVisible] = useState(false);
  // const [isScoresVisible, setScoresVisible] = useState(false);
  const [isRankingVisible, setRankingVisible] = useState(false);
//数据状态管理
  
  // 使用自定义hooks获取数据
  const { activityData, loading } = useActivityDetail(id);
  const { userStats, loading: userStatsLoading } = useUserStats(Number(id));


  /**
   * 处理返回按钮点击
   */
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * 处理项目卡片点击
   */
  const handleProjectClick = useCallback((projectId: number) => {
    navigate(`/user/activity/${id}/project/${projectId}`);
  }, [navigate]);

  // 加载状态 - 等待活动数据和用户统计数据都加载完成
  if (loading || userStatsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // 无数据状态
  if (!activityData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">未找到活动信息</p>
          <Button onClick={handleGoBack}>返回活动列表</Button>
        </div>
      </div>
    );
  }

  const { activity, projects } = activityData;

  return (
    <div className="min-h-screen bg-gray-50 p-0 space-y-3 sm:p-4 sm:space-y-4">
      {/* 活动头部组件 */}
      <ActivityHeader 
        activity={{
          ...activity,
          id: Number(id) 
        }}
        onGoBack={handleGoBack}
        onShowIntro={() => setIntroVisible(true)}
      />
      {/* 统计卡片组件 */}
      <StatsCards 
        userStats={userStats}
        // onScoresClick={() => setScoresVisible(true)}
        onRankingClick={() => setRankingVisible(true)}
        onScoresClick={() => {}}
      />

      {/* 项目列表组件 */}
      <ProjectList 
        projects={projects}
        onProjectClick={handleProjectClick}
      />

      {/* 弹窗组件 */}
      <ActivityIntroModal 
        visible={isIntroVisible}
        activity={activity}
        onClose={() => setIntroVisible(false)}
      />
      
      {/* <ScoresModal 
        visible={isScoresVisible}
        totalScore={userStats.total_score}
        scoreRecords={userStats.total_score}
        onClose={() => setScoresVisible(false)}
      />
       */}
      <RankingModal 
        visible={isRankingVisible}
        activityId={Number(id)}
        onClose={() => setRankingVisible(false)}
      />
    </div>
  );
};

export default ActivityDetailPage;
