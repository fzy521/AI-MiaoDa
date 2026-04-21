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

// WMS Types
export type CargoType = 'COAL' | 'BAUXITE';

export interface CoalEntry {
  id: string;
  trainNo: string;      // 车号
  originStation: string; // 发站
  weight: number;       // 重量
  customer: string;     // 客户
  area: 'EAST' | 'WEST';
  startPosition: number; // 起始位置 (米)
  endPosition: number;   // 结束位置 (米)
  timestamp: string;
}

export interface BauxiteEntry {
  id: string;
  shipName: string;     // 船名
  customer: string;     // 客户
  weight: number;       // 重量
  area: 'EAST' | 'WEST';
  occupiedArea: number; // 占用面积 (平米)
  timestamp: string;
}

export interface CoalOutflow {
  id: string;
  sourceEntryId: string; // 关联的入库记录ID (货位)
  trainNo: string;      // 车号
  destinationStation: string; // 到站
  weight: number;       // 重量
  customer: string;     // 客户
  area: 'EAST' | 'WEST';
  timestamp: string;
}

export interface BauxiteOutflow {
  id: string;
  sourceEntryId: string; // 关联的入库记录ID (货位)
  shipName: string;     // 船名
  customer: string;     // 客户
  weight: number;       // 重量
  area: 'EAST' | 'WEST';
  timestamp: string;
}
