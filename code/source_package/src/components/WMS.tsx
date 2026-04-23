import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Train, 
  Ship, 
  MapPin, 
  Scale, 
  User, 
  Calendar,
  LayoutGrid,
  Ruler,
  ArrowRightLeft,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CoalEntry, BauxiteEntry, CargoType, CoalOutflow, BauxiteOutflow } from '../types';

const mockCoalData: CoalEntry[] = [
  { id: 'C001', trainNo: 'K1234', originStation: '大同站', weight: 3200, customer: '华能电力', area: 'EAST', startPosition: 10, endPosition: 60, timestamp: '2026-03-29 10:00' },
  { id: 'C002', trainNo: 'K5678', originStation: '神木站', weight: 2800, customer: '大唐发电', area: 'WEST', startPosition: 120, endPosition: 165, timestamp: '2026-03-29 14:30' },
];

const mockBauxiteData: BauxiteEntry[] = [
  { id: 'B001', shipName: '远洋1号', customer: '中铝集团', weight: 5000, area: 'EAST', occupiedArea: 1200, timestamp: '2026-03-28 09:00' },
  { id: 'B002', shipName: '海丰轮', customer: '魏桥铝业', weight: 4500, area: 'WEST', occupiedArea: 1000, timestamp: '2026-03-29 11:20' },
];

const mockCoalOutflow: CoalOutflow[] = [
  { id: 'CO001', sourceEntryId: 'C001', trainNo: 'K9999', destinationStation: '天津港', weight: 1500, customer: '华能电力', area: 'EAST', timestamp: '2026-03-30 08:00' },
];

const mockBauxiteOutflow: BauxiteOutflow[] = [
  { id: 'BO001', sourceEntryId: 'B001', shipName: '远洋1号', customer: '中铝集团', weight: 2000, area: 'EAST', timestamp: '2026-03-30 09:30' },
];

