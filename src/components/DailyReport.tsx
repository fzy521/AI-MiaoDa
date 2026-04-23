    weighbridgeItems: items,
    totalTons,
  });

  const preview = () => {
    const r = buildReport();
    onPreview(formatWeighbridgeMessage(r));
  };

  const submit = () => {
    if (totalTons === 0) { toast.error('吨数合计为0，请检查数据'); return; }
    const r = buildReport();
    submitReport(r);
    toast.success('日报已提交');
    setItems(WEIGHBRIDGE_CUSTOMERS.map((c) => ({ customer: c, vehicles: 0, trips: 0, tons: 0, returnTons: 0 })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">日期</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT_CLS} style={{ width: 'auto' }} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">客户名称</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground w-24">车辆数</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground w-24">趟数</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground w-28">吨数</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground w-28">退车吨数</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.customer} className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">{item.customer}</td>
                <td className="py-2 px-3"><input type="number" min={0} value={item.vehicles} onChange={(e) => updateItem(idx, 'vehicles', +e.target.value)} className={NUM_INPUT} /></td>
                <td className="py-2 px-3"><input type="number" min={0} value={item.trips} onChange={(e) => updateItem(idx, 'trips', +e.target.value)} className={NUM_INPUT} /></td>
                <td className="py-2 px-3"><input type="number" min={0} step="0.01" value={item.tons} onChange={(e) => updateItem(idx, 'tons', +e.target.value)} className={NUM_INPUT} /></td>
                <td className="py-2 px-3"><input type="number" min={0} step="0.01" value={item.returnTons} onChange={(e) => updateItem(idx, 'returnTons', +e.target.value)} className={NUM_INPUT} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border">
              <td colSpan={3} className="py-2 px-3 text-right font-bold text-foreground">共计外运</td>
              <td colSpan={2} className="py-2 px-3 font-bold text-primary">{totalTons.toFixed(2)} 吨</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex gap-3">
        <button onClick={preview} className="px-5 py-2 bg-muted/50 text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
          <Eye size={16} /> 预览报文
        </button>
        <button onClick={submit} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <Send size={16} /> 提交日报
        </button>
      </div>
    </div>
  );
}

// ─── Transporter Message Form ───

