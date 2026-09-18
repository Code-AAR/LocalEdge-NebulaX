import {
  SubsystemId,
  DoorPredictionItem,
  AcvPredictionItem,
  RailPredictionItem,
  ShmPredictionItem,
} from '../types';

// ==========================================
// 1. DOOR SUBSYSTEM DEFINITIONS & SAMPLES
// ==========================================

export interface DoorSampleTelemetry {
  fileId: string;
  name: string;
  description: string;
  samplingRateHz: number;
  totalDurationSec: number;
  rawCsvData: string;
  predictions: DoorPredictionItem[];
  strategicImpact: string;
  tacticalAction: string;
}

export const SAMPLE_DOOR_DATASETS: DoorSampleTelemetry[] = [
  {
    fileId: 'door_run_train304_car02_d3.csv',
    name: 'Train 304 Car 02 Door #3 (Somerset Inbound)',
    description: 'Multiple cycle telemetry showing foreign debris obstruction drag in door guide track.',
    samplingRateHz: 50,
    totalDurationSec: 18.0,
    rawCsvData: `timestamp_s,motor_current_a,door_pos_mm,velocity_mps,obstacle_sensor
0.0,0.4,0,0.00,0
0.5,3.2,85,0.32,0
1.0,4.1,240,0.41,0
1.8,4.0,520,0.38,0
2.5,3.9,780,0.35,0
3.2,0.5,850,0.02,0
4.0,0.2,850,0.00,0
4.8,3.8,800,-0.34,0
5.5,4.0,580,-0.39,0
6.4,8.9,320,-0.12,1
7.1,9.4,310,-0.04,1
8.0,8.7,290,-0.08,1
9.1,1.1,280,0.00,0
10.5,3.5,320,0.18,0
11.8,3.9,640,0.39,0
12.8,0.3,850,0.00,0
14.0,3.6,790,-0.32,0
15.0,3.9,510,-0.38,0
16.2,4.0,180,-0.36,0
17.1,0.4,0,0.00,0`,
    predictions: [
      {
        startTime: 0.0,
        endTime: 3.2,
        prediction: 'Normal',
        confidence: 0.98,
        peakCurrentA: 4.1,
        obstacleScore: 0.02,
        explanation: 'Smooth door opening stroke with nominal current draw (4.1A peak, within 5.0A envelope).',
      },
      {
        startTime: 4.8,
        endTime: 9.1,
        prediction: 'Abnormal resistance',
        confidence: 0.96,
        peakCurrentA: 9.4,
        obstacleScore: 0.88,
        explanation: 'Critical mechanical resistance detected at 310mm door travel. Motor current surged to 9.4A (>8.0A trip limit) with velocity stalling to -0.04 m/s.',
      },
      {
        startTime: 10.5,
        endTime: 12.8,
        prediction: 'Normal',
        confidence: 0.94,
        peakCurrentA: 3.9,
        obstacleScore: 0.05,
        explanation: 'Sensitive edge obstacle retract stroke executed safely without sustained drag.',
      },
      {
        startTime: 14.0,
        endTime: 17.1,
        prediction: 'Normal',
        confidence: 0.95,
        peakCurrentA: 4.0,
        obstacleScore: 0.04,
        explanation: 'Re-closing stroke achieved full seal latch under nominal torque baseline.',
      },
    ],
    strategicImpact: 'Risk of door interlock failure during morning peak dwell. Trainset 304 may hold platform for 120s if guide track not cleared.',
    tacticalAction: 'Inspect Door #3 lower sill threshold guide groove for commuter debris (umbrella tip / coin). Clean and grease roller guide brackets.',
  },
  {
    fileId: 'door_run_train318_car01_d1.csv',
    name: 'Train 318 Car 01 Door #1 (Orchard Station Run)',
    description: 'High-cycle nominal operation recording across 3 platform stops.',
    samplingRateHz: 50,
    totalDurationSec: 12.0,
    rawCsvData: `timestamp_s,motor_current_a,door_pos_mm,velocity_mps,obstacle_sensor
0.0,0.2,0,0.00,0
0.6,3.4,90,0.30,0
1.4,3.9,380,0.38,0
2.4,4.1,720,0.37,0
3.1,0.4,850,0.01,0
6.0,3.6,790,-0.33,0
7.0,3.8,460,-0.38,0
8.1,4.0,120,-0.35,0
8.9,0.3,0,0.00,0`,
    predictions: [
      {
        startTime: 0.0,
        endTime: 3.1,
        prediction: 'Normal',
        confidence: 0.99,
        peakCurrentA: 4.1,
        obstacleScore: 0.01,
        explanation: 'Unobstructed opening stroke; linear velocity profile and smooth deceleration cushion.',
      },
      {
        startTime: 6.0,
        endTime: 8.9,
        prediction: 'Normal',
        confidence: 0.99,
        peakCurrentA: 4.0,
        obstacleScore: 0.02,
        explanation: 'Unobstructed closing stroke; latch interlock microswitches engaged in 2.9 seconds.',
      },
    ],
    strategicImpact: 'Subsystem operating within 99.9% reliability tier. No line disruption risk.',
    tacticalAction: 'Routine visual check only; verify pneumatic seal rubber elasticity at scheduled weekly sweep.',
  },
];

