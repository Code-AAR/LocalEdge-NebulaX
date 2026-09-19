import React, { useState, useEffect } from 'react';
import { TabType, TelemetryLog } from '../types';
import { LiDARModal } from './LiDARModal';
import { useTrackBot } from '../context/TrackBotContext';
import { TrackBotSelectorBar } from './TrackBotSelector';

interface TelemetryViewProps {
  onNavigate: (tab: TabType, promptTemplate?: string) => void;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ onNavigate }) => {
  const { selectedBot, toggleSelectedBotHold, setIsSelectorModalOpen } = useTrackBot();
  const isHeld = selectedBot.status === 'HELD';
  const [showLidar, setShowLidar] = useState<boolean>(false);
  const [logs, setLogs] = useState<TelemetryLog[]>(selectedBot.defaultLogs);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize telemetry logs when selected bot changes
  useEffect(() => {
    if (selectedBot?.defaultLogs) {
      setLogs(selectedBot.defaultLogs);
    }
  }, [selectedBot.id]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const toggleHold = () => {
    const { nextState, message } = toggleSelectedBotHold();
    triggerToast(message);
    if (nextState) {
      setLogs((prev) => [
        {
          id: Date.now().toString(),
          time: new Date().toTimeString().split(' ')[0] + '.10',
          message: `COMMAND: ${selectedBot.name} HOLD ORDER CONFIRMED BY CONTROLLER`,
          status: 'ALERT',
          isAlert: true,
        },
        ...prev.slice(0, 5),
      ]);
    } else {
      setLogs((prev) => [
        {
          id: Date.now().toString(),
          time: new Date().toTimeString().split(' ')[0] + '.20',
          message: `${selectedBot.name} AUTONOMOUS PATROL RESTORED (${selectedBot.speedKmH} KM/H)`,
          status: 'CLEAR',
        },
        ...prev.slice(0, 5),
      ]);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 sm:gap-6 px-3 sm:px-6 py-3 sm:py-4 max-w-4xl mx-auto">
      {/* Toast alert indicator */}
      {toastMessage && (
        <div className="sticky top-20 sm:top-24 z-40 p-3 bg-[#E11A2B] text-white rounded-xl font-mono text-xs sm:text-base font-extrabold text-center shadow-2xl border-2 border-white/40 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* SMRT TrackBot Fleet Interactive Selector Bar */}
      <TrackBotSelectorBar onOpenModal={() => setIsSelectorModalOpen(true)} />

      {/* Stressor Prevention & Zero-Delay Target Notification Banner */}
      <div className="bg-[#12161F] border-l-4 sm:border-l-6 border-[#E11A2B] rounded-r-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-xl relative overflow-hidden border-y border-r border-white/15">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#E11A2B]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-[#E11A2B] flex items-center justify-center shrink-0 text-white shadow-lg shadow-[#E11A2B]/40">
          <span
            className="material-symbols-outlined text-[24px] sm:text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#E11A2B] text-white font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
              SMRT Stressor Mitigation
            </span>
            <span className="text-[#94A3B8] font-mono text-[10px] sm:text-xs tracking-wider uppercase font-semibold">
              ISO-55001 ASSET CRITICALITY
            </span>
          </div>
          <p className="font-headline-sm text-base sm:text-xl text-white font-extrabold tracking-tight mt-1">
            Zero Delay Target: Pre-empting Peak Hour Bottlenecks
          </p>
          <p className="text-xs sm:text-base text-[#CBD5E1] mt-0.5 sm:mt-1 leading-relaxed">
            Corridor in focus: <strong className="text-white">{selectedBot.corridor}</strong> ({selectedBot.sector}). Zero passenger disruptions tolerated for morning peak revenue trains.
          </p>
        </div>
      </div>

      {/* Hero: Active Robot Unit Status Card */}
      <div className="bg-[#12161F] rounded-2xl overflow-hidden shadow-2xl relative border border-white/15">
        <div className="h-1.5 sm:h-2 bg-[#E11A2B]"></div>
        <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
          {/* Unit Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="relative w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-[#06080C] border-2 border-white/15 flex items-center justify-center text-[#E11A2B] shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[26px] sm:text-[32px]">smart_toy</span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E11A2B] animate-ping"></span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E11A2B]"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline-md text-lg sm:text-2xl text-white font-black tracking-tight truncate">
                    {selectedBot.name}
                  </span>
                  <span
                    className={`font-mono text-[11px] sm:text-sm font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md uppercase border ${
                      isHeld
                        ? 'bg-amber-500/25 text-amber-300 border-amber-400'
                        : 'bg-[#E11A2B]/25 text-[#E11A2B] border-[#E11A2B]'
                    }`}
                  >
                    {isHeld ? 'HELD' : selectedBot.status}
                  </span>
                </div>
                <span className="text-xs sm:text-base text-[#94A3B8] font-medium truncate mt-0.5">
                  {selectedBot.corridor} / {selectedBot.callsign}
                </span>
              </div>
            </div>
            <div className="bg-[#06080C] border border-white/15 px-3 py-1.5 rounded-lg flex items-center justify-between sm:flex-col sm:items-end shrink-0 shadow-inner">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-white">wifi_tethering</span>
                <span className="font-mono text-xs sm:text-base text-white font-extrabold">{selectedBot.latencyMs}ms</span>
              </div>
              <span className="font-mono text-[10px] sm:text-xs text-[#94A3B8] uppercase tracking-wider block font-semibold">
                {selectedBot.connectionType}
              </span>
            </div>
          </div>

          {/* Live Imagery Slice with HUD */}
          <div className="relative w-full h-40 sm:h-52 rounded-xl overflow-hidden bg-[#06080C] border border-white/15 group shadow-inner">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={`${selectedBot.name} inspects track permanent way`}
              src={selectedBot.imageUrl}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-[#06080C]/35 to-transparent"></div>
            <div className="absolute top-2.5 left-2.5 bg-[#06080C]/95 border border-white/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#E11A2B] animate-pulse"></span>
              <span className="font-mono text-[11px] sm:text-sm text-white font-extrabold tracking-wider">
                {selectedBot.liveFeedLabel}
              </span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex flex-col xs:flex-row justify-between items-start xs:items-end gap-1.5">
              <div className="font-mono text-[10px] sm:text-sm text-white bg-[#06080C]/95 border border-white/20 px-2.5 py-1 rounded-lg tracking-tight font-bold shadow-md truncate max-w-full">
                {selectedBot.locationCode}
              </div>
              <div
                className={`font-mono text-[10px] sm:text-sm text-white font-extrabold px-2.5 py-1 rounded-lg shadow-lg shrink-0 ${
                  isHeld ? 'bg-amber-600' : 'bg-[#E11A2B]'
                }`}
              >
                SPEED: {isHeld ? '0.0 KM/H (HOLD)' : `${selectedBot.speedKmH} KM/H`}
              </div>
            </div>
          </div>

          {/* Critical Metrics Telemetry Grid - Large & High Readability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Battery */}
            <div className="bg-[#06080C] border border-white/15 p-3.5 sm:p-4 rounded-xl flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[#CBD5E1]">
                <span className="font-mono text-[11px] sm:text-xs uppercase font-extrabold tracking-wider">
                  BATTERY
                </span>
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-white">battery_charging_90</span>
              </div>
              <div className="mt-1.5 sm:mt-2">
                <span className="font-mono text-2xl sm:text-3xl text-white font-black">
                  {selectedBot.batteryPct}%
                </span>
                <div className="w-full bg-[#191E2B] h-2 sm:h-2.5 rounded-full mt-1.5 sm:mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${selectedBot.batteryPct}%` }}></div>
                </div>
              </div>
            </div>

            {/* Primary Bot Metric */}
            <div className="bg-[#06080C] border border-white/15 p-3.5 sm:p-4 rounded-xl flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[#CBD5E1]">
                <span className="font-mono text-[11px] sm:text-xs uppercase font-extrabold tracking-wider truncate">
                  {selectedBot.primaryMetric.label}
                </span>
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-[#E11A2B]">speed</span>
              </div>
              <div className="mt-1.5 sm:mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl sm:text-3xl text-[#E11A2B] font-black">
                    {selectedBot.primaryMetric.value}
                  </span>
                  <span className="font-mono text-xs text-[#94A3B8] font-bold">
                    {selectedBot.primaryMetric.unit}
                  </span>
                </div>
                <div className="w-full bg-[#191E2B] h-2 sm:h-2.5 rounded-full mt-1.5 sm:mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedBot.primaryMetric.barPct}%`,
                      backgroundColor: selectedBot.primaryMetric.color || '#E11A2B',
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Secondary Bot Metric */}
            <div className="bg-[#06080C] border border-white/15 p-3.5 sm:p-4 rounded-xl flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[#CBD5E1]">
                <span className="font-mono text-[11px] sm:text-xs uppercase font-extrabold tracking-wider truncate">
                  {selectedBot.secondaryMetric.label}
                </span>
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-sky-400">tune</span>
              </div>
              <div className="mt-1.5 sm:mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl sm:text-3xl text-sky-400 font-black">
                    {selectedBot.secondaryMetric.value}
                  </span>
                  <span className="font-mono text-xs text-[#94A3B8] font-bold">
                    {selectedBot.secondaryMetric.unit}
                  </span>
                </div>
                <div className="w-full bg-[#191E2B] h-2 sm:h-2.5 rounded-full mt-1.5 sm:mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedBot.secondaryMetric.barPct}%`,
                      backgroundColor: selectedBot.secondaryMetric.color || '#38BDF8',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Night Window Countdown Banner */}
      <div className="bg-[#12161F] border border-white/15 rounded-2xl p-5 shadow-lg flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <span
              className="material-symbols-outlined text-[24px] text-[#E11A2B] animate-spin"
              style={{ animationDuration: '8s' }}
            >
              timelapse
            </span>
            <span className="text-base sm:text-lg uppercase tracking-wide font-extrabold">
              Possession Window Active
            </span>
          </div>
          <span className="font-mono text-xs sm:text-sm bg-[#E11A2B] text-white font-extrabold px-3 py-1 rounded-md shadow-md">
            01H 48M LEFT
          </span>
        </div>
        <div className="flex items-center justify-between text-[#CBD5E1] text-xs sm:text-sm mt-0.5 flex-wrap gap-2 font-mono">
          <span>Closure: 01:30 → 04:30 AM</span>
          <span className="text-white font-bold">First Revenue Train: 05:12 AM</span>
        </div>
        {/* Progress visual indicator bar */}
        <div className="w-full bg-[#06080C] border border-white/15 h-3 rounded-full mt-1.5 overflow-hidden flex">
          <div
            className="bg-[#E11A2B] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(225,26,43,0.9)]"
            style={{ width: '60%' }}
          ></div>
        </div>
      </div>

      {/* Interactive Mini Tunnel Schematic & Track Section View */}
      <div className="bg-[#12161F] border border-white/15 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl text-white font-extrabold tracking-tight uppercase">
              Subterranean Track Map
            </h3>
            <span className="text-xs sm:text-sm text-[#94A3B8] font-medium">
              Changi / Jurong Line Junction Segments
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#E11A2B]/20 border border-[#E11A2B]/50 px-3 py-1 rounded-lg">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E11A2B] animate-ping"></span>
            <span className="font-mono text-xs sm:text-sm text-white font-extrabold tracking-wider">
              1 HOTSPOT
            </span>
          </div>
        </div>

        {/* Schematic Visualizer Container */}
        <div className="relative bg-[#06080C] border border-white/15 rounded-xl p-3.5 sm:p-5 overflow-hidden flex flex-col gap-3 sm:gap-4">
          {/* Coordinate Ruler / Chainage Scale */}
          <div className="flex justify-between items-center text-[#94A3B8] font-mono text-[10px] sm:text-sm pb-1 font-semibold overflow-x-auto">
            <span>KP 18.00</span>
            <span className="hidden xs:inline">KP 18.25</span>
            <span className="text-white font-extrabold bg-[#191E2B] px-1.5 sm:px-2 py-0.5 rounded-md border border-white/30 text-[10px] sm:text-xs">
              KP 18.42 (ROBOT)
            </span>
            <span className="hidden xs:inline">KP 18.70</span>
            <span>KP 19.00</span>
          </div>

          {/* Tunnel Tube Simulation (Dual Rails) */}
          <div className="relative h-20 w-full flex flex-col justify-between py-2">
            {/* Top Rail Line */}
            <div className="w-full h-1.5 bg-white/30 rounded relative">
              <div className="absolute inset-0 flex justify-between px-1 opacity-40">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="w-1 h-full bg-white"></span>
                ))}
              </div>
            </div>

            {/* Hotspot Indicator Zone at KP 18.42 */}
            <div className="absolute left-[44%] top-1 bottom-1 w-14 sm:w-16 bg-[#E11A2B]/25 border-2 border-[#E11A2B] rounded-lg flex flex-col items-center justify-center p-0.5 shadow-[0_0_16px_rgba(225,26,43,0.6)]">
              <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-white animate-bounce">
                priority_high
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-white font-black leading-none uppercase">
                HOTSPOT
              </span>
            </div>

            {/* Robot Position Glyph */}
            <div className="absolute left-[47%] -top-2 transform -translate-x-1/2 flex flex-col items-center z-10">
              <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white flex items-center justify-center text-[#0B0E14] shadow-xl shadow-white/50 border-2 border-[#E11A2B]">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">precision_manufacturing</span>
              </div>
              <div className="w-1 sm:w-1.5 h-2.5 sm:h-3 bg-[#E11A2B] rounded-full mt-0.5"></div>
            </div>

            {/* Upcoming Torque Test Segment */}
            <div className="absolute right-[8%] sm:right-[12%] top-2 bottom-2 w-20 sm:w-24 bg-[#191E2B] border border-white/30 rounded-lg flex items-center justify-center px-1">
              <span className="font-mono text-[10px] sm:text-xs text-white tracking-wider uppercase font-bold text-center">
                Torque 18.8
              </span>
            </div>

            {/* Bottom Rail Line */}
            <div className="w-full h-1.5 bg-white/30 rounded relative">
              <div className="absolute -bottom-5 left-0 right-0 flex items-center justify-between text-[#94A3B8] font-mono text-[9px] sm:text-xs">
                <span className="flex items-center gap-1.5 text-white font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#E11A2B]"></span> 750V DC ISOLATED
                </span>
                <span className="text-[#94A3B8] truncate">AIRFLOW: 1.4 m/s</span>
              </div>
            </div>
          </div>

          {/* Segment Details Tag Strip */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 mt-4 pt-1">
            <div className="bg-[#12161F] border border-white/15 p-2.5 sm:p-3 rounded-xl flex items-center justify-between">
              <span className="text-[#CBD5E1] text-xs sm:text-sm font-medium">Detected Play:</span>
              <span className="font-mono text-sm sm:text-base text-[#E11A2B] font-black">
                +0.42 mm
              </span>
            </div>
            <div className="bg-[#12161F] border border-white/15 p-2.5 sm:p-3 rounded-xl flex items-center justify-between">
              <span className="text-[#CBD5E1] text-xs sm:text-sm font-medium">Sleeper Index:</span>
              <span className="font-mono text-sm sm:text-base text-white font-black">
                #4092-B
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Autonomous Action Callout Card */}
      <div className="bg-[#12161F] border border-white/15 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[#E11A2B]">
          <span className="material-symbols-outlined text-[22px] sm:text-[24px] animate-pulse">record_voice_over</span>
          <span className="text-sm sm:text-lg uppercase tracking-wide font-black text-white">
            Live Autonomous Subroutine
          </span>
        </div>
        <div className="bg-[#06080C] border border-white/15 p-3.5 sm:p-5 rounded-xl flex items-start gap-3 sm:gap-4">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-[#E11A2B]/20 border border-[#E11A2B]/50 flex items-center justify-center shrink-0 text-[#E11A2B] mt-0.5 shadow-inner">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">hearing</span>
          </div>
          <div className="flex flex-col">
            <p className="text-xs sm:text-base text-white font-medium leading-relaxed">
              Executing acoustic resonance sweep on outer rail flange. Anomaly detected: clip looseness (
              <span className="text-[#E11A2B] font-extrabold">0.42mm play</span>) at sleeper{' '}
              <span className="text-white font-extrabold">#4092</span>.
            </p>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-[#94A3B8] font-mono text-[10px] sm:text-sm flex-wrap">
              <span>
                PULSE FREQ: <span className="text-white font-bold">42.8 kHz</span>
              </span>
              <span>
                CONFIDENCE: <span className="text-white font-bold">98.4%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Intervention Quick Action Buttons - Chunky & Easy to Tap */}
      <div className="flex flex-col gap-2">
        <span className="text-xs sm:text-sm text-[#94A3B8] uppercase tracking-wider px-1 font-bold font-mono">
          Tactical Intervention Controls
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Direct Prompt CTA */}
          <button
            onClick={() =>
              onNavigate(
                'ai-prompt-&-dispatch',
                selectedBot.samplePrompt
              )
            }
            className="flex items-center justify-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl bg-[#E11A2B] text-white font-headline-sm uppercase transition active:scale-98 shadow-xl shadow-[#E11A2B]/40 hover:bg-[#c91424] cursor-pointer min-h-[54px] sm:min-h-[64px]"
          >
            <span className="material-symbols-outlined text-[24px] sm:text-[28px]">terminal</span>
            <span className="font-mono text-xs sm:text-base font-extrabold tracking-wider truncate">
              Send Prompt ({selectedBot.name})
            </span>
          </button>

          {/* Pause & Hold CTA */}
          <button
            onClick={toggleHold}
            className={`flex items-center justify-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl border-2 text-white transition active:scale-98 shadow-xl cursor-pointer min-h-[54px] sm:min-h-[64px] ${
              isHeld
                ? 'bg-amber-600 border-amber-400 text-white'
                : 'bg-[#191E2B] border-white/20 hover:bg-[#222838]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px] sm:text-[28px] text-[#E11A2B]">
              {isHeld ? 'play_circle' : 'pause_circle'}
            </span>
            <span className="font-mono text-xs sm:text-base font-extrabold tracking-wider uppercase">
              {isHeld ? 'Resume Unit' : 'Hold Unit'}
            </span>
          </button>

          {/* 3D LiDAR Cam CTA */}
          <button
            onClick={() => setShowLidar(true)}
            className="flex items-center justify-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl bg-[#191E2B] border-2 border-white/20 text-white hover:bg-[#222838] transition active:scale-98 shadow-xl cursor-pointer min-h-[54px] sm:min-h-[64px]"
          >
            <span className="material-symbols-outlined text-[24px] sm:text-[28px] text-sky-400">view_in_ar</span>
            <span className="font-mono text-xs sm:text-base font-extrabold tracking-wider uppercase">
              3D LiDAR
            </span>
          </button>
        </div>
      </div>

      {/* Sensor Telemetry Feed (Monospace Log Console) */}
      <div className="bg-[#12161F] border border-white/15 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] sm:text-[22px] text-[#E11A2B]">data_object</span>
            <h4 className="text-sm sm:text-lg text-white font-extrabold tracking-tight uppercase">
              Sensor Telemetry Feed
            </h4>
          </div>
          <span className="font-mono text-[10px] sm:text-sm text-[#94A3B8] font-bold">
            SYNC: LIVE
          </span>
        </div>

        {/* Live Telemetry Stream Console */}
        <div className="bg-[#06080C] border border-white/15 rounded-xl p-2.5 sm:p-4 text-xs sm:text-sm text-[#CBD5E1] flex flex-col gap-2 overflow-hidden">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 border-b border-white/10 py-1.5 px-2 rounded-lg ${
                log.isAlert ? 'bg-[#E11A2B]/15 border-[#E11A2B]/40' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`${log.isAlert ? 'text-[#E11A2B]' : 'text-[#94A3B8]'} shrink-0 font-mono font-semibold text-[11px] sm:text-xs`}>
                  [{log.time}]
                </span>
                <span
                  className={`truncate font-mono text-[11px] sm:text-sm ${
                    log.isAlert ? 'text-[#E11A2B] font-bold' : 'text-white'
                  }`}
                >
                  {log.message}
                </span>
              </div>
              <span
                className={`font-mono font-black self-start sm:self-auto shrink-0 px-2 py-0.5 rounded text-[10px] sm:text-xs ${
                  log.isAlert
                    ? 'bg-[#E11A2B] text-white'
                    : log.status === 'OK'
                    ? 'bg-white/15 text-white'
                    : log.status === 'ARMED'
                    ? 'text-[#E11A2B] bg-[#E11A2B]/10'
                    : 'text-[#CBD5E1] bg-white/10'
                }`}
              >
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3D LiDAR Modal */}
      <LiDARModal isOpen={showLidar} onClose={() => setShowLidar(false)} />
    </div>
  );
};
