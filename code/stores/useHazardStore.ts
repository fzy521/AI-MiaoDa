import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hazard, HazardStatus, HazardMonthlyStats, RiskLevel, StatusChange } from '@/types';

function log(status: HazardStatus, date: string, note?: string, reviewer?: string): StatusChange {
  return { status, date, note, reviewer };
}

const MOCK_HAZARDS: Hazard[] = [
  { id: 'H-20260329-01', title: '专用线 3 号道岔尖轨密贴不严', description: '巡查发现 3 号道岔尖轨与基本轨之间存在约 5mm 缝隙，可能导致脱轨风险。', level: 'RED', status: 'RECTIFYING', reporter: '王安全', date: '2026-03-29', location: 'A 区 3 号道岔', assignee: '李维修', department: '工务段', deadline: '2026-04-05', statusLog: [log('PENDING', '2026-03-29'), log('RECTIFYING', '2026-03-30')] },
  { id: 'H-20260328-04', title: '装卸区灭火器压力不足', description: '2 号仓库东侧 3 具灭火器压力表指针位于红色区域。', level: 'ORANGE', status: 'PENDING', reporter: '李巡检', date: '2026-03-28', location: '货运中心仓库', assignee: '张消防', department: '安全部', deadline: '2026-04-04', statusLog: [log('PENDING', '2026-03-28')] },
  { id: 'H-20260328-02', title: '监控室备用电源故障', description: 'UPS 电池老化，停电切换测试失败。', level: 'YELLOW', status: 'CLOSED', reporter: '张电务', date: '2026-03-28', location: '综合办公楼 402', assignee: '陈电工', department: '电务段', rectifyNote: '更换 UPS 电池组，切换测试通过。', reviewer: '赵主管', reviewNote: '验收合格', reviewedAt: '2026-03-30', statusLog: [log('PENDING', '2026-03-28'), log('RECTIFYING', '2026-03-29'), log('CLOSED', '2026-03-30', '验收合格', '赵主管')] },
  { id: 'H-20260327-05', title: '围墙护栏松动', description: '北侧围墙部分护栏底座锈蚀严重。', level: 'BLUE', status: 'REVIEWING', reporter: '赵巡逻', date: '2026-03-27', location: '北侧围界', assignee: '周焊工', department: '后勤保障部', rectifyNote: '已加固 12 处松动底座并重新焊接。', reviewer: '赵主管', statusLog: [log('PENDING', '2026-03-27'), log('RECTIFYING', '2026-03-28'), log('REVIEWING', '2026-03-30', '', '赵主管')] },
  { id: 'H-20260325-06', title: '货场照明灯具损坏', description: 'B 区货场 3 盏投光灯不亮，影响夜间作业安全。', level: 'YELLOW', status: 'CLOSED', reporter: '王安全', date: '2026-03-25', location: 'B 区货场', assignee: '陈电工', department: '电务段', rectifyNote: '更换灯泡及镇流器，已恢复正常照明。', reviewer: '赵主管', reviewNote: '验收合格', reviewedAt: '2026-03-27', statusLog: [log('PENDING', '2026-03-25'), log('RECTIFYING', '2026-03-26'), log('CLOSED', '2026-03-27', '验收合格', '赵主管')] },
  { id: 'H-20260322-07', title: '列车编组区地面油污', description: '编组区铁轨两侧存在大面积机油泄漏，存在滑倒风险。', level: 'ORANGE', status: 'CLOSED', reporter: '李巡检', date: '2026-03-22', location: '编组区 2 道', assignee: '孙清洁', department: '运输车间', rectifyNote: '使用吸油毡清理完毕，并设置警示标志。', reviewer: '钱班长', reviewNote: '整改到位', reviewedAt: '2026-03-24', statusLog: [log('PENDING', '2026-03-22'), log('RECTIFYING', '2026-03-23'), log('CLOSED', '2026-03-24', '整改到位', '钱班长')] },
  { id: 'H-20260320-08', title: '道口报警器灵敏度下降', description: '3 号道口列车接近报警器反应延迟约 8 秒，不满足安全标准。', level: 'RED', status: 'CLOSED', reporter: '张电务', date: '2026-03-20', location: '3 号道口', assignee: '陈电工', department: '电务段', rectifyNote: '更换传感器模块并重新校准，测试响应时间 2 秒。', reviewer: '赵主管', reviewNote: '整改到位，恢复达标', reviewedAt: '2026-03-23', statusLog: [log('PENDING', '2026-03-20'), log('RECTIFYING', '2026-03-21'), log('CLOSED', '2026-03-23', '整改到位，恢复达标', '赵主管')] },
  { id: 'H-20260315-09', title: '仓库货架螺栓松动', description: '1 号仓库 3 排货架立柱底部螺栓松动 2 处。', level: 'YELLOW', status: 'CLOSED', reporter: '王安全', date: '2026-03-15', location: '1 号仓库', assignee: '周焊工', department: '后勤保障部', rectifyNote: '紧固全部螺栓并增加防松垫片。', reviewer: '赵主管', reviewNote: '合格', reviewedAt: '2026-03-18', statusLog: [log('PENDING', '2026-03-15'), log('RECTIFYING', '2026-03-16'), log('CLOSED', '2026-03-18', '合格', '赵主管')] },
  { id: 'H-20260228-10', title: '信号机灯泡烧毁', description: '进站信号机绿灯灯泡烧毁，显示异常。', level: 'ORANGE', status: 'CLOSED', reporter: '张电务', date: '2026-02-28', location: '进站信号机', assignee: '陈电工', department: '电务段', rectifyNote: '更换 LED 信号灯泡。', reviewer: '赵主管', reviewNote: '合格', reviewedAt: '2026-03-01', statusLog: [log('PENDING', '2026-02-28'), log('RECTIFYING', '2026-02-28'), log('CLOSED', '2026-03-01', '合格', '赵主管')] },
  { id: 'H-20260225-11', title: '站台边缘警示标识褪色', description: '1 号站台黄色安全线褪色严重，辨识度不足。', level: 'BLUE', status: 'CLOSED', reporter: '李巡检', date: '2026-02-25', location: '1 号站台', assignee: '孙清洁', department: '后勤保障部', rectifyNote: '重新施划安全警示线。', reviewer: '赵主管', reviewNote: '合格', reviewedAt: '2026-02-27', statusLog: [log('PENDING', '2026-02-25'), log('RECTIFYING', '2026-02-26'), log('CLOSED', '2026-02-27', '合格', '赵主管')] },
  { id: 'H-20260220-12', title: '货运龙门吊限位器故障', description: '龙门吊行走机构限位开关失灵，存在碰撞风险。', level: 'RED', status: 'CLOSED', reporter: '王安全', date: '2026-02-20', location: 'B 区龙门吊', assignee: '李维修', department: '工务段', rectifyNote: '更换限位开关并加装冗余保护。', reviewer: '赵主管', reviewNote: '整改到位', reviewedAt: '2026-02-23', statusLog: [log('PENDING', '2026-02-20'), log('RECTIFYING', '2026-02-21'), log('CLOSED', '2026-02-23', '整改到位', '赵主管')] },
  { id: 'H-20260218-13', title: '消防通道被占', description: '3 号仓库西侧消防通道被临时堆放货物堵塞。', level: 'ORANGE', status: 'CLOSED', reporter: '李巡检', date: '2026-02-18', location: '3 号仓库', assignee: '钱班长', department: '运输车间', rectifyNote: '已清理通道并划定禁停标线。', reviewer: '赵主管', reviewNote: '合格', reviewedAt: '2026-02-19', statusLog: [log('PENDING', '2026-02-18'), log('RECTIFYING', '2026-02-18'), log('CLOSED', '2026-02-19', '合格', '赵主管')] },
  { id: 'H-20260215-14', title: '铁路沿线排水沟淤堵', description: '专用线 K2+300 处排水沟淤堵，雨季积水风险。', level: 'YELLOW', status: 'CLOSED', reporter: '赵巡逻', date: '2026-02-15', location: 'K2+300 排水沟', assignee: '孙清洁', department: '后勤保障部', rectifyNote: '清淤疏通 50 米。', reviewer: '赵主管', reviewNote: '合格', reviewedAt: '2026-02-18', statusLog: [log('PENDING', '2026-02-15'), log('RECTIFYING', '2026-02-16'), log('CLOSED', '2026-02-18', '合格', '赵主管')] },
  { id: 'H-20260210-15', title: '道岔转辙机异响', description: '5 号道岔转辙机转换时存在异常摩擦声。', level: 'RED', status: 'CLOSED', reporter: '张电务', date: '2026-02-10', location: '5 号道岔', assignee: '李维修', department: '工务段', rectifyNote: '更换摩擦片并润滑传动机构。', reviewer: '赵主管', reviewNote: '验收合格', reviewedAt: '2026-02-13', statusLog: [log('PENDING', '2026-02-10'), log('RECTIFYING', '2026-02-11'), log('CLOSED', '2026-02-13', '验收合格', '赵主管')] },
  { id: 'H-20260128-16', title: '专用线防护栅栏破损', description: 'K1+500 处防护栅栏被撞击变形，存在人员误入风险。', level: 'ORANGE', status: 'CLOSED', reporter: '赵巡逻', date: '2026-01-28', location: 'K1+500 防护栅栏', assignee: '周焊工', department: '后勤保障部', rectifyNote: '修复并加固栅栏 10 米。', reviewer: '赵主管', reviewNote: '合格', reviewedAt: '2026-01-31', statusLog: [log('PENDING', '2026-01-28'), log('RECTIFYING', '2026-01-29'), log('CLOSED', '2026-01-31', '合格', '赵主管')] },
  { id: 'H-20260125-17', title: '装卸机械钢丝绳磨损', description: '2 号龙门吊主起升钢丝绳断丝超标。', level: 'RED', status: 'CLOSED', reporter: '王安全', date: '2026-01-25', location: '2 号龙门吊', assignee: '李维修', department: '工务段', rectifyNote: '更换全套钢丝绳。', reviewer: '赵主管', reviewNote: '整改到位', reviewedAt: '2026-01-28', statusLog: [log('PENDING', '2026-01-25'), log('RECTIFYING', '2026-01-26'), log('CLOSED', '2026-01-28', '整改到位', '赵主管')] },
  { id: 'H-20260120-18', title: '站场排水不畅', description: '站场低洼处积水，影响调车作业。', level: 'YELLOW', status: 'CLOSED', reporter: '李巡检', date: '2026-01-20', location: '调车场 3 道', assignee: '孙清洁', department: '后勤保障部', rectifyNote: '疏通排水管 30 米，加设雨水井。', reviewer: '赵主管', reviewNote: '合格', reviewedAt: '2026-01-23', statusLog: [log('PENDING', '2026-01-20'), log('RECTIFYING', '2026-01-21'), log('CLOSED', '2026-01-23', '合格', '赵主管')] },
  { id: 'H-20260115-19', title: '应急疏散指示牌缺失', description: '2 号仓库内缺少 2 个应急疏散指示牌。', level: 'BLUE', status: 'CLOSED', reporter: '王安全', date: '2026-01-15', location: '2 号仓库', assignee: '孙清洁', department: '后勤保障部', rectifyNote: '补充安装荧光疏散指示牌。', reviewer: '赵主管', reviewNote: '合格', reviewedAt: '2026-01-17', statusLog: [log('PENDING', '2026-01-15'), log('RECTIFYING', '2026-01-16'), log('CLOSED', '2026-01-17', '合格', '赵主管')] },
  { id: 'H-20260110-20', title: '接触网支柱基础沉降', description: 'K3+200 处接触网支柱基础存在 15mm 不均匀沉降。', level: 'RED', status: 'CLOSED', reporter: '张电务', date: '2026-01-10', location: 'K3+200 接触网', assignee: '李维修', department: '工务段', rectifyNote: '基础注浆加固，沉降监测达标。', reviewer: '赵主管', reviewNote: '整改到位', reviewedAt: '2026-01-15', statusLog: [log('PENDING', '2026-01-10'), log('RECTIFYING', '2026-01-11'), log('CLOSED', '2026-01-15', '整改到位', '赵主管')] },
];