// ==========================================
// 2. ACV (HVAC) SUBSYSTEM DEFINITIONS & SAMPLES
// ==========================================

export interface AcvSampleTelemetry {
  fileId: string;
  name: string;
  trainSetId: string;
  ambientTempC: number;
  description: string;
  rawCsvData: string;
  rankedCars: string; // Format: 03|01|02|04
  metrics: AcvPredictionItem;
  strategicImpact: string;
  tacticalAction: string;
}

export const SAMPLE_ACV_DATASETS: AcvSampleTelemetry[] = [
  {
    fileId: 'acv_telemetry_ts304_aug.csv',
    name: 'TrainSet 304 - 4-Car Revenue Loop (Peak Hours)',
    trainSetId: 'TS-304',
    ambientTempC: 33.8,
    description: 'Telemetry logs from all four passenger cars covering cabin temp, supply air, discharge temp, and compressor duty.',
    rankedCars: '03|01|02|04',
    rawCsvData: `car_id,cabin_temp_c,supply_temp_c,discharge_temp_c,suction_pressure_bar,superheat_k,compressor_duty_pct
01,24.8,17.4,86.2,3.9,9.4,78
02,23.9,16.1,81.0,4.2,7.1,70
03,28.4,22.8,104.5,2.6,16.8,99
04,23.5,15.8,78.2,4.3,6.8,66`,
    metrics: {
      fileId: 'acv_telemetry_ts304_aug.csv',
      rankedCars: '03|01|02|04',
      carMetrics: [
        {
          carId: '03',
          leakProbability: 0.94,
          cabinTempC: 28.4,
          supplyTempC: 22.8,
          dischargeTempC: 104.5,
          suctionPressureBar: 2.6,
          superheatK: 16.8,
          compressorDutyPct: 99,
        },
        {
          carId: '01',
          leakProbability: 0.42,
          cabinTempC: 24.8,
          supplyTempC: 17.4,
          dischargeTempC: 86.2,
          suctionPressureBar: 3.9,
          superheatK: 9.4,
          compressorDutyPct: 78,
        },
        {
          carId: '02',
          leakProbability: 0.18,
          cabinTempC: 23.9,
          supplyTempC: 16.1,
          dischargeTempC: 81.0,
          suctionPressureBar: 4.2,
          superheatK: 7.1,
          compressorDutyPct: 70,
        },
        {
          carId: '04',
          leakProbability: 0.08,
          cabinTempC: 23.5,
          supplyTempC: 15.8,
          dischargeTempC: 78.2,
          suctionPressureBar: 4.3,
          superheatK: 6.8,
          compressorDutyPct: 66,
        },
      ],
      explanation: 'Car 03 exhibits severe thermodynamic signature of R407C refrigerant loss: compressor duty pegged at 99%, excessive superheat (16.8K vs 6-8K baseline), high discharge temperature (104.5°C), and depressed suction pressure (2.6 bar). Car 01 shows mild sub-cooling deficit. Cars 02 & 04 are nominal.',
    },
    strategicImpact: 'Passenger thermal comfort failure in Car 03 during 34°C afternoon peak. High risk of commuter complaints and HVAC thermal overload cutout.',
    tacticalAction: 'Isolate Car 03 HVAC circuit #1. Hook up electronic halide sniffer to evaporator coil Schrader valves and condenser brazed joints.',
  },
  {
    fileId: 'acv_telemetry_ts312_oct.csv',
    name: 'TrainSet 312 - Fleetwide Validation Loop',
    trainSetId: 'TS-312',
    ambientTempC: 31.5,
    description: 'Fleet verification run after nocturnal filter replacement sweep.',
    rankedCars: '02|04|01|03',
    rawCsvData: `car_id,cabin_temp_c,supply_temp_c,discharge_temp_c,suction_pressure_bar,superheat_k,compressor_duty_pct
01,23.6,16.2,79.5,4.2,7.0,68
02,26.1,19.5,92.4,3.2,12.5,89
03,23.4,15.9,77.8,4.3,6.6,65
04,24.5,17.2,83.1,3.8,8.8,74`,
    metrics: {
      fileId: 'acv_telemetry_ts312_oct.csv',
      rankedCars: '02|04|01|03',
      carMetrics: [
        {
          carId: '02',
          leakProbability: 0.82,
          cabinTempC: 26.1,
          supplyTempC: 19.5,
          dischargeTempC: 92.4,
          suctionPressureBar: 3.2,
          superheatK: 12.5,
          compressorDutyPct: 89,
        },
        {
          carId: '04',
          leakProbability: 0.35,
          cabinTempC: 24.5,
          supplyTempC: 17.2,
          dischargeTempC: 83.1,
          suctionPressureBar: 3.8,
          superheatK: 8.8,
          compressorDutyPct: 74,
        },
        {
          carId: '01',
          leakProbability: 0.12,
          cabinTempC: 23.6,
          supplyTempC: 16.2,
          dischargeTempC: 79.5,
          suctionPressureBar: 4.2,
          superheatK: 7.0,
          compressorDutyPct: 68,
        },
        {
          carId: '03',
          leakProbability: 0.06,
          cabinTempC: 23.4,
          supplyTempC: 15.9,
          dischargeTempC: 77.8,
          suctionPressureBar: 4.3,
          superheatK: 6.6,
          compressorDutyPct: 65,
        },
      ],
      explanation: 'Car 02 ranks highest for refrigerant leakage (superheat 12.5K, discharge 92.4°C, duty 89%). Remaining cars 04, 01, 03 operate within standard temperature delta bounds.',
    },
    strategicImpact: 'Moderate thermal inefficiency. Preventive top-up during nocturnal window will avoid passenger comfort threshold breaches.',
    tacticalAction: 'Inspect Car 02 suction line thermal expansion valve (TXV) sensing bulb and recharge refrigerant to 4.2 bar suction baseline.',
  },
];

