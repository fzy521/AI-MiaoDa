export type RiskLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE';
export type HazardStatus = 'PENDING' | 'RECTIFYING' | 'REVIEWING' | 'CLOSED';

export interface KPI {
  label: string;
  value: number | string;
  trend: number;
  unit?: string;
  level?: RiskLevel | 'SUCCESS';
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
}

export interface RiskPoint {
  id: string;
  name: string;
  level: RiskLevel;
  department: string;
  lastInspection: string;
  status: 'NORMAL' | 'ABNORMAL';
}
