import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  TrainFront, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../lib/utils';
import { DailyRecord, SummaryStats } from '../types';

// Mock data generation
const generateMockData = (): DailyRecord[] => {
  const data: DailyRecord[] = [];
  const today = new Date();
  
  let coalInv = 50000;
  let bauxiteInv = 30000;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const coalInTrains = Math.floor(Math.random() * 5) + 2;
    const coalInWagons = coalInTrains * (Math.floor(Math.random() * 10) + 50);
    const coalInTons = coalInWagons * 70;

    const bauxiteInTrains = Math.floor(Math.random() * 3) + 1;
    const bauxiteInTons = bauxiteInTrains * 3500;

    const coalOutTons = Math.floor(Math.random() * 10000) + 5000;
    const bauxiteOutTons = Math.floor(Math.random() * 5000) + 2000;

    coalInv = coalInv + coalInTons - coalOutTons;
    bauxiteInv = bauxiteInv + bauxiteInTons - bauxiteOutTons;

    data.push({
      date: dateStr,
      coalInbound: { trains: coalInTrains, wagons: coalInWagons, tonnage: coalInTons },
      bauxiteInbound: { trains: bauxiteInTrains, tonnage: bauxiteInTons },
      coalOutbound: coalOutTons,
      bauxiteOutbound: bauxiteOutTons,
      coalInventory: coalInv,
      bauxiteInventory: bauxiteInv
    });
  }
  return data;
};

const mockData = generateMockData();
const latest = mockData[mockData.length - 1];
const previous = mockData[mockData.length - 2];

const summaryStats: SummaryStats[] = [
  { 
    label: '今日煤炭进库', 
    value: latest.coalInbound.tonnage.toLocaleString(), 
    unit: '吨', 
    trend: ((latest.coalInbound.tonnage - previous.coalInbound.tonnage) / previous.coalInbound.tonnage) * 100,
    type: 'coal' 
  },
  { 
    label: '今日铝矾土进库', 
    value: latest.bauxiteInbound.tonnage.toLocaleString(), 
    unit: '吨', 
    trend: ((latest.bauxiteInbound.tonnage - previous.bauxiteInbound.tonnage) / previous.bauxiteInbound.tonnage) * 100,
    type: 'bauxite' 
  },
  { 
    label: '煤炭库存余额', 
    value: latest.coalInventory.toLocaleString(), 
    unit: '吨', 
    type: 'coal' 
  },
  { 
    label: '铝矾土库存余额', 
    value: latest.bauxiteInventory.toLocaleString(), 
    unit: '吨', 
    type: 'bauxite' 
  },
];

export function LogisticsReport() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">物流统计分析报表</h2>
          <p className="text-muted-foreground mt-1">实时监控煤炭与铝矾土的进出库动态及库存余量</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg text-sm font-medium">
            <Calendar size={16} className="text-muted-foreground" />
            <span>2026-03-01 至 2026-03-30</span>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Download size={16} />
            导出报表
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-2 rounded-xl",
                stat.type === 'coal' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
              )}>
                {stat.label.includes('进库') ? <TrainFront size={20} /> : <Package size={20} />}
              </div>
              {stat.trend !== undefined && (
                <div className={cn(
                  "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                  stat.trend >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                  {stat.trend >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                  {Math.abs(stat.trend).toFixed(1)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                <span className="text-sm font-medium text-muted-foreground">{stat.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inbound/Outbound Comparison */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              进出库吨数趋势
            </h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>煤炭进库</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>铝矾土进库</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorCoal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBauxite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="coalInbound.tonnage" name="煤炭进库" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCoal)" strokeWidth={2} />
                <Area type="monotone" dataKey="bauxiteInbound.tonnage" name="铝矾土进库" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBauxite)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Trend */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Package size={20} className="text-primary" />
              库存余量监控
            </h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-600" />
                <span>煤炭库存</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span>铝矾土库存</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="coalInventory" name="煤炭库存" stroke="#d97706" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="bauxiteInventory" name="铝矾土库存" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table Section */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            每日明细报表
          </h3>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="搜索日期..." 
              className="bg-muted border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">日期</th>
                <th className="px-6 py-4 font-semibold text-amber-700 bg-amber-50/30">煤炭进库 (列/车/吨)</th>
                <th className="px-6 py-4 font-semibold text-blue-700 bg-blue-50/30">铝矾土进库 (列/吨)</th>
                <th className="px-6 py-4 font-semibold">煤炭出库 (吨)</th>
                <th className="px-6 py-4 font-semibold">铝矾土出库 (吨)</th>
                <th className="px-6 py-4 font-semibold">煤炭库存 (吨)</th>
                <th className="px-6 py-4 font-semibold">铝矾土库存 (吨)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...mockData].reverse().map((row, i) => (
                <tr key={i} className="hover:bg-accent/30 transition-colors group">
                  <td className="px-6 py-4 font-medium">{row.date}</td>
                  <td className="px-6 py-4 bg-amber-50/10">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-700">{row.coalInbound.trains}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-medium">{row.coalInbound.wagons}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-bold">{row.coalInbound.tonnage.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-blue-50/10">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700">{row.bauxiteInbound.trains}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-bold">{row.bauxiteInbound.tonnage.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-rose-600 font-medium">-{row.coalOutbound.toLocaleString()}</td>
                  <td className="px-6 py-4 text-rose-600 font-medium">-{row.bauxiteOutbound.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-amber-800">{row.coalInventory.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-blue-800">{row.bauxiteInventory.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