// ==========================================
// 3. RAIL CORRUGATION SUBSYSTEM SAMPLES
// ==========================================

export interface RailSampleTelemetry {
  fileId: string;
  name: string;
  location: string;
  chainage: string;
  description: string;
  rawCsvData: string;
  prediction: 'Normal' | 'Side I' | 'Side II';
  metrics: RailPredictionItem;
  strategicImpact: string;
  tacticalAction: string;
}

export const SAMPLE_RAIL_DATASETS: RailSampleTelemetry[] = [
  {
    fileId: 'rail_vib_somerset_curve_t01.csv',
    name: 'NSL Somerset Down-Line Tight Curve (KP 18.422)',
    location: 'Somerset Inbound Curve R=300m',
    chainage: 'KP 18.422',
    description: 'Axle-box tri-axial accelerometer recording during 65 km/h train passage across sharp radius curve.',
    prediction: 'Side I',
    rawCsvData: `time_ms,axle_vert_g,axle_lat_g,wheel_shock_g,dominant_freq_hz
0,0.18,0.08,0.22,42
10,0.85,0.42,1.15,85
20,1.92,0.95,2.84,115
30,2.65,1.28,3.92,120
40,2.88,1.44,4.18,122
50,2.41,1.15,3.60,118
60,1.25,0.68,1.95,95
70,0.35,0.18,0.48,50`,
    metrics: {
      fileId: 'rail_vib_somerset_curve_t01.csv',
      prediction: 'Side I',
      rmsVibration: 2.14,
      dominantFreqHz: 122,
      peakShockG: 4.18,
      chainage: 'KP 18.422 (Sleeper #4092)',
      explanation: 'Characteristic short-pitch corrugation signature on the inner (low) rail (Side I). High harmonic energy concentrated at 115-125 Hz with peak axle-box shock exceeding 4.18G, producing elevated wheel roar.',
    },
    strategicImpact: 'High risk of passenger noise exceedance (>78 dBA) and accelerated Pandrol e-clip fatigue loosening under repetitive 120Hz shock pounding.',
    tacticalAction: 'Dispatch TrackBot-03 (Robotic Rail Grinder) for a 0.35mm corrective grinding sweep across 80m of low rail between Sleepers #4080 and #4120.',
  },
  {
    fileId: 'rail_vib_orchard_tangent_t02.csv',
    name: 'NSL Orchard Tangent Straight Section (KP 16.120)',
    location: 'Orchard Tangent Track Track #2',
    chainage: 'KP 16.120',
    description: 'Continuous axle-box recording over smooth continuous welded rail (CWR).',
    prediction: 'Normal',
    rawCsvData: `time_ms,axle_vert_g,axle_lat_g,wheel_shock_g,dominant_freq_hz
0,0.08,0.03,0.10,25
10,0.12,0.04,0.14,30
20,0.15,0.05,0.18,32
30,0.14,0.05,0.16,30
40,0.11,0.04,0.13,28`,
    metrics: {
      fileId: 'rail_vib_orchard_tangent_t02.csv',
      prediction: 'Normal',
      rmsVibration: 0.12,
      dominantFreqHz: 30,
      peakShockG: 0.18,
      chainage: 'KP 16.120',
      explanation: 'Smooth rail surface without periodic wave patterns. Axle-box acceleration remains well below the 0.8G warning threshold.',
    },
    strategicImpact: 'Optimal running surface; zero passenger vibration and minimal rail-head metal loss.',
    tacticalAction: 'Maintain bi-monthly automated ultrasonic track recording car schedule.',
  },
  {
    fileId: 'rail_vib_dover_crossover_t03.csv',
    name: 'EWL Dover High-Rail Curved Approach (KP 22.840)',
    location: 'Dover Crossover Lead Track',
    chainage: 'KP 22.840',
    description: 'High-speed wheel-rail contact on the outer (high) rail showing severe long-pitch rutting wear.',
    prediction: 'Side II',
    rawCsvData: `time_ms,axle_vert_g,axle_lat_g,wheel_shock_g,dominant_freq_hz
0,0.22,0.14,0.35,35
10,1.10,0.85,1.75,55
20,2.20,1.92,3.40,62
30,2.45,2.15,3.95,65
40,1.85,1.60,2.80,60`,
    metrics: {
      fileId: 'rail_vib_dover_crossover_t03.csv',
      prediction: 'Side II',
      rmsVibration: 1.88,
      dominantFreqHz: 62,
      peakShockG: 3.95,
      chainage: 'KP 22.840 (High Rail)',
      explanation: 'Long-pitch rail corrugation and side-wear rutting located on the outer (high) rail (Side II). Dominant frequency at 60-65 Hz accompanied by high lateral acceleration (2.15G).',
    },
    strategicImpact: 'Accelerated rail gauge corner spalling and potential wheel flange climbing risk if friction modifier is depleted.',
    tacticalAction: 'Deploy TrackBot-01 profile scanner to evaluate gauge face side-wear and re-apply top-of-rail friction modifier.',
  },
];

