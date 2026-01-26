import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, List, Avatar,  message, Spin, Alert } from 'antd';
import { LeftOutlined,  EditOutlined } from '@ant-design/icons';
import EditProjectModal from './EditProjectModal';
import moment from 'moment';
import EditColumnModal from './EditColumnModal';
import { Dialog, SwipeAction, Toast } from 'antd-mobile';
import { useAdminProjectDetail } from '../../../hooks/useAdminProjectDetail';
import { ColumnAPI } from '../../../services/api';


/**
 * 管理员项目详情页?
 * @returns 
 */
const ProjectDetailPage = () => {
  const { activityId, projectId } = useParams();
  const navigate = useNavigate();
  const [isIntroVisible, setIntroVisible] = useState(false);
  const [isScoresVisible, setScoresVisible] = useState(false);
  const [isRankingVisible, setRankingVisible] = useState(false);
  const [isEditProjectVisible, setEditProjectVisible] = useState(false);
  const [isEditColumnVisible, setEditColumnVisible] = useState(false);

  // 解析项目ID
  const parsedProjectId = useMemo(() => {
    if (!projectId) return undefined;
    const id = parseInt(projectId, 10);
    return isNaN(id) ? undefined : id;
  }, [projectId]);

  // 使用Hook获取项目详情
  const {
    projectDetail,
    loading,
    isRetrying,
    error,
    refetch,
    updateProject,
    updating
  } = useAdminProjectDetail(parsedProjectId);

  // 格式化日期显示?
  const formatDateRange = (startDate: number, endDate: number) => {
    const start = moment(startDate.toString(), 'YYYYMMDD').format('M.D');
    const end = moment(endDate.toString(), 'YYYYMMDD').format('M.D');
    return `${start} - ${end}`;
  };

  // 准备编辑表单的初始数据?
  const projectInitialData = useMemo(() => {
    if (!projectDetail) return null;
    
    return {
      name: projectDetail.name,
      description: projectDetail.description,
      cover: projectDetail.avatar,
      avatar: projectDetail.avatar,
      completion_bonus: projectDetail.completion_bonus,
      timeRange: [
        moment(projectDetail.start_date.toString(), 'YYYYMMDD'),
        moment(projectDetail.end_date.toString(), 'YYYYMMDD')
      ],
    };
  }, [projectDetail]);
  const userStats = {
    totalScore: 23,
    maxStreak: 7,
    rank: 21,
    todayProgress: { completed: 3, total: 5 } // 今日打卡进度
  };

  const columns = useMemo(() => {
    if (!projectDetail?.columns) return [];
    
    return projectDetail.columns.map(column => ({
      id: column.id.toString(),
      title: column.name,
      gradient: 'from-amber-500 to-orange-500',
      avatar: column.avatar,
      optional: column.optional,
    }));
  }, [projectDetail]);

  const rankingData = Array.from({ length: 30 }, (_, i) => ({
    rank: i + 1,
    name: `用户${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    score: 100 - i * 2,
    avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}` // 使用 placeholder 头像
  }));

  const handleColumnClick = (columnId: string) => {
    navigate(`/admin/activity/${activityId}/project/${projectId}/column/${columnId}`);
  };
  // 从编辑弹窗接收表单数据的处理函数
  const handleEditProjectFinish = async (values: any) => {
    if (!parsedProjectId || !activityId) {
      message.error('项目ID或活动ID无效');
      return;
    }

    try {
      // 格式化数据以匹配API要求
      const updateData = {
        name: values.name,
        description: values.description,
        activity_id: parseInt(activityId, 10),
        start_date: parseInt(values.timeRange[0].format('YYYYMMDD'), 10),
        end_date: parseInt(values.timeRange[1].format('YYYYMMDD'), 10),
        avatar: values.avatar,
        completion_bonus: values.completion_bonus !== undefined && values.completion_bonus !== null
          ? parseInt(values.completion_bonus, 10)
          : undefined
      };

      const success = await updateProject(updateData);
      
      if (success) {
        message.success('项目信息已成功更改?');
        setEditProjectVisible(false);
      } else {
        message.error('更新项目信息失败');
      }
    } catch (error) {
      console.error('更新项目失败:', error);
      message.error('更新项目信息失败');
    }
  };
  const handleEditColumnFinish = (values: any) => {
    console.log('表单数据已成功提交到父组件?', values);
    setEditColumnVisible(false);
    refetch();
  };
  const rightActions = (columnId: string) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => handleDelete(columnId),
    },
  ];
 const handleDelete = async (columnId: string) => {
  const result = await Dialog.confirm({
    content:'确定删除这个栏目吗？',
    confirmText: '确认',
    cancelText: '取消',
  });
  if(result){
    //删除栏目
    try {
      await ColumnAPI.deleteColumn(parseInt(columnId, 10));
      Toast.show({
        content:'删除成功',
        duration: 2000
      })
      refetch();
    } catch (error:any) {
        console.error('删除栏目失败:', error);
      Toast.show({
        content:error.message ||'删除失败',
        duration: 3000
      })
    }
  }
 }
  // 处理无效项目ID的情况
  if (!parsedProjectId) {
    return (
      <div className="bg-slate-50 min-h-screen font-sans flex items-center justify-center">
        <Alert
          message="\u9879\u76eeID\u65e0\u6548"
          description="\u8bf7\u68c0\u67e5 URL \u4e2d\u7684\u9879\u76eeID\u3002"
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate(-1)}>
              返回
            </Button>
          }
        />
      </div>
    );
  }

  // 加载状态
  if (loading || isRetrying) {
    return (
      <div className="bg-slate-50 min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">
            {isRetrying ? '正在重试加载项目详情...' : '正在加载项目详情...'}
          </p>
        </div>
      </div>
    );
  }

  // 错误状态处理
  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen font-sans flex items-center justify-center">
        <Alert
          message="\u52a0\u8f7d\u5931\u8d25"
          description={error}
          type="error"
          showIcon
          action={
            <div className="space-x-2">
              <Button size="small" onClick={refetch}>
                重试
              </Button>
              <Button size="small" onClick={() => navigate(-1)}>
                返回
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // 项目数据不存在
  if (!projectDetail) {
    return (
      <div className="bg-slate-50 min-h-screen font-sans flex items-center justify-center">
        <Alert
          message="\u9879\u76ee\u4e0d\u5b58\u5728"
          description="\u672a\u80fd\u52a0\u8f7d\u6307\u5b9a\u7684\u9879\u76ee\u3002"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => navigate(-1)}>
              返回
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 shadow-lg rounded-b-3xl">
        {/* 顶部导航*/}
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">{projectDetail.name}</h1>
          <Button 
            type="text" 
            shape="circle" 
            icon={<EditOutlined />} 
            className="text-white hover:bg-white/20" 
            onClick={() => setEditProjectVisible(true)}
            loading={updating}
          />
        </div>
        {/* 活动时间显示*/}
        <div className="text-center mt-3">
            <p className="text-sm opacity-80">活动时间</p>
            <p className="font-semibold tracking-wider">
              {formatDateRange(projectDetail.start_date, projectDetail.end_date)}
            </p>
        </div>
   
      </header>

      {/* 主内容区*/}
      <main className="p-2 pb-20">
        {/* 打卡项目卡片 */}
        <div className="space-y-4">
          <div  className={`bg-gradient-to-r from-orange-500 to-red-500 p-3 flex-col rounded-2xl shadow-lg border-4 border-white/50 border-dashed  flex items-center justify-center`}>
              <div className="flex items-center"></div>
            <div onClick={() => setEditColumnVisible(true)} className=" w-16 h-16 rounded-full flex items-center justify-center mb-2 border-2 border-white/50 border-dashed shadow">
              <span className="text-4xl font-bold text-white">+</span>
            </div> 
            <p  onClick={() => setEditColumnVisible(true)} className="text-lg font-semibold text-white">新增栏目</p>
            </div>
          <h3 className="text-lg font-bold text-gray-700 px-2">打卡栏目</h3>
          {columns.map((column) => (
            <SwipeAction
              key={column.id}
              rightActions={rightActions(column.id)}
            >
            <div key={column.id} className={`bg-gradient-to-r ${column.gradient} p-8 rounded-2xl shadow-lg flex items-center justify-between`}>
              <div className="flex items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {column.title}
                    {column.optional && (
                      <span className="ml-2 text-xs font-semibold text-white bg-emerald-500/90 px-2 py-0.5 rounded-full border border-emerald-200/80">
                        特殊栏目
                      </span>
                    )}
                  </h2>
                </div>
              </div>
              <Button  
                shape="round" 
                className="bg-white text-red-500 font-bold border-none hover:bg-white/90"
                onClick={() => handleColumnClick(column.id)}
              >
                进入栏目
              </Button>
            </div>
            </SwipeAction>
          ))}
        </div>
      </main>

      {/* --- 弹窗 --- */}
      <Modal title="\u9879\u76ee\u4ecb\u7ecd" open={isIntroVisible} onCancel={() => setIntroVisible(false)} footer={null}>
        <p className="text-gray-600 leading-relaxed">{projectDetail.description}</p>
      </Modal>

            <Modal title="\u6211\u7684\u79ef\u5206" open={isScoresVisible} onCancel={() => setScoresVisible(false)} footer={null}>
        <div className="text-center mb-4">
          <p className="text-gray-500">\u603b\u79ef\u5206</p>
          <p className="text-5xl font-bold text-orange-500">{userStats.totalScore}</p>
        </div>
      </Modal>

      <Modal title="\u6392\u884c\u699c" open={isRankingVisible} onCancel={() => setRankingVisible(false)} footer={null} width={360}>
        <List
          dataSource={rankingData}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar className={item.rank <= 3 ? 'bg-amber-400 text-white font-bold' : 'bg-gray-200 text-gray-600'}>{item.rank}</Avatar>}
                title={<span className="font-semibold">{item.name}</span>}
                description={<><Avatar size={20} src={item.avatar} className="mr-2"/>{item.name}</>}
              />
              <div className="font-bold text-gray-700">{item.score} \u5206</div>
            </List.Item>
          )}
        />
      </Modal>
      {projectInitialData && (
        <EditProjectModal
          visible={isEditProjectVisible}
          onClose={() => setEditProjectVisible(false)}
          onFinish={handleEditProjectFinish}
          initialData={projectInitialData}
        />
      )}
      <EditColumnModal
        visible={isEditColumnVisible}
        onClose={() => setEditColumnVisible(false)}
        onFinish={handleEditColumnFinish}
        projectId={parsedProjectId}
        projectStartDate={projectDetail.start_date}
        projectEndDate={projectDetail.end_date}
      />
    </div>
  );
};

export default ProjectDetailPage;