function TransporterMessageForm({ onPreview }: { onPreview: (msg: string) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [data, setData] = React.useState<TransporterMessage>({
    startTime: `${today} 7:00`,
    endTime: `${tomorrow} 7:00`,
    coalTrains: 0, bauxiteTrains: 0, bauxiteCars: 0, overtimeTrains: 0,
    trackStatus: [{ track: '', status: '' }],
    totalContainers: 0,
    container35: { total: 0, heavy: 0, heavyCargo: '矿渣', empty: 0, normalEmpty: 0 },
    container20: { total: 0, heavy: 0, heavyCargo: '氧化铝', empty: 0 },
    container40Empty: 0,
    grainEmpty: 0,
  });
  const { submitReport } = useReportStore();

  const set = <K extends keyof TransporterMessage>(key: K, val: TransporterMessage[K]) =>
    setData((p) => ({ ...p, [key]: val }));

  const setTrack = (idx: number, field: 'track' | 'status', val: string) =>
    setData((p) => {
      const ts = [...p.trackStatus];
      ts[idx] = { ...ts[idx], [field]: val };
      return { ...p, trackStatus: ts };
    });
  const addTrack = () => setData((p) => ({ ...p, trackStatus: [...p.trackStatus, { track: '', status: '' }] }));
  const removeTrack = (idx: number) => setData((p) => ({ ...p, trackStatus: p.trackStatus.filter((_, i) => i !== idx) }));

  const set35 = (key: keyof TransporterMessage['container35'], val: number | string) =>
    setData((p) => ({ ...p, container35: { ...p.container35, [key]: val } }));
  const set20 = (key: keyof TransporterMessage['container20'], val: number | string) =>
    setData((p) => ({ ...p, container20: { ...p.container20, [key]: val } }));

  const buildReport = (): DailyReport => ({
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role: 'TRANSPORTER',
    date: today,
    status: 'SUBMITTED',
    createdBy: '当前用户',
    createdAt: new Date().toISOString(),
    transporterMode: 'MESSAGE',
    transporterMessage: data,
  });

  const submit = () => {
    const r = buildReport();
    submitReport(r);
    toast.success('运输员日报已提交');
  };

  return (
    <div className="space-y-6">
      {/* 时间段 */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-foreground">开始</label>
        <input type="datetime-local" value={data.startTime.replace(' ', 'T')} onChange={(e) => set('startTime', e.target.value.replace('T', ' '))} className={cn(INPUT_CLS, 'w-48')} />
        <label className="text-sm font-medium text-foreground">结束</label>
        <input type="datetime-local" value={data.endTime.replace(' ', 'T')} onChange={(e) => set('endTime', e.target.value.replace('T', ' '))} className={cn(INPUT_CLS, 'w-48')} />
      </div>

      {/* 作业量 */}
      <div className="safety-card p-4 space-y-4">
        <h4 className="text-sm font-bold text-foreground">作业量</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="text-xs text-muted-foreground">卸煤炭(列)</label><input type="number" min={0} value={data.coalTrains} onChange={(e) => set('coalTrains', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">卸铝土(列)</label><input type="number" min={0} value={data.bauxiteTrains} onChange={(e) => set('bauxiteTrains', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">铝土车数</label><input type="number" min={0} value={data.bauxiteCars} onChange={(e) => set('bauxiteCars', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">超时(列)</label><input type="number" min={0} value={data.overtimeTrains} onChange={(e) => set('overtimeTrains', +e.target.value)} className={NUM_INPUT} /></div>
        </div>
      </div>

      {/* 股道状态 */}
      <div className="safety-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground">(2) 股道状态</h4>
          <button onClick={addTrack} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={14} /> 添加</button>
        </div>
        {data.trackStatus.map((ts, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input value={ts.track} onChange={(e) => setTrack(idx, 'track', e.target.value)} placeholder="股道名" className={cn(INPUT_CLS, 'w-32')} />
            <span className="text-muted-foreground">，</span>
            <input value={ts.status} onChange={(e) => setTrack(idx, 'status', e.target.value)} placeholder="状态" className={cn(INPUT_CLS, 'flex-1')} />
            <span className="text-muted-foreground">。</span>
            {data.trackStatus.length > 1 && <button onClick={() => removeTrack(idx)} className="text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>

      {/* 集装箱汇总 */}
      <div className="safety-card p-4 space-y-4">
        <h4 className="text-sm font-bold text-foreground">(3) 站存集装箱</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="text-xs text-muted-foreground">总箱数</label><input type="number" min={0} value={data.totalContainers} onChange={(e) => set('totalContainers', +e.target.value)} className={NUM_INPUT} /></div>
        </div>

        <h5 className="text-xs font-bold text-muted-foreground">35吨敞顶箱</h5>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div><label className="text-xs text-muted-foreground">总量</label><input type="number" min={0} value={data.container35.total} onChange={(e) => set35('total', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">重箱</label><input type="number" min={0} value={data.container35.heavy} onChange={(e) => set35('heavy', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">重箱货品</label><input value={data.container35.heavyCargo} onChange={(e) => set35('heavyCargo', e.target.value)} className={INPUT_CLS} /></div>
          <div><label className="text-xs text-muted-foreground">空箱</label><input type="number" min={0} value={data.container35.empty} onChange={(e) => set35('empty', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">常存空箱</label><input type="number" min={0} value={data.container35.normalEmpty} onChange={(e) => set35('normalEmpty', +e.target.value)} className={NUM_INPUT} /></div>
        </div>

        <h5 className="text-xs font-bold text-muted-foreground">20英尺通用</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="text-xs text-muted-foreground">总量</label><input type="number" min={0} value={data.container20.total} onChange={(e) => set20('total', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">重箱</label><input type="number" min={0} value={data.container20.heavy} onChange={(e) => set20('heavy', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">重箱货品</label><input value={data.container20.heavyCargo} onChange={(e) => set20('heavyCargo', e.target.value)} className={INPUT_CLS} /></div>
          <div><label className="text-xs text-muted-foreground">空箱</label><input type="number" min={0} value={data.container20.empty} onChange={(e) => set20('empty', +e.target.value)} className={NUM_INPUT} /></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          <div><label className="text-xs text-muted-foreground">40英尺通用空箱</label><input type="number" min={0} value={data.container40Empty} onChange={(e) => set('container40Empty', +e.target.value)} className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">粮食箱空箱</label><input type="number" min={0} value={data.grainEmpty} onChange={(e) => set('grainEmpty', +e.target.value)} className={NUM_INPUT} /></div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onPreview(formatTransporterMessage(data))} className="px-5 py-2 bg-muted/50 text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
          <Eye size={16} /> 预览报文
        </button>
        <button onClick={submit} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <Send size={16} /> 提交日报
        </button>
      </div>
    </div>
  );
}

// ─── Transporter Handover Book Form ───

function TransporterHandoverForm({ onPreview }: { onPreview: (msg: string) => void }) {
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [equipment, setEquipment] = React.useState<{ name: string; quantity: string }[]>([{ name: '', quantity: '' }]);
  const [vehicleStatus, setVehicleStatus] = React.useState<string[]>(['']);
  const [records, setRecords] = React.useState<string[]>(['']);
  const [notes, setNotes] = React.useState<string[]>(['']);
  const [totalContainers, setTotalContainers] = React.useState('');
  const [signOff, setSignOff] = React.useState({ shiftEnd: '', shiftStart: '' });
  const { submitReport } = useReportStore();

  const submit = () => {
    const report: DailyReport = {
      id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      role: 'TRANSPORTER',
      date,
      status: 'SUBMITTED',
      createdBy: '当前用户',
      createdAt: new Date().toISOString(),
      transporterMode: 'HANDOVER_BOOK',
      handover: {
        equipment: equipment.filter((e) => e.name),
        vehicleStatus: vehicleStatus.filter((v) => v),
        handoverRecords: records.filter((r) => r),
        handoverNotes: notes.filter((n) => n),
        totalContainers: totalContainers ? parseInt(totalContainers) : undefined,
      },
      handoverSignOff: signOff,
    };
    submitReport(report);
    toast.success('交接班簿已提交');
  };

  const section = (title: string, items: string[], onChange: (idx: number, val: string) => void, onAdd: () => void, onRemove: (idx: number) => void, placeholder: string) => (
    <div className="safety-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <button onClick={onAdd} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={14} /> 添加</button>
      </div>
      {items.map((val, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input value={val} onChange={(e) => onChange(idx, e.target.value)} placeholder={placeholder} className={cn(INPUT_CLS, 'flex-1')} />
          {items.length > 1 && <button onClick={() => onRemove(idx)} className="text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">日期</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT_CLS} style={{ width: 'auto' }} />
      </div>

      {/* 备品用具 */}
      <div className="safety-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground">备品用具</h4>
          <button onClick={() => setEquipment((p) => [...p, { name: '', quantity: '' }])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={14} /> 添加</button>
        </div>
        {equipment.map((eq, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input value={eq.name} onChange={(e) => { const n = [...equipment]; n[idx] = { ...n[idx], name: e.target.value }; setEquipment(n); }} placeholder="物品名称" className={cn(INPUT_CLS, 'flex-1')} />
            <input value={eq.quantity} onChange={(e) => { const n = [...equipment]; n[idx] = { ...n[idx], quantity: e.target.value }; setEquipment(n); }} placeholder="数量" className={cn(INPUT_CLS, 'w-28')} />
            {equipment.length > 1 && <button onClick={() => setEquipment((p) => p.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>

      {section('现在车情况', vehicleStatus, (i, v) => { const n = [...vehicleStatus]; n[i] = v; setVehicleStatus(n); }, () => setVehicleStatus((p) => [...p, '']), (i) => setVehicleStatus((p) => p.filter((_, j) => j !== i)), '车次/股道 + 状态')}
      {section('交接记事', records, (i, v) => { const n = [...records]; n[i] = v; setRecords(n); }, () => setRecords((p) => [...p, '']), (i) => setRecords((p) => p.filter((_, j) => j !== i)), '车次 + 货物 + 重量/数量')}
      {section('交接事项', notes, (i, v) => { const n = [...notes]; n[i] = v; setNotes(n); }, () => setNotes((p) => [...p, '']), (i) => setNotes((p) => p.filter((_, j) => j !== i)), '事项描述')}

      <div className="safety-card p-4 space-y-4">
        <h4 className="text-sm font-bold text-foreground">汇总 & 签名</h4>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="text-xs text-muted-foreground">总箱数</label><input value={totalContainers} onChange={(e) => setTotalContainers(e.target.value)} placeholder="总箱数" className={NUM_INPUT} /></div>
          <div><label className="text-xs text-muted-foreground">交班者</label><input value={signOff.shiftEnd} onChange={(e) => setSignOff((p) => ({ ...p, shiftEnd: e.target.value }))} placeholder="签名" className={INPUT_CLS} /></div>
          <div><label className="text-xs text-muted-foreground">接班者</label><input value={signOff.shiftStart} onChange={(e) => setSignOff((p) => ({ ...p, shiftStart: e.target.value }))} placeholder="签名" className={INPUT_CLS} /></div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={submit} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <Send size={16} /> 提交接班簿
        </button>
      </div>
    </div>
  );
}

// ─── Transporter View ───

function TransporterView() {
  const [tab, setTab] = React.useState('form');
  const [mode, setMode] = React.useState<'MESSAGE' | 'HANDOVER_BOOK'>('MESSAGE');
  const [previewText, setPreviewText] = React.useState('');
  const { reports } = useReportStore();

  const history = reports.filter((r) => r.role === 'TRANSPORTER').sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <TabBar tabs={[{ id: 'form', label: '填写日报' }, { id: 'history', label: '历史记录' }]} active={tab} onChange={setTab} />

      {tab === 'form' && (
        <>
          <TabBar
            tabs={[
              { id: 'MESSAGE', label: '报文填写' },
              { id: 'HANDOVER_BOOK', label: '交接班簿' },
            ]}
            active={mode}
            onChange={(id) => setMode(id as 'MESSAGE' | 'HANDOVER_BOOK')}
          />
          {mode === 'MESSAGE' ? <TransporterMessageForm onPreview={setPreviewText} /> : <TransporterHandoverForm onPreview={setPreviewText} />}
          {previewText && (
            <div className="safety-card p-4">
              <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><MessageSquare size={16} /> 报文预览</h4>
              <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/30 rounded-xl p-4">{previewText}</pre>
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无历史记录</p>}
          {history.map((r) => (
            <div key={r.id} className="safety-card p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-foreground">{r.date}</span>
                  <span className="text-xs text-muted-foreground">{r.transporterMode === 'HANDOVER_BOOK' ? '交接班簿' : '报文'}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-muted-foreground">{r.createdBy} · {new Date(r.createdAt).toLocaleString()}</p>
                {r.transporterMessage && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    卸{r.transporterMessage.coalTrains}列煤炭 · 总箱数{r.transporterMessage.totalContainers}
                  </p>
                )}
                {r.handover && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    备品{r.handover.equipment.length}项 · 现在车{r.handover.vehicleStatus.length}条
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Yard Dispatcher View ───

function YardDispatcherForm({ onPreview }: { onPreview: (msg: string) => void }) {
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [westYardTons, setWestYardTons] = React.useState(0);
  const [eastSuppliers, setEastSuppliers] = React.useState(
    BAUXITE_EAST_SUPPLIERS.map((s) => ({ supplier: s, tons: 0 }))
  );
  const [coalSuppliers, setCoalSuppliers] = React.useState(
    COAL_SUPPLIERS.map((s) => ({ supplier: s, tons: 0 }))
  );
  const [silos, setSilos] = React.useState(
    DEFAULT_SILOS.map((s) => ({
      siloNumber: s.siloNumber,
      items: s.items.map((i) => ({ ...i })),
    }))
  );
  const { submitReport } = useReportStore();

  const buildData = (): YardDispatcherReport => ({
    bauxite: { westYardTons, eastYardSuppliers: eastSuppliers },
    coal: { suppliers: coalSuppliers },
    silo: { silos },
  });

  const buildReport = (): DailyReport => ({
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role: 'YARD_DISPATCHER',
    date,
    status: 'SUBMITTED',
    createdBy: '当前用户',
    createdAt: new Date().toISOString(),
    yardData: buildData(),
  });

  const preview = () => {
    onPreview(formatYardDispatcherMessage(buildReport()));
  };

  const submit = () => {
    const d = buildData();
    if (getBauxiteTotal(d) === 0 && getCoalTotal(d) === 0) {
      toast.error('库存数据为空，请检查');
      return;
    }
    submitReport(buildReport());
    toast.success('货场调度日报已提交');
    setWestYardTons(0);
    setEastSuppliers(BAUXITE_EAST_SUPPLIERS.map((s) => ({ supplier: s, tons: 0 })));
    setCoalSuppliers(COAL_SUPPLIERS.map((s) => ({ supplier: s, tons: 0 })));
    setSilos(DEFAULT_SILOS.map((s) => ({ siloNumber: s.siloNumber, items: s.items.map((i) => ({ ...i })) })));
  };

  const updateEast = (idx: number, tons: number) =>
    setEastSuppliers((p) => p.map((s, i) => (i === idx ? { ...s, tons } : s)));

  const updateCoal = (idx: number, tons: number) =>
    setCoalSuppliers((p) => p.map((s, i) => (i === idx ? { ...s, tons } : s)));

  const updateSilo = (si: number, ii: number, tons: number) =>
    setSilos((p) =>
      p.map((silo, si2) =>
        si2 === si
          ? { ...silo, items: silo.items.map((it, ii2) => (ii2 === ii ? { ...it, tons } : it)) }
          : silo
      )
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">日期</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT_CLS} style={{ width: 'auto' }} />
      </div>

      {/* 铝土库存 */}
      <div className="safety-card p-4 space-y-4">
        <h4 className="text-sm font-bold text-foreground">铝土库存</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">西料场(吨)</label>
            <input type="number" min={0} step="0.01" value={westYardTons} onChange={(e) => setWestYardTons(+e.target.value)} className={NUM_INPUT} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">东料场</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eastSuppliers.map((s, idx) => (
                <div key={s.supplier}>
                  <label className="text-xs text-muted-foreground">{s.supplier}(吨)</label>
                  <input type="number" min={0} step="0.01" value={s.tons} onChange={(e) => updateEast(idx, +e.target.value)} className={NUM_INPUT} />
                </div>
              ))}
            </div>
          </div>
          <div className="text-right text-sm font-bold text-primary">
            共: {getBauxiteTotal({ bauxite: { westYardTons, eastYardSuppliers: eastSuppliers }, coal: { suppliers: [] }, silo: { silos: [] } }).toFixed(2)} 吨
          </div>
        </div>
      </div>

      {/* 煤炭库存 */}
      <div className="safety-card p-4 space-y-4">
        <h4 className="text-sm font-bold text-foreground">煤炭库存</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coalSuppliers.map((s, idx) => (
            <div key={s.supplier}>
              <label className="text-xs text-muted-foreground">{s.supplier}(吨)</label>
              <input type="number" min={0} step="0.01" value={s.tons} onChange={(e) => updateCoal(idx, +e.target.value)} className={NUM_INPUT} />
            </div>
          ))}
        </div>
        <div className="text-right text-sm font-bold text-primary">
          共: {getCoalTotal({ bauxite: { westYardTons: 0, eastYardSuppliers: [] }, coal: { suppliers: coalSuppliers }, silo: { silos: [] } }).toFixed(2)} 吨
        </div>
      </div>

      {/* 筒仓库存 */}
      <div className="safety-card p-4 space-y-4">
        <h4 className="text-sm font-bold text-foreground">筒仓库存、品类</h4>
        {silos.map((silo, si) => (
          <div key={silo.siloNumber} className="space-y-2">
            <label className="text-xs font-medium text-foreground">{silo.siloNumber}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {silo.items.map((item, ii) => (
                <div key={ii}>
                  <label className="text-xs text-muted-foreground">{item.cargo}(吨)</label>
                  <input type="number" min={0} step="0.01" value={item.tons} onChange={(e) => updateSilo(si, ii, +e.target.value)} className={NUM_INPUT} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={preview} className="px-5 py-2 bg-muted/50 text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
          <Eye size={16} /> 预览报文
        </button>
        <button onClick={submit} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <Send size={16} /> 提交日报
        </button>
      </div>
    </div>
  );
}

function YardDispatcherView() {
  const [tab, setTab] = React.useState('form');
  const [previewText, setPreviewText] = React.useState('');
  const { reports } = useReportStore();

  const history = reports.filter((r) => r.role === 'YARD_DISPATCHER').sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <TabBar tabs={[{ id: 'form', label: '填写日报' }, { id: 'history', label: '历史记录' }]} active={tab} onChange={setTab} />
      {tab === 'form' && (
        <>
          <YardDispatcherForm onPreview={setPreviewText} />
          {previewText && (
            <div className="safety-card p-4">
              <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><MessageSquare size={16} /> 报文预览</h4>
              <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/30 rounded-xl p-4">{previewText}</pre>
            </div>
          )}
        </>
      )}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无历史记录</p>}
          {history.map((r) => (
            <div key={r.id} className="safety-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-foreground">{r.date}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-xs text-muted-foreground">{r.createdBy} · {new Date(r.createdAt).toLocaleString()}</p>
              {r.yardData && (
                <p className="text-xs text-muted-foreground mt-1">
                  铝土 {getBauxiteTotal(r.yardData).toFixed(2)} 吨 · 煤炭 {getCoalTotal(r.yardData).toFixed(2)} 吨
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dispatcher Review View ───

function DispatcherView() {
  const [tab, setTab] = React.useState('pending');
  const { reports, updateReportStatus, createSummary } = useReportStore();
  const [rejectId, setRejectId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const [summaryDate, setSummaryDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [summaryText, setSummaryText] = React.useState('');

  const pending = reports.filter((r) => r.status === 'SUBMITTED').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const reviewed = reports.filter((r) => r.status === 'APPROVED' || r.status === 'REJECTED').sort((a, b) => (b.reviewedAt || '').localeCompare(a.reviewedAt || ''));

  const handleApprove = (id: string) => updateReportStatus(id, 'APPROVED', '调度长');
  const handleReject = () => {
    if (!rejectId) return;
    updateReportStatus(rejectId, 'REJECTED', '调度长', rejectReason);
    setRejectId(null);
    setRejectReason('');
  };

  const handleSummary = () => {
    const dateReports = reports.filter((r) => r.date === summaryDate && r.status === 'APPROVED');
    if (dateReports.length === 0) { toast.error('该日期无已审核报告'); return; }
    createSummary({
      id: `sum_${Date.now()}`,
      date: summaryDate,
      createdBy: '调度长',
      createdAt: new Date().toISOString(),
      summary: summaryText,
      reportIds: dateReports.map((r) => r.id),
    });
    toast.success('汇总已上报');
    setSummaryText('');
  };

  const reportCard = (r: DailyReport, showActions: boolean) => (
    <div key={r.id} className="safety-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-foreground">{r.date}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{ROLE_LABELS[r.role]}</span>
            <StatusBadge status={r.status} />
          </div>
          <p className="text-xs text-muted-foreground">{r.createdBy} · {new Date(r.createdAt).toLocaleString()}</p>
          {r.weighbridgeItems && <p className="text-xs text-muted-foreground mt-1">共计外运 {r.totalTons?.toFixed(2)} 吨</p>}
          {r.transporterMessage && <p className="text-xs text-muted-foreground mt-1">总箱数 {r.transporterMessage.totalContainers}</p>}
          {r.yardData && <p className="text-xs text-muted-foreground mt-1">铝土 {getBauxiteTotal(r.yardData).toFixed(2)} 吨 · 煤炭 {getCoalTotal(r.yardData).toFixed(2)} 吨</p>}
          {r.rejectReason && <p className="text-xs text-red-500 mt-1">退回原因: {r.rejectReason}</p>}
        </div>
        {showActions && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => handleApprove(r.id)} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium hover:bg-green-100 transition-colors flex items-center gap-1">
              <CheckCircle2 size={14} /> 通过
            </button>
            <button onClick={() => setRejectId(r.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium hover:bg-red-100 transition-colors flex items-center gap-1">
              <XCircle size={14} /> 退回
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <TabBar tabs={[{ id: 'pending', label: `待审报告 (${pending.length})` }, { id: 'reviewed', label: '已审核' }, { id: 'summary', label: '汇总上报' }]} active={tab} onChange={setTab} />

      {/* 退回弹窗 */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setRejectId(null)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground">退回原因</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="请输入退回原因..." className={cn(INPUT_CLS, 'min-h-[100px] resize-none')} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectId(null)} className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">取消</button>
              <button onClick={handleReject} className="px-4 py-2 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">确认退回</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'pending' && (
        <div className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无待审报告</p>}
          {pending.map((r) => reportCard(r, true))}
        </div>
      )}

      {tab === 'reviewed' && (
        <div className="space-y-3">
          {reviewed.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无已审核报告</p>}
          {reviewed.map((r) => reportCard(r, false))}
        </div>
      )}

      {tab === 'summary' && (
        <div className="safety-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">选择日期</label>
            <input type="date" value={summaryDate} onChange={(e) => setSummaryDate(e.target.value)} className={INPUT_CLS} style={{ width: 'auto' }} />
          </div>
          {(() => {
            const dayReports = reports.filter((r) => r.date === summaryDate && r.status === 'APPROVED');
            return dayReports.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground">当日已审核报告 ({dayReports.length})</h4>
                {dayReports.map((r) => (
                  <div key={r.id} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{ROLE_LABELS[r.role]}</span>
                    <span>{r.createdBy}</span>
                    {r.weighbridgeItems && <span>外运 {r.totalTons?.toFixed(2)} 吨</span>}
                    {r.transporterMessage && <span>总箱数 {r.transporterMessage.totalContainers}</span>}
                    {r.yardData && <span>铝土 {getBauxiteTotal(r.yardData).toFixed(2)}吨 · 煤炭 {getCoalTotal(r.yardData).toFixed(2)}吨</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">该日期暂无已审核报告</p>
            );
          })()}
          <div>
            <label className="text-sm font-medium text-foreground">综合评述</label>
            <textarea value={summaryText} onChange={(e) => setSummaryText(e.target.value)} placeholder="请填写综合评述..." className={cn(INPUT_CLS, 'min-h-[80px] resize-none mt-2')} />
          </div>
          <button onClick={handleSummary} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
            <Send size={16} /> 汇总上报
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Staff View ───

function StaffView() {
  const { reports, summaries } = useReportStore();
  const [viewId, setViewId] = React.useState<string | null>(null);

  const viewSummary = summaries.find((s) => s.id === viewId);
  const viewReports = viewSummary ? reports.filter((r) => viewSummary.reportIds.includes(r.id)) : [];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><BookOpen size={16} /> 汇总报告</h3>

      {summaries.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无汇总报告</p>}

      <div className="space-y-3">
        {summaries.map((s) => (
          <div key={s.id} className="safety-card p-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-foreground">{s.date}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.createdBy} · {new Date(s.createdAt).toLocaleString()}</p>
              {s.summary && <p className="text-xs text-foreground mt-1 line-clamp-2">{s.summary}</p>}
            </div>
            <button onClick={() => setViewId(s.id)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1">
              <Eye size={14} /> 查看
            </button>
          </div>
        ))}
      </div>

      {/* 详情弹窗 */}
      {viewSummary && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setViewId(null)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">{viewSummary.date} 汇总报告</h3>
              <button onClick={() => setViewId(null)} className="text-muted-foreground hover:text-foreground"><XCircle size={20} /></button>
            </div>
            <p className="text-xs text-muted-foreground">上报人: {viewSummary.createdBy} · {new Date(viewSummary.createdAt).toLocaleString()}</p>
            {viewSummary.summary && <div className="safety-card p-4"><p className="text-sm text-foreground">{viewSummary.summary}</p></div>}
            <h4 className="text-sm font-bold text-foreground">包含报告 ({viewReports.length})</h4>
            {viewReports.map((r) => (
              <div key={r.id} className="safety-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs">{ROLE_LABELS[r.role]}</span>
                  <span className="text-sm font-medium text-foreground">{r.createdBy}</span>
                  <StatusBadge status={r.status} />
                </div>
                {r.weighbridgeItems && (
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">{formatWeighbridgeMessage(r)}</pre>
                )}
                {r.transporterMessage && (
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">{formatTransporterMessage(r.transporterMessage)}</pre>
                )}
                {r.yardData && (
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">{formatYardDispatcherMessage(r)}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Weighbridge History ───

function WeighbridgeHistory() {
  const { reports } = useReportStore();
  const history = reports.filter((r) => r.role === 'WEIGHBRIDGE').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="space-y-3">
      {history.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无历史记录</p>}
      {history.map((r) => (
        <div key={r.id} className="safety-card p-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-foreground">{r.date}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-xs text-muted-foreground">{r.createdBy} · {new Date(r.createdAt).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">共计外运 {r.totalTons?.toFixed(2)} 吨</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Weighbridge View ───

function WeighbridgeView() {
  const [tab, setTab] = React.useState('form');
  const [previewText, setPreviewText] = React.useState('');

  return (
    <div className="space-y-6">
      <TabBar tabs={[{ id: 'form', label: '填写日报' }, { id: 'history', label: '历史记录' }]} active={tab} onChange={setTab} />
      {tab === 'form' && (
        <>
          <WeighbridgeForm onPreview={setPreviewText} />
          {previewText && (
            <div className="safety-card p-4">
              <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><MessageSquare size={16} /> 报文预览</h4>
              <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/30 rounded-xl p-4">{previewText}</pre>
            </div>
          )}
        </>
      )}
      {tab === 'history' && <WeighbridgeHistory />}
    </div>
  );
}

// ─── Main Component ───

export function DailyReport() {
  const { currentRole } = useAuthStore();
  const [showRoleSelector, setShowRoleSelector] = React.useState(false);

  const roleView = () => {
    switch (currentRole) {
      case 'WEIGHBRIDGE': return <WeighbridgeView />;
      case 'YARD_DISPATCHER': return <YardDispatcherView />;
      case 'TRANSPORTER': return <TransporterView />;
      case 'DISPATCHER': return <DispatcherView />;
      case 'STAFF': return <StaffView />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="safety-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">日报管理</h2>
              <p className="text-xs text-muted-foreground">当前角色: {ROLE_LABELS[currentRole]}</p>
            </div>
          </div>
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Clock size={16} /> 切换角色
            {showRoleSelector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        {showRoleSelector && (
          <div className="mt-4 pt-4 border-t border-border">
            <RoleSelector />
          </div>
        )}
      </div>

      {/* Role Content */}
      {roleView()}
    </div>
  );
}