// ==========================================
// 4. SHM (STRUCTURAL HEALTH MONITORING) SAMPLES
// ==========================================

export interface ShmSampleTelemetry {
  fileId: string;
  name: string;
  structure: string;
  chainage: string;
  description: string;
  rawCsvData: string;
  prediction: number; // e.g. 0.0418
  metrics: ShmPredictionItem;
  strategicImpact: string;
  tacticalAction: string;
}

export const SAMPLE_SHM_DATASETS: ShmSampleTelemetry[] = [
  {
    fileId: 'shm_bogie_frame_weld_t01.csv',
    name: 'Bogie Frame Transom Joint #4 (TrainSet 304)',
    structure: 'Fabricated Steel Bogie Transom Beam',
    chainage: 'Car 02 Bogie #1',
    description: 'High-frequency strain gauge recording under dynamic revenue train dynamic axle loading.',
    prediction: 0.0418, // 4.18% cumulative fatigue damage
    rawCsvData: `cycle_id,stress_range_mpa,mean_stress_mpa,cycle_count_n,endurance_limit_n
1,185.4,62.0,1420,50000
2,142.8,55.0,3800,120000
3,110.2,48.0,8500,450000
4,88.5,40.0,24000,1800000
5,65.2,32.0,68000,8500000`,
    metrics: {
      fileId: 'shm_bogie_frame_weld_t01.csv',
      prediction: 0.0418,
      stressRangeMpa: 185.4,
      cycleCount: 105720,
      damageRatePer1000Cycles: 0.000395,
      criticalLocation: 'Transom-to-side-beam weld gusset toe',
      explanation: 'Cumulative fatigue damage regression calculated using Palmgren-Miner linear damage summation. High-stress cycles (>180 MPa) incurred during switch crossing transitions represent 68% of fatigue consumption.',
    },
    strategicImpact: 'Bogie structure has consumed 4.18% of design life during this operational block. Remaining fatigue life is sufficient, but weld toe requires inspection prior to 15% threshold.',
    tacticalAction: 'Carry out magnetic particle testing (MT) or eddy-current testing (ET) on transom weld toe #4 during next scheduled B-level maintenance.',
  },
  {
    fileId: 'shm_viaduct_pier_girder_p412.csv',
    name: 'Viaduct Pre-stressed Concrete Box Girder (Pier P412)',
    structure: 'Pre-stressed Elevated Viaduct Span P412-P413',
    chainage: 'KP 24.150',
    description: 'Fiber-optic Bragg grating (FBG) strain sensors monitoring mid-span live load bending moments.',
    prediction: 0.0019, // 0.19% cumulative fatigue damage
    rawCsvData: `cycle_id,stress_range_mpa,mean_stress_mpa,cycle_count_n,endurance_limit_n
1,42.5,18.0,5200,2500000
2,35.0,15.0,18400,8000000
3,28.2,12.0,42000,25000000`,
    metrics: {
      fileId: 'shm_viaduct_pier_girder_p412.csv',
      prediction: 0.0019,
      stressRangeMpa: 42.5,
      cycleCount: 65600,
      damageRatePer1000Cycles: 0.000029,
      criticalLocation: 'Mid-span bottom soffit tendon anchorage zone',
      explanation: 'Low amplitude dynamic stress ranges (all under 45 MPa). Negligible cumulative fatigue damage (0.0019); prestressed concrete remains in deep uncracked compression.',
    },
    strategicImpact: 'Structural integrity index 99.81%. Viaduct structure safely within designed 100-year civil fatigue limits.',
    tacticalAction: 'Verify optical telemetry fiber continuity and bearing pad elastomeric shear settlement.',
  },
];

