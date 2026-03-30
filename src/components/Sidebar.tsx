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
  Bell,
  Warehouse,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'statistics', label: '物流统计报表', icon: BarChart3 },
  { id: 'inventory', label: '库存管理', icon: Warehouse },
  { id: 'basic', label: '物料信息', icon: Database },
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
        "fixed inset-y-0 left-0 z-40 w-64 bg-white text-foreground transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-border",
        !isOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight tracking-tight">LogiTrack</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Logistics Analytics</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={20} className={cn("transition-colors", activeTab === item.id ? "text-white" : "text-muted-foreground")} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-6">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/50 border border-border/50 transition-colors cursor-pointer hover:bg-muted">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                AD
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold truncate">管理员</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-wider">Administrator</p>
              </div>
              <button className="text-muted-foreground hover:text-rose-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
