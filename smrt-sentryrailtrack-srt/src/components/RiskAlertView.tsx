import React, { useState } from 'react';
import { RAIL_THERMAL_SCAN, AUTONOMOUS_TRACKBOT_ROBOT } from '../assets/assetUrls';

interface RiskAlertViewProps {
  onNavigateToAiAdvisor?: (prompt?: string) => void;
}

export const RiskAlertView: React.FC<RiskAlertViewProps> = ({ onNavigateToAiAdvisor }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExported, setIsExported] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExported(true);
    }, 1300);
  };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-space-lg">
      {/* Operational Countdown Notification Banner */}
      <div className="flex items-center justify-between bg-[#12161F] p-4 sm:p-5 rounded-2xl border-l-8 border-[#e11a2b] shadow-xl flex-wrap gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className="material-symbols-outlined text-[#e11a2b] text-[28px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <span className="text-sm sm:text-base text-white uppercase tracking-wider truncate font-mono font-black">
            REVENUE RUN BUFFER: 04:45 AM LAUNCH
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 font-mono">
          <span className="inline-block w-3 h-3 rounded-full bg-[#e11a2b] animate-ping"></span>
          <span className="text-xs sm:text-sm text-white bg-[#e11a2b] px-3 py-1 rounded-lg font-black uppercase shadow-md">
            SHIELD ACTIVE
          </span>
        </div>
      </div>

      {/* Top Impact Hero Card: Morning Peak Shield Status */}
      <section className="relative overflow-hidden bg-[#12161F] rounded-2xl border-2 border-white/10 shadow-xl">
        {/* Ambient Status Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e11a2b]/15 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>
        <div className="p-4 sm:p-8 flex flex-col gap-4 sm:gap-5 relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#e11a2b] text-white text-xs sm:text-sm uppercase font-black tracking-wider font-mono shadow-md">
                  DEFENSE MATRIX ACTIVE
                </span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] uppercase font-mono font-bold">
                  INTERVENTION REPORT #894
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl text-white tracking-tight font-black leading-tight">
                Morning Peak Shield: <span className="text-[#ff4d5e]">SECURED</span>
              </h1>
            </div>
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-[#191E2B] border-2 border-[#e11a2b]/50 flex items-center justify-center shrink-0 shadow-lg">
              <span
                className="material-symbols-outlined text-[#e11a2b] text-[28px] sm:text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
            Pre-emptive night interventions have mitigated{' '}
            <span className="text-white font-extrabold underline decoration-[#e11a2b] decoration-3">
              3 high-probability breakdown risks
            </span>{' '}
            for the 07:00 AM – 09:00 AM commuter rush hour. Track switch assemblies and signaling transponders calibrated within optimal margins.
          </p>

          {/* Key Status Bar Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#06080C] p-3 rounded-2xl border-2 border-white/10 shadow-inner">
            <div className="flex items-center gap-3.5 p-3.5 bg-[#191E2B] rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-[#e11a2b]/20 flex items-center justify-center shrink-0 text-[#e11a2b]">
                <span className="material-symbols-outlined text-[24px]">bolt</span>
              </div>
              <div className="flex flex-col min-w-0 font-mono">
                <span className="text-xs text-[#94A3B8] uppercase truncate font-bold">
                  Traction Circuit
                </span>
                <span className="text-sm sm:text-base text-white font-black truncate">ISOLATION SECURE</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 bg-[#191E2B] rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-[#e11a2b]/20 flex items-center justify-center shrink-0 text-[#e11a2b]">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div className="flex flex-col min-w-0 font-mono">
                <span className="text-xs text-[#94A3B8] uppercase truncate font-bold">LTA Clearance</span>
                <span className="text-sm sm:text-base text-white font-black truncate">READY TO AUDIT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Preventive Track Fault Chatbot Callout */}
      {onNavigateToAiAdvisor && (
        <div className="bg-gradient-to-r from-indigo-950/60 to-[#12161F] p-4 sm:p-5 rounded-2xl border-2 border-indigo-500/40 shadow-xl flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
              <span className="material-symbols-outlined text-[28px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg text-white font-black uppercase tracking-tight">
                  AI Track Fault Prevention Advisor
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#CBD5E1] mt-0.5">
                Generate pre-emptive nocturnal procedures for squats, fastener play, and switch blade interlocks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToAiAdvisor('Suggest preventive measures for the 3 high-probability breakdown risks identified in the Morning Peak Shield report.')}
            className="px-4 py-2.5 rounded-xl bg-[#e11a2b] hover:bg-[#c0001d] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition active:scale-95 shadow-lg shadow-[#e11a2b]/40 shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Consult AI Advisor</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Risk vs Relief Metrics Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-white/10 pb-2">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#e11a2b] text-[24px]">analytics</span>
            <h2 className="text-lg sm:text-xl text-white uppercase tracking-tight font-black">
              Public Scrutiny Mitigation
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-[#ffb4ab] uppercase font-mono font-black">AI RELIEF ENGINE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Metric 1 */}
          <div className="bg-[#12161F] p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-xl border-2 border-white/10">
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs sm:text-sm text-[#CBD5E1] uppercase font-bold">Riders Protected</span>
              <span className="material-symbols-outlined text-[#e11a2b] text-[22px]">groups</span>
            </div>
            <div className="flex flex-col font-mono">
              <span className="text-3xl sm:text-4xl text-white font-black tracking-tight">142,000</span>
              <span className="text-sm text-[#CBD5E1] font-medium mt-1">Commuters journey preserved</span>
            </div>
            <div className="w-full bg-[#06080C] h-2.5 rounded-full overflow-hidden mt-4 border border-white/15">
              <div className="bg-[#e11a2b] h-full rounded-full w-4/5"></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-[#12161F] p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-xl border-2 border-white/10">
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs sm:text-sm text-[#CBD5E1] uppercase font-bold">Sentiment Shield</span>
              <span className="material-symbols-outlined text-[#e11a2b] text-[22px]">trending_down</span>
            </div>
            <div className="flex flex-col font-mono">
              <span className="text-3xl sm:text-4xl text-[#ff4d5e] font-black tracking-tight">-88%</span>
              <span className="text-sm text-[#CBD5E1] font-medium mt-1">Viral complaint spike avoided</span>
            </div>
            <div className="w-full bg-[#06080C] h-2.5 rounded-full overflow-hidden mt-4 border border-white/15">
              <div className="bg-[#e11a2b] h-full rounded-full w-[88%]"></div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#12161F] p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-xl border-2 border-white/10">
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs sm:text-sm text-[#CBD5E1] uppercase font-bold">Cascading Delay Avoided</span>
              <span className="material-symbols-outlined text-white text-[22px]">schedule</span>
            </div>
            <div className="flex flex-col font-mono">
              <span className="text-3xl sm:text-4xl text-white font-black tracking-tight">38 MIN</span>
              <span className="text-sm text-[#CBD5E1] font-medium mt-1">DTL &amp; NSL trunk branches</span>
            </div>
            <div className="w-full bg-[#06080C] h-2.5 rounded-full overflow-hidden mt-4 border border-white/15">
              <div className="bg-white h-full rounded-full w-[70%]"></div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-[#12161F] p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-xl border-2 border-white/10">
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs sm:text-sm text-[#CBD5E1] uppercase font-bold">Platform Crowd Risk</span>
              <span className="material-symbols-outlined text-emerald-400 text-[22px]">domain_verification</span>
            </div>
            <div className="flex flex-col font-mono">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl text-emerald-400 font-black tracking-tight">1.2</span>
                <span className="text-base text-[#94A3B8] font-bold">/ 10</span>
              </div>
              <span className="text-sm text-emerald-300 font-extrabold mt-1">STABLE &amp; SAFE (NOMINAL)</span>
            </div>
            <div className="w-full bg-[#06080C] h-2.5 rounded-full overflow-hidden mt-4 border border-white/15">
              <div className="bg-emerald-500 h-full rounded-full w-[12%]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Predictive Breakdown Heatmap & Sector Map */}
      <section className="bg-[#12161F] rounded-2xl p-5 sm:p-6 flex flex-col gap-5 shadow-xl border-2 border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#e11a2b] text-[24px]">alt_route</span>
              <h2 className="text-lg sm:text-xl text-white uppercase font-black">
                Predictive Stress Heatmap
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-[#CBD5E1] mt-0.5">TrackBot-04 Autonomous Patch Log</span>
          </div>
          <span className="px-3 py-1 rounded-lg bg-[#222838] text-white text-xs sm:text-sm border border-white/15 font-mono font-bold">
            02:40 AM POST-FIX
          </span>
        </div>

        {/* Heatmap Stations Segment */}
        <div className="flex flex-col gap-3 bg-[#06080C] p-3 sm:p-4 rounded-2xl border-2 border-white/10 font-mono">
          {/* Station Row: City Hall */}
          <div
            onClick={() => setSelectedStation(selectedStation === 'CTH' ? null : 'CTH')}
            className={`flex items-center justify-between p-4 bg-[#12161F] rounded-xl transition-all border-2 cursor-pointer ${
              selectedStation === 'CTH' ? 'border-[#e11a2b] bg-[#191E2B]' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-4 h-4 rounded-full bg-[#e11a2b] shrink-0 shadow-[0_0_10px_rgba(225,26,43,0.9)]"></div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base text-white font-black truncate">
                  CITY HALL (NS25 / EW13)
                </span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] truncate mt-0.5">
                  Turnout Points 104A • Contact Rail Fastener Refastened
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm line-through text-[#ff4d5e] font-bold">RED 89%</span>
                <span className="text-base sm:text-lg text-white font-black">14%</span>
              </div>
              <span className="text-xs text-emerald-400 uppercase font-black bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded mt-0.5">
                STABILIZED
              </span>
            </div>
          </div>

          {/* Station Row: Raffles Place */}
          <div
            onClick={() => setSelectedStation(selectedStation === 'RFP' ? null : 'RFP')}
            className={`flex items-center justify-between p-4 bg-[#12161F] rounded-xl transition-all border-2 cursor-pointer ${
              selectedStation === 'RFP' ? 'border-[#e11a2b] bg-[#191E2B]' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-4 h-4 rounded-full bg-[#e11a2b] shrink-0 shadow-[0_0_10px_rgba(225,26,43,0.9)]"></div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base text-white font-black truncate">
                  RAFFLES PLACE (NS26 / EW14)
                </span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] truncate mt-0.5">
                  Interlocking Rail Joint Micro-Weld Ground &amp; Polished
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm line-through text-[#94A3B8] font-bold">PRIOR 72%</span>
                <span className="text-base sm:text-lg text-white font-black">08%</span>
              </div>
              <span className="text-xs text-emerald-400 uppercase font-black bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded mt-0.5">
                OPTIMAL
              </span>
            </div>
          </div>

          {/* Station Row: Dhoby Ghaut */}
          <div
            onClick={() => setSelectedStation(selectedStation === 'DBG' ? null : 'DBG')}
            className={`flex items-center justify-between p-4 bg-[#12161F] rounded-xl transition-all border-2 cursor-pointer ${
              selectedStation === 'DBG' ? 'border-[#e11a2b] bg-[#191E2B]' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-4 h-4 rounded-full bg-[#e11a2b] shrink-0 shadow-[0_0_10px_rgba(225,26,43,0.9)]"></div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base text-white font-black truncate">
                  DHOBY GHAUT (NE6 / CC1)
                </span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] truncate mt-0.5">
                  Vibration Sensor Calibration &amp; Debris Clearance
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm line-through text-[#ff4d5e] font-bold">RED 81%</span>
                <span className="text-base sm:text-lg text-white font-black">11%</span>
              </div>
              <span className="text-xs text-emerald-400 uppercase font-black bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded mt-0.5">
                CALIBRATED
              </span>
            </div>
          </div>

          {/* Station Row: Jurong East */}
          <div
            onClick={() => setSelectedStation(selectedStation === 'JUR' ? null : 'JUR')}
            className={`flex items-center justify-between p-4 bg-[#12161F] rounded-xl transition-all border-2 cursor-pointer ${
              selectedStation === 'JUR' ? 'border-[#e11a2b] bg-[#191E2B]' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-4 h-4 rounded-full bg-[#e11a2b] shrink-0 shadow-[0_0_10px_rgba(225,26,43,0.9)]"></div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base text-white font-black truncate">
                  JURONG EAST (NS1 / EW24)
                </span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] truncate mt-0.5">
                  Crossover Switch Lubrication &amp; Gauge Check (1435mm)
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm line-through text-[#94A3B8] font-bold">PRIOR 65%</span>
                <span className="text-base sm:text-lg text-white font-black">06%</span>
              </div>
              <span className="text-xs text-emerald-400 uppercase font-black bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded mt-0.5">
                NORMALIZED
              </span>
            </div>
          </div>
        </div>

        {/* Visual Track Schematic Inline SVG */}
        <div className="bg-[#06080C] p-4 rounded-2xl flex flex-col gap-3 border-2 border-white/10 font-mono shadow-inner">
          <div className="flex justify-between items-center text-[#CBD5E1] flex-wrap gap-2">
            <span className="text-xs uppercase font-bold">
              Trunk Corridor Vector Stress (Pre vs Post Bot Intervention)
            </span>
            <span className="text-xs text-emerald-400 font-black">NORMALIZED • ZERO DRIFT</span>
          </div>

          <div className="w-full overflow-x-auto py-2">
            <svg className="w-full h-14 overflow-visible" preserveAspectRatio="none" viewBox="0 0 340 44">
              {/* Rail Bed Guideline */}
              <line stroke="#272a2e" strokeLinecap="round" strokeWidth="6" x1="10" x2="330" y1="20" y2="20" />
              <line
                stroke="#ffffff"
                strokeDasharray="6,4"
                strokeLinecap="round"
                strokeWidth="2.5"
                x1="10"
                x2="330"
                y1="20"
                y2="20"
              />
              {/* Station 1: City Hall */}
              <circle cx="40" cy="20" fill="#181b20" r="7" stroke="#e11a2b" strokeWidth="2.5" />
              <circle cx="40" cy="20" fill="#e11a2b" r="3.5" />
              <text fill="#ffffff" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle" x="40" y="38">
                CTH
              </text>
              {/* Interlink TrackBot-04 Tag */}
              <line stroke="#e11a2b" strokeWidth="3" x1="40" x2="130" y1="20" y2="20" />
              {/* Station 2: Raffles Place */}
              <circle cx="130" cy="20" fill="#181b20" r="7" stroke="#e11a2b" strokeWidth="2.5" />
              <circle cx="130" cy="20" fill="#e11a2b" r="3.5" />
              <text fill="#ffffff" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle" x="130" y="38">
                RFP
              </text>
              {/* Interlink */}
              <line stroke="#e11a2b" strokeWidth="3" x1="130" x2="220" y1="20" y2="20" />
              {/* Station 3: Dhoby Ghaut */}
              <circle cx="220" cy="20" fill="#181b20" r="7" stroke="#e11a2b" strokeWidth="2.5" />
              <circle cx="220" cy="20" fill="#e11a2b" r="3.5" />
              <text fill="#ffffff" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle" x="220" y="38">
                DBG
              </text>
              {/* Interlink */}
              <line stroke="#e11a2b" strokeWidth="3" x1="220" x2="300" y1="20" y2="20" />
              {/* Station 4: Jurong East */}
              <circle cx="300" cy="20" fill="#181b20" r="7" stroke="#e11a2b" strokeWidth="2.5" />
              <circle cx="300" cy="20" fill="#e11a2b" r="3.5" />
              <text fill="#ffffff" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle" x="300" y="38">
                JUR
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* Inspection Snapshot Visual Evidence */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-[#12161F] aspect-video border-2 border-white/10 group">
          <img
            className="w-full h-full object-cover transition group-hover:scale-105"
            alt="FLIR Thermal Camera sensor check"
            src={RAIL_THERMAL_SCAN}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-[#06080C]/40 to-transparent flex flex-col justify-end p-4 font-mono">
            <span className="text-xs sm:text-sm text-[#ffb4ab] uppercase font-black">FLIR SENSOR CHECK</span>
            <span className="text-sm sm:text-base text-white font-extrabold">31.4°C NORMALIZED</span>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-[#12161F] aspect-video border-2 border-white/10 group">
          <img
            className="w-full h-full object-cover transition group-hover:scale-105"
            alt="Fastener Torque tightening by TrackBot"
            src={AUTONOMOUS_TRACKBOT_ROBOT}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-[#06080C]/40 to-transparent flex flex-col justify-end p-4 font-mono">
            <span className="text-xs sm:text-sm text-[#ffb4ab] uppercase font-black">FASTENER TORQUE</span>
            <span className="text-sm sm:text-base text-white font-extrabold">620 Nm LOCKED</span>
          </div>
        </div>
      </section>

      {/* Ground Crew Psychological Reassurance Card */}
      <section className="bg-[#0E121A] rounded-2xl p-6 sm:p-7 flex items-start gap-4 sm:gap-5 shadow-xl border-2 border-white/10">
        <div className="w-12 h-12 rounded-xl bg-[#191E2B] border-2 border-[#e11a2b]/40 flex items-center justify-center shrink-0 shadow-inner">
          <span className="material-symbols-outlined text-[#e11a2b] text-[28px]">sentiment_very_satisfied</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl text-white font-black">Ground Team Reassurance</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#e11a2b]"></span>
          </div>
          <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
            Night window handoff clean. Zero open critical defects. Track isolation release signals acknowledged. Operations control center cleared for 100% normal revenue frequency.
          </p>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[#CBD5E1] font-mono flex-wrap">
            <span className="text-xs sm:text-sm uppercase text-white font-black bg-[#191E2B] px-3 py-1 rounded-lg border border-white/10">
              Duty Controller: Lead Eng. Tan (Staff #4419)
            </span>
            <span className="text-xs sm:text-sm uppercase text-emerald-400 font-bold">✓ Handshake Verified</span>
          </div>
        </div>
      </section>

      {/* 'Scrutiny Safeguard' Compliance Export Section */}
      <section className="bg-[#12161F] rounded-2xl p-6 sm:p-7 flex flex-col gap-5 shadow-2xl border-2 border-white/10 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#e11a2b] text-[26px]">fact_check</span>
            <h3 className="text-xl sm:text-2xl text-white uppercase tracking-tight font-black">
              Scrutiny Safeguard Protocol
            </h3>
          </div>
          <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
            Pre-cleared digital telemetry dossier proving all preemptive repairs occurred strictly within nocturnal curfew before 04:45 AM revenue departure.
          </p>
        </div>

        {/* Export Action Button */}
        <button
          className={`w-full min-h-[64px] py-3 px-6 rounded-2xl text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all font-black cursor-pointer ${
            isExported
              ? 'bg-[#191E2B] text-white border-2 border-emerald-500 shadow-emerald-950/40'
              : 'bg-[#e11a2b] hover:bg-[#c0001d] text-white shadow-[#e11a2b]/30'
          }`}
          id="exportComplianceBtn"
          type="button"
          disabled={isExporting}
          onClick={handleExport}
        >
          <span className={`material-symbols-outlined text-[26px] ${isExporting ? 'animate-spin' : ''}`}>
            {isExporting ? 'hourglass_top' : isExported ? 'task_alt' : 'receipt_long'}
          </span>
          <span className="text-center">
            {isExporting
              ? 'COMPILING TELEMETRY & SIGNATURES...'
              : isExported
              ? 'COMPLIANCE DOSSIER SECURED & LOGGED ✓'
              : 'Generate Morning Executive & LTA Compliance Brief'}
          </span>
        </button>

        {/* Post Generation Verification Pill */}
        {isExported && (
          <div
            className="p-4 sm:p-5 bg-[#191E2B] rounded-2xl border-2 border-emerald-500/50 flex items-center justify-between font-mono animate-fade-in flex-wrap gap-3 shadow-lg"
            id="complianceSuccessAlert"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-emerald-400 text-[26px] shrink-0">mark_email_read</span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm text-white font-black uppercase truncate">
                  DISPATCHED TO LTA CHIEF AUDIT
                </span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] truncate mt-0.5">
                  Hash: 8d92f...a10e • 03:12 AM GMT+8
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-emerald-900/60 text-emerald-300 text-xs sm:text-sm border border-emerald-400/40 font-black">
              DOWNLOADED
            </span>
          </div>
        )}
      </section>
    </div>
  );
};