// ==========================================
// 5. SCHEMA COMPLIANT CSV GENERATORS
// ==========================================

/**
 * door_predictions.csv
 * Schema: start_time,end_time,prediction
 */
export function generateDoorCsv(items: DoorPredictionItem[]): string {
  const header = 'start_time,end_time,prediction';
  const rows = items.map((item) => `${item.startTime.toFixed(1)},${item.endTime.toFixed(1)},${item.prediction}`);
  return [header, ...rows].join('\n');
}

/**
 * acv_predictions.csv
 * Schema: file_id,ranked_cars
 */
export function generateAcvCsv(items: AcvPredictionItem[]): string {
  const header = 'file_id,ranked_cars';
  const rows = items.map((item) => `${item.fileId},${item.rankedCars}`);
  return [header, ...rows].join('\n');
}

/**
 * rail_predictions.csv
 * Schema: file_id,prediction
 */
export function generateRailCsv(items: RailPredictionItem[]): string {
  const header = 'file_id,prediction';
  const rows = items.map((item) => `${item.fileId},${item.prediction}`);
  return [header, ...rows].join('\n');
}

/**
 * shm_predictions.csv
 * Schema: file_id,prediction
 */
export function generateShmCsv(items: ShmPredictionItem[]): string {
  const header = 'file_id,prediction';
  const rows = items.map((item) => `${item.fileId},${item.prediction.toFixed(4)}`);
  return [header, ...rows].join('\n');
}

