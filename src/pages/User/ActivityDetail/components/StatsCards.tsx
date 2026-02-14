import React from 'react';
import { Trophy, Calendar, Zap, Users, Star, Award } from 'lucide-react';
import { type UserStats } from '../types';

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
 * 包含累计得分、签到记录、排名等全方位数据展示
 */
const StatsCards: React.FC<StatsCardsProps> = ({
  userStats,
  onScoresClick,
  onRankingClick
}) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* 第一行：累计得分 & 我的排名 (主要展示区) */}
      <div className="grid grid-cols-5 gap-4">
        {/* 累计得分 - 大卡片 */}
        <div 
          className="col-span-3 bg-gradient-to-br from-orange-400 to-orange-500 p-5 rounded-3xl shadow-lg shadow-orange-100 flex flex-col justify-between relative overflow-hidden cursor-pointer group"
          onClick={onScoresClick}
        >
          <div className="z-10">
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
              <Star className="text-white w-6 h-6 fill-white/20" />
            </div>
            <p className="text-white/80 text-sm font-medium">累计得分</p>
            <p className="text-white text-4xl font-black mt-1 leading-none">
              {userStats.total_score}
            </p>
          </div>
          
          {/* 背景装饰图层 */}
          <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute right-4 top-4 opacity-20">
            <Award className="text-white w-16 h-16" />
          </div>
        </div>

        {/* 我的排名 - 垂直卡片 */}
        <div 
          className="col-span-2 bg-white p-5 rounded-3xl shadow-md border border-gray-50 flex flex-col justify-between cursor-pointer group hover:border-amber-200 transition-colors"
          onClick={onRankingClick}
        >
          <div className="flex justify-between items-start">
            <div className="bg-amber-50 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Trophy className="text-amber-500 w-5 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Rank</span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">当前排名</p>
            <div className="flex items-baseline gap-1">
              <p className="text-gray-400 text-[10px] font-bold">TOP</p>
              <p className="text-amber-600 text-3xl font-black">{userStats.rank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 第二行：今日参与 & 签到详情 (网格展示区) */}
      <div className="grid grid-cols-4 gap-3">
        {/* 总参与人数 */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-50 p-1.5 rounded-lg mb-2">
            <Users className="text-blue-500 w-4 h-4" />
          </div>
          <p className="text-gray-900 text-sm font-bold leading-tight">{userStats.today_punched_user_count}</p>
          <p className="text-gray-400 text-[10px] mt-0.5">总参与人数</p>
        </div>

        {/* 当前连签 */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-red-50 p-1.5 rounded-lg mb-2">
            <Zap className="text-red-500 w-4 h-4 fill-red-50" />
          </div>
          <p className="text-gray-900 text-sm font-bold leading-tight">{userStats.current}d</p>
          <p className="text-gray-400 text-[10px] mt-0.5">当前连签</p>
        </div>

        {/* 最长连签 */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-orange-50 p-1.5 rounded-lg mb-2">
            <Calendar className="text-orange-500 w-4 h-4" />
          </div>
          <p className="text-gray-900 text-sm font-bold leading-tight">{userStats.max}d</p>
          <p className="text-gray-400 text-[10px] mt-0.5">最长连签</p>
        </div>

        {/* 总打卡天数 */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-emerald-50 p-1.5 rounded-lg mb-2">
            <Award className="text-emerald-500 w-4 h-4" />
          </div>
          <p className="text-gray-900 text-sm font-bold leading-tight">{userStats.total}d</p>
          <p className="text-gray-400 text-[10px] mt-0.5">总打卡天数</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
export type { UserStats };