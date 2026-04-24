import React from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Wrench,
  TreePine,
  Settings,
  FileText,
  Info,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskLevel, RiskPoint } from '@/types';

const LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ size?: number }> }> = {
  RED: { label: '重大风险', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
  ORANGE: { label: '较大风险', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle },
  YELLOW: { label: '一般风险', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock },
  BLUE: { label: '低风险', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle2 },
};

const TYPE_CONFIG = {
  人: { label: '行为类', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  机: { label: '设备类', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
  环: { label: '环境类', icon: TreePine, color: 'text-green-600', bg: 'bg-green-50' },
  管: { label: '管理类', icon: Settings, color: 'text-orange-600', bg: 'bg-orange-50' },
};

const ACCIDENT_TYPES = [
  '车辆伤害', '机械伤害', '物体打击', '高处坠落', '触电', '火灾', '爆炸',
  '中毒和窒息', '其他伤害', '职业病', '铁路交通事故', '火灾/拥挤踩踏',
  '火灾/触电', '其他爆炸', '治安/盗窃'
];

const MOCK_RISKS: RiskPoint[] = [
  { id: 'R-001', name: '专用线道岔安全风险', level: 'RED', department: '工务段', lastInspection: '2026-04-20', status: 'ABNORMAL', type: '人', workActivity: '线路维护作业', hazard: '道岔几何尺寸超标，轨道结构损坏', accidentType: '铁路交通事故', controlMeasures: '每日检查道岔状态，每周全面检测，发现问题立即上报并处理', area: '货场 丁公站', assignee: '李维修 13800001111' },
  { id: 'R-002', name: '货场消防系统风险', level: 'ORANGE', department: '安全部', lastInspection: '2026-04-18', status: 'NORMAL', type: '机', workActivity: '消防安全检查', hazard: '消防验收未完成区域消防设施缺失', accidentType: '火灾', controlMeasures: '配置临时灭火器材，安排专人每日巡查消防设施状态', area: '货场 丁公站', assignee: '张消防 13800002222' },
  { id: 'R-003', name: '装卸作业机械伤害风险', level: 'ORANGE', department: '运输车间', lastInspection: '2026-04-19', status: 'NORMAL', type: '机', workActivity: '龙门吊操作', hazard: '钢丝绳断丝超标，限位器失灵', accidentType: '机械伤害', controlMeasures: '更换限位开关并加装冗余保护，定期检查钢丝绳', area: 'B区货场', assignee: '王操作 13800003333' },
  { id: 'R-004', name: '恶劣天气作业风险', level: 'YELLOW', department: '安全部', lastInspection: '2026-04-15', status: 'NORMAL', type: '环', workActivity: '户外作业', hazard: '暴雨/台风导致水淹设备、边坡滑塌', accidentType: '其他伤害', controlMeasures: '制定恶劣天气应急预案，建立气象预警接收机制', area: '货场全域', assignee: '赵安全 13800004444' },
  { id: 'R-005', name: '叉车操作伤人风险', level: 'YELLOW', department: '运输车间', lastInspection: '2026-04-21', status: 'NORMAL', type: '人', workActivity: '叉车驾驶', hazard: '超速行驶、视野盲区导致碰撞', accidentType: '车辆伤害', controlMeasures: '场内限速20km/h，安装叉车报警器，作业区设置警戒标识', area: '装卸区', assignee: '孙司机 13800005555' },
  { id: 'R-006', name: '电气设备触电风险', level: 'YELLOW', department: '电务段', lastInspection: '2026-04-17', status: 'NORMAL', type: '机', workActivity: '电气设备检修', hazard: '设备漏电未及时发现，检修时未断电挂牌', accidentType: '触电', controlMeasures: '安装漏电保护器，检修时严格执行断电挂牌制度，使用绝缘工具', area: '综合办公楼', assignee: '陈电工 13800006666' },
  { id: 'R-007', name: '外来人员管理风险', level: 'BLUE', department: '安保部', lastInspection: '2026-04-22', status: 'NORMAL', type: '管', workActivity: '门卫值班', hazard: '外来人员未经登记进入管理区域', accidentType: '治安/盗窃', controlMeasures: '严格执行外来人员登记制度，重要区域实行门禁管理', area: '货场入口', assignee: '周保安 13800007777' },
  { id: 'R-008', name: '高温天气中暑风险', level: 'BLUE', department: '综合部', lastInspection: '2026-04-10', status: 'NORMAL', type: '人', workActivity: '户外作业', hazard: '高温天气户外作业导致中暑', accidentType: '职业病', controlMeasures: '高温天气缩短户外作业时间，提供防暑降温饮品和药品', area: '户外作业区', assignee: '刘工长 13800008888' },
  { id: 'R-009', name: '信号设备故障风险', level: 'RED', department: '电务段', lastInspection: '2026-04-19', status: 'NORMAL', type: '机', workActivity: '信号设备维护', hazard: '道口报警器灵敏度下降，响应延迟', accidentType: '铁路交通事故', controlMeasures: '更换传感器模块并重新校准，测试响应时间达标', area: '3号道口', assignee: '张电务 13800009999' },
  { id: 'R-010', name: '消防通道堵塞风险', level: 'ORANGE', department: '安全部', lastInspection: '2026-04-21', status: 'ABNORMAL', type: '管', workActivity: '日常巡检', hazard: '消防通道被占用，安全出口锁闭', accidentType: '火灾', controlMeasures: '每日巡查消防通道畅通情况，严禁占用和锁闭安全出口', area: '3号仓库', assignee: '钱班长 13800001010' },
];

interface RiskFormData {
  workActivity: string;
  type: string;
  hazard: string;
  accidentType: string;
  controlMeasures: string;
  level: RiskLevel;
  area: string;
  assignee: string;
}

const emptyForm: RiskFormData = {
  workActivity: '',
  type: '人',
  hazard: '',
  accidentType: '',
  controlMeasures: '',
  level: 'BLUE',
  area: '',
  assignee: '',
};

export function RiskManagement() {
  const [risks] = React.useState<RiskPoint[]>(MOCK_RISKS);
  const [search, setSearch] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState<RiskLevel | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'NORMAL' | 'ABNORMAL'>('ALL');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<RiskFormData>(emptyForm);

  const filtered = risks.filter(r => {
    const matchSearch = search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.hazard?.toLowerCase().includes(search.toLowerCase()) ||
      r.area.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'ALL' || r.level === levelFilter;
    const matchType = typeFilter === 'ALL' || r.type === typeFilter;
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchLevel && matchType && matchStatus;
  });

  const levelCounts = {
    RED: risks.filter(r => r.level === 'RED').length,
    ORANGE: risks.filter(r => r.level === 'ORANGE').length,
    YELLOW: risks.filter(r => r.level === 'YELLOW').length,
    BLUE: risks.filter(r => r.level === 'BLUE').length,
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (risk: RiskPoint) => {
    setEditingId(risk.id);
    setForm({
      workActivity: (risk as any).workActivity || '',
      type: (risk as any).type || '人',
      hazard: (risk as any).hazard || risk.name,
      accidentType: (risk as any).accidentType || '',
      controlMeasures: (risk as any).controlMeasures || '',
      level: risk.level,
      area: risk.area,
      assignee: risk.assignee || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">风险管控</h2>
          <p className="text-muted-foreground">构建安全风险分级管控和隐患排查治理双控机制</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors">
            <Download size={16} /> 导出清单
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all">
            <Plus size={20} /> 新增风险点
          </button>
        </div>
      </div>

      {/* Level Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(LEVEL_CONFIG) as [RiskLevel, typeof LEVEL_CONFIG[RiskLevel]][]).reverse().map(([level, config]) => {
          const Icon = config.icon;
          return (
            <div
              key={level}
              className={cn('safety-card p-4 cursor-pointer transition-all hover:shadow-md', config.bg, config.border)}
              onClick={() => setLevelFilter(levelFilter === level ? 'ALL' : level)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={config.color} />
                <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn('text-3xl font-bold', config.color)}>{levelCounts[level]}</span>
                <span className="text-sm text-muted-foreground">项</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-full p-2 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm border border-border">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto px-2">
          <button
            onClick={() => setLevelFilter('ALL')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              levelFilter === 'ALL' ? 'bg-accent text-accent-foreground' : 'bg-transparent text-muted-foreground hover:bg-black/5'
            )}
          >
            全部等级
          </button>
          {Object.entries(LEVEL_CONFIG).map(([level, config]) => (
            <button
              key={level}
              onClick={() => setLevelFilter(levelFilter === level ? 'ALL' : level)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                levelFilter === level ? 'bg-accent text-accent-foreground' : 'bg-transparent text-muted-foreground hover:bg-black/5'
              )}
            >
              {config.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 pr-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="搜索风险点、危险因素、区域..."
            className="w-full pl-11 pr-4 py-2 bg-muted/50 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-transparent focus:shadow-md transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Risk List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="safety-card p-12 text-center text-muted-foreground">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">未找到匹配的风险点</p>
            <p className="text-sm mt-1">请调整搜索条件或筛选条件</p>
          </div>
        ) : (
          filtered.map(risk => {
            const levelCfg = LEVEL_CONFIG[risk.level];
            const typeCfg = TYPE_CONFIG[(risk as any).type] || TYPE_CONFIG['人'];
            const TypeIcon = typeCfg.icon;
            return (
              <div key={risk.id} className={cn('safety-card p-6 group hover:shadow-md transition-all border-l-4', levelCfg.border.split(' ')[1])}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{risk.id}</span>
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md', levelCfg.bg, levelCfg.color)}>
                            {levelCfg.label}
                          </span>
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1', typeCfg.bg, typeCfg.color)}>
                            <TypeIcon size={12} />
                            {typeCfg.label}
                          </span>
                          {risk.status === 'ABNORMAL' && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-red-100 text-red-600 flex items-center gap-1">
                              <AlertTriangle size={12} /> 异常
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">{(risk as any).hazard || risk.name}</h3>
                        <p className="text-sm text-muted-foreground">{(risk as any).workActivity} · {(risk as any).accidentType}</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground">危险因素：</span>
                          <span className="text-foreground">{(risk as any).hazard}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground">控制措施：</span>
                          <span className="text-foreground">{(risk as any).controlMeasures}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <TreePine size={16} />
                        {risk.area}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        {(risk as any).assignee || '未分配'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        上次检查: {risk.lastInspection}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 min-w-[120px]">
                    <button className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-full transition-colors text-center">
                      查看详情
                    </button>
                    <button
                      onClick={() => openEditModal(risk)}
                      className="flex-1 md:flex-none px-4 py-2 text-sm font-medium border border-border bg-white hover:bg-muted rounded-full transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <Edit2 size={14} /> 编辑
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingId ? '编辑风险点' : '新增风险点'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">涉及作业活动</label>
                  <input
                    type="text"
                    placeholder="如：线路维护作业"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.workActivity}
                    onChange={e => setForm({ ...form, workActivity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">风险类型</label>
                  <div className="flex gap-2">
                    {Object.entries(TYPE_CONFIG).map(([t, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={t}
                          onClick={() => setForm({ ...form, type: t })}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                            form.type === t ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-primary/30` : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          <Icon size={14} /> {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">危险因素描述</label>
                <textarea
                  placeholder="描述存在的危险因素..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  value={form.hazard}
                  onChange={e => setForm({ ...form, hazard: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">事故类型</label>
                  <select
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.accidentType}
                    onChange={e => setForm({ ...form, accidentType: e.target.value })}
                  >
                    <option value="">请选择</option>
                    {ACCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">风险等级</label>
                  <div className="flex gap-2">
                    {Object.entries(LEVEL_CONFIG).map(([l, cfg]) => (
                      <button
                        key={l}
                        onClick={() => setForm({ ...form, level: l })}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-xs font-medium transition-colors',
                          form.level === l ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-primary/30` : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">控制措施</label>
                <textarea
                  placeholder="描述风险控制措施..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  value={form.controlMeasures}
                  onChange={e => setForm({ ...form, controlMeasures: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">所属区域</label>
                  <input
                    type="text"
                    placeholder="如：货场 丁公站"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">包保责任人及电话</label>
                  <input
                    type="text"
                    placeholder="如：张三 13800000000"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.assignee}
                    onChange={e => setForm({ ...form, assignee: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors">
                取消
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}