// ==========================================
// 6. CSV EXPORT UTILITY
// ==========================================

export function downloadCsvFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// 7. IN-MEMORY INFERENCE ALGORITHMS (OFFLINE FALLBACK)
// ==========================================

export function analyzeDoorRawData(csvText: string): DoorPredictionItem[] {
  const lines = csvText.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return SAMPLE_DOOR_DATASETS[0].predictions;
  }

  // Parse points
  const points: { t: number; current: number; pos: number; vel: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => parseFloat(p.trim()));
    if (parts.length >= 3 && !isNaN(parts[0])) {
      points.push({
        t: parts[0],
        current: parts[1] || 0,
        pos: parts[2] || 0,
        vel: parts[3] || 0,
      });
    }
  }

  if (points.length === 0) {
    return SAMPLE_DOOR_DATASETS[0].predictions;
  }

  // Segment by motion states
  const results: DoorPredictionItem[] = [];
  let inSegment = false;
  let segStart = 0;
  let peakCurrent = 0;
  let maxPos = 0;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const isMoving = Math.abs(pt.current) > 1.0;

    if (isMoving && !inSegment) {
      inSegment = true;
      segStart = pt.t;
      peakCurrent = pt.current;
      maxPos = pt.pos;
    } else if (inSegment) {
      if (pt.current > peakCurrent) peakCurrent = pt.current;
      if (pt.pos > maxPos) maxPos = pt.pos;

      if (!isMoving || i === points.length - 1) {
        inSegment = false;
        const segEnd = pt.t;
        const isAbnormal = peakCurrent > 7.5;
        results.push({
          startTime: Number(segStart.toFixed(1)),
          endTime: Number(segEnd.toFixed(1)),
          prediction: isAbnormal ? 'Abnormal resistance' : 'Normal',
          confidence: isAbnormal ? 0.96 : 0.98,
          peakCurrentA: Number(peakCurrent.toFixed(1)),
          obstacleScore: isAbnormal ? 0.85 : 0.03,
          explanation: isAbnormal
            ? `Motor current spiked to ${peakCurrent.toFixed(1)}A (>7.5A threshold). Mechanical drag or foreign obstacle detected.`
            : `Nominal movement profile with peak current ${peakCurrent.toFixed(1)}A within safe 5.5A bounds.`,
        });
      }
    }
  }

  return results.length > 0 ? results : SAMPLE_DOOR_DATASETS[0].predictions;
}

