import React from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useHazardStore } from '@/stores/useHazardStore';
import type { HazardStatus, RiskLevel } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts';

const LEVEL_LABELS: Record<RiskLevel, string> = { RED: '重大', ORANGE: '较大', YELLOW: '一般', BLUE: '低风险' };
const LEVEL_COLORS: Record<RiskLevel, string> = {
  RED: '#dc2626',
  ORANGE: '#ea580c',
  YELLOW: '#ca8a04',
  BLUE: '#2563eb',
};
const LEVEL_BADGE_CLS: Record<RiskLevel, string> = {
  RED: 'bg-red-100 text-red-600',
  ORANGE: 'bg-orange-100 text-orange-600',
  YELLOW: 'bg-yellow-100 text-yellow-600',
  BLUE: 'bg-blue-100 text-blue-600',
};
const STATUS_CONFIG: Record<HazardStatus, { label: string; cls: string; icon: React.ComponentType<{ size?: number }> }> = {
  PENDING: { label: '待分配', cls: 'bg-orange-100 text-orange-600', icon: Clock },
  RECTIFYING: { label: '整改中', cls: 'bg-blue-100 text-blue-600', icon: AlertCircle },
  REVIEWING: { label: '待复查', cls: 'bg-yellow-100 text-yellow-600', icon: ClipboardCheck },
  CLOSED: { label: '已销号', cls: 'bg-green-100 text-green-600', icon: CheckCircle2 },
};

