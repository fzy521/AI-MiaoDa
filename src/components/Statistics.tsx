import React from 'react';
import { 
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
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Truck,
  Ship,
  Train,
  Box,
  LayoutGrid,
  ArrowRightLeft,
  Eye,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const inventoryData = [
  { name: '煤炭 (东区)', value: 12500, color: '#1a73e8' },
  { name: '煤炭 (西区)', value: 8400, color: '#4285f4' },
  { name: '铝矾土 (东区)', value: 15000, color: '#1e8e3e' },
  { name: '铝矾土 (西区)', value: 11200, color: '#34a853' },
];

const flowData = [
  { date: '03-24', inbound: 4500, outbound: 3200 },
  { date: '03-25', inbound: 5200, outbound: 4100 },
  { date: '03-26', inbound: 3800, outbound: 4500 },
  { date: '03-27', inbound: 6100, outbound: 3800 },
  { date: '03-28', inbound: 4900, outbound: 5200 },
  { date: '03-29', inbound: 7200, outbound: 4800 },
  { date: '03-30', inbound: 5800, outbound: 6100 },
];

const reportTemplates = [
  { id: 'logistics', name: '煤炭与铝矾土物流统计报表', type: 'EXCEL', lastGenerated: '2026-03-30 10:00' },
  { id: 'daily', name: '每日仓储动态报表', type: 'PDF', lastGenerated: '2026-03-30 08:00' },
  { id: 'inventory', name: '实时库存盘点清单', type: 'EXCEL', lastGenerated: '2026-03-30 09:15' },
  { id: 'flow', name: '货物吞吐量月度分析', type: 'PDF', lastGenerated: '2026-03-01 00:00' },
  { id: 'customer', name: '客户存货明细汇总', type: 'EXCEL', lastGenerated: '2026-03-29 18:30' },
  { id: 'container', name: '集装箱库存和当日装卸情况', type: 'EXCEL', lastGenerated: '2026-03-30 11:00' },
];

export function Statistics() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [viewingReport, setViewingReport] = React.useState<string | null>(null);

  const handleExport = (reportName: string) => {
    setIsExporting(true);
    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      alert(`${reportName} 导出成功！`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">统计分析</h2>
          <p className="text-muted-foreground">仓储吞吐量、库存分布及业务动态报表</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors">
            <Calendar size={16} />
            最近7天
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors">
            <Filter size={16} />
            筛选条件
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-primary rounded-lg">
              <Package size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-success-text bg-success-bg px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" />
              +5.2%
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">当前总库存</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">47,100</span>
            <span className="text-sm text-muted-foreground">t</span>
          </div>
        </div>

        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-success-text rounded-lg">
              <Truck size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-success-text bg-success-bg px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" />
              +12.8%
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">本周入库总量</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">37,500</span>
            <span className="text-sm text-muted-foreground">t</span>
          </div>
        </div>

        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-risk-orange-text rounded-lg">
              <Ship size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-risk-red-text bg-risk-red-bg px-2 py-1 rounded-full">
              <ArrowDownRight size={14} className="mr-1" />
              -2.4%
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">本周出库总量</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">31,700</span>
            <span className="text-sm text-muted-foreground">t</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbound/Outbound Trend */}
        <div className="safety-card p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-primary" />
            出入库趋势分析
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5f6368' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5f6368' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="inbound" name="入库量" stroke="#1a73e8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="outbound" name="出库量" stroke="#1e8e3e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="safety-card p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Package size={20} className="text-primary" />
            库存分布占比
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports & Export Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <div className="lg:col-span-2 safety-card">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              报表中心
            </h3>
          </div>
          <div className="divide-y divide-border">
            {reportTemplates.map((report) => (
              <div key={report.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    report.type === 'PDF' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  )}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{report.name}</h4>
                    <p className="text-xs text-muted-foreground">上次生成: {report.lastGenerated}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground mr-2">
                    {report.type}
                  </span>
                  <button 
                    onClick={() => setViewingReport(report.name)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    title="查看报表"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleExport(report.name)}
                    disabled={isExporting}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50"
                    title="导出报表"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="safety-card p-6 bg-primary text-white">
          <h3 className="text-lg font-medium mb-4">仓储效率简报</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-white/70 uppercase tracking-wider">平均周转天数</p>
              <p className="text-2xl font-bold mt-1">12.5 天</p>
              <div className="mt-2 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-white/70 uppercase tracking-wider">库位利用率</p>
              <p className="text-2xl font-bold mt-1">88.4 %</p>
              <div className="mt-2 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: '88%' }} />
              </div>
            </div>
            <button className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors mt-2 shadow-lg">
              生成本周安全仓储报告
            </button>
          </div>
        </div>
      </div>

      {/* Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{viewingReport}</h3>
                  <p className="text-sm text-muted-foreground">数据统计截止至: 2026-03-30 09:00</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingReport(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-8">
                {/* Mock Report Content */}
                {viewingReport === '煤炭与铝矾土物流统计报表' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Coal Logistics Card */}
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Train size={16} />
                          煤炭物流统计概况 (2026-03-30)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted-foreground border-b border-blue-100">
                                <th className="pb-2 font-medium text-left">指标</th>
                                <th className="pb-2 font-bold text-right">当日</th>
                                <th className="pb-2 font-bold text-right">月累</th>
                                <th className="pb-2 font-bold text-right">年累</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                              <tr>
                                <td className="py-3 text-muted-foreground">入库总量 (t)</td>
                                <td className="py-3 font-bold text-right text-foreground">1,030</td>
                                <td className="py-3 font-bold text-right text-foreground">42,500</td>
                                <td className="py-3 font-bold text-right text-foreground">125,800</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-muted-foreground">到列数量 (列)</td>
                                <td className="py-3 font-bold text-right text-foreground">3</td>
                                <td className="py-3 font-bold text-right text-foreground">124</td>
                                <td className="py-3 font-bold text-right text-foreground">368</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-muted-foreground">出库总量 (t)</td>
                                <td className="py-3 font-bold text-right text-foreground">640</td>
                                <td className="py-3 font-bold text-right text-foreground">38,200</td>
                                <td className="py-3 font-bold text-right text-foreground">112,400</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">当前库存</span>
                          <span className="text-lg font-bold text-primary">20,900 t</span>
                        </div>
                      </div>

                      {/* Bauxite Logistics Card */}
                      <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                        <h4 className="text-sm font-bold text-success-text uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Ship size={16} />
                          铝矾土物流统计概况 (2026-03-30)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted-foreground border-b border-green-100">
                                <th className="pb-2 font-medium text-left">指标</th>
                                <th className="pb-2 font-bold text-right">当日</th>
                                <th className="pb-2 font-bold text-right">月累</th>
                                <th className="pb-2 font-bold text-right">年累</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-green-50">
                              <tr>
                                <td className="py-3 text-muted-foreground">入库总量 (t)</td>
                                <td className="py-3 font-bold text-right text-foreground">0</td>
                                <td className="py-3 font-bold text-right text-foreground">58,000</td>
                                <td className="py-3 font-bold text-right text-foreground">185,200</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-muted-foreground">到列数量 (船)</td>
                                <td className="py-3 font-bold text-right text-foreground">1</td>
                                <td className="py-3 font-bold text-right text-foreground">28</td>
                                <td className="py-3 font-bold text-right text-foreground">92</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-muted-foreground">出库总量 (t)</td>
                                <td className="py-3 font-bold text-right text-foreground">320</td>
                                <td className="py-3 font-bold text-right text-foreground">45,600</td>
                                <td className="py-3 font-bold text-right text-foreground">142,800</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 pt-4 border-t border-green-100 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">当前库存</span>
                          <span className="text-lg font-bold text-success-text">26,200 t</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 font-medium">品类</th>
                            <th className="px-4 py-3 font-medium">作业类型</th>
                            <th className="px-4 py-3 font-medium">车号/船名</th>
                            <th className="px-4 py-3 font-medium">客户</th>
                            <th className="px-4 py-3 font-medium">重量 (t)</th>
                            <th className="px-4 py-3 font-medium">时间</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[
                            { cargo: '煤炭', type: '出库', ref: 'K9999', customer: '华能电力', weight: '640', time: '2026-03-30 10:00' },
                            { cargo: '铝矾土', type: '出库', ref: '远洋1号', customer: '中铝集团', weight: '320', time: '2026-03-30 09:30' },
                            { cargo: '煤炭', type: '入库', ref: 'K1234', customer: '华能电力', weight: '580', time: '2026-03-30 09:15' },
                            { cargo: '煤炭', type: '入库', ref: 'K5678', customer: '大唐发电', weight: '450', time: '2026-03-30 08:30' },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  row.cargo === '煤炭' ? "bg-blue-50 text-primary" : "bg-green-50 text-success-text"
                                )}>
                                  {row.cargo}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  row.type === '入库' ? "bg-muted text-muted-foreground" : "bg-orange-50 text-risk-orange-text"
                                )}>
                                  {row.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium">{row.ref}</td>
                              <td className="px-4 py-3">{row.customer}</td>
                              <td className="px-4 py-3 font-mono">{row.weight}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : viewingReport === '客户存货明细汇总' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase">总客户数</p>
                        <p className="text-xl font-bold mt-1">48 家</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase">客户总存量</p>
                        <p className="text-xl font-bold mt-1">65,900 t</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase">活跃度最高</p>
                        <p className="text-xl font-bold mt-1">华能电力</p>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 font-medium">客户名称</th>
                            <th className="px-4 py-3 font-medium">货物品类</th>
                            <th className="px-4 py-3 font-medium text-right">期初库存 (t)</th>
                            <th className="px-4 py-3 font-medium text-right">本期入库 (t)</th>
                            <th className="px-4 py-3 font-medium text-right">本期出库 (t)</th>
                            <th className="px-4 py-3 font-medium text-right">期末库存 (t)</th>
                            <th className="px-4 py-3 font-medium">最后更新</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[
                            { customer: '华能电力', cargo: '煤炭', initial: '15,000', inbound: '5,000', outbound: '3,200', current: '16,800', lastUpdate: '2026-03-30 10:00' },
                            { customer: '中铝集团', cargo: '铝矾土', initial: '12,000', inbound: '8,000', outbound: '4,500', current: '15,500', lastUpdate: '2026-03-30 09:30' },
                            { customer: '大唐发电', cargo: '煤炭', initial: '8,500', inbound: '2,400', outbound: '1,800', current: '9,100', lastUpdate: '2026-03-29 14:30' },
                            { customer: '魏桥铝业', cargo: '铝矾土', initial: '14,200', inbound: '6,500', outbound: '5,200', current: '15,500', lastUpdate: '2026-03-29 11:20' },
                            { customer: '国电投', cargo: '煤炭', initial: '10,000', inbound: '3,000', outbound: '4,000', current: '9,000', lastUpdate: '2026-03-30 08:15' },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-4 py-3 font-medium">{row.customer}</td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  row.cargo === '煤炭' ? "bg-blue-50 text-primary" : "bg-green-50 text-success-text"
                                )}>
                                  {row.cargo}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono">{row.initial}</td>
                              <td className="px-4 py-3 text-right font-mono text-primary">+{row.inbound}</td>
                              <td className="px-4 py-3 text-right font-mono text-risk-orange-text">-{row.outbound}</td>
                              <td className="px-4 py-3 text-right font-bold font-mono">{row.current}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.lastUpdate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : viewingReport === '集装箱库存和当日装卸情况' ? (
                  <div className="space-y-6">
                    {/* Container KPI Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Box size={20} />
                          </div>
                          <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">当日装卸动态</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">当日装船/车</p>
                            <p className="text-xl font-bold text-indigo-700">124 <span className="text-xs font-normal">TEU</span></p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">当日卸船/车</p>
                            <p className="text-xl font-bold text-indigo-700">86 <span className="text-xs font-normal">TEU</span></p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                            <LayoutGrid size={20} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">场内库存分布</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">重箱 (Full)</p>
                            <p className="text-xl font-bold text-slate-700">1,240 <span className="text-xs font-normal">TEU</span></p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">空箱 (Empty)</p>
                            <p className="text-xl font-bold text-slate-700">450 <span className="text-xs font-normal">TEU</span></p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <ArrowRightLeft size={20} />
                          </div>
                          <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">堆场利用率</h4>
                        </div>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-bold text-amber-700">74.2%</p>
                          <div className="flex-1 h-2 bg-amber-100 rounded-full mb-2 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '74.2%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Container Size Distribution */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-white border border-border rounded-xl text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">20' 重箱</p>
                        <p className="text-lg font-bold">420</p>
                      </div>
                      <div className="p-3 bg-white border border-border rounded-xl text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">40' 重箱</p>
                        <p className="text-lg font-bold">410</p>
                      </div>
                      <div className="p-3 bg-white border border-border rounded-xl text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">20' 空箱</p>
                        <p className="text-lg font-bold">180</p>
                      </div>
                      <div className="p-3 bg-white border border-border rounded-xl text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">40' 空箱</p>
                        <p className="text-lg font-bold">135</p>
                      </div>
                    </div>

                    {/* Daily Operations Table */}
                    <div className="border border-border rounded-xl overflow-hidden">
                      <div className="bg-muted px-4 py-2 border-b border-border flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider">当日装卸作业明细 (2026-03-30)</span>
                        <span className="text-[10px] text-muted-foreground">共 210 条记录</span>
                      </div>
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 font-medium">箱号</th>
                            <th className="px-4 py-3 font-medium">尺寸/类型</th>
                            <th className="px-4 py-3 font-medium">作业</th>
                            <th className="px-4 py-3 font-medium">状态</th>
                            <th className="px-4 py-3 font-medium">客户/船名</th>
                            <th className="px-4 py-3 font-medium">堆位</th>
                            <th className="px-4 py-3 font-medium">时间</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[
                            { id: 'MSCU1234567', type: '40\' HC', op: '卸船', load: '重箱', ref: '远洋1号', pos: 'A-03-02', time: '11:20' },
                            { id: 'COSU7654321', type: '20\' GP', op: '装车', load: '空箱', ref: '顺丰物流', pos: 'B-12-01', time: '10:45' },
                            { id: 'MAEU9876543', type: '40\' GP', op: '卸车', load: '重箱', ref: '中外运', pos: 'C-05-04', time: '10:15' },
                            { id: 'EVER2468135', type: '20\' GP', op: '装船', load: '重箱', ref: '长荣海运', pos: 'A-08-03', time: '09:50' },
                            { id: 'CMAU1357924', type: '40\' HC', op: '卸船', load: '空箱', ref: '达飞轮船', pos: 'D-02-01', time: '09:10' },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-4 py-3 font-mono font-medium">{row.id}</td>
                              <td className="px-4 py-3 text-xs">{row.type}</td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  row.op.includes('装') ? "bg-blue-50 text-primary" : "bg-green-50 text-success-text"
                                )}>
                                  {row.op}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  row.load === '重箱' ? "bg-slate-100 text-slate-700" : "bg-slate-50 text-slate-400"
                                )}>
                                  {row.load}
                                </span>
                              </td>
                              <td className="px-4 py-3">{row.ref}</td>
                              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.pos}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase">
                          {viewingReport.includes('库存') ? '当前总库存' : '总吞吐量'}
                        </p>
                        <p className="text-xl font-bold mt-1">
                          {viewingReport.includes('库存') ? '47,100 t' : '12,450 t'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase">
                          {viewingReport.includes('客户') ? '活跃客户' : '入库车次'}
                        </p>
                        <p className="text-xl font-bold mt-1">
                          {viewingReport.includes('客户') ? '24 家' : '156 次'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase">
                          {viewingReport.includes('分析') ? '环比增长' : '出库车次'}
                        </p>
                        <p className="text-xl font-bold mt-1">
                          {viewingReport.includes('分析') ? '+8.5 %' : '142 次'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase">安全运行</p>
                        <p className="text-xl font-bold mt-1 text-success-text">1,240 天</p>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 font-medium">
                              {viewingReport.includes('库存') ? '库位编号' : '时间'}
                            </th>
                            <th className="px-4 py-3 font-medium">
                              {viewingReport.includes('客户') ? '客户名称' : '货物品类'}
                            </th>
                            <th className="px-4 py-3 font-medium">
                              {viewingReport.includes('库存') ? '存放品类' : '作业类型'}
                            </th>
                            <th className="px-4 py-3 font-medium">数量 (t)</th>
                            <th className="px-4 py-3 font-medium">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {viewingReport.includes('库存') ? (
                            [
                              { id: 'W001-E', cargo: '煤炭', type: '东区', amount: '12,500', status: '正常' },
                              { id: 'W001-W', cargo: '煤炭', type: '西区', amount: '8,400', status: '正常' },
                              { id: 'W002-E', cargo: '铝矾土', type: '东区', amount: '15,000', status: '预警' },
                              { id: 'W002-W', cargo: '铝矾土', type: '西区', amount: '11,200', status: '正常' },
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-muted/30">
                                <td className="px-4 py-3 text-muted-foreground font-mono">{row.id}</td>
                                <td className="px-4 py-3 font-medium">-- 多客户汇总 --</td>
                                <td className="px-4 py-3">{row.cargo}</td>
                                <td className="px-4 py-3 font-mono">{row.amount}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      row.status === '正常' ? "bg-success-text" : "bg-risk-red-text"
                                    )} />
                                    {row.status}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            [
                              { time: '08:30', cargo: '煤炭', type: '入库', amount: '450', status: '已完成' },
                              { time: '08:45', cargo: '铝矾土', type: '出库', amount: '320', status: '进行中' },
                              { time: '09:15', cargo: '煤炭', type: '入库', amount: '580', status: '已完成' },
                              { time: '09:30', cargo: '铝矾土', type: '入库', amount: '210', status: '待处理' },
                              { time: '10:00', cargo: '煤炭', type: '出库', amount: '640', status: '已完成' },
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-muted/30">
                                <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                                <td className="px-4 py-3 font-medium">{row.cargo}</td>
                                <td className="px-4 py-3">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                    row.type === '入库' ? "bg-blue-50 text-primary" : "bg-orange-50 text-risk-orange-text"
                                  )}>
                                    {row.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono">{row.amount}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      row.status === '已完成' ? "bg-success-text" : row.status === '进行中' ? "bg-primary" : "bg-muted-foreground"
                                    )} />
                                    {row.status}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-border bg-muted/10 flex justify-end gap-3">
              <button 
                onClick={() => setViewingReport(null)}
                className="px-6 py-2 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
              >
                关闭
              </button>
              <button 
                onClick={() => {
                  handleExport(viewingReport);
                  setViewingReport(null);
                }}
                className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Download size={18} />
                立即导出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
