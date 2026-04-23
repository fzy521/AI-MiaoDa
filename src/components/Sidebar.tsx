import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  ClipboardCheck, 
  Settings, 
  HardHat, 
  BarChart3,
  Menu,
  X,
  LogOut,
  Warehouse,
  Database,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '安全驾驶舱', icon: LayoutDashboard },
  { id: 'wms', label: '仓储管理 (WMS)', icon: Warehouse },
  { id: 'basic', label: '基础信息', icon: Database },
  { id: 'risks', label: '风险管控', icon: ShieldAlert },
  { id: 'hazards', label: '隐患治理', icon: ClipboardCheck },
  { id: 'equipment', label: '设备管理', icon: HardHat },
  { id: 'statistics', label: '统计分析', icon: BarChart3 },
  { id: 'daily-report', label: '日报管理', icon: FileText },
  { id: 'settings', label: '系统设置', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white text-foreground rounded-full shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-border",
        !isOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <ShieldAlert className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-medium text-xl leading-tight text-foreground tracking-tight">RailSafe</h1>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Industrial Safety</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-full text-sm font-medium transition-colors",
                  activeTab === item.id 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon size={20} className={activeTab === item.id ? "text-sidebar-primary-foreground" : "text-muted-foreground"} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                FZ
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate text-foreground">范安全</p>
                <p className="text-xs text-muted-foreground truncate">安全总监</p>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
