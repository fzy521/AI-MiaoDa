import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoalEntry, BauxiteEntry, CargoType, CoalOutflow, BauxiteOutflow } from '@/types';
import { toast } from 'sonner';

const mockCoalData: CoalEntry[] = [
  { id: 'C001', trainNo: 'K1234', originStation: '大同站', weight: 3200, customer: '华能电力', area: 'EAST', startPosition: 10, endPosition: 60, timestamp: '2026-03-29 10:00' },
  { id: 'C002', trainNo: 'K5678', originStation: '神木站', weight: 2800, customer: '大唐发电', area: 'WEST', startPosition: 120, endPosition: 165, timestamp: '2026-03-29 14:30' },
];

const mockBauxiteData: BauxiteEntry[] = [
  { id: 'B001', shipName: '远洋1号', customer: '中铝集团', weight: 5000, area: 'EAST', occupiedArea: 1200, timestamp: '2026-03-28 09:00' },
  { id: 'B002', shipName: '海丰轮', customer: '魏桥铝业', weight: 4500, area: 'WEST', occupiedArea: 1000, timestamp: '2026-03-29 11:20' },
];

const mockCoalOutflow: CoalOutflow[] = [
  { id: 'CO001', sourceEntryId: 'C001', trainNo: 'K9999', destinationStation: '天津港', weight: 1500, customer: '华能电力', area: 'EAST', timestamp: '2026-03-30 08:00' },
];

const mockBauxiteOutflow: BauxiteOutflow[] = [
  { id: 'BO001', sourceEntryId: 'B001', shipName: '远洋1号', customer: '中铝集团', weight: 2000, area: 'EAST', timestamp: '2026-03-30 09:30' },
];

const allCustomers = [...new Set([...mockCoalData, ...mockBauxiteData].map(d => d.customer))];

const WAREHOUSE_TOTAL_LENGTH = 500;

