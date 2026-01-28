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
  nick_name?: string;
  college?: string;
  major?: string;
  grade?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  /**
   * True once zustand/persist has rehydrated state from storage.
   * Prevents route guards from redirecting before persisted auth is available.
   */
  hasHydrated: boolean;
  login: (loginData: { role_id: number; student_id: string; token: string }) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setUserProfile: (profileData: any) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      hasHydrated: false,
      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
      
      login: (loginData: { role_id: number; student_id: string; token: string }) => {
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
      
      setUserProfile: (profileData: any) => {
        const currentUser = get().user;
        if (currentUser && profileData) {
          const updatedUser: User = {
            ...currentUser,
            name: profileData.name,
            nick_name: profileData.nick_name,
            avatar: profileData.avatar?.trim(),
            college: profileData.college,
            major: profileData.major,
            grade: profileData.grade,
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
          };
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
