import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';
import type { KPI, RiskLevel } from '@/types';

const kpiData: KPI[] = [
  { label: '重大隐患', value: 2, trend: 100, level: 'RED' },
  { label: '较大隐患', value: 5, trend: -20, level: 'ORANGE' },
  { label: '一般隐患', value: 12, trend: 5, level: 'YELLOW' },
  { label: '整改完成率', value: '94.2', trend: 2.1, unit: '%', level: 'SUCCESS' },
];

const chartData = [
  { name: '周一', hazards: 4, fixed: 3 },
  { name: '周二', hazards: 3, fixed: 4 },
  { name: '周三', hazards: 6, fixed: 2 },
  { name: '周四', hazards: 2, fixed: 5 },
  { name: '周五', hazards: 8, fixed: 4 },
  { name: '周六', hazards: 5, fixed: 6 },
  { name: '周日', hazards: 3, fixed: 3 },
];

const riskDistribution = [
  { name: '重大风险', value: 2, color: ' #d93025' }, // Google Red
  { name: '较大风险', value: 8, color: ' #e8710a' }, // Google Orange
  { name: '一般风险', value: 24, color: ' #f9ab00' }, // Google Yellow
  { name: '低风险', value: 56, color: ' #1a73e8' }, // Google Blue
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">安全驾驶舱</h2>
          <p className="text-muted-foreground">实时监控全线安全风险与隐患治理动态</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-md border border-border">
          <Clock size={14} />
          数据更新于: 2026-03-29 16:00
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={i} className={cn(
            "safety-card p-6 flex flex-col justify-between",
            kpi.level === 'RED' && "bg-red-50/50 border-red-500/20",
            kpi.level === 'ORANGE' && "bg-orange-50/50 border-orange-500/20",
            kpi.level === 'YELLOW' && "bg-yellow-50/50 border-yellow-500/20",
            kpi.level === 'SUCCESS' && "bg-green-50/50 border-green-500/20"
          )}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
              <div className={cn(
                "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                kpi.trend > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
              )}>
                {kpi.trend > 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {Math.abs(kpi.trend)}%
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-foreground">{kpi.value}</span>
              {kpi.unit && <span className="text-sm font-medium text-muted-foreground">{kpi.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 safety-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              隐患趋势分析
            </h3>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>新增隐患</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span>完成整改</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke=" #dadce0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: ' #5f6368' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: ' #5f6368' }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: ' #f1f3f4' }}
                  contentStyle={{ 
                    backgroundColor: ' #ffffff', 
                    borderColor: ' #dadce0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxShadow: '0 1px 2px 0  rgba(60,64,67,0.3), 0 1px 3px 1px  rgba(60,64,67,0.15)'
                  }}
                />
                <Bar dataKey="hazards" fill=" #1a73e8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fixed" fill=" #1e8e3e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="safety-card p-6">
          <h3 className="font-bold flex items-center gap-2 mb-6">
            <ShieldAlert size={18} className="text-primary" />
            风险等级分布
          </h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {riskDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-mono font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div className="safety-card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="text-primary" />
            待办预警提醒
          </h3>
          <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            查看全部 <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">隐患编号</th>
                <th className="px-6 py-4 font-medium">隐患描述</th>
                <th className="px-6 py-4 font-medium">风险等级</th>
                <th className="px-6 py-4 font-medium">责任单位</th>
                <th className="px-6 py-4 font-medium">剩余时间</th>
                <th className="px-6 py-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { id: 'H-20260329-01', desc: '专用线 3 号道岔尖轨密贴不严', level: 'RED', dept: '工务段', time: '2h' },
                { id: 'H-20260328-04', desc: '装卸区灭火器压力不足', level: 'ORANGE', dept: '货运中心', time: '1d' },
                { id: 'H-20260328-02', desc: '监控室备用电源故障', level: 'YELLOW', dept: '电务段', time: '3d' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{row.id}</td>
                  <td className="px-6 py-4 font-medium">{row.desc}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                      row.level === 'RED' && "bg-red-100 text-red-600 border-red-600/20",
                      row.level === 'ORANGE' && "bg-orange-100 text-orange-600 border-orange-600/20",
                      row.level === 'YELLOW' && "bg-yellow-100 text-yellow-600 border-yellow-600/20"
                    )}>
                      {row.level === 'RED' ? '重大' : row.level === 'ORANGE' ? '较大' : '一般'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{row.dept}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1",
                      row.level === 'RED' ? "text-red-600 font-bold" : "text-muted-foreground"
                    )}>
                      <Clock size={14} />
                      {row.time}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:underline font-medium">立即处理</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
