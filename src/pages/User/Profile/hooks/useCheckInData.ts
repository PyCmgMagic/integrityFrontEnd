import { useState } from 'react';
import type { CheckInData } from '../../../../types/types';

// 初始打卡数据
const initialCheckInData: CheckInData[] = [
  { id: 1, title: '寒假打卡-"瑞蛇衔知"，勤学善知-自习打卡', time: '第14次打卡', date: '1.19' },
  { id: 2, title: '寒假打卡-"瑞蛇衔知"，勤学善知-单词打卡', time: '第13次打卡', date: '1.18' },
  { id: 3, title: '寒假打卡-"瑞蛇衔知"，勤学善知-自习打卡', time: '第12次打卡', date: '1.18' },
  { id: 4, title: '寒假打卡-"瑞蛇衔知"，勤学善知-单词打卡', time: '第11次打卡', date: '1.17' },
];

/**
 * 打卡数据管理自定义Hook
 * 处理打卡记录的增删改查操作
 */
export const useCheckInData = () => {
  const [checkInData, setCheckInData] = useState<CheckInData[]>(initialCheckInData);

  /**
   * 删除打卡记录
   * @param id 打卡记录ID
   */
  const deleteCheckIn = (id: number) => {
    setCheckInData(prevData => prevData.filter(item => item.id !== id));
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
    deleteCheckIn,
    addCheckIn,
    updateCheckIn,
  };
};