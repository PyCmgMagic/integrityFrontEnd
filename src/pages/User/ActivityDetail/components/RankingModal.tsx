import React, { useState, useEffect } from 'react';
import { Modal, List, Avatar, Spin, Empty, Pagination } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { API } from '../../../../services/api';
import type { RankingItem } from '../types';

/**
 * RankingModal组件的属性接口
 */
interface RankingModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 活动ID */
  activityId: number;
  /** 关闭弹窗事件 */
  onClose: () => void;
}

/**
 * RankingModal组件 - 排行榜弹窗
 * 显示用户排行榜信息
 */
const RankingModal: React.FC<RankingModalProps> = ({
  visible,
  activityId,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (visible && activityId) {
      fetchRanking(1, pagination.pageSize);
    }
  }, [visible, activityId]);

  const fetchRanking = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await API.Activity.getActivityRank(activityId, { page, page_size: pageSize });
      console.log('Ranking API Response:', res);
      if (res.code === 200) {
        const list = res.data?.rank_list ?? (Array.isArray(res.data) ? res.data : (res.data as any)?.data || []);
        setRankingData(list);
        const total = res.data?.total ?? res.data?.count ?? list.length;
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize,
          total,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    fetchRanking(page, pageSize);
  };



  /**
    * 渲染排名奖牌或数字
    */
  const renderRank = (rank: number) => {
    if (rank === 1) return <TrophyOutlined style={{ color: '#ffd700', fontSize: '20px' }} />;
    if (rank === 2) return <TrophyOutlined style={{ color: '#c0c0c0', fontSize: '20px' }} />;
    if (rank === 3) return <TrophyOutlined style={{ color: '#cd7f32', fontSize: '20px' }} />;
    return <span className="text-gray-500 font-medium">{rank}</span>;
  };

  return (
    <Modal 
      title={
        <div className="flex items-center gap-2 text-lg font-bold">
          <TrophyOutlined className="text-amber-500" />
          <span>活动排行榜</span>
        </div>
      } 
      open={visible} 
      onCancel={onClose} 
      footer={null} 
      width={450}
      centered
      className="ranking-modal"
      bodyStyle={{ padding: '12px 24px 24px' }}
    >
      {loading ? (
        <div className="py-12 flex justify-center">
          <Spin tip="\u52a0\u8f7d\u6392\u884c\u699c.." />
        </div>
      ) : rankingData.length > 0 ? (
        <>
          <List
            dataSource={rankingData}
            renderItem={(item) => (
              <List.Item className="border-b last:border-b-0 py-4">
                <div className="flex items-center w-full gap-4">
                  <div className="flex-shrink-0 w-8 text-center">
                    {renderRank(item.rank)}
                  </div>
                  
                  <Avatar 
                    size={44} 
                    src={item.user.avatar || '/assets/\u9ed8\u8ba4\u5934\u50cf.png'} 
                    className="bg-gray-100 flex-shrink-0"
                  >
                    {!item.user.avatar && !item.user.nick_name && 'U'}
                  </Avatar>
                  
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-gray-800 truncate">
                      {item.user.nick_name}
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">
                      {[item.user.college, item.user.major, item.user.grade].filter(Boolean).join(' | ')}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="text-amber-600 font-bold text-lg">{item.score}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Points</div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {pagination.total > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
              />
            </div>
          )}
        </>
      ) : (
        <Empty description="\u6682\u65e0\u6392\u540d\u6570\u636e" className="py-8" />
      )}
    </Modal>
  );
};

export default RankingModal;
