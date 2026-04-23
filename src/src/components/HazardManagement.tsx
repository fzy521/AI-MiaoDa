import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Hazard, HazardStatus, RiskLevel } from '@/types';

const mockHazards: Hazard[] = [
  {
    id: 'H-20260329-01',
    title: '专用线 3 号道岔尖轨密贴不严',
    description: '巡查发现 3 号道岔尖轨与基本轨之间存在约 5mm 缝隙，可能导致脱轨风险。',
    level: 'RED',
    status: 'RECTIFYING',
    reporter: '王安全',
    date: '2026-03-29',
    location: 'A 区 3 号道岔'
  },
  {
    id: 'H-20260328-04',
    title: '装卸区灭火器压力不足',
    description: '2 号仓库东侧 3 具灭火器压力表指针位于红色区域。',
    level: 'ORANGE',
    status: 'PENDING',
    reporter: '李巡检',
    date: '2026-03-28',
    location: '货运中心仓库'
  },
  {
    id: 'H-20260328-02',
    title: '监控室备用电源故障',
    description: 'UPS 电池老化，停电切换测试失败。',
    level: 'YELLOW',
    status: 'CLOSED',
    reporter: '张电务',
    date: '2026-03-28',
    location: '综合办公楼 402'
  },
  {
    id: 'H-20260327-05',
    title: '围墙护栏松动',
    description: '北侧围墙部分护栏底座锈蚀严重。',
    level: 'BLUE',
    status: 'REVIEWING',
    reporter: '赵巡逻',
    date: '2026-03-27',
    location: '北侧围界'
  }
];

const statusConfig: Record<HazardStatus, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  PENDING: { label: '待分配', color: 'bg-orange-100 text-orange-600 border-orange-600/20', icon: Clock },
  RECTIFYING: { label: '整改中', color: 'bg-blue-100 text-blue-600 border-blue-600/20', icon: AlertCircle },
  REVIEWING: { label: '待复查', color: 'bg-yellow-100 text-yellow-600 border-yellow-600/20', icon: ClipboardCheck },
  CLOSED: { label: '已销号', color: 'bg-green-100 text-green-600 border-green-600/20', icon: CheckCircle2 },
};

const levelConfig: Record<RiskLevel, { label: string; color: string; bar: string }> = {
  RED: { label: '重大', color: 'text-red-600', bar: 'border-l-4 border-l-red-600' },
  ORANGE: { label: '较大', color: 'text-orange-600', bar: 'border-l-4 border-l-orange-600' },
  YELLOW: { label: '一般', color: 'text-yellow-600', bar: 'border-l-4 border-l-yellow-600' },
  BLUE: { label: '低风险', color: 'text-blue-600', bar: 'border-l-4 border-l-blue-600' },
};

export function HazardManagement() {
  const [filter, setFilter] = React.useState<HazardStatus | 'ALL'>('ALL');

  const filteredHazards = filter === 'ALL' 
    ? mockHazards 
    : mockHazards.filter(h => h.status === filter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">隐患治理</h2>
          <p className="text-muted-foreground">实现隐患发现、上报、整改、验收的全闭环管理</p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
          <Plus size={20} />
          上报新隐患
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-full p-2 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm border border-border">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto px-2">
          {(['ALL', 'PENDING', 'RECTIFYING', 'REVIEWING', 'CLOSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === s 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-transparent text-muted-foreground hover:bg-black/5"
              )}
            >
              {s === 'ALL' ? '全部' : statusConfig[s].label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 pr-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="搜索隐患、编号或位置..." 
            className="w-full pl-11 pr-4 py-2 bg-muted/50 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-transparent focus:shadow-md transition-all"
          />
        </div>
      </div>

      {/* Hazard List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredHazards.map((hazard) => (
          <div key={hazard.id} className={cn("safety-card p-6 group", levelConfig[hazard.level].bar)}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{hazard.id}</span>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", 
                        hazard.level === 'RED' ? 'bg-red-100 text-red-600' :
                        hazard.level === 'ORANGE' ? 'bg-orange-100 text-orange-600' :
                        hazard.level === 'YELLOW' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      )}>
                        {levelConfig[hazard.level].label}隐患
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">{hazard.title}</h3>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                    statusConfig[hazard.status].color
                  )}>
                    {React.createElement(statusConfig[hazard.status].icon, { size: 16 })}
                    {statusConfig[hazard.status].label}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{hazard.description}</p>
                
                <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {hazard.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    上报人: {hazard.reporter}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {hazard.date}
                  </div>
                </div>
              </div>
              
              <div className="flex md:flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 min-w-[120px]">
                <button className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-full transition-colors text-center">
                  查看详情
                </button>
                {hazard.status === 'PENDING' && (
                  <button className="flex-1 md:flex-none px-4 py-2 text-sm font-medium bg-primary text-white rounded-full shadow-sm hover:shadow-md transition-all text-center">
                    立即指派
                  </button>
                )}
                {hazard.status === 'RECTIFYING' && (
                  <button className="flex-1 md:flex-none px-4 py-2 text-sm font-medium border border-border bg-white hover:bg-muted rounded-full transition-colors text-center">
                    整改反馈
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
