import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { HazardManagement } from '@/components/HazardManagement';
import { WMS } from '@/components/WMS';
import { Statistics } from '@/components/Statistics';
import { BasicInfo } from '@/components/BasicInfo';
import { DailyReport } from '@/components/DailyReport';
import { Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'hazards':
        return <HazardManagement />;
      case 'wms':
        return <WMS />;
      case 'basic':
        return <BasicInfo />;
      case 'statistics':
        return <Statistics />;
      case 'daily-report':
        return <DailyReport />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-medium text-foreground">模块开发中</h3>
            <p>该功能正在接入工业安全数据接口，敬请期待。</p>
          </div>
        );
    }
  };
  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-background flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative hidden md:block w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="快速搜索风险点、设备、隐患..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-full text-sm focus:bg-white focus:border-primary focus:shadow-md transition-all outline-none"
              />
            <div className="flex items-center gap-2 md:gap-4 ml-4">
              <button className="relative p-2 text-muted-foreground hover:bg-black/5 rounded-full transition-colors">
                <Bell size={24} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-background" />
              </button>
              <div className="flex items-center gap-3 ml-2 cursor-pointer hover:bg-black/5 p-1 pr-3 rounded-full transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden font-medium text-sm">
                  FZ
                </div>
              </div>
        </header>
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {renderContent()}
        </main>
        {/* Footer */}
        <footer className="py-6 px-8 text-center text-xs text-muted-foreground">
          <p>© 2026 RailSafe Industrial. 铁路专用线安全管理系统 V2.4.0</p>
        </footer>
      </div>
    </div>
  );
}