import React from 'react';
import { Modal, List } from 'antd';

/**
 * 得分记录接口
 */
interface ScoreRecord {
  /** 任务描述 */
  task: string;
  /** 得分 */
  score: number;
  /** 日期 */
  date: string;
}

/**
 * ScoresModal组件的属性接口
 */
interface ScoresModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 总分数 */
  totalScore: number;
  /** 得分记录列表 */
  scoreRecords: ScoreRecord[];
  /** 关闭弹窗事件 */
  onClose: () => void;
}

/**
 * ScoresModal组件 - 得分记录弹窗
 * 显示用户的总分数和详细得分记录
 */
const ScoresModal: React.FC<ScoresModalProps> = ({
  visible,
  totalScore,
  scoreRecords,
  onClose
}) => {
  return (
    <Modal 
      title="我的分数" 
      open={visible} 
      onCancel={onClose} 
      footer={null}
    >
      <div className="text-center mb-4">
        <p className="text-gray-500">总分数</p>
        <p className="text-5xl font-bold text-orange-500">{totalScore}</p>
      </div>
      
      <List
        header={<div className="font-semibold">得分记录</div>}
        dataSource={scoreRecords}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta 
              title={item.task} 
              description={item.date} 
            />
            <div className="font-bold text-green-500 text-lg">+{item.score}</div>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default ScoresModal;
export type { ScoreRecord };