export function HazardMonthlyReport() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [statusFilter, setStatusFilter] = React.useState<HazardStatus | 'ALL'>('ALL');
  const [levelFilter, setLevelFilter] = React.useState<RiskLevel | 'ALL'>('ALL');

  const { getByMonth, getMonthlyStats, getMonthlyTrend } = useHazardStore();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const stats = React.useMemo(() => getMonthlyStats(monthStr), [monthStr, getMonthlyStats]);
  const trend = React.useMemo(() => getMonthlyTrend(6), [getMonthlyTrend]);
  const hazards = React.useMemo(() => {
    let list = getByMonth(monthStr);
    if (statusFilter !== 'ALL') list = list.filter(h => h.status === statusFilter);
    if (levelFilter !== 'ALL') list = list.filter(h => h.level === levelFilter);
    return list;
  }, [monthStr, statusFilter, levelFilter, getByMonth]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const exportCSV = () => {
    const header = '编号,隐患描述,风险等级,发现日期,地点,上报人,整改负责人,责任部门,整改期限,状态,复查人\n';
    const rows = hazards.map(h =>
      `${h.id},"${h.title}",${LEVEL_LABELS[h.level]},${h.date},"${h.location}",${h.reporter},${h.assignee || ''},${h.department || ''},${h.deadline || ''},${STATUS_CONFIG[h.status].label},${h.reviewer || ''}`
    ).join('\n');
    const bom = '﻿';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `隐患排查治理月报表_${monthStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('月报表已导出为 Excel 文件');
  };

  const exportPDF = () => {
    window.print();
    toast.success('打印对话框已打开');
  };

  const pieData = (Object.entries(stats.byLevel) as [RiskLevel, number][])
    .filter(([, v]) => v > 0)
    .map(([level, value]) => ({ name: LEVEL_LABELS[level], value, color: LEVEL_COLORS[level] }));
  const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);

  const trendLineData = trend.map(t => ({
    month: `${t.month.slice(2).replace('-', '.')}`,
    新增: t.totalNew,
    销号: t.totalClosed,
    待处理: t.totalPending + t.totalRectifying + t.totalReviewing,
  }));

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">隐患排查治理月报表</h2>
          <p className="text-muted-foreground">按月汇总隐患台账、整改进度与统计分析</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors">
            <Download size={16} /> 导出 PDF
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all">
            <FileText size={16} /> 导出 Excel
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="safety-card px-6 py-4 flex items-center justify-between print:px-0 print:py-2">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors print:hidden">
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-xl font-bold min-w-[140px] text-center">{year} 年 {month} 月</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors print:hidden">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground print:hidden">
          <Filter size={16} />
          <span>共 {hazards.length} 条记录</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <span className={cn(
              'flex items-center text-xs font-medium px-2 py-1 rounded-full',
              stats.totalNew > 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
            )}>
              {stats.totalNew > 0 ? '需关注' : '无新增'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">本月新增隐患</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{stats.totalNew}</span>
            <span className="text-sm text-muted-foreground">条</span>
          </div>
        </div>

        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
            <span className={cn(
              'flex items-center text-xs font-medium px-2 py-1 rounded-full',
              stats.closureRate >= 80 ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'
            )}>
              <TrendingUp size={14} className="mr-1" />
              {stats.closureRate}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">已销号 / 销号率</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{stats.totalClosed}</span>
            <span className="text-sm text-muted-foreground">/ {stats.totalNew} 条</span>
          </div>
        </div>

        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">待处理 / 整改中</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{stats.totalPending}</span>
            <span className="text-sm text-muted-foreground">+ {stats.totalRectifying} 整改中</span>
          </div>
        </div>

        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">平均整改天数</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{stats.avgRectifyDays}</span>
            <span className="text-sm text-muted-foreground">天</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <div className="safety-card p-6">
          <h3 className="text-lg font-medium mb-6">隐患趋势（近 6 个月）</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendLineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="新增" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="销号" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="待处理" stroke="#ea580c" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="safety-card p-6">
          <h3 className="text-lg font-medium mb-6">风险等级分布</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#94a3b8' }}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <Label value={`${pieTotal} 条`} position="center" className="text-lg font-bold fill-foreground" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="safety-card">
        <div className="p-6 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ClipboardCheck size={20} className="text-primary" />
            隐患治理台账
          </h3>
          <div className="flex items-center gap-2 print:hidden">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as HazardStatus | 'ALL')}
              className="px-3 py-1.5 bg-muted/30 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">全部状态</option>
              <option value="PENDING">待分配</option>
              <option value="RECTIFYING">整改中</option>
              <option value="REVIEWING">待复查</option>
              <option value="CLOSED">已销号</option>
            </select>
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value as RiskLevel | 'ALL')}
              className="px-3 py-1.5 bg-muted/30 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">全部等级</option>
              <option value="RED">重大</option>
              <option value="ORANGE">较大</option>
              <option value="YELLOW">一般</option>
              <option value="BLUE">低风险</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">编号</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">隐患描述</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">等级</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">发现日期</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">地点</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">上报人</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">整改负责人</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">责任部门</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">整改期限</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">状态</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">复查人</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hazards.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                    当月暂无隐患记录
                  </td>
                </tr>
              ) : (
                hazards.map(h => (
                  <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{h.id}</td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="truncate text-foreground font-medium">{h.title}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', LEVEL_BADGE_CLS[h.level])}>
                        {LEVEL_LABELS[h.level]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground whitespace-nowrap">{h.date}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{h.location}</td>
                    <td className="px-4 py-3 text-center">{h.reporter}</td>
                    <td className="px-4 py-3 text-center">{h.assignee || '-'}</td>
                    <td className="px-4 py-3 text-center">{h.department || '-'}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">{h.deadline || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        STATUS_CONFIG[h.status].cls
                      )}>
                        {React.createElement(STATUS_CONFIG[h.status].icon, { size: 12 })}
                        {STATUS_CONFIG[h.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{h.reviewer || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print-only Summary */}
      <div className="hidden print:block text-center text-sm text-muted-foreground border-t border-border pt-4">
        <p>RailSafe 工业安全管理系统 — 隐患排查治理月报表 ({monthStr})</p>
        <p className="mt-1">生成时间: {new Date().toLocaleString('zh-CN')}</p>
      </div>
    </div>
  );
}
