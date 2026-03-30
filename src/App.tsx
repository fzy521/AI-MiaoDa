import React from 'react';
import { Sidebar } from './components/Sidebar';
import { LogisticsReport } from './components/LogisticsReport';
import { Bell, Search } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('statistics');

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <LogisticsReport />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-medium text-foreground">模块开发中</h3>
            <p>该功能正在接入实时物流数据接口，敬请期待。</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#202124]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 border-b border-border">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative hidden md:block w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="搜索报表、日期、物料类型..." 
                className="w-full pl-12 pr-4 py-2 bg-muted/50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-4">
            <button className="relative p-2 text-muted-foreground hover:bg-black/5 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 ml-2 cursor-pointer hover:bg-black/5 p-1 pr-3 rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden font-bold text-xs shadow-sm">
                ADMIN
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">系统管理员</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="py-8 px-8 text-center text-xs text-muted-foreground border-t border-border mt-auto">
          <p>© 2026 煤炭与铝矾土物流管理系统 V1.0.0</p>
          <p className="mt-1">数据实时同步自铁路货运调度系统</p>
        </footer>
      </div>
    </div>
  );
}
