import React, { useState } from 'react';
import { TECH_AVATAR_URL } from './Header';
import { RAIL_THERMAL_SCAN, POST_REPAIR_THERMAL } from '../assets/assetUrls';

export const SelfHealView: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'welding' | 'clips' | 'signoff'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isSignedOff, setIsSignedOff] = useState<boolean>(false);
  const [activeThermalTab, setActiveThermalTab] = useState<'split' | 'pre' | 'post'>('split');

  const handleSignOff = () => {
    setIsSignedOff(true);
    setTimeout(() => {
      setIsDrawerOpen(false);
    }, 1200);
  };

  const matchesFilter = (category: string) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'welding') return category.includes('welding');
    if (activeFilter === 'clips') return category.includes('clips');
    if (activeFilter === 'signoff') return category.includes('signoff');
    return true;
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-space-lg space-y-4 sm:space-y-6 px-3 sm:px-6 py-3 sm:py-4">
      {/* Possession Countdown & Status Banner */}
      <div className="flex flex-col gap-4">
        <div className="bg-[#0E121A] border-2 border-white/15 p-4 sm:p-6 rounded-2xl shadow-xl flex items-center justify-between gap-3 relative overflow-hidden flex-wrap sm:flex-nowrap">
          <div className="absolute left-0 inset-y-0 w-2 bg-[#e11a2b]"></div>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 pl-2">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-[#e11a2b]/20 border-2 border-[#e11a2b]/60 flex items-center justify-center shrink-0 text-[#e11a2b] shadow-inner">
              <span className="material-symbols-outlined text-[24px] sm:text-[28px]">verified</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-xs sm:text-sm text-[#ffb4ab] font-black uppercase tracking-widest leading-tight">
                Nocturnal Track Possession
              </span>
              <span className="text-lg sm:text-2xl text-white truncate font-extrabold">
                Auto-Remediation Ledger
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end shrink-0 font-mono pl-2 sm:pl-0">
            <span className="text-xs text-[#CBD5E1] uppercase tracking-wider font-bold">Interlock Phase</span>
            <span className="text-xs sm:text-sm text-white font-black bg-[#e11a2b] px-3 py-1 rounded-lg mt-1 shadow-md">
              CLEARANCE RUN
            </span>
          </div>
        </div>

        {/* Header Stats Grid (Bento Matrix) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Stat Card 1 */}
          <div className="bg-[#12161F] border-2 border-white/10 p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#CBD5E1] uppercase tracking-wider font-mono font-bold">
                Tonight's Total
              </span>
              <span className="material-symbols-outlined text-[22px] text-[#e11a2b]">task_alt</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl sm:text-4xl text-white font-black leading-none">
                7
              </span>
              <span className="text-xs text-[#e11a2b] font-black uppercase">Fixed</span>
            </div>
            <span className="text-xs text-[#94A3B8] font-medium mt-2">Autonomous micro-actions</span>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-[#12161F] border-2 border-white/10 p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#CBD5E1] uppercase tracking-wider font-mono font-bold">
                Dawn Cutoff
              </span>
              <span className="material-symbols-outlined text-[22px] text-[#e11a2b] animate-pulse">timer</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl sm:text-4xl text-[#e11a2b] font-black leading-none">
                3
              </span>
              <span className="text-xs text-white/90 font-black uppercase">Urgent</span>
            </div>
            <span className="text-xs text-white/90 font-bold mt-2">Near 04:30 deadline</span>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-[#12161F] border-2 border-white/10 p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#CBD5E1] uppercase tracking-wider font-mono font-bold">
                Buffer Saved
              </span>
              <span className="material-symbols-outlined text-[22px] text-white">trending_down</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl sm:text-4xl text-white font-black leading-none">
                ~42
              </span>
              <span className="text-xs text-[#e11a2b] font-black uppercase">mins</span>
            </div>
            <span className="text-xs text-[#94A3B8] font-medium mt-2">Commuter delay prevented</span>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-[#12161F] border-2 border-white/10 p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#CBD5E1] uppercase tracking-wider font-mono font-bold">
                Readiness
              </span>
              <span className="material-symbols-outlined text-[22px] text-emerald-400">speed</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl sm:text-4xl text-white font-black leading-none">
                98.4%
              </span>
            </div>
            <div className="w-full bg-[#06080C] h-2.5 rounded-full overflow-hidden mt-2 border border-white/15">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.4%' }}></div>
            </div>
          </div>
        </div>

        {/* Filter Micro-Bar (Glove-friendly) */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar font-mono">
          <button
            className={`shrink-0 min-h-[50px] px-5 py-2 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-extrabold shadow-md transition active:scale-[0.98] cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#e11a2b] text-white border-2 border-[#e11a2b]'
                : 'bg-[#191E2B] text-white border-2 border-white/10 hover:border-white/30'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            All Tonight (7)
          </button>
          <button
            className={`shrink-0 min-h-[50px] px-5 py-2 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition active:scale-[0.98] cursor-pointer ${
              activeFilter === 'welding'
                ? 'bg-[#e11a2b] text-white border-2 border-[#e11a2b] font-black'
                : 'bg-[#191E2B] text-white border-2 border-white/10 hover:border-white/30 font-bold'
            }`}
            onClick={() => setActiveFilter('welding')}
          >
            Welding Fixes (2)
          </button>
          <button
            className={`shrink-0 min-h-[50px] px-5 py-2 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition active:scale-[0.98] cursor-pointer ${
              activeFilter === 'clips'
                ? 'bg-[#e11a2b] text-white border-2 border-[#e11a2b] font-black'
                : 'bg-[#191E2B] text-white border-2 border-white/10 hover:border-white/30 font-bold'
            }`}
            onClick={() => setActiveFilter('clips')}
          >
            Rail Clips (3)
          </button>
          <button
            className={`shrink-0 min-h-[50px] px-5 py-2 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition active:scale-[0.98] cursor-pointer ${
              activeFilter === 'signoff'
                ? 'bg-[#e11a2b] text-white border-2 border-[#e11a2b] font-black'
                : 'bg-[#191E2B] text-white border-2 border-white/10 hover:border-white/30 font-bold'
            }`}
            onClick={() => setActiveFilter('signoff')}
          >
            Awaiting Sign-Off ({isSignedOff ? '0' : '1'})
          </button>
        </div>
      </div>

      {/* Micro-Fix Timeline Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
          <span className="text-xs sm:text-sm text-white uppercase tracking-widest font-black font-mono">
            Self-Healing Execution Log
          </span>
          <span className="text-xs text-[#e11a2b] font-mono font-black tracking-wider">
            SMRT CHRONOLOGICAL REV-08
          </span>
        </div>

        {/* Timeline Item 1: Thermal Weld */}
        {matchesFilter('welding signoff') && (
          <div className="timeline-item flex flex-col bg-[#12161F] border-2 border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#191E2B] border-b border-white/10 px-5 py-3 flex items-center justify-between font-mono flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px] text-[#e11a2b]">local_fire_department</span>
                <span className="text-sm sm:text-base text-white font-black tracking-wider">02:41 AM</span>
                <span className="text-[#94A3B8]">•</span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] font-bold">TrackBot-04</span>
              </div>
              <span className="bg-[#e11a2b]/25 text-white border border-[#e11a2b] text-xs sm:text-sm px-3 py-1 rounded-md font-black">
                KP 24.12 / SL-4088
              </span>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl text-white font-extrabold">
                  Localized Composite Thermal Weld on Joint J-104
                </span>
                <span className="text-sm sm:text-base text-[#CBD5E1] mt-1 leading-relaxed">
                  Automated induction filler seam applied across microscopic fissure profile at Sleeper #4088.
                </span>
              </div>

              {/* Before / After Thermal Diagnostic Imaging Pair */}
              <div className="flex flex-col gap-3 bg-[#06080C] border-2 border-white/10 p-4 rounded-xl shadow-inner">
                <div className="flex items-center justify-between font-mono flex-wrap gap-2">
                  <span className="text-xs text-white uppercase tracking-wider font-bold">
                    FLIR Spectral Comparison (38.4°C Target)
                  </span>
                  <span className="text-xs text-[#e11a2b] font-black bg-[#e11a2b]/20 px-2 py-0.5 rounded border border-[#e11a2b]/40">
                    DELTA -118°C CURED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#191E2B] border-2 border-white/10 group shadow-md">
                    <img
                      className="w-full h-full object-cover transition group-hover:scale-105"
                      alt="Pre-repair thermal scan showing friction hotspot"
                      src={RAIL_THERMAL_SCAN}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-md border-2 border-[#e11a2b] font-mono">
                      <span className="text-xs text-[#ffb3ae] font-black leading-none">
                        PRE: 156.4°C HAZARD
                      </span>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#191E2B] border-2 border-white/10 group shadow-md">
                    <img
                      className="w-full h-full object-cover transition group-hover:scale-105"
                      alt="Post-repair thermal scan showing normalized cool temperature"
                      src={POST_REPAIR_THERMAL}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-md border-2 border-emerald-500 font-mono">
                      <span className="text-xs text-emerald-400 font-black leading-none">
                        POST: 38.1°C VERIFIED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telemetry & Test Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="bg-[#0E121A] border-2 border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs text-[#94A3B8] uppercase font-bold">Stress Tolerance Test</span>
                  <span className="text-base sm:text-lg text-white font-black mt-1">480 kN (PASS)</span>
                </div>
                <div className="bg-[#0E121A] border-2 border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs text-[#94A3B8] uppercase font-bold">Structural Integrity</span>
                  <span className="text-base sm:text-lg text-[#e11a2b] font-black mt-1">100% CURED</span>
                </div>
              </div>

              {/* Verification / Sign-Off Trigger */}
              <button
                className={`w-full min-h-[56px] px-4 py-3 rounded-xl flex items-center justify-between transition active:scale-[0.98] cursor-pointer shadow-lg ${
                  isSignedOff
                    ? 'bg-emerald-600/30 border-2 border-emerald-500 text-emerald-300'
                    : 'bg-[#e11a2b]/25 hover:bg-[#e11a2b]/35 border-2 border-[#e11a2b] text-white'
                }`}
                onClick={() => setIsDrawerOpen(true)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[26px] ${
                      isSignedOff ? 'text-emerald-400' : 'text-[#e11a2b]'
                    }`}
                  >
                    {isSignedOff ? 'verified' : 'assignment_turned_in'}
                  </span>
                  <span className="text-sm sm:text-base font-black uppercase tracking-wider">
                    {isSignedOff ? 'Compliance Certified & Signed' : 'Compliance Sign-Off Required'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[24px]">
                  {isSignedOff ? 'done' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Timeline Item 2: Rail Clip Tightening */}
        {matchesFilter('clips') && (
          <div className="timeline-item flex flex-col bg-[#12161F] border-2 border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#191E2B] border-b border-white/10 px-5 py-3 flex items-center justify-between font-mono flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px] text-[#e11a2b]">tune</span>
                <span className="text-sm sm:text-base text-white font-black tracking-wider">02:18 AM</span>
                <span className="text-[#94A3B8]">•</span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] font-bold">TrackBot-04</span>
              </div>
              <span className="bg-[#0E121A] border border-white/15 text-[#CBD5E1] text-xs sm:text-sm px-3 py-1 rounded-md font-mono font-bold">
                KP 17.80
              </span>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl text-white font-extrabold">
                  Automated Rail-Clip Tightening (8 Clips)
                </span>
                <span className="text-sm sm:text-base text-[#CBD5E1] mt-1 leading-relaxed">
                  Hydraulic torque sweep executed. Restored Fastclip tension to nominal 175–185 Nm tolerances.
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#06080C] border-2 border-white/10 px-4 py-3 rounded-xl flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#e11a2b] text-[20px]">volume_down</span>
                  <span className="text-xs sm:text-sm text-white font-bold">Prevented Morning Peak Rumble Noise</span>
                </div>
                <span className="text-xs text-[#CBD5E1] font-mono font-extrabold bg-[#191E2B] px-2.5 py-1 rounded-md border border-white/10">
                  4m 12s DURATION
                </span>
              </div>

              {/* 8-Clip Torque Strip */}
              <div className="flex flex-col gap-2 font-mono">
                <div className="flex justify-between text-xs text-[#CBD5E1] font-bold">
                  <span className="tracking-wider uppercase">CLIP TORQUE MATRIX (Nm)</span>
                  <span className="text-white font-extrabold">TARGET: 180 Nm</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[182, 179, 184, 177, 181, 180, 185, 178].map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-[#191E2B] border border-white/15 py-2 px-1 text-center rounded-lg text-xs sm:text-sm text-white font-black shadow-inner"
                    >
                      <span className="block text-[10px] text-[#94A3B8] font-bold">#{idx + 1}</span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs sm:text-sm text-[#CBD5E1] border-t border-white/10">
                <span className="font-medium">Status: Verified Nominal</span>
                <span className="text-[#e11a2b] font-mono font-black">100% SUCCESS RATE</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Item 3: Ballast Tamp & Micro-Leveling */}
        {matchesFilter('all') && (
          <div className="timeline-item flex flex-col bg-[#12161F] border-2 border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#191E2B] border-b border-white/10 px-5 py-3 flex items-center justify-between font-mono flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px] text-[#e11a2b]">swap_horiz</span>
                <span className="text-sm sm:text-base text-white font-black tracking-wider">01:52 AM</span>
                <span className="text-[#94A3B8]">•</span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] font-bold">TrackBot-02</span>
              </div>
              <span className="bg-[#0E121A] border border-white/15 text-[#CBD5E1] text-xs sm:text-sm px-3 py-1 rounded-md font-mono font-bold">
                SWITCH POINT 12B
              </span>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl text-white font-extrabold">
                  Ballast Tamp &amp; Micro-Leveling at Point 12B
                </span>
                <span className="text-sm sm:text-base text-[#CBD5E1] mt-1 leading-relaxed">
                  Corrected 2.3mm differential track cant deflection using robotic dual-prong ballast vibration packer.
                </span>
              </div>

              <div className="bg-[#06080C] border-2 border-white/10 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#191E2B] border border-white/15 flex items-center justify-center text-[#e11a2b] shadow-inner">
                    <span className="material-symbols-outlined text-[22px]">straighten</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#94A3B8] font-bold">Track Dynamic Gauge</span>
                    <span className="text-base sm:text-lg text-white font-mono font-black">
                      1435.08 mm (±0.1)
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#e11a2b]/25 border border-[#e11a2b] text-white text-xs sm:text-sm font-black font-mono">
                  CERTIFIED
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Item 4: Acoustic Crack Diagnostic */}
        {matchesFilter('all') && (
          <div className="timeline-item flex flex-col bg-[#12161F] border-2 border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#191E2B] border-b border-white/10 px-5 py-3 flex items-center justify-between font-mono flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px] text-sky-400">hearing</span>
                <span className="text-sm sm:text-base text-white font-black tracking-wider">01:34 AM</span>
                <span className="text-[#94A3B8]">•</span>
                <span className="text-xs sm:text-sm text-[#CBD5E1] font-bold">TrackBot-04</span>
              </div>
              <span className="bg-[#0E121A] border border-white/15 text-[#CBD5E1] text-xs sm:text-sm px-3 py-1 rounded-md font-mono font-bold">
                CH 09.44
              </span>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl text-white font-extrabold">
                  Acoustic Ultrasound Crack Diagnostic
                </span>
                <span className="text-sm sm:text-base text-[#CBD5E1] mt-1 leading-relaxed">
                  Multi-frequency ultrasonic probe array completed 60-meter sweep on high-rail curved transition.
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#06080C] border-2 border-white/10 px-4 py-3 rounded-xl flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-sky-400 text-[20px]">info</span>
                  <span className="text-xs sm:text-sm text-[#CBD5E1] font-bold">No Actionable Structural Fracture</span>
                </div>
                <span className="text-xs text-white font-mono font-black bg-[#12161F] px-3 py-1 rounded-md border border-white/20">
                  WATCHLIST
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Regulatory Compliance Drawer (Modal Overlay) */}
      <div
        className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-[#191E2B] border-t-2 border-white/20 rounded-t-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 max-h-[85vh] overflow-y-auto max-w-2xl mx-auto w-full">
          {/* Drawer Handle */}
          <div className="flex items-center justify-between">
            <div className="w-16 h-1.5 bg-white/30 rounded-full mx-auto"></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#e11a2b] text-[30px]">verified_user</span>
              <span className="text-xl sm:text-2xl text-white font-black">Regulatory Sign-Off</span>
            </div>
            <button
              className="w-12 h-12 rounded-xl bg-[#12161F] border-2 border-white/15 flex items-center justify-center text-white hover:bg-white/10 cursor-pointer transition active:scale-95"
              onClick={() => setIsDrawerOpen(false)}
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Technician Badge */}
          <div className="bg-[#0E121A] border-2 border-white/15 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 ring-3 ring-[#e11a2b] shadow-lg">
              <img
                alt="Lead Sarah J."
                className="w-full h-full object-cover"
                src={TECH_AVATAR_URL}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl text-white font-black truncate">
                  Lead Sarah J.
                </span>
                <span className="material-symbols-outlined text-[#e11a2b] text-[22px]">check_circle</span>
              </div>
              <span className="text-xs sm:text-sm text-[#ffb4ab] uppercase font-mono font-black mt-0.5">
                #SMRT-8821 • Senior P-Way Engineer
              </span>
              <span className="text-xs sm:text-sm text-[#CBD5E1] font-medium mt-0.5">
                Night Sector Possession Authority
              </span>
            </div>
          </div>

          {/* Compliance Details / Audit Trail */}
          <div className="flex flex-col gap-3 bg-[#06080C] border-2 border-white/15 p-5 rounded-2xl font-mono text-xs sm:text-sm shadow-inner">
            <div className="flex items-center justify-between text-[#CBD5E1]">
              <span className="font-bold">REGULATION CODE</span>
              <span className="text-white font-black">LTA-ENG-TRK-709.4</span>
            </div>
            <div className="flex items-center justify-between text-[#CBD5E1]">
              <span className="font-bold">TASK ID</span>
              <span className="text-white font-black">FIX-2024-0312-J104</span>
            </div>
            <div className="flex items-center justify-between text-[#CBD5E1]">
              <span className="font-bold">NON-DESTRUCTIVE TEST</span>
              <span className="text-[#e11a2b] font-black">ULTRASONIC 100% CLEAR</span>
            </div>
            <div className="flex flex-col gap-1 mt-2 pt-2 bg-[#12161F] border border-white/15 p-3 rounded-xl">
              <span className="text-xs text-[#94A3B8] uppercase font-bold">
                Transit Regulatory Verification Hash
              </span>
              <span className="text-xs text-white font-mono break-all select-all font-semibold">
                SHA-256: 9e3b7c84a0d922f51198f3bca81907de8a614cf18029ab0f62d4e8c71b3e510a
              </span>
            </div>
          </div>

          {/* Action Confirmation Button */}
          <div className="flex flex-col gap-2 pb-safe pt-2">
            <button
              className={`w-full min-h-[58px] rounded-xl text-base sm:text-lg uppercase tracking-wider font-black shadow-xl flex items-center justify-center gap-3 transition active:scale-[0.98] cursor-pointer ${
                isSignedOff ? 'bg-white text-black' : 'bg-[#e11a2b] hover:bg-[#b81220] text-white shadow-[#e11a2b]/30'
              }`}
              id="signOffBtn"
              onClick={handleSignOff}
            >
              <span className="material-symbols-outlined text-[26px]">
                {isSignedOff ? 'task_alt' : 'fingerprint'}
              </span>
              <span>{isSignedOff ? 'DIGITALLY SIGNED & VERIFIED ✓' : 'Authorize & Stamp Clearance'}</span>
            </button>
            <span className="text-xs text-center text-[#94A3B8] uppercase tracking-wider font-mono font-bold mt-1">
              Legally Binding Digital Seal for Dawn Revenue Service
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Quick Audit Bar */}
      <div className="sticky bottom-20 inset-x-0 py-2 pointer-events-none max-w-4xl mx-auto w-full">
        <div className="pointer-events-auto bg-[#07090C]/95 border-2 border-white/20 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 font-mono">
            <span className="w-3 h-3 rounded-full bg-[#e11a2b] animate-ping shrink-0"></span>
            <span className="text-xs sm:text-sm text-white truncate uppercase font-extrabold tracking-wider">
              Session Ledger In Sync (7 Actions)
            </span>
          </div>
          <button
            className="min-h-[44px] px-4 bg-[#e11a2b] hover:bg-[#b81220] text-white rounded-xl text-xs sm:text-sm uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer font-mono active:scale-95 transition"
            onClick={() => setIsDrawerOpen(true)}
          >
            <span>Lead Audit</span>
            <span className="material-symbols-outlined text-[20px]">expand_less</span>
          </button>
        </div>
      </div>
    </div>
  );
};
