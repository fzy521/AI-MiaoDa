import React from 'react';
import { 
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
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Hazard, HazardStatus, RiskLevel } from '../types';

const mockHazards: Hazard[] = [
  {
    id: 'H-20260329-01',
    title: '专用线 3 号道岔尖轨密贴不严',
    description: '巡查发现 3 号道岔尖轨与基本轨之间存在约 5mm 缝隙，可能导致脱轨风险。',
    level: 'RED',
    status: 'RECTIFYING',
    reporter: '王安全',
    date: '2026-03-29',
    location: 'A 区 3 号道岔'
  },
  {
    id: 'H-20260328-04',
    title: '装卸区灭火器压力不足',
    description: '2 号仓库东侧 3 具灭火器压力表指针位于红色区域。',
    level: 'ORANGE',
    status: 'PENDING',
    reporter: '李巡检',
    date: '2026-03-28',
    location: '货运中心仓库'
  },
  {
    id: 'H-20260328-02',
    title: '监控室备用电源故障',
    description: 'UPS 电池老化，停电切换测试失败。',
    level: 'YELLOW',
    status: 'CLOSED',
    reporter: '张电务',
    date: '2026-03-28',
    location: '综合办公楼 402'
  },
  {
    id: 'H-20260327-05',
    title: '围墙护栏松动',
    description: '北侧围墙部分护栏底座锈蚀严重。',
    level: 'BLUE',
    status: 'REVIEWING',
    reporter: '赵巡逻',
    date: '2026-03-27',
    location: '北侧围界'
  }
];

const statusConfig: Record<HazardStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: '待分配', color: 'bg-risk-orange-bg text-risk-orange-text border-risk-orange-text/20', icon: Clock },
  RECTIFYING: { label: '整改中', color: 'bg-risk-blue-bg text-risk-blue-text border-risk-blue-text/20', icon: AlertCircle },
  REVIEWING: { label: '待复查', color: 'bg-risk-yellow-bg text-risk-yellow-text border-risk-yellow-text/20', icon: ClipboardCheck },
  CLOSED: { label: '已销号', color: 'bg-success-bg text-success-text border-success-text/20', icon: CheckCircle2 },
};

const levelConfig: Record<RiskLevel, { label: string; color: string; bar: string }> = {
  RED: { label: '重大', color: 'text-risk-red-text', bar: 'safety-bar-red' },
  ORANGE: { label: '较大', color: 'text-risk-orange-text', bar: 'safety-bar-orange' },
  YELLOW: { label: '一般', color: 'text-risk-yellow-text', bar: 'safety-bar-yellow' },
  BLUE: { label: '低风险', color: 'text-risk-blue-text', bar: 'safety-bar-blue' },
};

export function HazardManagement() {
  const [filter, setFilter] = React.useState<HazardStatus | 'ALL'>('ALL');

  const filteredHazards = filter === 'ALL' 
    ? mockHazards 
    : mockHazards.filter(h => h.status === filter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">隐患治理</h2>
          <p className="text-muted-foreground">实现隐患发现、上报、整改、验收的全闭环管理</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
          <Plus size={18} />
          上报新隐患
        </button>
      </div>

      {/* Filter Bar */}
      <div className="safety-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {(['ALL', 'PENDING', 'RECTIFYING', 'REVIEWING', 'CLOSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                filter === s 
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-white text-muted-foreground border-border hover:bg-accent"
              )}
            >
              {s === 'ALL' ? '全部' : statusConfig[s].label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="搜索隐患、编号或位置..." 
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Hazard List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredHazards.map((hazard) => (
          <div key={hazard.id} className={cn("safety-card p-5 group", levelConfig[hazard.level].bar)}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{hazard.id}</span>
                      <span className={cn("text-xs font-bold", levelConfig[hazard.level].color)}>
                        {levelConfig[hazard.level].label}隐患
                      </span>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{hazard.title}</h3>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                    statusConfig[hazard.status].color
                  )}>
                    {React.createElement(statusConfig[hazard.status].icon, { size: 14 })}
                    {statusConfig[hazard.status].label}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">{hazard.description}</p>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {hazard.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    上报人: {hazard.reporter}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {hazard.date}
                  </div>
                </div>
              </div>
              
              <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                <button className="flex-1 md:flex-none px-4 py-2 text-sm font-bold bg-foreground text-background rounded-md hover:opacity-90 transition-opacity">
                  查看详情
                </button>
                {hazard.status === 'PENDING' && (
                  <button className="flex-1 md:flex-none px-4 py-2 text-sm font-bold border border-border bg-white hover:bg-accent rounded-md transition-colors">
                    立即指派
                  </button>
                )}
                {hazard.status === 'RECTIFYING' && (
                  <button className="flex-1 md:flex-none px-4 py-2 text-sm font-bold border border-border bg-white hover:bg-accent rounded-md transition-colors">
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
