import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  SubsystemId,
  UserRoleFraming,
  EmergencySafetyProtocol,
} from '../types';
import {
  SAMPLE_DOOR_DATASETS,
  SAMPLE_ACV_DATASETS,
  SAMPLE_RAIL_DATASETS,
  SAMPLE_SHM_DATASETS,
} from '../data/trackPulseSubsystems';

interface TrackPulseSubsystemEngineProps {
  onAskAiAdvisor: (prompt: string) => void;
}

export const TrackPulseSubsystemEngine: React.FC<TrackPulseSubsystemEngineProps> = ({
  onAskAiAdvisor,
}) => {
  const { isDarkMode } = useTheme();

  // Active Subsystem
  const [activeSubsystem, setActiveSubsystem] = useState<SubsystemId>('door');

  // Dual-User Framing Role
  const [userRole, setUserRole] = useState<UserRoleFraming>('strategic');

  // Emergency Response Protocol Mode
  const [emergencyProtocol, setEmergencyProtocol] = useState<EmergencySafetyProtocol>({
    isEmergencyActive: false,
    powerIsolated: true,
    trackShuntApplied: true,
    chainageVerified: true,
    ppeConfirmed: true,
    clearanceCode: 'PTW-SMRT-NSL-8842',
    incidentChainage: 'KP 18.422 (Somerset Inbound Curve)',
  });

  // Selected Sample Datasets
  const [selectedDoorIndex, setSelectedDoorIndex] = useState<number>(0);
  const [selectedAcvIndex, setSelectedAcvIndex] = useState<number>(0);
  const [selectedRailIndex, setSelectedRailIndex] = useState<number>(0);
  const [selectedShmIndex, setSelectedShmIndex] = useState<number>(0);

  // Custom Input State
  const [customCsvInput, setCustomCsvInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveCsv, setLiveCsv] = useState<Record<string, string>>({}); // real model output per subsystem (keyed by rail/door/acv/shm)

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active dataset getters
  const currentDoor = SAMPLE_DOOR_DATASETS[selectedDoorIndex];
  const currentAcv = SAMPLE_ACV_DATASETS[selectedAcvIndex];
  const currentRail = SAMPLE_RAIL_DATASETS[selectedRailIndex];
  const currentShm = SAMPLE_SHM_DATASETS[selectedShmIndex];

  // Run Inference / Process Custom
  const handleRunInference = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      showToast(`SRT AI inference complete for ${activeSubsystem.toUpperCase()} Subsystem!`);
    }, 450);
  };

  const handleConsultAiWithData = () => {
    let prompt = '';
    switch (activeSubsystem) {
      case 'door':
        prompt = `Analyze door subsystem temporal segments from ${currentDoor.fileId}. Flag start_time, end_time and classify Normal vs Abnormal resistance with field action.`;
        break;
      case 'acv':
        prompt = `Perform ACV refrigerant leak localization on ${currentAcv.trainSetId} telemetry. Rank cars in format 03|01|02|04 and explain thermodynamic superheat anomalies.`;
        break;
      case 'rail':
        prompt = `Classify rail corrugation multi-channel axle-box vibration for ${currentRail.chainage}. Categorize condition into Normal, Side I, or Side II and detail grinding action.`;
        break;
      case 'shm':
        prompt = `Calculate SHM dynamic stress cumulative fatigue damage regression for ${currentShm.structure} (${currentShm.fileId}). Estimate numeric damage index and recommend NDT inspection.`;
        break;
    }
    onAskAiAdvisor(prompt);
  };

  // Optional backend URL (set VITE_INFERENCE_API to your deployed FastAPI URL)
  const INFERENCE_API = ((import.meta as any).env?.VITE_INFERENCE_API as string) || '';

  const PRED_FILE: Record<string, string> = {
    door: 'door_predictions.csv',
    acv: 'acv_predictions.csv',
    rail: 'rail_predictions.csv',
    shm: 'shm_predictions.csv',
  };

  const triggerCsvDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Run the REAL trained models on uploaded held-out file(s) via the backend API
  const handleRealInference = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!INFERENCE_API) {
      showToast('Set VITE_INFERENCE_API to your deployed model backend URL first.');
      return;
    }
    setIsProcessing(true);
    try {
      const fd = new FormData();
      // rail & shm take many files (field "files"); door & acv take one (field "file")
      if (activeSubsystem === 'rail' || activeSubsystem === 'shm') {
        Array.from(files).forEach((f) => fd.append('files', f));
      } else {
        fd.append('file', files[0]);
      }
      const res = await fetch(`${INFERENCE_API}/predict/${activeSubsystem}`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLiveCsv((prev) => ({ ...prev, [activeSubsystem]: data.csv }));
      showToast(`Model ran on ${files.length} file(s) — ${data.rows.length} prediction(s) ready to download.`);
    } catch (err: any) {
      showToast('Inference failed: ' + String(err?.message || 'error').slice(0, 60));
    } finally {
      setIsProcessing(false);
    }
  };

  // Download predictions: the live model output if we have one, else the bundled real CSV
  const handleDownloadPredictions = async () => {
    const filename = PRED_FILE[activeSubsystem];
    const live = liveCsv[activeSubsystem];
    if (live) {
      triggerCsvDownload(live, filename);
      showToast(`Downloaded ${filename} (live model output)`);
      return;
    }
    try {
      const res = await fetch(`/submission/${filename}`);
      if (!res.ok) throw new Error('missing');
      triggerCsvDownload(await res.text(), filename);
      showToast(`Downloaded ${filename}`);
    } catch {
      showToast(`Could not load ${filename}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col gap-4 sm:gap-5">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-3 sm:right-4 z-50 bg-[#12161F] text-white border-2 border-emerald-500/80 px-3.5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-bounce max-w-[90vw]">
          <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0">check_circle</span>
          <span className="font-mono text-xs sm:text-sm font-bold truncate">{toastMessage}</span>
        </div>
      )}

      {/* Emergency Response Protocol Banner */}
      <div
        className={`p-3.5 sm:p-5 rounded-2xl border transition-all ${
          emergencyProtocol.isEmergencyActive
            ? 'bg-red-950/40 border-red-500/80 text-white shadow-xl shadow-red-950/50'
            : isDarkMode
            ? 'bg-[#12161F] border-white/15 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
            <div
              className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
                emergencyProtocol.isEmergencyActive
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50'
                  : 'bg-[#E11A2B]/20 text-[#E11A2B] border border-[#E11A2B]/40'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] sm:text-[26px]">
                {emergencyProtocol.isEmergencyActive ? 'e911_emergency' : 'shield_with_heart'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#E11A2B]">
                  EMERGENCY PROTOCOL (OFFLINE & FIELD MODE)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold ${
                    emergencyProtocol.isEmergencyActive
                      ? 'bg-red-500 text-white font-black'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {emergencyProtocol.isEmergencyActive ? 'ACTIVE INCIDENT' : 'MONITORING READY'}
                </span>
              </div>
              <h3 className="font-headline-sm text-sm sm:text-base font-bold tracking-tight mt-0.5">
                {emergencyProtocol.isEmergencyActive
                  ? 'URGENT TRACK TRIP: Safety Isolation & Verification Active'
                  : 'Third-Rail 750V DC Isolation & First Responder Safety Protocol'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() =>
                setEmergencyProtocol((prev) => ({
                  ...prev,
                  isEmergencyActive: !prev.isEmergencyActive,
                }))
              }
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                emergencyProtocol.isEmergencyActive
                  ? 'bg-white text-red-700 hover:bg-slate-100 shadow-md'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/40'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {emergencyProtocol.isEmergencyActive ? 'check_circle' : 'warning'}
              </span>
              {emergencyProtocol.isEmergencyActive ? 'Deactivate Emergency' : 'Trigger Track Trip Protocol'}
            </button>
          </div>
        </div>

        {/* Emergency Safety Protocol Checklist */}
        {emergencyProtocol.isEmergencyActive && (
          <div className="mt-4 pt-4 border-t border-red-500/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="bg-black/40 border border-red-500/40 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0">verified</span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 block uppercase font-bold">1. 750V DC Power</span>
                <span className="text-xs font-bold text-white truncate block">Isolated (Zone 4B)</span>
              </div>
            </div>
            <div className="bg-black/40 border border-red-500/40 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0">verified</span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 block uppercase font-bold">2. Track Shunt Clamps</span>
                <span className="text-xs font-bold text-white truncate block">Secured ±200m</span>
              </div>
            </div>
            <div className="bg-black/40 border border-red-500/40 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-400 text-[20px] shrink-0">location_on</span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 block uppercase font-bold">3. Chainage Marker</span>
                <span className="text-xs font-bold text-white truncate block">KP 18.422 Verified</span>
              </div>
            </div>
            <div className="bg-black/40 border border-red-500/40 p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sky-400 text-[20px] shrink-0">vpn_key</span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 block uppercase font-bold">4. Clearance Permit</span>
                <span className="text-xs font-mono font-bold text-white truncate block">{emergencyProtocol.clearanceCode}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Deck: Subsystem Selector & User Role Framing */}
      <div
        className={`p-3.5 sm:p-5 rounded-2xl border transition-all ${
          isDarkMode
            ? 'bg-[#12161F] border-white/15 text-white shadow-xl shadow-black/40'
            : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E11A2B] animate-ping"></span>
              <h2 className="font-headline-sm sm:font-headline-md text-base sm:text-xl font-bold uppercase tracking-tight">
                SRT Predictive Engine
              </h2>
            </div>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
              Multi-subsystem temporal segmentation, thermodynamic leak ranking, and vibration classification
            </p>
          </div>

          {/* User Framing Toggle: Strategic vs Tactical */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 self-stretch sm:self-start lg:self-auto">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-[#94A3B8]">Framing Lens:</span>
            <div className="inline-flex p-1 rounded-xl bg-black/30 border border-white/15 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setUserRole('strategic')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  userRole === 'strategic'
                    ? 'bg-[#E11A2B] text-white shadow-md'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">monitoring</span>
                Strategic (Control)
              </button>
              <button
                type="button"
                onClick={() => setUserRole('tactical')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  userRole === 'tactical'
                    ? 'bg-[#E11A2B] text-white shadow-md'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">engineering</span>
                Tactical (Field)
              </button>
            </div>
          </div>
        </div>

        {/* The 4 Subsystem Pills */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 mt-4 sm:mt-5">
          <button
            type="button"
            onClick={() => setActiveSubsystem('door')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[84px] sm:min-h-[92px] ${
              activeSubsystem === 'door'
                ? 'bg-[#E11A2B]/20 border-[#E11A2B] text-white ring-2 ring-[#E11A2B]/40 shadow-lg shadow-[#E11A2B]/20'
                : isDarkMode
                ? 'bg-[#0B0E14] border-white/10 text-slate-300 hover:border-white/30'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px] text-[#E11A2B]">sensor_door</span>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                Segment / Resistance
              </span>
            </div>
            <div className="mt-2">
              <span className="font-headline-sm text-xs sm:text-base font-bold block leading-tight">
                1. Door Subsystem
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] block truncate">
                door_predictions.csv
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubsystem('acv')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[84px] sm:min-h-[92px] ${
              activeSubsystem === 'acv'
                ? 'bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/40 shadow-lg shadow-sky-500/20'
                : isDarkMode
                ? 'bg-[#0B0E14] border-white/10 text-slate-300 hover:border-white/30'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px] text-sky-400">mode_fan</span>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                Refrigerant Leak
              </span>
            </div>
            <div className="mt-2">
              <span className="font-headline-sm text-xs sm:text-base font-bold block leading-tight">
                2. ACV Subsystem
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] block truncate">
                acv_predictions.csv
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubsystem('rail')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[84px] sm:min-h-[92px] ${
              activeSubsystem === 'rail'
                ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20'
                : isDarkMode
                ? 'bg-[#0B0E14] border-white/10 text-slate-300 hover:border-white/30'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px] text-amber-400">vibration</span>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                Multi-Class FFT
              </span>
            </div>
            <div className="mt-2">
              <span className="font-headline-sm text-xs sm:text-base font-bold block leading-tight">
                3. Rail Corrugation
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] block truncate">
                rail_predictions.csv
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubsystem('shm')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[84px] sm:min-h-[92px] ${
              activeSubsystem === 'shm'
                ? 'bg-purple-500/20 border-purple-400 text-white ring-2 ring-purple-400/40 shadow-lg shadow-purple-500/20'
                : isDarkMode
                ? 'bg-[#0B0E14] border-white/10 text-slate-300 hover:border-white/30'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px] text-purple-400">architecture</span>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                Fatigue Regression
              </span>
            </div>
            <div className="mt-2">
              <span className="font-headline-sm text-xs sm:text-base font-bold block leading-tight">
                4. SHM Subsystem
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] block truncate">
                shm_predictions.csv
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Subsystem Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Data Input, Selection & Telemetry Details (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Subsystem Dataset Selector / Custom CSV */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDarkMode
                ? 'bg-[#12161F] border-white/15 text-white'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div>
                <span className="font-mono text-xs uppercase font-bold text-[#E11A2B] tracking-wider block">
                  Data Stream & Telemetry
                </span>
                <h3 className="font-headline-sm font-bold mt-0.5">
                  {activeSubsystem === 'door' && 'Door Motion & Motor Current Telemetry'}
                  {activeSubsystem === 'acv' && 'Multi-Car HVAC Sensor Array & Pressures'}
                  {activeSubsystem === 'rail' && 'Axle-Box Accelerometer Vibration Channels'}
                  {activeSubsystem === 'shm' && 'Dynamic Strain Gauge Time-Series'}
                </h3>
              </div>

              {/* Sample vs Custom Toggle */}
              <div className="inline-flex p-1 rounded-xl bg-black/30 border border-white/15 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    !isCustomMode ? 'bg-[#E11A2B] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Validated Datasets
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    isCustomMode ? 'bg-[#E11A2B] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom CSV
                </button>
              </div>
            </div>

            {!isCustomMode ? (
              <div className="flex flex-col gap-3">
                {/* Dataset options */}
                {activeSubsystem === 'door' && (
                  <div className="flex gap-2 flex-wrap">
                    {SAMPLE_DOOR_DATASETS.map((ds, idx) => (
                      <button
                        key={ds.fileId}
                        onClick={() => setSelectedDoorIndex(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                          selectedDoorIndex === idx
                            ? 'bg-[#E11A2B]/20 border-[#E11A2B] text-white shadow-md'
                            : 'bg-black/20 border-white/10 text-slate-300 hover:border-white/25'
                        }`}
                      >
                        {ds.name}
                      </button>
                    ))}
                  </div>
                )}

                {activeSubsystem === 'acv' && (
                  <div className="flex gap-2 flex-wrap">
                    {SAMPLE_ACV_DATASETS.map((ds, idx) => (
                      <button
                        key={ds.fileId}
                        onClick={() => setSelectedAcvIndex(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                          selectedAcvIndex === idx
                            ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                            : 'bg-black/20 border-white/10 text-slate-300 hover:border-white/25'
                        }`}
                      >
                        {ds.name}
                      </button>
                    ))}
                  </div>
                )}

                {activeSubsystem === 'rail' && (
                  <div className="flex gap-2 flex-wrap">
                    {SAMPLE_RAIL_DATASETS.map((ds, idx) => (
                      <button
                        key={ds.fileId}
                        onClick={() => setSelectedRailIndex(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                          selectedRailIndex === idx
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                            : 'bg-black/20 border-white/10 text-slate-300 hover:border-white/25'
                        }`}
                      >
                        {ds.name}
                      </button>
                    ))}
                  </div>
                )}

                {activeSubsystem === 'shm' && (
                  <div className="flex gap-2 flex-wrap">
                    {SAMPLE_SHM_DATASETS.map((ds, idx) => (
                      <button
                        key={ds.fileId}
                        onClick={() => setSelectedShmIndex(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                          selectedShmIndex === idx
                            ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                            : 'bg-black/20 border-white/10 text-slate-300 hover:border-white/25'
                        }`}
                      >
                        {ds.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Raw CSV preview container */}
                <div className="mt-2 bg-[#06080C] border border-white/15 rounded-xl p-3.5 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
                  <div className="text-[11px] text-slate-400 font-bold uppercase mb-1 flex items-center justify-between">
                    <span>Source Telemetry Stream</span>
                    <span className="text-[#CBD5E1]">
                      {activeSubsystem === 'door' && currentDoor.fileId}
                      {activeSubsystem === 'acv' && currentAcv.fileId}
                      {activeSubsystem === 'rail' && currentRail.fileId}
                      {activeSubsystem === 'shm' && currentShm.fileId}
                    </span>
                  </div>
                  <pre className="text-slate-300 text-[11px] leading-relaxed whitespace-pre font-mono">
                    {activeSubsystem === 'door' && currentDoor.rawCsvData}
                    {activeSubsystem === 'acv' && currentAcv.rawCsvData}
                    {activeSubsystem === 'rail' && currentRail.rawCsvData}
                    {activeSubsystem === 'shm' && currentShm.rawCsvData}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-[#94A3B8]">
                  Paste or upload raw CSV time-series data for the {activeSubsystem.toUpperCase()} subsystem:
                </p>
                <textarea
                  value={customCsvInput}
                  onChange={(e) => setCustomCsvInput(e.target.value)}
                  placeholder={`Paste ${activeSubsystem} telemetry CSV lines here...`}
                  rows={6}
                  className={`w-full p-3 rounded-xl font-mono text-xs border focus:outline-none focus:ring-2 focus:ring-[#E11A2B] ${
                    isDarkMode
                      ? 'bg-[#06080C] border-white/20 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            )}

            {/* Upload held-out test file(s) -> run the REAL model via the backend */}
            <div className="mt-3">
              <label className="flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">upload_file</span>
                <span>Upload held-out {activeSubsystem.toUpperCase()} test file(s) to run the real model</span>
                <input
                  type="file"
                  multiple={activeSubsystem === 'rail' || activeSubsystem === 'shm'}
                  accept=".csv,.xlsx"
                  onChange={(e) => handleRealInference(e.target.files)}
                  className="hidden"
                />
                <span className="px-3 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-mono text-[11px] font-bold">
                  Choose file(s)
                </span>
              </label>
            </div>

            {/* Run Inference Button */}
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleRunInference}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-[#E11A2B] hover:bg-[#c91424] text-white font-mono text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg shadow-[#E11A2B]/40 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isProcessing ? 'sync' : 'neurology'}
                </span>
                {isProcessing ? 'Running SRT Inference...' : 'Run SRT Inference'}
              </button>

              <button
                type="button"
                onClick={handleConsultAiWithData}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Ask SRT AI
              </button>

              <button
                type="button"
                onClick={handleDownloadPredictions}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-mono text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download {activeSubsystem}_predictions.csv
              </button>
            </div>
          </div>

          {/* Subsystem Live Diagnostic Output Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDarkMode
                ? 'bg-[#12161F] border-white/15 text-white'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-headline-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E11A2B]">analytics</span>
                Predicted Diagnostics & Segment Timeline
              </h3>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                Model: Calibrated SMRT Transit Classifier
              </span>
            </div>

            {/* 1. DOOR PREDICTIONS DISPLAY */}
            {activeSubsystem === 'door' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentDoor.predictions.map((seg, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                        seg.prediction === 'Abnormal resistance'
                          ? 'bg-red-950/30 border-red-500/60 text-white'
                          : 'bg-black/30 border-white/10 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-300">
                          Segment #{idx + 1}: {seg.startTime.toFixed(1)}s – {seg.endTime.toFixed(1)}s
                        </span>
                        <span
                          className={`font-mono text-[11px] font-black px-2 py-0.5 rounded uppercase ${
                            seg.prediction === 'Abnormal resistance'
                              ? 'bg-red-600 text-white'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {seg.prediction}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-300">
                        <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 mb-1">
                          <span>Peak Current: {seg.peakCurrentA}A</span>
                          <span>Confidence: {Math.round(seg.confidence * 100)}%</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-300">{seg.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ACV PREDICTIONS DISPLAY */}
            {activeSubsystem === 'acv' && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#06080C] border border-white/15 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-[#94A3B8] uppercase font-bold block">
                      Ranked Cars (Highest → Lowest Refrigerant Leak Likelihood):
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl text-sky-400 font-black tracking-widest block mt-0.5">
                      {currentAcv.rankedCars}
                    </span>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="font-mono text-xs text-slate-400 block font-bold">Ambient Temp</span>
                    <span className="font-mono text-xl text-white font-black">{currentAcv.ambientTempC}°C</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-1">
                  {currentAcv.metrics.carMetrics.map((car) => (
                    <div
                      key={car.carId}
                      className={`p-2.5 sm:p-3 rounded-xl border flex flex-col justify-between ${
                        car.carId === '03'
                          ? 'bg-red-950/30 border-red-500/60'
                          : 'bg-black/30 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-white text-sm">Car {car.carId}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            car.leakProbability > 0.7
                              ? 'bg-red-600 text-white'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {Math.round(car.leakProbability * 100)}% Risk
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] font-mono text-slate-300 space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Superheat:</span>
                          <span className="font-bold text-white">{car.superheatK}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Discharge:</span>
                          <span className="font-bold text-white">{car.dischargeTempC}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Suction:</span>
                          <span className="font-bold text-white">{car.suctionPressureBar} bar</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duty:</span>
                          <span className="font-bold text-white">{car.compressorDutyPct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-300 mt-2 bg-black/20 p-3 rounded-xl border border-white/10">
                  <strong className="text-sky-400">Explainability:</strong> {currentAcv.metrics.explanation}
                </p>
              </div>
            )}

            {/* 3. RAIL CORRUGATION PREDICTIONS DISPLAY */}
            {activeSubsystem === 'rail' && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#06080C] border border-white/15 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-[#94A3B8] uppercase font-bold block">
                      Axle-Box Vibration Classification:
                    </span>
                    <span
                      className={`font-mono text-2xl sm:text-3xl font-black block mt-0.5 ${
                        currentRail.prediction === 'Side I'
                          ? 'text-amber-400'
                          : currentRail.prediction === 'Side II'
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {currentRail.prediction}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="font-mono text-xs text-slate-400 block font-bold">Spatial Chainage</span>
                    <span className="font-mono text-sm text-white font-black">{currentRail.chainage}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-2.5">
                  <div className="bg-black/30 border border-white/10 p-2.5 sm:p-3 rounded-xl text-center">
                    <span className="font-mono text-[11px] text-slate-400 block">Dominant Freq</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-white mt-0.5 block">
                      {currentRail.metrics.dominantFreqHz} Hz
                    </span>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-2.5 sm:p-3 rounded-xl text-center">
                    <span className="font-mono text-[11px] text-slate-400 block">RMS Vibration</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-amber-400 mt-0.5 block">
                      {currentRail.metrics.rmsVibration} m/s²
                    </span>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-2.5 sm:p-3 rounded-xl text-center">
                    <span className="font-mono text-[11px] text-slate-400 block">Peak Shock</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-red-400 mt-0.5 block">
                      {currentRail.metrics.peakShockG}G
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-1 bg-black/20 p-3 rounded-xl border border-white/10">
                  <strong className="text-amber-400">Explainability:</strong> {currentRail.metrics.explanation}
                </p>
              </div>
            )}

            {/* 4. SHM PREDICTIONS DISPLAY */}
            {activeSubsystem === 'shm' && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#06080C] border border-white/15 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-[#94A3B8] uppercase font-bold block">
                      Cumulative Fatigue Damage Regression Value:
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl text-purple-400 font-black block mt-0.5">
                      {currentShm.prediction.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="font-mono text-xs text-slate-400 block font-bold">Target Member</span>
                    <span className="font-mono text-sm text-white font-bold">{currentShm.structure}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-2.5">
                  <div className="bg-black/30 border border-white/10 p-2.5 sm:p-3 rounded-xl text-center">
                    <span className="font-mono text-[11px] text-slate-400 block">Peak Stress Range</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-white mt-0.5 block">
                      {currentShm.metrics.stressRangeMpa} MPa
                    </span>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-2.5 sm:p-3 rounded-xl text-center">
                    <span className="font-mono text-[11px] text-slate-400 block">Cycle Count</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-purple-400 mt-0.5 block">
                      {currentShm.metrics.cycleCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-2.5 sm:p-3 rounded-xl text-center">
                    <span className="font-mono text-[11px] text-slate-400 block">Life Consumed</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-emerald-400 mt-0.5 block">
                      {(currentShm.prediction * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-1 bg-black/20 p-3 rounded-xl border border-white/10">
                  <strong className="text-purple-400">Explainability:</strong> {currentShm.metrics.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dual-User Framing (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Dual-User Framing Diagnostic Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDarkMode
                ? 'bg-[#12161F] border-white/15 text-white'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#E11A2B] text-[22px]">
                {userRole === 'strategic' ? 'domain' : 'construction'}
              </span>
              <h3 className="font-headline-sm font-bold uppercase tracking-tight">
                {userRole === 'strategic' ? 'Strategic Control Room View' : 'Field Technician Tactical View'}
              </h3>
            </div>

            {userRole === 'strategic' ? (
              <div className="space-y-3 text-xs">
                <div className="bg-black/30 p-3.5 rounded-xl border border-white/10">
                  <span className="font-mono text-[#94A3B8] font-bold block uppercase text-[11px]">
                    Line-Wide Reliability & Passenger Impact:
                  </span>
                  <p className="text-slate-200 mt-1 leading-relaxed">
                    {activeSubsystem === 'door' && currentDoor.strategicImpact}
                    {activeSubsystem === 'acv' && currentAcv.strategicImpact}
                    {activeSubsystem === 'rail' && currentRail.strategicImpact}
                    {activeSubsystem === 'shm' && currentShm.strategicImpact}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/10">
                    <span className="text-slate-400 block">Mean Time to Detect</span>
                    <span className="font-bold text-emerald-400 text-sm">4.2 min</span>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/10">
                    <span className="text-slate-400 block">Repair Priority</span>
                    <span className="font-bold text-[#E11A2B] text-sm">TIER 1 (Nocturnal)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-black/30 p-3.5 rounded-xl border border-white/10">
                  <span className="font-mono text-[#E11A2B] font-bold block uppercase text-[11px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">security</span>
                    Immediate Physical Safety Protocol:
                  </span>
                  <p className="text-slate-200 mt-1 leading-relaxed">
                    750V DC third-rail isolation confirmed for Sector KP 18.42. Ensure portable earth grounding shoes attached before touching permanent-way components.
                  </p>
                </div>

                <div className="bg-black/30 p-3.5 rounded-xl border border-white/10">
                  <span className="font-mono text-[#94A3B8] font-bold block uppercase text-[11px]">
                    Offline Step-by-Step Troubleshooting:
                  </span>
                  <p className="text-slate-200 mt-1 leading-relaxed">
                    {activeSubsystem === 'door' && currentDoor.tacticalAction}
                    {activeSubsystem === 'acv' && currentAcv.tacticalAction}
                    {activeSubsystem === 'rail' && currentRail.tacticalAction}
                    {activeSubsystem === 'shm' && currentShm.tacticalAction}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