export function WMS() {
  const [activeCargo, setActiveCargo] = React.useState<CargoType>('COAL');
  const [activeMode, setActiveMode] = React.useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
  const [selectedLotId, setSelectedLotId] = React.useState<string>('');
  const [outflowWeight, setOutflowWeight] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);

  // Calculate remaining stock for a lot
  const getRemainingStock = (lotId: string) => {
    if (activeCargo === 'COAL') {
      const lot = mockCoalData.find(l => l.id === lotId);
      if (!lot) return 0;
      const outflow = mockCoalOutflow
        .filter(o => o.sourceEntryId === lotId)
        .reduce((sum, o) => sum + o.weight, 0);
      return lot.weight - outflow;
    } else {
      const lot = mockBauxiteData.find(l => l.id === lotId);
      if (!lot) return 0;
      const outflow = mockBauxiteOutflow
        .filter(o => o.sourceEntryId === lotId)
        .reduce((sum, o) => sum + o.weight, 0);
      return lot.weight - outflow;
    }
  };

  const handleOutflowSubmit = () => {
    if (!selectedLotId) {
      setError('请先选择货位/批次');
      return;
    }
    const weight = parseFloat(outflowWeight);
    if (isNaN(weight) || weight <= 0) {
      setError('请输入有效的出库重量');
      return;
    }
    const remaining = getRemainingStock(selectedLotId);
    if (weight > remaining) {
      setError(`出库量不能大于当前存货量 (${remaining} t)`);
      return;
    }
    setError(null);
    alert('出库登记成功 (模拟)');
  };

  const activeLots = activeCargo === 'COAL' ? mockCoalData : mockBauxiteData;
  const currentRemaining = selectedLotId ? getRemainingStock(selectedLotId) : 0;

  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const getTooltipAlignment = (positionPercent: number) => {
    if (positionPercent < 20) return 'left-0 translate-x-0';
    if (positionPercent > 80) return 'right-0 translate-x-0';
    return 'left-1/2 -translate-x-1/2';
  };

  const getTooltipArrowAlignment = (positionPercent: number) => {
    if (positionPercent < 20) return 'left-4';
    if (positionPercent > 80) return 'right-4';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">仓储管理 (WMS)</h2>
          <p className="text-muted-foreground">煤炭条形仓与铝矾土堆场数字化管理</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-muted/50 rounded-full p-1 border border-border">
            <button 
              onClick={() => { setActiveMode('INBOUND'); setError(null); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeMode === 'INBOUND' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              )}
            >
              入库登记
            </button>
            <button 
              onClick={() => { setActiveMode('OUTBOUND'); setError(null); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeMode === 'OUTBOUND' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              )}
            >
              出库登记
            </button>
          </div>
          <div className="h-8 w-[1px] bg-border mx-1 hidden md:block self-center" />
          <div className="flex gap-2">
            <button 
              onClick={() => { setActiveCargo('COAL'); setSelectedLotId(''); setOutflowWeight(''); setError(null); }}
              className={cn(
                "px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all text-sm border",
                activeCargo === 'COAL' ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <Train size={16} />
              煤炭
            </button>
            <button 
              onClick={() => { setActiveCargo('BAUXITE'); setSelectedLotId(''); setOutflowWeight(''); setError(null); }}
              className={cn(
                "px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all text-sm border",
                activeCargo === 'BAUXITE' ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <Ship size={16} />
              铝矾土
            </button>
          </div>
        </div>
      </div>

      {/* Visual Warehouse Map */}
      <div className="safety-card p-6 !overflow-visible">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2 text-foreground">
          {activeCargo === 'COAL' ? <Ruler size={20} className="text-primary" /> : <LayoutGrid size={20} className="text-primary" />}
          {activeCargo === 'COAL' ? '条形仓实时分布 (长度表示)' : '铝矾土堆场分布 (面积表示)'}
        </h3>
        
        <div className="space-y-8">
          {/* East Area */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>东区 (EAST AREA)</span>
              <span>{activeCargo === 'COAL' ? '总长: 500m' : '总面积: 5000㎡'}</span>
            </div>
            <div className="h-16 bg-muted/30 rounded-md border border-dashed border-border relative">
              {activeCargo === 'COAL' ? (
                mockCoalData.filter(d => d.area === 'EAST').map(item => (
                  <div 
                    key={item.id}
                    className="group absolute top-0 bottom-0 bg-primary/20 border-x border-primary flex items-center justify-center text-[10px] font-bold text-primary cursor-help hover:z-50 transition-colors hover:bg-primary/30"
                    style={{ left: `${(item.startPosition / 500) * 100}%`, width: `${((item.endPosition - item.startPosition) / 500) * 100}%` }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.customer}
                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute bottom-full mb-3 w-64 p-0 bg-surface-container-high text-on-surface rounded-2xl shadow-elevation-3 z-[100] pointer-events-none border border-outline-variant overflow-hidden",
                            getTooltipAlignment((item.startPosition / 500) * 100)
                          )}
                        >
                          <div className="px-4 py-3 bg-primary/5 border-b border-outline-variant flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded-md">
                              <Info size={14} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">煤炭批次详情 (东区)</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="text-lg font-bold text-foreground leading-tight">{item.customer}</div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-0.5">车号</div>
                                <div className="font-medium">{item.trainNo}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-0.5">重量</div>
                                <div className="font-medium text-primary">{item.weight} t</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">位置区间</div>
                                <div className="font-medium">{item.startPosition}m - {item.endPosition}m</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">入库时间</div>
                                <div className="font-medium">{item.timestamp}</div>
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "absolute top-full border-8 border-transparent border-t-surface-container-high",
                            getTooltipArrowAlignment((item.startPosition / 500) * 100)
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                mockBauxiteData.filter(d => d.area === 'EAST').map(item => (
                  <div 
                    key={item.id}
                    className="group absolute top-0 bottom-0 bg-risk-blue-bg/50 border-x border-risk-blue-text flex items-center justify-center text-[10px] font-bold text-risk-blue-text cursor-help hover:z-50 transition-colors hover:bg-risk-blue-bg/70"
                    style={{ left: '0', width: `${(item.occupiedArea / 5000) * 100}%` }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.customer}
                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute bottom-full mb-3 w-64 p-0 bg-surface-container-high text-on-surface rounded-2xl shadow-elevation-3 z-[100] pointer-events-none border border-outline-variant overflow-hidden",
                            getTooltipAlignment(0)
                          )}
                        >
                          <div className="px-4 py-3 bg-primary/5 border-b border-outline-variant flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded-md">
                              <Info size={14} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">铝矾土批次详情 (东区)</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="text-lg font-bold text-foreground leading-tight">{item.customer}</div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-0.5">船名</div>
                                <div className="font-medium">{item.shipName}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-0.5">重量</div>
                                <div className="font-medium text-primary">{item.weight} t</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">占用面积</div>
                                <div className="font-medium">{item.occupiedArea} ㎡</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">入库时间</div>
                                <div className="font-medium">{item.timestamp}</div>
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "absolute top-full border-8 border-transparent border-t-surface-container-high",
                            getTooltipArrowAlignment(0)
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* West Area */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>西区 (WEST AREA)</span>
              <span>{activeCargo === 'COAL' ? '总长: 500m' : '总面积: 5000㎡'}</span>
            </div>
            <div className="h-16 bg-muted/30 rounded-md border border-dashed border-border relative">
              {activeCargo === 'COAL' ? (
                mockCoalData.filter(d => d.area === 'WEST').map(item => (
                  <div 
                    key={item.id}
                    className="group absolute top-0 bottom-0 bg-primary/20 border-x border-primary flex items-center justify-center text-[10px] font-bold text-primary cursor-help hover:z-50 transition-colors hover:bg-primary/30"
                    style={{ left: `${(item.startPosition / 500) * 100}%`, width: `${((item.endPosition - item.startPosition) / 500) * 100}%` }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.customer}
                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute bottom-full mb-3 w-64 p-0 bg-surface-container-high text-on-surface rounded-2xl shadow-elevation-3 z-[100] pointer-events-none border border-outline-variant overflow-hidden",
                            getTooltipAlignment((item.startPosition / 500) * 100)
                          )}
                        >
                          <div className="px-4 py-3 bg-primary/5 border-b border-outline-variant flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded-md">
                              <Info size={14} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">煤炭批次详情 (西区)</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="text-lg font-bold text-foreground leading-tight">{item.customer}</div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-0.5">车号</div>
                                <div className="font-medium">{item.trainNo}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-0.5">重量</div>
                                <div className="font-medium text-primary">{item.weight} t</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">位置区间</div>
                                <div className="font-medium">{item.startPosition}m - {item.endPosition}m</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">入库时间</div>
                                <div className="font-medium">{item.timestamp}</div>
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "absolute top-full border-8 border-transparent border-t-surface-container-high",
                            getTooltipArrowAlignment((item.startPosition / 500) * 100)
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                mockBauxiteData.filter(d => d.area === 'WEST').map(item => (
                  <div 
                    key={item.id}
                    className="group absolute top-0 bottom-0 bg-risk-blue-bg/50 border-x border-risk-blue-text flex items-center justify-center text-[10px] font-bold text-risk-blue-text cursor-help hover:z-50 transition-colors hover:bg-risk-blue-bg/70"
                    style={{ left: '0', width: `${(item.occupiedArea / 5000) * 100}%` }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.customer}
                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute bottom-full mb-3 w-64 p-0 bg-surface-container-high text-on-surface rounded-2xl shadow-elevation-3 z-[100] pointer-events-none border border-outline-variant overflow-hidden",
                            getTooltipAlignment(0)
                          )}
                        >
                          <div className="px-4 py-3 bg-primary/5 border-b border-outline-variant flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded-md">
                              <Info size={14} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">铝矾土批次详情 (西区)</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="text-lg font-bold text-foreground leading-tight">{item.customer}</div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-0.5">船名</div>
                                <div className="font-medium">{item.shipName}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-0.5">重量</div>
                                <div className="font-medium text-primary">{item.weight} t</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">占用面积</div>
                                <div className="font-medium">{item.occupiedArea} ㎡</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">入库时间</div>
                                <div className="font-medium">{item.timestamp}</div>
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "absolute top-full border-8 border-transparent border-t-surface-container-high",
                            getTooltipArrowAlignment(0)
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 safety-card p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            {activeMode === 'INBOUND' ? <Plus size={20} className="text-primary" /> : <ArrowRightLeft size={20} className="text-primary" />}
            {activeCargo === 'COAL' 
              ? (activeMode === 'INBOUND' ? '煤炭入库登记' : '煤炭出库登记') 
              : (activeMode === 'INBOUND' ? '铝矾土入库登记' : '铝矾土出库登记')}
          </h3>
          <form className="space-y-5">
            {activeMode === 'OUTBOUND' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">选择货位/批次</label>
                <select 
                  value={selectedLotId}
                  onChange={(e) => { setSelectedLotId(e.target.value); setError(null); }}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">请选择...</option>
                  {activeLots.map(lot => (
                    <option key={lot.id} value={lot.id}>
                      {activeCargo === 'COAL' ? (lot as CoalEntry).trainNo : (lot as BauxiteEntry).shipName} - {lot.customer} ({getRemainingStock(lot.id)} t 剩余)
                    </option>
                  ))}
                </select>
              </div>
            )}
            {activeCargo === 'COAL' ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">车号</label>
                  <input type="text" placeholder="请输入车号" className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {activeMode === 'INBOUND' ? '发站' : '到站'}
                  </label>
                  <input type="text" placeholder={activeMode === 'INBOUND' ? "请输入发站" : "请输入到站"} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">船名</label>
                <input type="text" placeholder="请输入船名" className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">客户</label>
              <input type="text" placeholder="请输入客户名称" className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                重量 (吨) {activeMode === 'OUTBOUND' && selectedLotId && (
                  <span className="text-[10px] lowercase font-normal text-muted-foreground ml-2">
                    (最大可出: {currentRemaining} t)
                  </span>
                )}
              </label>
              <input 
                type="number" 
                value={activeMode === 'OUTBOUND' ? outflowWeight : undefined}
                onChange={(e) => { if(activeMode === 'OUTBOUND') setOutflowWeight(e.target.value); setError(null); }}
                placeholder="0.00" 
                className={cn(
                  "w-full px-4 py-2.5 bg-muted/30 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                  error && outflowWeight && parseFloat(outflowWeight) > currentRemaining ? "border-risk-red-text ring-1 ring-risk-red-text/20" : "border-border"
                )} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">区域</label>
                <select className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option>东区</option>
                  <option>西区</option>
                </select>
              </div>
              {activeMode === 'INBOUND' && activeCargo !== 'COAL' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    占用面积 (㎡)
                  </label>
                  <input type="number" placeholder="0" className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              )}
            </div>
            {activeMode === 'INBOUND' && activeCargo === 'COAL' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">起始位置 (m)</label>
                  <input type="number" placeholder="0" className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">结束位置 (m)</label>
                  <input type="number" placeholder="0" className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-risk-red-bg text-risk-red-text text-sm rounded-lg border border-risk-red-text/20 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="button" 
              onClick={activeMode === 'OUTBOUND' ? handleOutflowSubmit : undefined}
              className={cn(
                "w-full font-medium py-3 rounded-full shadow-google hover:shadow-google-hover transition-all mt-4",
                activeMode === 'INBOUND' ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
              )}
            >
              确认{activeMode === 'INBOUND' ? '入库' : '出库'}登记
            </button>
          </form>
        </div>

        {/* Recent Records List */}
        <div className="lg:col-span-2 safety-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between bg-white">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ArrowRightLeft size={20} className="text-primary" />
              最近{activeMode === 'INBOUND' ? '入库' : '出库'}记录
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">
                    {activeCargo === 'COAL' 
                      ? (activeMode === 'INBOUND' ? '车号/发站' : '车号/到站') 
                      : '船名'}
                  </th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">客户</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">重量</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">
                    {activeMode === 'INBOUND' ? '存放位置' : '出库区域'}
                  </th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">登记时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {activeCargo === 'COAL' ? (
                  (activeMode === 'INBOUND' ? mockCoalData : mockCoalOutflow).map((row: any) => (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{row.trainNo}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {activeMode === 'INBOUND' ? row.originStation : row.destinationStation}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{row.customer}</td>
                      <td className="px-6 py-4 font-mono font-medium text-primary">{row.weight} t</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-medium",
                            row.area === 'EAST' ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-orange-50 text-orange-700 border border-orange-100"
                          )}>
                            {row.area === 'EAST' ? '东' : '西'}
                          </span>
                          {activeMode === 'INBOUND' && (
                            <span className="text-xs text-muted-foreground">{row.startPosition}m - {row.endPosition}m</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{row.timestamp}</td>
                    </tr>
                  ))
                ) : (
                  (activeMode === 'INBOUND' ? mockBauxiteData : mockBauxiteOutflow).map((row: any) => (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{row.shipName}</td>
                      <td className="px-6 py-4 text-foreground">{row.customer}</td>
                      <td className="px-6 py-4 font-mono font-medium text-primary">{row.weight} t</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-medium",
                            row.area === 'EAST' ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-orange-50 text-orange-700 border border-orange-100"
                          )}>
                            {row.area === 'EAST' ? '东' : '西'}
                          </span>
                          {activeMode === 'INBOUND' && (
                            <span className="text-xs text-muted-foreground">{row.occupiedArea} ㎡</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{row.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
