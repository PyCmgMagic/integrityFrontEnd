import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  email?: string;
  student_id?: string;
  role_id?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (loginData: { role_id: number; student_id: string; token: string }) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      
      login: (loginData: { role_id: number; student_id: string; token: string }) => {
        console.log('AuthStore: Logging in user', loginData);
        
        // 根据 role_id 确定用户角色
        const role: 'user' | 'admin' = loginData.role_id === 1 ? 'admin' : 'user';
        
        // 构建用户对象
        const user: User = {
          id: loginData.student_id,
          name: loginData.student_id, 
          role,
          student_id: loginData.student_id,
          role_id: loginData.role_id,
        };
        
        set({ 
          user, 
          token: loginData.token,
          isLoggedIn: true 
        });
      },

      logout: () => {
        console.log('AuthStore: Logging out');
        set({ 
          user: null, 
          token: null,
          isLoggedIn: false 
        });
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);