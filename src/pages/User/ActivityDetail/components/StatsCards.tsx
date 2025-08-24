import React from 'react';

/**
 * 用户统计数据接口
 */
interface UserStats {
  /** 累计得分 */
  totalScore: number;
  /** 最长连签天数 */
  maxStreak: number;
  /** 排名 */
  rank: number;
}

/**
 * StatsCards组件的属性接口
 */
interface StatsCardsProps {
  /** 用户统计数据 */
  userStats: UserStats;
  /** 累计得分卡片点击事件 */
  onScoresClick: () => void;
  /** 排名卡片点击事件 */
  onRankingClick: () => void;
}

/**
 * StatsCards组件 - 用户统计数据卡片
 * 包含累计得分、最长连签和排名统计卡片
 */
const StatsCards: React.FC<StatsCardsProps> = ({
  userStats,
  onScoresClick,
  onRankingClick
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* 左侧大卡片：累计得分 */}
      <div 
        className="col-span-2 bg-white p-3 rounded-2xl shadow-md flex flex-col justify-center items-center cursor-pointer transform hover:-translate-y-1 transition-transform" 
        onClick={onScoresClick}
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
          onClick={onRankingClick}
        >
          <p className="text-2xl font-bold text-orange-500">{userStats.rank}</p>
          <p className="text-gray-500 text-xs mt-1">我的排名</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
export type { UserStats };