/** Get the hazard's status as of the end of a given month */
function getStatusAtMonth(h: Hazard, year: number, month: number): { status: HazardStatus; reviewer?: string } {
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-31`;
  const relevant = (h.statusLog || []).filter(e => e.date <= endOfMonth);
  if (relevant.length === 0) return { status: 'PENDING' };
  const latest = relevant[relevant.length - 1];
  return { status: latest.status, reviewer: latest.reviewer };
}

interface HazardState {
  hazards: Hazard[];
  addHazard: (hazard: Hazard) => void;
  getByMonth: (month: string) => Hazard[];
  getLedger: (year: number, month: number) => Hazard[];
  getMonthlyStats: (month: string) => HazardMonthlyStats;
  getMonthlyTrend: (months: number) => HazardMonthlyStats[];
}

function computeStats(month: string, hazards: Hazard[]): HazardMonthlyStats {
  const monthHazards = hazards.filter(h => h.date.startsWith(month));
  const totalNew = monthHazards.length;
  const totalClosed = monthHazards.filter(h => h.status === 'CLOSED').length;
  const totalPending = monthHazards.filter(h => h.status === 'PENDING').length;
  const totalRectifying = monthHazards.filter(h => h.status === 'RECTIFYING').length;
  const totalReviewing = monthHazards.filter(h => h.status === 'REVIEWING').length;
  const closable = totalNew - totalPending;
  const byLevel: Record<RiskLevel, number> = { RED: 0, ORANGE: 0, YELLOW: 0, BLUE: 0 };
  monthHazards.forEach(h => { byLevel[h.level]++; });
  let avgRectifyDays = 0;
  const closed = monthHazards.filter(h => h.status === 'CLOSED' && h.reviewedAt);
  if (closed.length > 0) {
    const totalDays = closed.reduce((sum, h) => {
      const start = new Date(h.date).getTime();
      const end = new Date(h.reviewedAt!).getTime();
      return sum + Math.max(1, Math.round((end - start) / 86400000));
    }, 0);
    avgRectifyDays = Math.round(totalDays / closed.length * 10) / 10;
  }
  return { month, totalNew, totalClosed, totalPending, totalRectifying, totalReviewing, byLevel, closureRate: closable > 0 ? Math.round(totalClosed / closable * 100) : 0, avgRectifyDays };
}

export const useHazardStore = create<HazardState>()(
  persist(
    (set, get) => ({
      hazards: MOCK_HAZARDS,
      addHazard: (hazard) => set((s) => ({ hazards: [hazard, ...s.hazards] })),
      getByMonth: (month) => get().hazards.filter(h => h.date.startsWith(month)),
      getLedger: (year, month) => {
        const prefix = `${year}-`;
        const endMonth = `${prefix}${String(month).padStart(2, '0')}`;
        return get().hazards.filter(h => h.date >= `${prefix}01` && h.date <= `${endMonth}-31`);
      },
      getMonthlyStats: (month) => computeStats(month, get().hazards),
      getMonthlyTrend: (count) => {
        const now = new Date();
        const months: string[] = [];
        for (let i = count - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
        return months.map(m => computeStats(m, get().hazards));
      },
    }),
    { name: 'hazard-store' }
  )
);

export { getStatusAtMonth };