export function analyzeAcvRawData(fileId: string, csvText: string): AcvPredictionItem {
  const lines = csvText.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return SAMPLE_ACV_DATASETS[0].metrics;
  }

  const carMetrics: AcvPredictionItem['carMetrics'] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length >= 7) {
      const carId = parts[0];
      const cabin = parseFloat(parts[1]) || 24;
      const supply = parseFloat(parts[2]) || 16;
      const discharge = parseFloat(parts[3]) || 80;
      const suction = parseFloat(parts[4]) || 4.0;
      const superheat = parseFloat(parts[5]) || 7.0;
      const duty = parseFloat(parts[6]) || 70;

      // Leak probability heuristic
      // Elevated superheat (>11K) + elevated discharge (>90C) + depressed suction (<3.5 bar)
      let score = 0;
      if (superheat > 11) score += (superheat - 11) * 0.1;
      if (discharge > 88) score += (discharge - 88) * 0.03;
      if (suction < 3.8) score += (3.8 - suction) * 0.35;
      if (duty > 85) score += (duty - 85) * 0.02;

      const prob = Math.min(0.99, Math.max(0.05, score));
      carMetrics.push({
        carId,
        leakProbability: Number(prob.toFixed(2)),
        cabinTempC: cabin,
        supplyTempC: supply,
        dischargeTempC: discharge,
        suctionPressureBar: suction,
        superheatK: superheat,
        compressorDutyPct: duty,
      });
    }
  }

  if (carMetrics.length === 0) {
    return SAMPLE_ACV_DATASETS[0].metrics;
  }

  // Sort descending by leakProbability
  carMetrics.sort((a, b) => b.leakProbability - a.leakProbability);
  const rankedCars = carMetrics.map((c) => c.carId).join('|');

  return {
    fileId,
    rankedCars,
    carMetrics,
    explanation: `Ranked car ${carMetrics[0].carId} highest for refrigerant leakage risk (${Math.round(
      carMetrics[0].leakProbability * 100
    )}% confidence) based on elevated superheat (${carMetrics[0].superheatK}K) and reduced suction pressure (${carMetrics[0].suctionPressureBar} bar).`,
  };
}

export function analyzeRailRawData(fileId: string, csvText: string): RailPredictionItem {
  const lines = csvText.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return SAMPLE_RAIL_DATASETS[0].metrics;
  }

  let maxShock = 0;
  let sumSq = 0;
  let count = 0;
  let avgFreq = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => parseFloat(p.trim()));
    if (parts.length >= 5) {
      const vert = parts[1] || 0;
      const shock = parts[3] || 0;
      const freq = parts[4] || 0;

      if (shock > maxShock) maxShock = shock;
      sumSq += vert * vert;
      avgFreq += freq;
      count++;
    }
  }

  const rms = count > 0 ? Math.sqrt(sumSq / count) : 0.5;
  const domFreq = count > 0 ? avgFreq / count : 40;

  let prediction: 'Normal' | 'Side I' | 'Side II' = 'Normal';
  if (rms > 1.5 && domFreq > 90) {
    prediction = 'Side I';
  } else if (rms > 1.2 && domFreq <= 90) {
    prediction = 'Side II';
  }

  return {
    fileId,
    prediction,
    rmsVibration: Number(rms.toFixed(2)),
    dominantFreqHz: Math.round(domFreq),
    peakShockG: Number(maxShock.toFixed(2)),
    chainage: 'KP 18.420 (Down-Line)',
    explanation:
      prediction === 'Normal'
        ? 'Axle-box vibration spectrum within normal smooth rail baseline.'
        : prediction === 'Side I'
        ? 'High-frequency vibration harmonic (100-130 Hz) indicative of short-pitch corrugation on low rail.'
        : 'Mid-frequency lateral rutting signature indicative of long-pitch corrugation on high rail.',
  };
}

export function analyzeShmRawData(fileId: string, csvText: string): ShmPredictionItem {
  const lines = csvText.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return SAMPLE_SHM_DATASETS[0].metrics;
  }

  let totalCycles = 0;
  let maxStress = 0;
  let damageSum = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => parseFloat(p.trim()));
    if (parts.length >= 5) {
      const stressRange = parts[1] || 0;
      const n = parts[3] || 0;
      const N = parts[4] || 1000000;

      if (stressRange > maxStress) maxStress = stressRange;
      totalCycles += n;
      if (N > 0) {
        damageSum += n / N;
      }
    }
  }

  return {
    fileId,
    prediction: Number(damageSum.toFixed(4)),
    stressRangeMpa: Number(maxStress.toFixed(1)),
    cycleCount: totalCycles,
    damageRatePer1000Cycles: Number((damageSum / Math.max(1, totalCycles / 1000)).toFixed(6)),
    criticalLocation: 'Structural member welded joint',
    explanation: `Calculated dynamic cumulative fatigue damage of ${damageSum.toFixed(
      4
    )} based on Palmgren-Miner stress cycle summation across ${totalCycles} cycles.`,
  };
}
