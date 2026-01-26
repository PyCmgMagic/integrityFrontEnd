import  {  useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {  Button,Spin } from 'antd';
import { LeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Dialog, Toast } from 'antd-mobile';
import ChenkInData from './ChenkInData';
import CheckIn from '../../../components/CheckIn';
import { usePunchRecords } from '../../../hooks/usePunchRecords';
import type { CheckInData } from '../Profile/types';

/**
 * @returns 
 */
const ColumnPage = () => {
  const { columnId } = useParams();
  const navigate = useNavigate();
  
  // 添加打卡页面显示状态管理
  const [gotoCheckIn, setGotoCheckIn] = useState(false);
  
  // 获取栏目ID（从URL参数中获取）
  const currentColumnId = columnId ? parseInt(columnId) : 1; // 如果没有columnId，使用默认值1
  
  // 使用自定义Hook获取打卡记录
  const {
    loading,
    punchRecords,
    error,
    myCount,
    punchedToday,
    userCount,
    initialized,
    columnInfo,
    refreshPunchRecords,
    deletePunchRecord,
  } = usePunchRecords(currentColumnId);
  
  /**
   * 处理打卡按钮点击事件
   * 如果未打卡，则跳转到打卡页面
   * 如果已打卡，则显示提示信息
   */
  const handleCheckIn = () => {
    if (punchedToday) {
      // 已经打卡，显示提示
      Toast.show({
        content: '今日已完成打卡！',
        position: 'bottom',
      });
      return;
    }
    
    //这里显示打卡组件
    setGotoCheckIn(true);
  };

  /**
   * 处理打卡成功后的回调
   * 刷新打卡记录列表
   */
  const handleCheckInSuccess = () => {
    setGotoCheckIn(false);
    // 刷新打卡记录，这会更新 punchedToday 状态
    refreshPunchRecords();
    Toast.show({
      content: '打卡成功！',
      position: 'bottom',
    });
  };

  /**
   * 处理删除打卡记录
   * @param recordId 记录ID
   */
  const handleDeleteRecord = async (recordId: number) => {
    const targetRecord = punchRecords?.find((record) => record.id === recordId);
    if (targetRecord?.status !== 0) {
      Toast.show({
        content: '已审核或未通过的打卡不允许删除',
        position: 'bottom',
      });
      return;
    }

    const result = await Dialog.confirm({
      content: '确定要删除这条打卡记录吗？',
      confirmText: '确认',
      cancelText: '取消',
    });
    
    if (result) {
      await deletePunchRecord(recordId);
    }
  };

// 将API获取的打卡记录转换为组件需要的格式
const formattedPunchRecords:CheckInData[] = (punchRecords.reverse() || []).map((record, index) => ({
  id: record.id,
  title: `第${(punchRecords?.length || 0) - index}次打卡`,
  gradient: 'from-blue-400 to-blue-600',
  date: record.date,
  time: record.time,
  imgs: record.imgs,
  content: record.content,
  status: record.status,
  column_id:currentColumnId
}));

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 shadow-lg rounded-b-3xl">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between">
          <Button type="text" shape="circle" icon={<LeftOutlined />} className="text-white hover:bg-white/20" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">{columnInfo.name}</h1>
          <Button type="text" shape="circle"  className="text-white hover:bg-white/20" />
        </div>
        {/* 打卡列时间显示*/}
        <div className="text-center mt-3">
            <p className="text-sm opacity-80">打卡时间</p>
            <p className="font-semibold tracking-wider">
              {columnInfo.start_time || '未知'} - {columnInfo.end_time || '未知'}
            </p>
        </div>
      </header>
      {/* 主内容区域 */}
      <main className="p-2 pb-20">
        {/* 打卡信息 */}
        {gotoCheckIn ? (
          <CheckIn 
            columnId={currentColumnId}
            setGotoCheckIn={setGotoCheckIn}
            onSuccess={handleCheckInSuccess}
          /> 
        ) : (
          <Spin spinning={loading} tip="加载打卡记录中...">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={refreshPunchRecords}>重新加载</Button>
              </div>
            ) : !initialized && !loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">正在初始化...</p>
              </div>
            ) : (
              <ChenkInData 
                  columns={formattedPunchRecords} 
                  column={columnInfo}
                  onDeleteRecord={handleDeleteRecord}
                  totalRecords={userCount}
                  currentUserCheckInCount={myCount}
                />
            )}
          </Spin>
        )}
      </main>
      {/* 底部固定的打卡按钮 */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center z-10" style={{visibility: gotoCheckIn ? 'hidden' : 'visible'}}>
        <Button 
          size="large" 
          shape="round"
          icon={<CheckCircleOutlined style={{ fontSize: '28px' }} />}
          style={{ height: 'auto', padding: '10px 24px' }}
          onClick={handleCheckIn}
          disabled={loading || !initialized}
          loading={loading}
        >
          {punchedToday ? '已完成打卡' : '立即打卡'}
        </Button>
      </div>
    </div>
  );
};

export default ColumnPage;