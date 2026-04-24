import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettings {
  hazardDeadlineAlert: boolean;
  riskLevelChange: boolean;
  dailyReportReminder: boolean;
  systemAnnouncement: boolean;
}

interface ProfileInfo {
  userName: string;
  userRole: string;
  userDepartment: string;
}

interface SettingsState extends ProfileInfo {
  notifications: NotificationSettings;
  updateNotifications: (patch: Partial<NotificationSettings>) => void;
  updateProfile: (patch: Partial<ProfileInfo>) => void;
  resetSettings: () => void;
}

const DEFAULTS: ProfileInfo & { notifications: NotificationSettings } = {
  userName: '范安全',
  userRole: '安全总监',
  userDepartment: '安全生产部',
  notifications: {
    hazardDeadlineAlert: true,
    riskLevelChange: true,
    dailyReportReminder: true,
    systemAnnouncement: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      updateNotifications: (patch) =>
        set((s) => ({ notifications: { ...s.notifications, ...patch } })),
      updateProfile: (patch) => set((s) => ({ ...s, ...patch })),
      resetSettings: () => set(DEFAULTS),
    }),
    { name: 'railsafe-settings' }
  )
);
