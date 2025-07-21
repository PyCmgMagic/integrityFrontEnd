import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  email?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      
      login: (user: User) => {
        console.log('AuthStore: Logging in user', user);
        set({ user, isLoggedIn: true });
      },

      logout: () => {
        console.log('AuthStore: Logging out');
        set({ user: null, isLoggedIn: false });
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