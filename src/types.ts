export interface MaterialStats {
  trains: number;
  wagons?: number; 
  tonnage: number;
}

export interface DailyRecord {
  date: string;
  coalInbound: MaterialStats;
  bauxiteInbound: MaterialStats;
  coalOutbound: number; // tonnage
  bauxiteOutbound: number; // tonnage
  coalInventory: number; // tonnage
  bauxiteInventory: number; // tonnage
}

export interface SummaryStats {
  label: string;
  value: string | number;
  unit: string;
  trend?: number;
  type: 'coal' | 'bauxite' | 'total';
}
