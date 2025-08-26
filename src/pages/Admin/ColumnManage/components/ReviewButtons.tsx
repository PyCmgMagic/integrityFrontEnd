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
    <div className="bg-white p-6 shadow-lg border-t border-gray-100">
      <div className="flex gap-4">
        <Button
          danger
          shape="round"
          size="large"
          className="flex-1 h-14 font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200"
          onClick={onReject}
        >
          不通过
        </Button>
        <Button
          type="primary"
          shape="round"
          size="large"
          className="flex-1 h-14 font-semibold text-lg bg-green-500 hover:bg-green-600 border-0 shadow-md hover:shadow-lg transition-all duration-200"
          onClick={onApprove}
        >
          通过
        </Button>
      </div>
    </div>
  );
};

export default ReviewButtons;