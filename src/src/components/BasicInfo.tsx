import React from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Warehouse, 
  Users, 
  MapPin, 
  MoreVertical,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'WAREHOUSE' | 'CUSTOMER' | 'STATION';

interface WarehouseInfo {
  id: string;
  name: string;
  type: string;
  capacity: string;
  manager: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface CustomerInfo {
  id: string;
  name: string;
  contact: string;
  phone: string;
  type: string;
  creditLevel: string;
}

interface StationInfo {
  id: string;
  name: string;
  code: string;
  line: string;
  type: 'ORIGIN' | 'DESTINATION' | 'BOTH';
}

const mockWarehouses: WarehouseInfo[] = [
  { id: 'W001', name: '煤炭条形仓-东区', type: '条形仓', capacity: '50,000 t', manager: '张三', status: 'ACTIVE' },
  { id: 'W002', name: '煤炭条形仓-西区', type: '条形仓', capacity: '50,000 t', manager: '李四', status: 'ACTIVE' },
  { id: 'W003', name: '铝矾土堆场-东区', type: '露天堆场', capacity: '80,000 t', manager: '王五', status: 'ACTIVE' },
  { id: 'W004', name: '铝矾土堆场-西区', type: '露天堆场', capacity: '80,000 t', manager: '赵六', status: 'ACTIVE' },
];

const mockCustomers: CustomerInfo[] = [
  { id: 'C001', name: '华能电力集团', contact: '刘经理', phone: '138****1234', type: '核心客户', creditLevel: 'AAA' },
  { id: 'C002', name: '中铝集团', contact: '陈主管', phone: '139****5678', type: '战略合作伙伴', creditLevel: 'AAA' },
  { id: 'C003', name: '魏桥铝业', contact: '张主任', phone: '137****9012', type: '普通客户', creditLevel: 'AA' },
  { id: 'C004', name: '大唐发电', contact: '孙经理', phone: '136****3456', type: '核心客户', creditLevel: 'AAA' },
];

const mockStations: StationInfo[] = [
  { id: 'S001', name: '大同站', code: 'DTZ', line: '大秦线', type: 'ORIGIN' },
  { id: 'S002', name: '神木站', code: 'SMZ', line: '神黄线', type: 'ORIGIN' },
  { id: 'S003', name: '天津港', code: 'TJG', line: '津山线', type: 'DESTINATION' },
  { id: 'S004', name: '黄骅港', code: 'HHG', line: '朔黄线', type: 'DESTINATION' },
];

export function BasicInfo() {
  const [activeTab, setActiveTab] = React.useState<TabType>('WAREHOUSE');
  const [searchQuery, setSearchQuery] = React.useState('');

  const renderWarehouseTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground border-b border-border">
          <tr>
            <th className="px-6 py-4 font-medium">仓库编号</th>
            <th className="px-6 py-4 font-medium">仓库名称</th>
            <th className="px-6 py-4 font-medium">类型</th>
            <th className="px-6 py-4 font-medium">设计库容</th>
            <th className="px-6 py-4 font-medium">负责人</th>
            <th className="px-6 py-4 font-medium">状态</th>
            <th className="px-6 py-4 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockWarehouses.map((w) => (
            <tr key={w.id} className="hover:bg-accent/50 transition-colors">
              <td className="px-6 py-4 font-mono text-xs">{w.id}</td>
              <td className="px-6 py-4 font-medium">{w.name}</td>
              <td className="px-6 py-4 text-muted-foreground">{w.type}</td>
              <td className="px-6 py-4 text-muted-foreground">{w.capacity}</td>
              <td className="px-6 py-4 text-muted-foreground">{w.manager}</td>
              <td className="px-6 py-4">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                  w.status === 'ACTIVE' ? "bg-green-100 text-green-600 border-green-600/20" : "bg-muted text-muted-foreground border-border"
                )}>
                  {w.status === 'ACTIVE' ? '启用中' : '已停用'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-100 rounded-md transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCustomerTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground border-b border-border">
          <tr>
            <th className="px-6 py-4 font-medium">客户编号</th>
            <th className="px-6 py-4 font-medium">客户全称</th>
            <th className="px-6 py-4 font-medium">联系人</th>
            <th className="px-6 py-4 font-medium">联系电话</th>
            <th className="px-6 py-4 font-medium">客户类型</th>
            <th className="px-6 py-4 font-medium">信用等级</th>
            <th className="px-6 py-4 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockCustomers.map((c) => (
            <tr key={c.id} className="hover:bg-accent/50 transition-colors">
              <td className="px-6 py-4 font-mono text-xs">{c.id}</td>
              <td className="px-6 py-4 font-medium">{c.name}</td>
              <td className="px-6 py-4 text-muted-foreground">{c.contact}</td>
              <td className="px-6 py-4 text-muted-foreground">{c.phone}</td>
              <td className="px-6 py-4 text-muted-foreground">{c.type}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-primary border-primary/20">
                  {c.creditLevel}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-100 rounded-md transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStationTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground border-b border-border">
          <tr>
            <th className="px-6 py-4 font-medium">车站代码</th>
            <th className="px-6 py-4 font-medium">车站名称</th>
            <th className="px-6 py-4 font-medium">所属线路</th>
            <th className="px-6 py-4 font-medium">车站类型</th>
            <th className="px-6 py-4 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockStations.map((s) => (
            <tr key={s.id} className="hover:bg-accent/50 transition-colors">
              <td className="px-6 py-4 font-mono text-xs">{s.code}</td>
              <td className="px-6 py-4 font-medium">{s.name}</td>
              <td className="px-6 py-4 text-muted-foreground">{s.line}</td>
              <td className="px-6 py-4">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                  s.type === 'ORIGIN' ? "bg-blue-50 text-primary border-primary/20" : 
                  s.type === 'DESTINATION' ? "bg-green-50 text-green-600 border-green-600/20" :
                  "bg-purple-50 text-purple-600 border-purple-200"
                )}>
                  {s.type === 'ORIGIN' ? '发站' : s.type === 'DESTINATION' ? '到站' : '中转站'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-100 rounded-md transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">基础信息管理</h2>
          <p className="text-muted-foreground">维护仓库、客户及物流节点等核心基础数据</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all">
          <Plus size={18} />
          新增记录
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-2 rounded-2xl border border-border">
        <div className="flex p-1 bg-muted/50 rounded-xl">
          <button 
            onClick={() => setActiveTab('WAREHOUSE')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'WAREHOUSE' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Warehouse size={16} />
            仓库管理
          </button>
          <button 
            onClick={() => setActiveTab('CUSTOMER')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'CUSTOMER' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users size={16} />
            客户信息
          </button>
          <button 
            onClick={() => setActiveTab('STATION')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'STATION' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin size={16} />
            到发站
          </button>
        </div>
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="搜索名称、编号或代码..." 
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="safety-card">
        {activeTab === 'WAREHOUSE' && renderWarehouseTable()}
        {activeTab === 'CUSTOMER' && renderCustomerTable()}
        {activeTab === 'STATION' && renderStationTable()}
      </div>
    </div>
  );
}
