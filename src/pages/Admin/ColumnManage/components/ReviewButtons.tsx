import React from 'react';
import { Button } from 'antd';

interface ReviewButtonsProps {
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

/**
 * 审核按钮组件
 * @param onApprove - 审核通过回调函数
 * @param onReject - 审核驳回回调函数
 */
const ReviewButtons: React.FC<ReviewButtonsProps> = ({ onApprove, onReject }) => {
  return (
    <div className="flex gap-4 pb-4 mb-10">
      <Button
        danger
        shape="round"
        size="large"
        className="flex-1 h-12 font-medium"
        onClick={onReject}
      >
        不通过
      </Button>
      <Button
        type="primary"
        shape="round"
        size="large"
        className="flex-1 h-12 font-medium bg-green-500 hover:bg-green-600 border-green-500"
        onClick={onApprove}
      >
        通过
      </Button>
    </div>
  );
};

export default ReviewButtons;