const LengthScale = ({ totalLength = WAREHOUSE_TOTAL_LENGTH }: { totalLength?: number }) => {
  const majorStep = 100;
  const minorStep = 50;
  const ticks: { position: number; label: string; isMajor: boolean }[] = [];

  for (let i = 0; i <= totalLength; i += minorStep) {
    ticks.push({
      position: i,
      label: i % majorStep === 0 ? `${i}m` : '',
      isMajor: i % majorStep === 0,
    });
  }

  return (
    <div className="relative w-full h-7 mt-1">
      <div className="absolute inset-x-0 top-0 h-px bg-border" />
      {ticks.map((tick) => (
        <div
          key={tick.position}
          className="absolute flex flex-col items-center"
          style={{ left: `${(tick.position / totalLength) * 100}%`, transform: 'translateX(-50%)' }}
        >
          <div
            className={cn(
              "w-px",
              tick.isMajor ? "h-3 bg-border" : "h-2 bg-border/50"
            )}
          />
          {tick.label && (
            <span className="text-[9px] text-muted-foreground font-medium mt-0.5 select-none">
              {tick.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export function WMS() {
  const [activeCargo, setActiveCargo] = React.useState<CargoType>('COAL');
  const [activeMode, setActiveMode] = React.useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
  const [selectedLotId, setSelectedLotId] = React.useState<string>('');
  const [outflowWeight, setOutflowWeight] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);

  const getRemainingStock = (lotId: string) => {
    if (activeCargo === 'COAL') {
      const lot = mockCoalData.find(l => l.id === lotId);
      if (!lot) return 0;
      const outflow = mockCoalOutflow
        .filter(o => o.sourceEntryId === lotId)
        .reduce((sum, o) => sum + o.weight, 0);
      return lot.weight - outflow;
    } else {
      const lot = mockBauxiteData.find(l => l.id === lotId);
      if (!lot) return 0;
      const outflow = mockBauxiteOutflow
        .filter(o => o.sourceEntryId === lotId)
        .reduce((sum, o) => sum + o.weight, 0);
      return lot.weight - outflow;
    }
  };

  const handleOutflowSubmit = () => {
    if (!selectedLotId) {
      setError('请先选择货位/批次');
      return;
    }
    const weight = parseFloat(outflowWeight);
    if (isNaN(weight) || weight <= 0) {
      setError('请输入有效的出库重量');
      return;
    }
    const remaining = getRemainingStock(selectedLotId);
    if (weight > remaining) {
      setError(`出库量不能大于当前存货量 (${remaining} t)`);
      return;
    }
    setError(null);
    toast('出库登记成功 (模拟)');
  };

  const activeLots = activeCargo === 'COAL' ? mockCoalData : mockBauxiteData;
  const currentRemaining = selectedLotId ? getRemainingStock(selectedLotId) : 0;

  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const getTooltipAlignment = (positionPercent: number) => {
    if (positionPercent < 20) return 'left-0 translate-x-0';
    if (positionPercent > 80) return 'right-0 translate-x-0';
    return 'left-1/2 -translate-x-1/2';
  };

  const getTooltipArrowAlignment = (positionPercent: number) => {
    if (positionPercent < 20) return 'left-4';
    if (positionPercent > 80) return 'right-4';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">仓储管理 (WMS)</h2>
          <p className="text-muted-foreground">煤炭条形仓与铝矾土堆场数字化管理</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-muted/50 rounded-full p-1 border border-border">
            <button 
              onClick={() => { setActiveMode('INBOUND'); setError(null); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeMode === 'INBOUND' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              )}
            >
              入库登记
            </button>
            <button 
              onClick={() => { setActiveMode('OUTBOUND'); setError(null); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeMode === 'OUTBOUND' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              )}
            >
              出库登记
            </button>
          </div>
          <div className="h-8 w-[1px] bg-border mx-1 hidden md:block self-center" />
          <div className="flex gap-2">
            <button 
              onClick={() => { setActiveCargo('COAL'); setSelectedLotId(''); setOutflowWeight(''); setError(null); }}
              className={cn(
                "px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all text-sm border",
                activeCargo === 'COAL' ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <Train size={16} />
              煤炭
            </button>
            <button 
              onClick={() => { setActiveCargo('BAUXITE'); setSelectedLotId(''); setOutflowWeight(''); setError(null); }}
              className={cn(
                "px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all text-sm border",
                activeCargo === 'BAUXITE' ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <Ship size={16} />
              铝矾土
            </button>
          </div>
        </div>
      </div>

      {/* Visual Warehouse Map */}
      <div className="safety-card p-6 !overflow-visible">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2 text-foreground">
          {activeCargo === 'COAL' ? <Ruler size={20} className="text-primary" /> : <LayoutGrid size={20} className="text-primary" />}
          {activeCargo === 'COAL' ? '条形仓实时分布 (长度表示)' : '铝矾土堆场分布 (面积表示)'}
        </h3>
        
        <div className="space-y-8">
          {/* East Area */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>东区 (EAST AREA)</span>
              <span>{activeCargo === 'COAL' ? '总长: 500m' : '总面积: 5000㎡'}</span>
            </div>
            <div className="h-16 bg-muted/30 rounded-md border border-dashed border-border relative">
              {activeCargo === 'COAL' ? (
                mockCoalData.filter(d => d.area === 'EAST').map(item => (
                  <div 
                    key={item.id}
                    className="group absolute top-0 bottom-0 bg-primary/20 border-x border-primary flex items-center justify-center text-[10px] font-bold text-primary cursor-help hover:z-50 transition-colors hover:bg-primary/30"
                    style={{ left: `${(item.startPosition / WAREHOUSE_TOTAL_LENGTH) * 100}%`, width: `${((item.endPosition - item.startPosition) / WAREHOUSE_TOTAL_LENGTH) * 100}%` }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.customer}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute bottom-full mb-3 w-64 p-0 bg-card text-foreground rounded-2xl shadow-xl z-[100] pointer-events-none border border-border overflow-hidden",
                            getTooltipAlignment((item.startPosition / WAREHOUSE_TOTAL_LENGTH) * 100)
                          )}
                        >
                          <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded-md">
                              <Info size={14} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">煤炭批次详情 (东区)</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="text-lg font-bold text-foreground leading-tight">{item.customer}</div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-0.5">车号</div>
                                <div className="font-medium">{item.trainNo}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-0.5">重量</div>
                                <div className="font-medium text-primary">{item.weight} t</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">位置区间</div>
                                <div className="font-medium">{item.startPosition}m - {item.endPosition}m</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">入库时间</div>
                                <div className="font-medium">{item.timestamp}</div>
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "absolute top-full border-8 border-transparent border-t-card",
                            getTooltipArrowAlignment((item.startPosition / WAREHOUSE_TOTAL_LENGTH) * 100)
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                mockBauxiteData.filter(d => d.area === 'EAST').map(item => (
                  <div 
                    key={item.id}
                    className="group absolute top-0 bottom-0 bg-blue-100/50 border-x border-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-600 cursor-help hover:z-50 transition-colors hover:bg-blue-100/70"
                    style={{ left: '0', width: `${(item.occupiedArea / 5000) * 100}%` }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.customer}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute bottom-full mb-3 w-64 p-0 bg-card text-foreground rounded-2xl shadow-xl z-[100] pointer-events-none border border-border overflow-hidden",
                            getTooltipAlignment(0)
                          )}
                        >
                          <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded-md">
                              <Info size={14} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">铝矾土批次详情 (东区)</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="text-lg font-bold text-foreground leading-tight">{item.customer}</div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-0.5">船名</div>
                                <div className="font-medium">{item.shipName}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-0.5">重量</div>
                                <div className="font-medium text-primary">{item.weight} t</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">占用面积</div>
                                <div className="font-medium">{item.occupiedArea} ㎡</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-0.5">入库时间</div>
                                <div className="font-medium">{item.timestamp}</div>
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "absolute top-full border-8 border-transparent border-t-card",
                            getTooltipArrowAlignment(0)
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
            {activeCargo === 'COAL' && <LengthScale totalLength={WAREHOUSE_TOTAL_LENGTH} />}
          </div>

          {/* West Area */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>西区 (WEST AREA)</span>
              <span>{activeCargo === 'COAL' ? '总长: 500m' : '总面积: 5000㎡'}</span>
            </div>
            <div className="h-16 bg-muted/30 rounded-md border border-dashed border-border relative">
              {activeCargo === 'COAL' ? (
                mockCoalData.filter(d => d.area === 'WEST').map(item => (
                  <div 
                    key={item.id}
                    className="group absolute top-0 bottom-0 bg-primary/20 border-x border-primary flex items-center justify-center text-[10px] font-bold text-primary cursor-help hover:z-50 transition-colors hover:bg-primary/30"
                    style={{ left: `${(item.startPosition / WAREHOUSE_TOTAL_LENGTH) * 100}%`, width: `${((item.endPosition - item.startPosition) / WAREHOUSE_TOTAL_LENGTH) * 100}%` }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.customer}
                  </div>
                ))
              ) : (
                mockBauxiteData.filter(d => d.area === 'WEST').map(item => (
                  <div 
                    key={item.id}
                    className="group absolute top-0 bottom-0 bg-blue-100/50 border-x border-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-600 cursor-help hover:z-50 transition-colors hover:bg-blue-100/70"
                    style={{ left: '0', width: `${(item.occupiedArea / 5000) * 100}%` }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.customer}
                  </div>
                ))
              )}
            </div>
            {activeCargo === 'COAL' && <LengthScale totalLength={WAREHOUSE_TOTAL_LENGTH} />}
          </div>
        </div>
      </div>

      {/* Entry/Outflow Form */}
      <div className="safety-card p-6">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
          {activeMode === 'INBOUND' ? <Plus size={20} className="text-primary" /> : <ArrowRightLeft size={20} className="text-primary" />}
          {activeMode === 'INBOUND' ? '入库登记' : '出库登记'}
        </h3>

        {activeMode === 'INBOUND' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {activeCargo === 'COAL' ? '车号' : '船名'}
              </label>
              <input 
                type="text" 
                placeholder={activeCargo === 'COAL' ? '如: K1234' : '如: 远洋1号'}
                className="w-full px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">客户名称</label>
              <select className="w-full px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="">选择客户</option>
                {allCustomers.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">重量 (吨)</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">存放区域</label>
              <select className="w-full px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="">选择区域</option>
                <option value="EAST">东区</option>
                <option value="WEST">西区</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">选择货位/批次</label>
                <select 
                  value={selectedLotId}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">选择货位</option>
                  {activeLots.map(lot => (
                    <option key={lot.id} value={lot.id}>
                      {lot.id} - {lot.customer} (余: {getRemainingStock(lot.id)}t)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {activeCargo === 'COAL' ? '到站' : '船名'}
                </label>
                <input 
                  type="text" 
                  placeholder={activeCargo === 'COAL' ? '输入到站名称' : '输入船名'}
                  className="w-full px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  出库重量 (吨) {selectedLotId && <span className="text-xs text-muted-foreground">(可出: {currentRemaining}t)</span>}
                </label>
                <input 
                  type="number" 
                  value={outflowWeight}
                  onChange={(e) => setOutflowWeight(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            onClick={activeMode === 'OUTBOUND' ? handleOutflowSubmit : undefined}
            className="px-6 py-2.5 bg-primary text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
          >
            {activeMode === 'INBOUND' ? '确认入库' : '确认出库'}
          </button>
        </div>
      </div>
    </div>
  );
}