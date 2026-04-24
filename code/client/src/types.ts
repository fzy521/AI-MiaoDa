export type RiskLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE';
export type HazardStatus = 'PENDING' | 'RECTIFYING' | 'REVIEWING' | 'CLOSED';

export interface KPI {
  label: string;
  value: number | string;
  trend: number;
  unit?: string;
  level?: RiskLevel | 'SUCCESS';
}

export interface StatusChange {
  status: HazardStatus;
  date: string;
  note?: string;
  reviewer?: string;
}

export interface Hazard {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  status: HazardStatus;
  reporter: string;
  date: string;
  location: string;
  assignee?: string;
  department?: string;
  deadline?: string;
  rectifyNote?: string;
  reviewer?: string;
  reviewNote?: string;
  reviewedAt?: string;
  statusLog?: StatusChange[];
}

export interface HazardMonthlyStats {
  month: string;
  totalNew: number;
  totalClosed: number;
  totalPending: number;
  totalRectifying: number;
  totalReviewing: number;
  byLevel: Record<RiskLevel, number>;
  closureRate: number;
  avgRectifyDays: number;
}

export interface RiskPoint {
  id: string;
  name: string;
  level: RiskLevel;
  department: string;
  lastInspection: string;
  status: 'NORMAL' | 'ABNORMAL';
  // Extended fields
  type?: '人' | '机' | '环' | '管';
  workActivity?: string;
  hazard?: string;
  accidentType?: string;
  controlMeasures?: string;
  area?: string;
  assignee?: string;
}

// WMS Types
export type CargoType = 'COAL' | 'BAUXITE';

export interface CoalEntry {
  id: string;
  trainNo: string;
  originStation: string;
  weight: number;
  customer: string;
  area: 'EAST' | 'WEST';
  startPosition: number;
  endPosition: number;
  timestamp: string;
}

export interface BauxiteEntry {
  id: string;
  shipName: string;
  customer: string;
  weight: number;
  area: 'EAST' | 'WEST';
  occupiedArea: number;
  timestamp: string;
}

export interface CoalOutflow {
  id: string;
  sourceEntryId: string;
  trainNo: string;
  destinationStation: string;
  weight: number;
  customer: string;
  area: 'EAST' | 'WEST';
  timestamp: string;
}

export interface BauxiteOutflow {
  id: string;
  sourceEntryId: string;
  shipName: string;
  customer: string;
  weight: number;
  area: 'EAST' | 'WEST';
  timestamp: string;
}