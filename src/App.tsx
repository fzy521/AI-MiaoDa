import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HazardManagement } from './components/HazardManagement';
import { Bell, Search, User } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'hazards':
        return <HazardManagement />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground">模块开发中</h3>
            <p>该功能正在接入工业安全数据接口，敬请期待。</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="快速搜索风险点、设备、隐患..." 
                className="w-full pl-10 pr-4 py-1.5 bg-muted/50 border-transparent rounded-md text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-card" />
            </button>
            <div className="h-8 w-[1px] bg-border mx-1" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">范安全</p>
                <p className="text-[10px] text-muted-foreground mt-1">安全总监</p>
              </div>
              <div className="w-9 h-9 rounded-md bg-accent border border-border flex items-center justify-center overflow-hidden">
                <User size={20} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="py-6 px-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>© 2026 RailSafe Industrial. 铁路专用线安全管理系统 V2.4.0</p>
        </footer>
      </div>
    </div>
  );
}
