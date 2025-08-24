import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { API } from '../services/api';
import type { CheckInData, PunchRecordsData } from '../types/types';
import { transformPunchRecordsToCheckInData } from '../utils/dataTransform';
/**
 * 打卡记录管理Hook
 * @param columnId 栏目ID
 * @returns 打卡记录数据和相关操作方法
 */
export const usePunchRecords = (columnId: number) => {
  const [loading, setLoading] = useState(true); // 初始状态为加载中
  const [punchRecords, setPunchRecords] = useState<CheckInData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myCount, setMyCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [punchedToday, setPunchedToday] = useState(false);
  const [columnInfo, setColumnInfo] = useState<{
      ID: number;
      CreatedAt: string;
      UpdatedAt: string;
      DeletedAt: null;
      name: string;
      description: string;
      owner_id: string;
      project_id: number;
  }>({
    ID: 0,
    CreatedAt: '',
    UpdatedAt: '',
    DeletedAt: null,
    name: '',
    description: '',
    owner_id: '',
    project_id: 0
  });


  /**
   * 获取打卡记录列表
   */
  const fetchPunchRecords = useCallback(async () => {
    // 验证columnId是否有效
    if (!columnId || columnId <= 0) {
      setError('无效的栏目ID');
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // request工具已经提取了response.data.data，所以这里直接获得的是数据部分
      const data = await API.Column.getPunchRecords(columnId);
      const today_punch_count = await API.Column.getTodayTotalPunchRecords(columnId);
      const columnInfo = await API.Column.getColumnInfo(columnId)
      setColumnInfo(columnInfo)
      // 转换数据格式
      const transformedRecords = transformPunchRecordsToCheckInData(data.records);
      
      setPunchRecords(transformedRecords);
      setMyCount(data.my_count);
      setUserCount(today_punch_count.today_punch_count);
      setPunchedToday(data.punched_today)
    } catch (err: any) {
      const errorMessage = err?.message || '获取打卡记录失败';
      // 忽略静默错误（如请求取消）
      if (!err.silent) {
        setError(errorMessage);
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [columnId]);

  /**
   * 刷新打卡记录
   */
  const refreshPunchRecords = () => {
    fetchPunchRecords();
  };

  /**
   * 删除打卡记录
   * @param recordId 记录ID
   */
  const deletePunchRecord = async (recordId: number) => {
    try {
      await API.Column.deletePunchRecord(recordId);
      
      // 从本地状态中移除记录
      setPunchRecords(prev => prev.filter(record => record.id !== recordId));
      
      message.success('删除成功');
    } catch (err: any) {
      const errorMessage = err?.message || '删除失败';
      // 忽略静默错误（如请求取消）
      if (!err.silent) {
        message.error(errorMessage);
      }
    }
  };

  // 组件挂载时自动获取数据
  useEffect(() => {
    if (columnId && columnId > 0 && !initialized) {
      fetchPunchRecords().then(() => {
        setInitialized(true);
      }).catch(() => {
        // 即使出错也要设置为已初始化，避免无限重试
        setInitialized(true);
      });
    }
  }, [columnId, fetchPunchRecords, initialized]);

  return {
    loading,
    punchRecords,
    error,
    myCount,
    punchedToday,
    userCount,
    initialized,
    columnInfo,
    fetchPunchRecords,
    refreshPunchRecords,
    deletePunchRecord,
  };
};

export default usePunchRecords;