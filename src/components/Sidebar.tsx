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
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '安全驾驶舱', icon: LayoutDashboard },
  { id: 'risks', label: '风险管控', icon: ShieldAlert },
  { id: 'hazards', label: '隐患治理', icon: ClipboardCheck },
  { id: 'equipment', label: '设备管理', icon: HardHat },
  { id: 'statistics', label: '统计分析', icon: BarChart3 },
  { id: 'settings', label: '系统设置', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar text-sidebar-foreground rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:translate-x-0",
        !isOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <ShieldAlert className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">RailSafe</h1>
              <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">Industrial Safety</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  activeTab === item.id 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold">
                FZ
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">范安全</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">安全总监</p>
              </div>
              <button className="text-sidebar-foreground/50 hover:text-sidebar-foreground">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
