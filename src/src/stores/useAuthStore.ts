import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/types/report';

interface AuthState {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentRole: 'WEIGHBRIDGE',
      setCurrentRole: (role) => set({ currentRole: role }),
    }),
    { name: 'auth-role' }
  )
);