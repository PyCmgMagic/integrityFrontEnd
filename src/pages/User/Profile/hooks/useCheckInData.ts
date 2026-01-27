import { useState, useEffect } from 'react';
import { API } from '../../../../services/api';
import type { CheckInData, PunchItem } from '../../../../types/types';

/**
 * 将 API 返回的打卡数据转换为前端组件需要的格式
 * @param punchItems API 返回的打卡数据
 * @returns 转换后的打卡数据
 */
const transformPunchData = (punchItems: PunchItem[] | [] | undefined): CheckInData[] => {
  // 防护性检查：确保 punchItems 存在且为数组
  if (!punchItems || !Array.isArray(punchItems)) {
    return [];
  }
  
  return punchItems.map((item) => {
    // 拼接 title：activity_name - project_name - column_name
    const title = `${item.activity_name} - ${item.project_name} - ${item.column_name}`;
    
    // 格式化日期时间
    const dateObj = new Date(item.punch.created_at);
    const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = dateObj.toTimeString().split(' ')[0].substring(0, 5); // HH:mm
    
    return {
      id: item.punch.ID,
      title,
      time: formattedTime,
      date: formattedDate,
      content: item.punch.content,
      status: item.punch.status,
      project_id: item.project_id,
      column_id: item.punch.column_id,
      imgs: item.imgs
    };
  });
};

/**
 * 打卡数据管理自定义Hook
 * 处理打卡记录的增删改查操作
 */
export const useCheckInData = () => {
  const [checkInData, setCheckInData] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 从 API 获取打卡记录
   */
  const fetchCheckInData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.Column.getMyPunchList();

      let punchData: PunchItem[] = [];
      if (Array.isArray(response)) {
        punchData = response;
      } 
      
      const transformedData = transformPunchData(punchData);
      setCheckInData(transformedData);
    } catch (err: any) {
      console.error('获取打卡记录失败:', err);
      
      // API 调用失败时，设置空数据和错误信息
      setCheckInData([]);
      setError(err.message || '获取打卡记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchCheckInData();
  }, []);

  /**
   * 删除打卡记录
   * @param id 打卡记录ID
   */
  const deleteCheckIn = async (id: number) => {
    try {
      // 调用 API 删除打卡记录
      await API.Column.deletePunchRecord(id);
      
      // API 调用成功后，从本地状态中移除该记录
      setCheckInData(prevData => prevData.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('删除打卡记录失败:', err);
      throw new Error(err.message || '删除打卡记录失败，请稍后重试');
    }
  };

  /**
   * 添加打卡记录
   * @param newCheckIn 新的打卡记录
   */
  const addCheckIn = (newCheckIn: CheckInData) => {
    setCheckInData(prevData => [newCheckIn, ...prevData]);
  };

  /**
   * 更新打卡记录
   * @param id 打卡记录ID
   * @param updatedCheckIn 更新的打卡记录数据
   */
  const updateCheckIn = (id: number, updatedCheckIn: Partial<CheckInData>) => {
    setCheckInData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, ...updatedCheckIn } : item
      )
    );
  };

  return {
    checkInData,
    loading,
    error,
    deleteCheckIn,
    addCheckIn,
    updateCheckIn,
    refreshData: fetchCheckInData,
  };
};
