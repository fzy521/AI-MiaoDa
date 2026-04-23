import React from 'react';
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
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const inventoryData = [
  { name: '煤炭 (东区)', value: 12500, color: ' #1a73e8' },
  { name: '煤炭 (西区)', value: 8400, color: ' #4285f4' },
  { name: '铝矾土 (东区)', value: 15000, color: ' #1e8e3e' },
  { name: '铝矾土 (西区)', value: 11200, color: ' #34a853' },
];

const flowData = [
  { date: '03-24', inbound: 4500, outbound: 3200 },
  { date: '03-25', inbound: 5200, outbound: 4100 },
  { date: '03-26', inbound: 3800, outbound: 4500 },
  { date: '03-27', inbound: 6100, outbound: 3800 },
  { date: '03-28', inbound: 4900, outbound: 5200 },
  { date: '03-29', inbound: 7200, outbound: 4800 },
  { date: '03-30', inbound: 5800, outbound: 6100 },
];

const reportTemplates = [
  { id: 'logistics', name: '煤炭与铝矾土物流统计报表', type: 'EXCEL', lastGenerated: '2026-03-30 10:00' },
  { id: 'daily', name: '每日仓储动态报表', type: 'PDF', lastGenerated: '2026-03-30 08:00' },
  { id: 'inventory', name: '实时库存盘点清单', type: 'EXCEL', lastGenerated: '2026-03-30 09:15' },
  { id: 'flow', name: '货物吞吐量月度分析', type: 'PDF', lastGenerated: '2026-03-01 00:00' },
  { id: 'customer', name: '客户存货明细汇总', type: 'EXCEL', lastGenerated: '2026-03-29 18:30' },
  { id: 'container', name: '集装箱库存和当日装卸情况', type: 'EXCEL', lastGenerated: '2026-03-30 11:00' },
];

