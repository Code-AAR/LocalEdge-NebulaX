import React, { useEffect, useState } from 'react';
import { TabType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useTrackBot } from '../context/TrackBotContext';
import { OFFICIAL_SMRT_LOGO, TECH_LEAD_AVATAR } from '../assets/assetUrls';

interface HeaderProps {
  activeTab: TabType;
  seniorMode: boolean;
  setSeniorMode: (mode: boolean) => void;
  onOpenSettings: () => void;
  onOpenAiAdvisor?: () => void;
}

export const SMRT_LOGO_URL = OFFICIAL_SMRT_LOGO;
export const TECH_AVATAR_URL = TECH_LEAD_AVATAR;

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  seniorMode,
  setSeniorMode,
  onOpenSettings,
  onOpenAiAdvisor,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { selectedBot, setIsSelectorModalOpen } = useTrackBot();

  // Live ticking countdown timer for nocturnal possession window
  const [secondsRemaining, setSecondsRemaining] = useState<number>(8078); // ~02:14:38

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'telemetry-&-live-map':
        return 'Rapid Transit Ops • Live Telemetry';
      case 'trackpulse-subsystems':
        return 'SRT Predictive Engine (4 Subsystems)';
      case 'ai-fault-advisor':
        return 'SRT AI Advisory & Diagnostics';
      case 'ai-prompt-&-dispatch':
        return 'SMRT AI Prompt & Dispatch';
      case 'micro-fix-log-&-self-healing-history':
        return 'Micro Fix Log & Self Healing History';
      case 'commuter-risk-analytics-&-early-warning':
        return 'Commuter Risk Analytics & Early Warning';
      default:
        return 'Rapid Transit Autonomous Ops';
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 pt-safe transition-all ${
        isDarkMode
          ? 'bg-[#0B0E14]/95 backdrop-blur-xl border-b border-white/15 shadow-xl shadow-black/80 text-white'
          : 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-md text-slate-900'
      }`}
    >
      <div className="h-16 sm:h-20 px-2.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
        {/* Left identity branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <img
            alt="Official SMRT Logo"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover shrink-0 ring-2 ring-[#E11A2B]/60 shadow-[0_0_12px_rgba(225,26,43,0.4)] bg-white p-0.5"
            src={SMRT_LOGO_URL}
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-sm sm:text-lg font-extrabold tracking-tight truncate uppercase">
                <span className="sm:hidden">SMRT</span>
                <span className="hidden sm:inline">SMRT Corporation</span>
              </span>
              <span className="inline-block w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#E11A2B] animate-pulse shrink-0 ring-2 ring-[#E11A2B]/40"></span>
            </div>
            <span
              className={`font-label-sm text-[10px] sm:text-xs uppercase tracking-wider truncate font-medium ${
                isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'
              }`}
            >
              {getSubtitle()}
            </span>
          </div>
        </div>

        {/* Right time, senior mode toggle, theme quick toggle, settings & profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Active TrackBot Quick Selector Button */}
          <button
            type="button"
            onClick={() => setIsSelectorModalOpen(true)}
            title="Switch Active TrackBot (6 Units Available)"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-bold uppercase transition active:scale-95 cursor-pointer shadow-sm ${
              isDarkMode
                ? 'bg-[#191E2B] text-white border-white/20 hover:border-[#E11A2B] hover:bg-white/10'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:border-[#E11A2B] hover:bg-slate-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E11A2B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E11A2B]"></span>
            </span>
            <span className="font-mono font-black text-[#E11A2B] tracking-tight text-[11px] sm:text-xs">{selectedBot.name}</span>
            <span className="hidden md:inline font-mono text-[11px] text-[#94A3B8] font-bold">
              {selectedBot.batteryPct}%
            </span>
            <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-[#94A3B8]">expand_more</span>
          </button>

          {/* Quick Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode (Settings)' : 'Switch to Dark Mode (Settings)'}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs font-bold uppercase transition active:scale-95 cursor-pointer flex items-center justify-center ${
              isDarkMode
                ? 'bg-[#191E2B] text-amber-300 border-white/15 hover:bg-white/10'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            aria-label="Toggle Dark/Light Mode"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              {isDarkMode ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* Senior High-Legibility Mode Switch */}
          <button
            onClick={() => setSeniorMode(!seniorMode)}
            title={seniorMode ? 'Text Size: Large (Click to switch to Normal)' : 'Text Size: Normal (Click to switch to Large)'}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm font-bold uppercase transition active:scale-95 cursor-pointer ${
              seniorMode
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.5)] ring-1 ring-amber-400'
                : isDarkMode
                ? 'bg-[#191E2B] text-white/90 border-white/15 hover:bg-white/10'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
            aria-pressed={seniorMode}
          >
            <span className="material-symbols-outlined text-[18px]">
              {seniorMode ? 'format_size' : 'text_increase'}
            </span>
            <span className="hidden sm:inline">{seniorMode ? 'Large' : 'Normal'}</span>
          </button>

          {/* Window Countdown Timer - Compact on mobile */}
          <div
            className={`flex flex-col items-end border px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-inner ${
              isDarkMode
                ? 'bg-[#191E2B] border-white/15'
                : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
          >
            <span
              className={`hidden sm:inline font-label-sm text-[9px] sm:text-[10px] uppercase font-bold tracking-wider leading-none ${
                isDarkMode ? 'text-white/80' : 'text-slate-600'
              }`}
            >
              WINDOW (01:30–04:30)
            </span>
            <span className="font-mono text-[11px] sm:text-xs text-[#E11A2B] font-extrabold tracking-wider leading-tight">
              {formatCountdown(secondsRemaining)}
              <span className="hidden sm:inline"> LEFT</span>
            </span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Open Console & Theme Settings"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs sm:text-sm font-bold uppercase transition active:scale-95 cursor-pointer flex items-center gap-1 ${
              isDarkMode
                ? 'bg-[#191E2B] text-white hover:bg-white/10 border-white/15 hover:border-white/30'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
            }`}
            id="header-settings-button"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-[#E11A2B]">settings</span>
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Profile */}
          <div className="hidden sm:block relative w-7 sm:w-9 h-7 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#E11A2B] shrink-0 shadow-md">
            <img
              alt="Lead Technician Chen"
              className="w-full h-full rounded-full object-cover"
              src={TECH_AVATAR_URL}
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
