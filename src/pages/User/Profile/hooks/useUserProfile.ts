import { useState, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import { useAuthStore } from '../../../../store/useAuthStore';
import { API } from '../../../../services/api';
import type { UserProfile } from '../../../../types/types';

/**
 * 用户信息管理自定义Hook
 * 处理用户信息的获取、更新等操作
 */
export const useUserProfile = () => {
  const { user: authUser, setUserProfile } = useAuthStore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * 获取用户个人信息
   */
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await API.User.getCurrentUser();
      
      // 转换API数据格式为前端UserProfile格式
      const userProfile: UserProfile = {
        name: profileData.nick_name || profileData.name || '未设置',
        avatar: profileData.avatar || '/assets/默认头像.png',
        studentId: authUser?.student_id || '未设置',
        grade: profileData.grade || '未设置', 
        college: profileData.college || '未设置',
        major: profileData.major || '未设置',
      };
      
      setUser(userProfile);
      // 同时更新认证store中的用户信息
      setUserProfile(profileData);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      Toast.show({ content: '获取用户信息失败', position: 'bottom' });
      
      // 使用认证store中的基本信息作为fallback
      if (authUser) {
        const fallbackProfile: UserProfile = {
          name: authUser.nick_name || authUser.name || '未设置',
          avatar: authUser.avatar || '/assets/默认头像.png',
          bio: '个人描述',
          studentId: authUser.student_id || '未设置',
          grade: '2024级',
          college: authUser.college || '未设置',
          major: authUser.major || '未设置',
          dob: '2006-01-01',
          gender: '男',
        };
        setUser(fallbackProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新用户信息
   * @param updatedData 更新的用户信息
   */
  const updateUserProfile = async (updatedData: UserProfile): Promise<boolean> => {
    try {
      // 转换前端数据格式为API所需格式
      const updateRequest = {
        nick_name: updatedData.name,
        avatar: updatedData.avatar,
        college: updatedData.college,
        major: updatedData.major,
        grade: updatedData.grade,
      };
      
      // 调用API更新用户信息
      const response = await API.User.updateProfile(updateRequest);
      
      if (response && response.code === 200) {
        setUser(updatedData);
        Toast.show({ content: '个人信息已更新', position: 'bottom' });
        
        // 重新获取最新的用户信息
        await fetchUserProfile();
        return true;
      } else {
        Toast.show({ content: (response && response.msg) || '更新失败', position: 'bottom' });
        return false;
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      Toast.show({ content: '更新失败，请重试', position: 'bottom' });
      return false;
    }
  };

  /**
   * 组件挂载时获取用户信息
   */
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    user,
    loading,
    fetchUserProfile,
    updateUserProfile,
  };
};