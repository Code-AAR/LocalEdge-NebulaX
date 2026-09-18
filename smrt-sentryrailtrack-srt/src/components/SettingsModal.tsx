import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { TabType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seniorMode: boolean;
  setSeniorMode: (mode: boolean) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  seniorMode,
  setSeniorMode,
  onNavigateTab,
}) => {
  const { theme, setTheme, isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      id="settings-modal"
    >
      <div
        className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all scale-100 ${
          isDarkMode
            ? 'bg-[#12161F] border-white/20 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b gap-3 ${
            isDarkMode ? 'border-white/10 bg-[#191E2B]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#E11A2B] text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-headline-sm text-sm sm:text-lg font-bold uppercase tracking-tight truncate">
                Operations & Display Settings
              </h2>
              <p
                className={`text-[11px] sm:text-xs truncate ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'
                }`}
              >
                SMRT Nocturnal TrackBot Console v4.18
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition active:scale-95 cursor-pointer shrink-0 ${
              isDarkMode
                ? 'border-white/10 hover:bg-white/10 text-white/70 hover:text-white'
                : 'border-slate-200 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
            title="Close Settings"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Theme Mode Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#E11A2B]">
                    palette
                  </span>
                  Display Theme Mode
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'
                  }`}
                >
                  Switch between nocturnal tunnel vision and daytime depot clarity
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                  isDarkMode
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isDarkMode
                    ? 'border-[#E11A2B] bg-[#191E2B] shadow-md shadow-[#E11A2B]/20 ring-2 ring-[#E11A2B]/40'
                    : 'border-slate-300 bg-slate-100/70 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0B0E14] text-amber-300 flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                  </div>
                  {isDarkMode && (
                    <span className="w-5 h-5 rounded-full bg-[#E11A2B] text-white flex items-center justify-center text-xs">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm">Dark Mode</div>
                  <div className="text-[11px] opacity-75 mt-0.5">
                    Nocturnal Tunnel Ops • Low glare • Battery saving
                  </div>
                </div>
              </button>

              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  !isDarkMode
                    ? 'border-[#E11A2B] bg-red-50/50 shadow-md shadow-[#E11A2B]/20 ring-2 ring-[#E11A2B]/40 text-slate-900'
                    : 'border-white/10 bg-[#151923] hover:bg-[#1C2230] text-white/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-300">
                    <span className="material-symbols-outlined text-[20px]">light_mode</span>
                  </div>
                  {!isDarkMode && (
                    <span className="w-5 h-5 rounded-full bg-[#E11A2B] text-white flex items-center justify-center text-xs">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm">Light Mode</div>
                  <div className="text-[11px] opacity-75 mt-0.5">
                    Daylight Depot Ops • Crisp contrast • Ambient light
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Typography & Accessibility */}
          <section
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-[#191E2B]/70 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-amber-500">
                format_size
              </span>
              Accessibility & Typography
            </h3>

            <div className="flex items-center justify-between py-2">
              <div className="pr-4">
                <div className="font-bold text-sm">Senior / High-Legibility Large Text</div>
                <div
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'
                  }`}
                >
                  Increases font weight and sizes for fast reading during high-stress maintenance
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSeniorMode(!seniorMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  seniorMode ? 'bg-amber-500' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={seniorMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    seniorMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* SRT 4 Subsystems Predictive Engine Launch */}
          <section
            className={`p-4 rounded-xl border relative overflow-hidden ${
              isDarkMode
                ? 'bg-gradient-to-r from-red-950/40 to-[#12161F] border-red-500/40'
                : 'bg-gradient-to-r from-red-50 to-slate-100 border-red-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#E11A2B]">
                    neurology
                  </span>
                  <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wide">
                    SRT Predictive Engine
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                    4 Subsystems
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-600'
                  }`}
                >
                  Analyze Door segments, ACV refrigerant leak ranking, Rail corrugation FFT, and SHM fatigue damage regression with live CSV exports.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab('trackpulse-subsystems');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#E11A2B] hover:bg-[#c91424] text-white text-xs font-bold uppercase tracking-wider shrink-0 transition active:scale-95 flex items-center gap-1 shadow-md shadow-[#E11A2B]/30 cursor-pointer"
              >
                <span>Open</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* AI Track Fault Advisor Quick Launch */}
          <section
            className={`p-4 rounded-xl border relative overflow-hidden ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#1E293B] to-[#12161F] border-indigo-500/30'
                : 'bg-gradient-to-r from-slate-100 to-indigo-50 border-indigo-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-indigo-400">
                    smart_toy
                  </span>
                  <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wide">
                    SRT AI Advisory Console
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-mono">
                    Dual-Lens AI
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-600'
                  }`}
                >
                  Strategic Control Room & Tactical Offline Field Technician assistance, 750V third-rail safety isolation protocols, and real-time failure diagnostics.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab('ai-fault-advisor');
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shrink-0 transition active:scale-95 flex items-center gap-1 shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <span>Launch</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Operational Line Configuration */}
          <section
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-[#191E2B]/70 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#E11A2B]">
                train
              </span>
              Active Transit Corridor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono font-bold">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                <span className="truncate">NSL (North-South Line)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">EWL (East-West Line)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="truncate">CCL (Circle Line)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-600/10 border border-yellow-600/30 text-yellow-500">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-600 shrink-0"></span>
                <span className="truncate">TEL (Thomson-East Coast)</span>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-4 sm:px-5 py-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isDarkMode ? 'border-white/10 bg-[#191E2B]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span
            className={`text-[10px] sm:text-[11px] font-mono ${
              isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'
            }`}
          >
            Singapore Land Transport Authority Compliance • Code COP-RS
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-lg bg-[#E11A2B] hover:bg-[#c91424] text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-md shadow-[#E11A2B]/30 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
