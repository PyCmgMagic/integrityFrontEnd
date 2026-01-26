import  { useState, useEffect, useCallback, useRef } from 'react'; // 添加 useRef
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar, Space, message, Spin } from 'antd';
import { LeftOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// 导入外部的编辑弹窗组件
import EditActivityModal from './EditActivityModal';
import { Dialog, SwipeAction, Toast } from 'antd-mobile';
import { ActivityAPI, ProjectAPI } from '../../../services/api';
import { formatDateFromNumber } from '../../../utils/dataTransform';
import type { ActivityDetailResponse } from '../../../types/api';
import ProjectIcon from '../../../components/ProjectIcon';

const currentUser = JSON.parse(localStorage.getItem('auth-storage') || 'null');
/**
 * 
 * @returns 
 */
const ActivityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 添加取消请求的引用
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  // --- State 管理 ---
  const [isIntroVisible, setIntroVisible] = useState(false);
  const [isScoresVisible, setScoresVisible] = useState(false);
  const [isRankingVisible, setRankingVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  // API数据状态
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // 组件卸载时的清理
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // 取消进行中的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * 获取活动详情数据 
   */
  const fetchActivityDetail = useCallback(async (activityId?: string) => {
    const currentId = activityId || id;
    
    // 等待路由参数完全加载
    if (!currentId) {
      console.warn('⚠️ ID 参数未就绪');
      return;
    }

    // 验证ID是否为有效数字
    const numericId = Number(currentId);
    if (isNaN(numericId) || numericId <= 0) {
      const errorMsg = `无效的活动ID: ${currentId}`;
      console.error('❌ 错误:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的请求控制器
    const controller = new AbortController();
    abortControllerRef.current = controller;
       try {
      // 重置状态，准备发起新的请求
      setLoading(true);
      setError(null);
      console.log('📡 调用API获取活动详情, activityId:', numericId);
      
      const response = await ActivityAPI.getActivityDetail(numericId);
      const staticResponse = await ActivityAPI.getActivityStaticDetail(numericId);
      if(response.activity.owner_id !==  currentUser?.state.user.id ){
        navigate(`/user/activity/${numericId}`);
        return;
      }

      // 检查组件是否仍然挂载以及请求是否被取消
      if (!mountedRef.current || controller.signal.aborted) {
        console.log('🚫 组件已卸载或请求被取消，忽略响应');
        return;
      }
      if(staticResponse.code)
      console.log('✅ 成功获取活动详情:', response);
      setActivityData(response);
      
    } catch (error: any) {
      // 统一处理请求被取消的情况
      const isCanceled = (
        error.name === 'AbortError' || 
        controller.signal.aborted ||
        (error.message && error.message.toLowerCase().includes('cancel'))
      );
      
      // 如果是取消错误，则静默处理，不显示任何用户提示
      if (isCanceled) {
        console.log('🚫 请求被主动取消 (开发环境下的正常行为)');
        return; // 直接退出，不执行后续错误处理
      }
      
      // 检查组件是否仍然挂载（处理真实的错误）
      if (!mountedRef.current) {
        console.log('🚫 组件已卸载，忽略真实错误');
        return;
      }
      
      console.error('❌ 获取活动详情失败:', error);
      
      // 为真实错误设置并显示消息
      let errorMessage = '获取活动详情失败';
      if (error.code === 404) {
        errorMessage = `活动不存在 (ID: ${numericId})`;
      } else if (error.message) { // 移除了 !error.message.includes('canceled')
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      message.error(errorMessage);

    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // 移除 id 依赖，防止无限循环

  // 简化的 useEffect，只在 id 变化时触发
  useEffect(() => {
    console.log('🚀 useEffect 触发，当前id:', id);
    if (!id) {
      console.warn('⚠️ ID 参数未就绪，等待路由加载...');
      // 给路由参数一些时间来加载
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          console.log('⏰ 延迟后重试获取数据，当前页面参数:', window.location.pathname);
          // 重新检查URL参数
          const pathParts = window.location.pathname.split('/');
          const urlId = pathParts[pathParts.indexOf('activity') + 1];
          if (urlId && urlId !== id) {
            console.log('📍 从URL直接获取ID:', urlId);
            fetchActivityDetail(urlId);
          }
        }
      }, 150);
      
      return () => clearTimeout(timer);
    } else {
      // ID 存在时立即获取数据
      fetchActivityDetail(id);
    }
  }, [id]); // 只依赖于 id 变化

  // 处理从API获取的数据
  const activity = activityData ? {
    name: activityData.activity.name,
    time: `${formatDateFromNumber(activityData.activity.start_date)} - ${formatDateFromNumber(activityData.activity.end_date)}`,
    description: activityData.activity.description,
  } : {
    name: '加载中...',
    time: '加载中...',
    description: '加载中...',
  };
  
  // 为编辑表单准备的详细数据
  const activityInitialData = activityData ? {
    name: activityData.activity.name,
    description: activityData.activity.description,
    cover: activityData.activity.avatar,
    avatar: activityData.activity.avatar,
    daily_point_limit: activityData.activity.daily_point_limit,
    completion_bonus: activityData.activity.completion_bonus,
    startTime: formatDateFromNumber(activityData.activity.start_date),
    endTime: formatDateFromNumber(activityData.activity.end_date),
    timeRange: [
      dayjs(formatDateFromNumber(activityData.activity.start_date)), 
      dayjs(formatDateFromNumber(activityData.activity.end_date))
    ],
  } : null;
  
  const userStats = {
    totalScore: 23,
    maxStreak: 7,
    rank: 21,
    todayProgress: { completed: 3, total: 5 }
  };

  const projects = activityData?.projects?.map((project, index) => ({
    id: Number(project.id),
    title: project.name || `项目 ${index + 1}`,
    subtitle: project.description || '暂无描述',
    icon: <ProjectIcon name={project.avatar} className="text-4xl text-white" />,
    gradient: index % 2 === 0 ? 'from-orange-500 to-red-500' : 'from-amber-500 to-orange-500',
  })) || [];


  const rankingData = Array.from({ length: 30 }, (_, i) => ({
    rank: i + 1,
    name: `用户${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    score: 100 - i * 2,
    avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`
  }));

  const handleProjectClick = (projectId: number) => {
    navigate(`/admin/activity/${id}/project/${projectId}`);
  };
  
  const handleNewProjectClick = () => {
    navigate(`/admin/create/activity/${id}/project`);
  }

  const handleEditFinish = () => {
    message.success('活动信息已成功更新!');
    setEditModalVisible(false);
    fetchActivityDetail(); // 重新获取活动数据
  };

  /**
   * 处理导出排行榜
   */
  const handleExportRanking = async () => {
    if (!id) return;
    
    setExporting(true);
    try {
      await ActivityAPI.exportActivityRanking(Number(id));
      message.success('排行榜导出成功!');
    } catch (error: any) {
      console.error('导出排行榜失败:', error);
      message.error(error.message || '导出排行榜失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const rightActions = (projectId: number) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => handleDelete(projectId),
    },
  ];
  
  /**
   * 删除项目处理函数
   * @param projectId 项目ID
   */
  const handleDelete = async (projectId: number) => {
    const result = await Dialog.confirm({
      content:'确定删除这个项目吗？删除后无法恢复。',
      confirmText: '确认删除',
      cancelText: '取消',
    });
    if (result) {
      try {
        // 调用删除项目API
        await ProjectAPI.deleteProject(projectId);
        
        // 显示成功提示
        Toast.show({ 
          content: '项目删除成功',
          duration: 2000
        });
        // 重新获取活动数据以更新项目列表
        fetchActivityDetail(); 
        
      } catch (error: any) {
        console.error('删除项目失败:', error);
        
        // 显示错误提示
        Toast.show({ 
          content: error.message || '删除项目失败，请重试',
          duration: 3000
        });
      }
    }
  }

  // --- 渲染逻辑 ---

  // 加载状态：在数据请求期间显示（改进了判断逻辑）
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">
            {!id ? '正在加载路由参数...' : '正在获取活动详情...'}
          </p> 
        </div> 
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="space-y-2">
            <Button type="primary" onClick={() =>fetchActivityDetail(id)} className="w-full">
              重试
            </Button> 
            <Button onClick={() => navigate('/admin/home')} className="w-full">
              返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // 主UI渲染
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white pt-6 px-2 pb-4shadow-lg rounded-b-3xl">
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">{activity.name}</h1>
          {<Button  type="text" shape="circle" icon={<EditOutlined />} className={`text-white hover:bg-white/20 ${
            activityData?.activity?.owner_id !== currentUser?.state.user.id 
              ? 'invisible pointer-events-none' 
              : ''
          }`} onClick={() => setEditModalVisible(true)} />}
        </div>
        <div className='flex items-center justify-between mt-6'>
          <Space className='flex items-between'>
              <Button 
                size='small' 
                icon={<DownloadOutlined />}
                loading={exporting}
                onClick={handleExportRanking}
                className="px-2 py-1 text-sm h-auto bg-white text-red-500 font-light border-none hover:bg-white/90"
              >
                导出活动数据
              </Button>
          </Space>
            <div className="text-center mt-3">
                <p className="text-sm opacity-80">活动时间</p>
                <p className="font-semibold tracking-wider pb-2">{activity.time}</p>
            </div>
        </div>
      </header>

      <main className="p-2 pb-20"> 
        <div className="space-y-4">
           {
            activityData?.activity?.owner_id === currentUser?.state.user.id &&  
            <div  className={`bg-gradient-to-r from-orange-500 to-red-500 p-3 flex-col rounded-2xl shadow-lg border-4 border-white/50 border-dashed  flex items-center justify-center `}>
              <div className="flex items-center"></div>
            <div onClick={() => navigate(`/admin/create/activity/${id}/project`)} className=" w-16 h-16 rounded-full flex items-center justify-center mb-2 border-2 border-white/50 border-dashed shadow">
              <span className="text-4xl font-bold text-white">+</span>
            </div> 
            <p onClick={handleNewProjectClick} className="text-lg font-semibold text-white">新增项目</p> 
            </div>  
            }
          <h3 className="text-lg font-bold text-gray-700 px-2">打卡项目</h3>
          {projects.map((project) => (
            <SwipeAction
              key={project.id}
              data-id={project.id}
              rightActions={rightActions(Number(project.id))} 
            >
            <div key={project.id} className={`bg-gradient-to-r ${project.gradient} p-6 rounded-2xl shadow-lg flex items-center justify-between`}>
              <div className="flex items-center">
                <div className="mr-4 bg-white/20 p-3 rounded-full">{project.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-white">{project.title}</h2>
                  <p className="text-gray-100 text-sm h-10 overflow-hidden line-clamp-2">{project.subtitle}</p>
                </div>
              </div>
              <Button  
                shape="round" 
                className="bg-white text-red-500 font-bold border-none hover:bg-white/90"
                onClick={() => handleProjectClick(Number(project.id))}

              >
                查看
              </Button>
            </div>
            </SwipeAction>
          ))}
        </div>
      </main>

      {/* Modals */}
      <Modal title="活动简介" open={isIntroVisible} onCancel={() => setIntroVisible(false)} footer={null}>
        <p className="text-gray-600 leading-relaxed">{activity.description}</p>
      </Modal>

      <Modal title="我的分数" open={isScoresVisible} onCancel={() => setScoresVisible(false)} footer={null}>
        <div className="text-center mb-4">
          <p className="text-gray-500">总分数</p>
          <p className="text-5xl font-bold text-orange-500">{userStats.totalScore}</p>
        </div>
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

      {activityInitialData && (
        <EditActivityModal
          visible={isEditModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onClose={() => setEditModalVisible(false)}
          onSuccess={handleEditFinish}
          activityId={Number(id)}
          initialData={activityInitialData}
        />
      )}
    </div>  
  );
}; 

export default ActivityDetailPage;