export function Statistics() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [viewingReport, setViewingReport] = React.useState<string | null>(null);

  const handleExport = (reportName: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast(`${reportName} 导出成功！`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">统计分析</h2>
          <p className="text-muted-foreground">仓储吞吐量、库存分布及业务动态报表</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors">
            <Calendar size={16} />
            最近7天
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors">
            <Filter size={16} />
            筛选条件
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-primary rounded-lg">
              <Package size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" />
              +5.2%
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">当前总库存</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">47,100</span>
            <span className="text-sm text-muted-foreground">t</span>
          </div>
        </div>

        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Truck size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" />
              +12.8%
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">本周入库总量</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">37,500</span>
            <span className="text-sm text-muted-foreground">t</span>
          </div>
        </div>

        <div className="safety-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Ship size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              <ArrowDownRight size={14} className="mr-1" />
              -2.4%
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">本周出库总量</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">31,700</span>
            <span className="text-sm text-muted-foreground">t</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbound/Outbound Trend */}
        <div className="safety-card p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-primary" />
            出入库趋势分析
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke=" #f1f3f4" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: ' #5f6368' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: ' #5f6368' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px  rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="inbound" name="入库量" stroke=" #1a73e8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="outbound" name="出库量" stroke=" #1e8e3e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="safety-card p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Package size={20} className="text-primary" />
            库存分布占比
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
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
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports & Export Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <div className="lg:col-span-2 safety-card">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              报表中心
            </h3>
          </div>
          <div className="divide-y divide-border">
            {reportTemplates.map((report) => (
              <div key={report.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    report.type === 'PDF' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  )}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{report.name}</h4>
                    <p className="text-xs text-muted-foreground">上次生成: {report.lastGenerated}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground mr-2">
                    {report.type}
                  </span>
                  <button 
                    onClick={() => setViewingReport(report.name)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    title="查看报表"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleExport(report.name)}
                    disabled={isExporting}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50"
                    title="导出报表"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="safety-card p-6 bg-primary text-white">
          <h3 className="text-lg font-medium mb-4">仓储效率简报</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-white/70 uppercase tracking-wider">平均周转天数</p>
              <p className="text-2xl font-bold mt-1">12.5 天</p>
              <div className="mt-2 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-white/70 uppercase tracking-wider">库位利用率</p>
              <p className="text-2xl font-bold mt-1">88.4 %</p>
              <div className="mt-2 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: '88%' }} />
              </div>
            </div>
            <button className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors mt-2 shadow-lg">
              生成本周安全仓储报告
            </button>
          </div>
        </div>
      </div>

      {/* Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{viewingReport}</h3>
                  <p className="text-sm text-muted-foreground">数据统计截止至: 2026-03-30 09:00</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingReport(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-8">
                {/* Mock Report Content */}
                {viewingReport === '煤炭与铝矾土物流统计报表' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Coal Logistics Card */}
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Train size={16} />
                          煤炭物流统计概况 (2026-03-30)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted-foreground border-b border-blue-100">
                                <th className="pb-2 font-medium text-left">指标</th>
                                <th className="pb-2 font-bold text-right">当日</th>
                                <th className="pb-2 font-bold text-right">月累</th>
                                <th className="pb-2 font-bold text-right">年累</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                              <tr>
                                <td className="py-3 text-muted-foreground">入库总量 (t)</td>
                                <td className="py-3 font-bold text-right text-foreground">1,030</td>
                                <td className="py-3 font-bold text-right text-foreground">42,500</td>
                                <td className="py-3 font-bold text-right text-foreground">125,800</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-muted-foreground">到列数量 (列)</td>
                                <td className="py-3 font-bold text-right text-foreground">3</td>
                                <td className="py-3 font-bold text-right text-foreground">124</td>
                                <td className="py-3 font-bold text-right text-foreground">368</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-muted-foreground">出库总量 (t)</td>
                                <td className="py-3 font-bold text-right text-foreground">640</td>
                                <td className="py-3 font-bold text-right text-foreground">38,200</td>
                                <td className="py-3 font-bold text-right text-foreground">112,400</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">当前库存</span>
                          <span className="text-lg font-bold text-primary">20,900 t</span>
                        </div>
                      </div>

                      {/* Bauxite Logistics Card */}
                      <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                        <h4 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Ship size={16} />
                          铝矾土物流统计概况 (2026-03-30)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted-foreground border-b border-green-100">
                                <th className="pb-2 font-medium text-left">指标</th>
                                <th className="pb-2 font-bold text-right">当日</th>
                                <th className="pb-2 font-bold text-right">月累</th>
                                <th className="pb-2 font-bold text-right">年累</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-green-50">
                              <tr>
                                <td className="py-3 text-muted-foreground">入库总量 (t)</td>
                                <td className="py-3 font-bold text-right text-foreground">0</td>
                                <td className="py-3 font-bold text-right text-foreground">58,000</td>
                                <td className="py-3 font-bold text-right text-foreground">185,200</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-muted-foreground">到列数量 (船)</td>
                                <td className="py-3 font-bold text-right text-foreground">1</td>
                                <td className="py-3 font-bold text-right text-foreground">28</td>
                                <td className="py-3 font-bold text-right text-foreground">92</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-muted-foreground">出库总量 (t)</td>
                                <td className="py-3 font-bold text-right text-foreground">320</td>
                                <td className="py-3 font-bold text-right text-foreground">45,600</td>
                                <td className="py-3 font-bold text-right text-foreground">142,800</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 pt-4 border-t border-green-100 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">当前库存</span>
                          <span className="text-lg font-bold text-green-600">26,200 t</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 font-medium">品类</th>
                            <th className="px-4 py-3 font-medium">作业类型</th>
                            <th className="px-4 py-3 font-medium">车号/船名</th>
                            <th className="px-4 py-3 font-medium">客户</th>
                            <th className="px-4 py-3 font-medium">重量 (t)</th>
                            <th className="px-4 py-3 font-medium">时间</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[
                            { cargo: '煤炭', type: '出库', ref: 'K9999', customer: '华能电力', weight: '640', time: '2026-03-30 10:00' },
                            { cargo: '铝矾土', type: '出库', ref: '远洋1号', customer: '中铝集团', weight: '320', time: '2026-03-30 09:30' },
                            { cargo: '煤炭', type: '入库', ref: 'K1234', customer: '华能电力', weight: '580', time: '2026-03-30 09:15' },
                            { cargo: '煤炭', type: '入库', ref: 'K5678', customer: '大唐发电', weight: '450', time: '2026-03-30 08:30' },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  row.cargo === '煤炭' ? "bg-blue-50 text-primary" : "bg-green-50 text-green-600"
                                )}>
                                  {row.cargo}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  row.type === '入库' ? "bg-muted text-muted-foreground" : "bg-orange-50 text-orange-600"
                                )}>
                                  {row.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium">{row.ref}</td>
                              <td className="px-4 py-3">{row.customer}</td>
                              <td className="px-4 py-3 font-mono">{row.weight}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p>报表内容预览功能开发中...</p>
                    <p className="text-sm mt-2">请导出后查看完整内容</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
