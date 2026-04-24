import React from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSettingsStore } from '@/stores/useSettingsStore';
import {
  User,
  Bell,
  Database,
  Info,
  Edit2,
  Save,
  X,
  Download,
  Upload,
  Trash2,
  HardDrive,
  AlertTriangle,
  Clock,
  FileText,
  Megaphone,
  RefreshCw,
} from 'lucide-react';

const NOTIFICATION_ITEMS = [
  { key: 'hazardDeadlineAlert' as const, label: '隐患到期提醒', desc: '隐患整改期限到期前自动提醒', icon: AlertTriangle },
  { key: 'riskLevelChange' as const, label: '风险等级变更', desc: '风险点等级发生变化时通知', icon: Bell },
  { key: 'dailyReportReminder' as const, label: '日报提交提醒', desc: '每日安全日报填写提醒', icon: Clock },
  { key: 'systemAnnouncement' as const, label: '系统公告', desc: '系统更新与重要通知', icon: Megaphone },
];

const APP_KEYS = ['railsafe-settings', 'hazard-store', 'auth-role', 'daily-reports'];

function getInitials(name: string) {
  return name.length >= 2 ? name.slice(-2) : name;
}

function calcStorageSize() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += (localStorage.getItem(key) || '').length * 2;
    }
  }
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(2)} MB`;
}

export function Settings() {
  const {
    notifications,
    userName,
    userRole,
    userDepartment,
    updateNotifications,
    updateProfile,
    resetSettings,
  } = useSettingsStore();

  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [draftValue, setDraftValue] = React.useState('');
  const [confirmClear, setConfirmClear] = React.useState(false);

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setDraftValue(value);
  };

  const saveEdit = (field: string) => {
    if (!draftValue.trim()) { toast.error('内容不能为空'); return; }
    updateProfile({ [field]: draftValue.trim() });
    setEditingField(null);
    toast.success('已保存');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraftValue('');
  };

  const handleExport = () => {
    const data: Record<string, unknown> = {};
    APP_KEYS.forEach((key) => {
      const val = localStorage.getItem(key);
      if (val) {
        try { data[key] = JSON.parse(val); } catch { data[key] = val; }
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RailSafe_备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('数据已导出');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (typeof data !== 'object' || data === null) throw new Error('invalid');
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          });
          toast.success('数据导入成功，即将刷新页面');
          setTimeout(() => window.location.reload(), 1500);
        } catch {
          toast.error('导入失败：文件格式无效');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearCache = () => {
    APP_KEYS.forEach((key) => localStorage.removeItem(key));
    setConfirmClear(false);
    toast.success('缓存已清除，即将刷新页面');
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleReset = () => {
    resetSettings();
    toast.success('已恢复默认设置');
  };

  const profileFields = [
    { key: 'userName', label: '姓名', value: userName },
    { key: 'userRole', label: '职务', value: userRole },
    { key: 'userDepartment', label: '部门', value: userDepartment },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">系统设置</h2>
          <p className="text-muted-foreground">管理个人信息、通知偏好与系统数据</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw size={16} />
          恢复默认
        </button>
      </div>

      {/* Section 1: Personal Info */}
      <div className="safety-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <User size={20} />
          </div>
          <h3 className="text-lg font-medium">个人信息</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
              {getInitials(userName)}
            </div>
            <span className="text-sm text-muted-foreground">{userRole}</span>
          </div>

          <div className="flex-1 space-y-4">
            {profileFields.map(({ key, label, value }) => (
              <div key={key} className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground w-12 shrink-0">{label}</span>
                {editingField === key ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(key);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-border rounded-lg text-sm focus:border-primary focus:shadow-sm transition-all outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(key)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Save size={16} />
                    </button>
                    <button onClick={cancelEdit} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-foreground">{value}</span>
                    <button
                      onClick={() => startEdit(key, value)}
                      className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">个人信息基于平台登录账号，修改仅影响本系统显示。</p>
          </div>
        </div>
      </div>

      {/* Section 2: Notifications */}
      <div className="safety-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Bell size={20} />
          </div>
          <h3 className="text-lg font-medium">通知设置</h3>
        </div>

        <div className="divide-y divide-border">
          {NOTIFICATION_ITEMS.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <Icon size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
              <button
                onClick={() => updateNotifications({ [key]: !notifications[key] })}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors shrink-0',
                  notifications[key] ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    notifications[key] ? 'left-[22px]' : 'left-0.5'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Data Management */}
      <div className="safety-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
            <Database size={20} />
          </div>
          <h3 className="text-lg font-medium">数据管理</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-xl p-5 flex flex-col items-center text-center gap-3 hover:bg-muted/30 transition-colors">
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <Download size={24} />
            </div>
            <div>
              <p className="text-sm font-medium">导出数据</p>
              <p className="text-xs text-muted-foreground mt-1">将系统数据导出为 JSON 文件</p>
            </div>
            <button
              onClick={handleExport}
              className="mt-auto px-4 py-1.5 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
            >
              导出
            </button>
          </div>

          <div className="border border-border rounded-xl p-5 flex flex-col items-center text-center gap-3 hover:bg-muted/30 transition-colors">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-sm font-medium">导入数据</p>
              <p className="text-xs text-muted-foreground mt-1">从 JSON 文件恢复系统数据</p>
            </div>
            <button
              onClick={handleImport}
              className="mt-auto px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              导入
            </button>
          </div>

          <div className="border border-border rounded-xl p-5 flex flex-col items-center text-center gap-3 hover:bg-muted/30 transition-colors">
            <div className="p-3 bg-red-50 text-red-600 rounded-full">
              <Trash2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium">清除缓存</p>
              <p className="text-xs text-muted-foreground mt-1">清空本地存储并重置系统</p>
            </div>
            {confirmClear ? (
              <div className="mt-auto flex items-center gap-2">
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  确认清除
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-xs font-medium hover:bg-muted/80 transition-colors"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="mt-auto px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
              >
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: System Info */}
      <div className="safety-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Info size={20} />
          </div>
          <h3 className="text-lg font-medium">系统信息</h3>
        </div>

        <div className="space-y-3">
          {[
            { label: '应用名称', value: 'RailSafe 铁路专用线安全管理系统', icon: FileText },
            { label: '系统版本', value: 'V2.4.0', icon: Info },
            { label: '运行平台', value: '飞书妙搭', icon: HardDrive },
            { label: '存储占用', value: calcStorageSize(), icon: Database },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon size={14} />
                {label}
              </div>
              <span className="text-sm font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
