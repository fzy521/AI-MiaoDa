export type Role = 'WEIGHBRIDGE' | 'YARD_DISPATCHER' | 'TRANSPORTER' | 'DISPATCHER' | 'STAFF';
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export const ROLE_LABELS: Record<Role, string> = {
  WEIGHBRIDGE: '磅房',
  YARD_DISPATCHER: '货场调度',
  TRANSPORTER: '企业运输员',
  DISPATCHER: '调度长',
  STAFF: '生产调度部内勤',
};

export interface WeighbridgeItem {
  customer: string;
  vehicles: number;
  trips: number;
  tons: number;
  returnTons: number;
}

export const WEIGHBRIDGE_CUSTOMERS = ['大同(飞硕)', '美思托', '中联盛', '汇德科技'];

export interface TransporterMessage {
  startTime: string;
  endTime: string;
  coalTrains: number;
  bauxiteTrains: number;
  bauxiteCars: number;
  overtimeTrains: number;
  trackStatus: { track: string; status: string }[];
  totalContainers: number;
  container35: {
    total: number;
    heavy: number;
    heavyCargo: string;
    empty: number;
    normalEmpty: number;
  };
  container20: {
    total: number;
    heavy: number;
    heavyCargo: string;
    empty: number;
  };
  container40Empty: number;
  grainEmpty: number;
}

export interface HandoverBook {
  equipment: { name: string; quantity: string }[];
  vehicleStatus: { description: string }[];
  handoverRecords: { description: string }[];
  handoverNotes: { description: string }[];
  totalContainers?: number;
}

export interface DailyReport {
  id: string;
  role: Role;
  date: string;
  status: ReportStatus;
  createdBy: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  weighbridgeItems?: WeighbridgeItem[];
  totalTons?: number;
  yardData?: YardDispatcherReport;
  transporterMessage?: TransporterMessage;
  handover?: HandoverBook;
  handoverSignOff?: { shiftEnd: string; shiftStart: string };
  transporterMode?: 'MESSAGE' | 'HANDOVER_BOOK';
}

export interface BauxiteInventory {
  westYardTons: number;
  eastYardSuppliers: { supplier: string; tons: number }[];
}

export interface CoalInventory {
  suppliers: { supplier: string; tons: number }[];
}

export interface SiloInventory {
  silos: { siloNumber: string; items: { cargo: string; tons: number }[] }[];
}

export interface YardDispatcherReport {
  bauxite: BauxiteInventory;
  coal: CoalInventory;
  silo: SiloInventory;
}

export const BAUXITE_EAST_SUPPLIERS = ['阳光天宇', '阳光烨发', '罗盘座', '协海丰裕'];
export const COAL_SUPPLIERS = ['美思托', '大同飞硕', '中联晟', '汇德科技'];
export const DEFAULT_SILOS = [
  { siloNumber: '3号筒仓', items: [{ cargo: '大新煤炭', tons: 0 }] },
  { siloNumber: '4号筒仓', items: [{ cargo: '黄金土庙煤炭', tons: 0 }, { cargo: '大新煤炭', tons: 0 }] },
  { siloNumber: '2号筒仓', items: [{ cargo: '大新煤炭', tons: 0 }] },
];

export function formatYardDispatcherMessage(report: DailyReport): string {
  const d = report.yardData;
  if (!d) return '';
  const month = parseInt(report.date.split('-')[1]);
  const day = parseInt(report.date.split('-')[2]);
  let msg = `${month}月${day}日库存情况:\n\n`;
  msg += `【铝土库存】\n`;
  msg += `西料场: ${d.bauxite.westYardTons.toFixed(2)}吨\n`;
  msg += `东料场:\n`;
  d.bauxite.eastYardSuppliers.forEach(s => {
    msg += `  ${s.supplier}: ${s.tons.toFixed(2)}吨\n`;
  });
  const bauxiteTotal = d.bauxite.westYardTons + d.bauxite.eastYardSuppliers.reduce((s, x) => s + x.tons, 0);
  msg += `共: ${bauxiteTotal.toFixed(2)}吨\n\n`;
  msg += `【煤炭库存】\n`;
  let coalTotal = 0;
  d.coal.suppliers.forEach(s => {
    msg += `${s.supplier}: ${s.tons.toFixed(2)}吨\n`;
    coalTotal += s.tons;
  });
  msg += `共: ${coalTotal.toFixed(2)}吨\n\n`;
  msg += `【筒仓库存、品类】\n`;
  d.silo.silos.forEach(silo => {
    const detail = silo.items.map(i => `${i.cargo}${i.tons.toFixed(2)}吨`).join('+');
    msg += `${silo.siloNumber}: ${detail}\n`;
  });
  return msg;
}

export function getBauxiteTotal(d: YardDispatcherReport): number {
  return d.bauxite.westYardTons + d.bauxite.eastYardSuppliers.reduce((s, x) => s + x.tons, 0);
}

export function getCoalTotal(d: YardDispatcherReport): number {
  return d.coal.suppliers.reduce((s, x) => s + x.tons, 0);
}

export interface SummaryReport {
  id: string;
  date: string;
  createdBy: string;
  createdAt: string;
  summary: string;
  reportIds: string[];
}

export function formatWeighbridgeMessage(report: DailyReport): string {
  const items = report.weighbridgeItems || [];
  const date = report.date;
  const month = date.split('-')[1];
  const day = date.split('-')[2];
  let msg = `${parseInt(month)}月${parseInt(day)}日出货量及到达信息情况:\n`;
  msg += `外运煤炭:00:00-24:00\n`;
  items.forEach(item => {
    let line = `${item.customer}:${item.vehicles}辆车拉运${item.trips}趟${item.tons}吨。`;
    if (item.returnTons > 0) line += `退车${item.returnTons}吨`;
    msg += line + '\n';
  });
  msg += `共计外运${report.totalTons || 0}吨。`;
  return msg;
}

export function formatTransporterMessage(msg: TransporterMessage): string {
  const startParts = msg.startTime.split(' ');
  const endParts = msg.endTime.split(' ');
  const startMD = startParts[0].split('-');
  const endMD = endParts[0].split('-');
  const startLine = `${parseInt(startMD[1])}.${parseInt(startMD[2])} ${startParts[1] || '7:00'}`;
  const endLine = `${parseInt(endMD[1])}.${parseInt(endMD[2])} ${endParts[1] || '7:00'}`;

  let text = `${startLine}-${endLine}\n`;
  text += `卸${msg.coalTrains}列煤炭。卸${msg.bauxiteTrains}列铝土${msg.bauxiteCars}车\n`;
  text += `(1)超时${msg.overtimeTrains}列。\n`;
  msg.trackStatus.forEach(ts => {
    text += `(2)${ts.track}，${ts.status}。\n`;
  });
  text += `(3)站存总箱数${msg.totalContainers}。\n`;
  text += `35吨敞顶箱${msg.container35.total}。${msg.container35.heavy}重(${msg.container35.heavyCargo}${msg.container35.heavy}重)，${msg.container35.empty}空(常存${msg.container35.normalEmpty}空)。\n`;
  text += `20英尺通用${msg.container20.total}。${msg.container20.heavyCargo}${msg.container20.heavy}重，${msg.container20.empty}空。\n`;
  text += `40英尺通用${msg.container40Empty}空。\n`;
  text += `粮食箱${msg.grainEmpty}空。`;
  return text;
}
