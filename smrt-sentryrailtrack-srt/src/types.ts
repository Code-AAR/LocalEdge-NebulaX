export type TabType = 
  | 'telemetry-&-live-map'
  | 'trackpulse-subsystems'
  | 'ai-fault-advisor'
  | 'ai-prompt-&-dispatch'
  | 'micro-fix-log-&-self-healing-history'
  | 'commuter-risk-analytics-&-early-warning';

export type TrackBotStatus = 'AUTONOMOUS' | 'HELD' | 'SCANNING' | 'STANDBY' | 'ENGAGED';

export interface TrackBotMetric {
  label: string;
  value: string | number;
  unit: string;
  barPct: number;
  color?: string;
}

export interface TrackBot {
  id: string;
  name: string;
  callsign: string;
  corridor: string;
  sector: string;
  kpLocation: string;
  locationCode: string;
  status: TrackBotStatus;
  speedKmH: number;
  batteryPct: number;
  latencyMs: number;
  connectionType: string;
  specialization: string;
  payload: string;
  primaryMetric: TrackBotMetric;
  secondaryMetric: TrackBotMetric;
  imageUrl: string;
  liveFeedLabel: string;
  defaultLogs: TelemetryLog[];
  samplePrompt: string;
}

export interface TelemetryLog {
  id: string;
  time: string;
  message: string;
  status: 'OK' | 'NOMINAL' | 'ALERT' | 'CLEAR' | 'ARMED';
  isAlert?: boolean;
}

export interface MicroFixItem {
  id: string;
  time: string;
  robot: string;
  location: string;
  title: string;
  description: string;
  category: 'welding' | 'clips' | 'ballast' | 'acoustic';
  status: 'COMPLETED' | 'SIGN_OFF_REQUIRED' | 'WATCHLIST';
  metricLabel: string;
  metricValue: string;
  beforeImg?: string;
  afterImg?: string;
  torqueList?: number[];
}

export type SubsystemId = 'door' | 'acv' | 'rail' | 'shm';

export type UserRoleFraming = 'strategic' | 'tactical';

export interface DoorPredictionItem {
  startTime: number;
  endTime: number;
  prediction: 'Normal' | 'Abnormal resistance';
  confidence: number;
  peakCurrentA: number;
  obstacleScore: number;
  explanation: string;
}

export interface AcvCarMetric {
  carId: string;
  leakProbability: number;
  cabinTempC: number;
  supplyTempC: number;
  dischargeTempC: number;
  suctionPressureBar: number;
  superheatK: number;
  compressorDutyPct: number;
}

export interface AcvPredictionItem {
  fileId: string;
  rankedCars: string; // e.g. "03|01|02|04"
  carMetrics: AcvCarMetric[];
  explanation: string;
}

export interface RailPredictionItem {
  fileId: string;
  prediction: 'Normal' | 'Side I' | 'Side II';
  rmsVibration: number;
  dominantFreqHz: number;
  peakShockG: number;
  chainage: string;
  explanation: string;
}

export interface ShmPredictionItem {
  fileId: string;
  prediction: number; // numeric cumulative fatigue damage value (e.g. 0.0418)
  stressRangeMpa: number;
  cycleCount: number;
  damageRatePer1000Cycles: number;
  criticalLocation: string;
  explanation: string;
}

export interface EmergencySafetyProtocol {
  isEmergencyActive: boolean;
  powerIsolated: boolean;
  trackShuntApplied: boolean;
  chainageVerified: boolean;
  ppeConfirmed: boolean;
  clearanceCode: string;
  incidentChainage: string;
}

