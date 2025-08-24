import React from 'react';
import { Modal, List, Avatar } from 'antd';

/**
 * 排行榜数据接口
 */
interface RankingItem {
  /** 排名 */
  rank: number;
  /** 用户名 */
  name: string;
  /** 得分 */
  score: number;
  /** 头像URL */
  avatar: string;
}

/**
 * RankingModal组件的属性接口
 */
interface RankingModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 排行榜数据 */
  rankingData: RankingItem[];
  /** 关闭弹窗事件 */
  onClose: () => void;
}

/**
 * RankingModal组件 - 排行榜弹窗
 * 显示用户排行榜信息
 */
const RankingModal: React.FC<RankingModalProps> = ({
  visible,
  rankingData,
  onClose
}) => {
  return (
    <Modal 
      title="排行榜" 
      open={visible} 
      onCancel={onClose} 
      footer={null} 
      width={360}
    >
      <List
        dataSource={rankingData}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  className={
                    item.rank <= 3 
                      ? 'bg-amber-400 text-white font-bold' 
                      : 'bg-gray-200 text-gray-600'
                  }
                >
                  {item.rank}
                </Avatar>
              }
              title={<span className="font-semibold">{item.name}</span>}
              description={
                <>
                  <Avatar size={20} src={item.avatar} className="mr-2"/>
                  {item.name}
                </>
              }
            />
            <div className="font-bold text-gray-700">{item.score}分</div>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default RankingModal;
export type { RankingItem };