// src/pages/Admin/Success/index.tsx

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { activityId, projectId  } = useParams<{ projectId: string, activityId: string }>();

  /**
   * 跳转到新创建的项目详情页
   * 使用普通导航而不是replace，确保用户可以正常返回
   */
  const handleViewProject = () => {
    if (projectId && activityId) {
      // 清除浏览器历史记录中的创建流程页面，直接导航到项目详情页
      // 这样用户从项目详情页返回时会回到管理员首页而不是创建页面
      window.history.replaceState(null, '', '/admin/home');
      navigate(`/admin/activity/${activityId}/project/${projectId}`);
    }
  };

  /**
   * 返回管理员首页
   * 清理浏览器历史记录，确保用户不会返回到创建流程页面
   */
  const handleGoToHome = () => {
    // 使用replace避免用户通过浏览器返回按钮回到成功页面
    navigate('/admin/home', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        
        {/* 成功图标 */}
        <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle size={48} className="text-green-500" />
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-bold text-gray-900">
          创建成功
        </h1>

        {/* 描述信息 */}
        <p className="mt-2 text-base text-gray-600">
          您的新项目及其所有栏目均已成功创建。
        </p>

        {/* 操作按钮组 */}
        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleViewProject}
            disabled={!projectId}
            className="w-full py-3 rounded-lg font-medium transition-all bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            查看项目详情
          </button>
          <button
            onClick={handleGoToHome}
            className="w-full py-3 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;