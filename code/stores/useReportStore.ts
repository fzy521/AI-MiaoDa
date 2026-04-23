import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyReport, ReportStatus, Role, SummaryReport } from '@/types/report';

let idCounter = Date.now();
function uid() {
  return `rpt_${++idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

const MOCK_REPORTS: DailyReport[] = [
  {
    id: uid(),
    role: 'YARD_DISPATCHER',
    date: today,
    status: 'SUBMITTED',
    createdBy: '赵货调',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    yardData: {
      bauxite: {
        westYardTons: 35280.55,
        eastYardSuppliers: [
          { supplier: '阳光天宇', tons: 22345.28 },
          { supplier: '阳光烨发', tons: 18156.00 },
          { supplier: '罗盘座', tons: 12456.00 },
          { supplier: '协海丰裕', tons: 9790.00 },
        ],
      },
      coal: {
        suppliers: [
          { supplier: '美思托', tons: 18450.60 },
          { supplier: '大同飞硕', tons: 12380.00 },
          { supplier: '中联晟', tons: 18526.00 },
          { supplier: '汇德科技', tons: 7000.00 },
        ],
      },
      silo: {
        silos: [
          { siloNumber: '3号筒仓', items: [{ cargo: '大新煤炭', tons: 6975 }] },
          { siloNumber: '4号筒仓', items: [{ cargo: '黄金土庙煤炭', tons: 4086 }, { cargo: '大新煤炭', tons: 2975 }] },
          { siloNumber: '2号筒仓', items: [{ cargo: '大新煤炭', tons: 7420 }] },
        ],
      },
    },
  },
  {
    id: uid(),
    role: 'WEIGHBRIDGE',
    date: yesterday,
    status: 'APPROVED',
    createdBy: '张磅房',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reviewedBy: '李调度长',
    reviewedAt: new Date(Date.now() - 82800000).toISOString(),
    weighbridgeItems: [
      { customer: '大同(飞硕)', vehicles: 2, trips: 4, tons: 286.5, returnTons: 0 },
      { customer: '美思托', vehicles: 5, trips: 12, tons: 856.2, returnTons: 0 },
      { customer: '中联盛', vehicles: 28, trips: 55, tons: 3780.4, returnTons: 45.6 },
      { customer: '汇德科技', vehicles: 1, trips: 2, tons: 135.8, returnTons: 0 },
    ],
    totalTons: 5058.9,
  },
  {
    id: uid(),
    role: 'WEIGHBRIDGE',
    date: today,
    status: 'SUBMITTED',
    createdBy: '张磅房',
    createdAt: new Date().toISOString(),
    weighbridgeItems: [
      { customer: '大同(飞硕)', vehicles: 0, trips: 0, tons: 0, returnTons: 0 },
      { customer: '美思托', vehicles: 3, trips: 17, tons: 1207.98, returnTons: 0 },
      { customer: '中联盛', vehicles: 30, trips: 61, tons: 4054.64, returnTons: 67.78 },
      { customer: '汇德科技', vehicles: 0, trips: 0, tons: 0, returnTons: 0 },
    ],
    totalTons: 5262.62,
  },
  {
    id: uid(),
    role: 'TRANSPORTER',
    date: today,
    status: 'SUBMITTED',
    createdBy: '王运输',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    transporterMode: 'MESSAGE',
    transporterMessage: {
      startTime: `${today} 7:00`,
      endTime: `${today} 7:00`,
      coalTrains: 4,
      bauxiteTrains: 1,
      bauxiteCars: 58,
      overtimeTrains: 0,
      trackStatus: [
        { track: '货一', status: '待迁出' },
        { track: '货二', status: '空线' },
        { track: '翻车机', status: '空线' },
      ],
      totalContainers: 785,
      container35: { total: 330, heavy: 81, heavyCargo: '矿渣', empty: 249, normalEmpty: 133 },
      container20: { total: 436, heavy: 48, heavyCargo: '氧化铝', empty: 388 },
      container40Empty: 3,
      grainEmpty: 16,
    },
  },
];

interface ReportState {
  reports: DailyReport[];
  summaries: SummaryReport[];
  submitReport: (report: DailyReport) => void;
  updateReportStatus: (id: string, status: ReportStatus, reviewer: string, reason?: string) => void;
  createSummary: (summary: SummaryReport) => void;
  getReportsByDate: (date: string) => DailyReport[];
  getReportsByRoleAndStatus: (role: Role, status: ReportStatus) => DailyReport[];
  getSummaries: () => SummaryReport[];
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: MOCK_REPORTS,
      summaries: [],
      submitReport: (report) => set((s) => ({ reports: [report, ...s.reports] })),
      updateReportStatus: (id, status, reviewer, reason) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id
              ? { ...r, status, reviewedBy: reviewer, reviewedAt: new Date().toISOString(), rejectReason: reason }
              : r
          ),
        })),
      createSummary: (summary) => set((s) => ({ summaries: [summary, ...s.summaries] })),
      getReportsByDate: (date) => get().reports.filter((r) => r.date === date),
      getReportsByRoleAndStatus: (role, status) =>
        get().reports.filter((r) => r.role === role && r.status === status),
      getSummaries: () => get().summaries,
    }),
    { name: 'daily-reports' }
  )
);
