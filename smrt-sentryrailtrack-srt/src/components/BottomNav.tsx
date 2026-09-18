import React from 'react';
import { TabType } from '../types';
import { useTheme } from '../context/ThemeContext';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { isDarkMode } = useTheme();

  const tabs: { id: TabType; label: string; icon: string; badge?: string }[] = [
    {
      id: 'telemetry-&-live-map',
      label: 'Telemetry',
      icon: 'radar',
    },
    {
      id: 'trackpulse-subsystems',
      label: 'Subsystems',
      icon: 'neurology',
      badge: '4',
    },
    {
      id: 'ai-fault-advisor',
      label: 'Fault AI',
      icon: 'smart_toy',
      badge: 'AI',
    },
    {
      id: 'ai-prompt-&-dispatch',
      label: 'Dispatch',
      icon: 'precision_manufacturing',
    },
    {
      id: 'micro-fix-log-&-self-healing-history',
      label: 'Self-Heal',
      icon: 'build_circle',
      badge: '7',
    },
    {
      id: 'commuter-risk-analytics-&-early-warning',
      label: 'Risk Alert',
      icon: 'warning',
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 pb-safe backdrop-blur-2xl transition-all ${
        isDarkMode
          ? 'bg-[#0B0E14]/98 border-t border-white/20 shadow-[0_-4px_24px_rgba(0,0,0,0.9)]'
          : 'bg-white/98 border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]'
      }`}
      id="bottomNav"
    >
      <div className="grid grid-cols-6 items-center h-16 sm:h-20 px-1 sm:px-4 gap-0.5 sm:gap-2 max-w-7xl mx-auto w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-13 sm:h-16 rounded-lg sm:rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] px-0.5 ${
                isActive
                  ? 'text-white bg-[#E11A2B] shadow-lg shadow-[#E11A2B]/50 ring-1 sm:ring-2 ring-white/30 font-extrabold'
                  : isDarkMode
                  ? 'text-[#94A3B8] hover:text-white hover:bg-[#191E2B]/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id={`nav-${tab.id}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[20px] sm:text-[24px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                {tab.badge && !isActive && (
                  <span
                    className={`absolute -top-1 -right-2 text-[8px] sm:text-[9px] font-mono font-bold px-1 py-0.2 rounded-full leading-tight ring-1 ${
                      tab.badge === 'NEW'
                        ? 'bg-indigo-600 text-white ring-indigo-400'
                        : 'bg-[#E11A2B] text-white ring-black'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-[9px] xs:text-[10px] sm:text-xs text-center leading-tight tracking-tight font-bold uppercase truncate max-w-full px-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
