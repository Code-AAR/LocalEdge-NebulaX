import React from 'react';
import { useTrackBot } from '../context/TrackBotContext';
import { TrackBot } from '../types';

interface TrackBotSelectorBarProps {
  onOpenModal?: () => void;
  compact?: boolean;
}

export const TrackBotSelectorBar: React.FC<TrackBotSelectorBarProps> = ({
  onOpenModal,
  compact = false,
}) => {
  const { bots, selectedBotId, selectBot, setIsSelectorModalOpen } = useTrackBot();

  const handleOpen = () => {
    if (onOpenModal) {
      onOpenModal();
    } else {
      setIsSelectorModalOpen(true);
    }
  };

  const getStatusColor = (status: TrackBot['status']) => {
    switch (status) {
      case 'AUTONOMOUS':
        return 'bg-emerald-500';
      case 'SCANNING':
        return 'bg-sky-400';
      case 'HELD':
        return 'bg-amber-400';
      case 'STANDBY':
        return 'bg-slate-400';
      default:
        return 'bg-[#E11A2B]';
    }
  };

  return (
    <div className="w-full bg-[#0E121A] border border-white/15 rounded-2xl p-3 sm:p-4 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#E11A2B]">smart_toy</span>
          <span className="font-mono text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            SMRT Autonomous Fleet Deck
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-white/10 text-white/90">
            {bots.length} Active Units
          </span>
        </div>
        <button
          type="button"
          onClick={handleOpen}
          className="text-xs font-mono font-bold text-[#CBD5E1] hover:text-white flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-white/10"
        >
          <span>Fleet Overview</span>
          <span className="material-symbols-outlined text-[16px]">grid_view</span>
        </button>
      </div>

      {/* Horizontal Scrollable Unit Cards */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/20">
        {bots.map((bot) => {
          const isSelected = bot.id === selectedBotId;
          const statusDot = getStatusColor(bot.status);

          return (
            <button
              key={bot.id}
              type="button"
              onClick={() => selectBot(bot.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-white/15 border-[#E11A2B] shadow-lg shadow-[#E11A2B]/20 ring-1 ring-[#E11A2B]'
                  : 'bg-[#12161F] border-white/10 hover:border-white/30 hover:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="relative w-8 h-8 rounded-lg bg-[#06080C] border border-white/15 flex items-center justify-center text-white shrink-0 overflow-hidden">
                <img
                  src={bot.imageUrl}
                  alt={bot.name}
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${statusDot} ${bot.status === 'AUTONOMOUS' || bot.status === 'SCANNING' ? 'animate-ping' : ''}`}></span>
                <span className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${statusDot}`}></span>
              </div>

              <div className="flex flex-col min-w-[130px]">
                <div className="flex items-center justify-between gap-1">
                  <span className={`font-mono text-xs sm:text-sm font-black ${isSelected ? 'text-white' : 'text-[#CBD5E1]'}`}>
                    {bot.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8] font-bold">
                    {bot.batteryPct}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] font-medium truncate mt-0.5">
                  <span className="truncate max-w-[120px]">{bot.callsign}</span>
                </div>
              </div>

              {isSelected && (
                <span className="material-symbols-outlined text-[18px] text-[#E11A2B] ml-1 shrink-0 font-bold">
                  check_circle
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const TrackBotSelectorModal: React.FC = () => {
  const { bots, selectedBotId, selectBot, isSelectorModalOpen, setIsSelectorModalOpen } = useTrackBot();

  if (!isSelectorModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0E121A] border-2 border-white/20 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3 bg-[#12161F]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E11A2B] text-white flex items-center justify-center shadow-lg shadow-[#E11A2B]/40 shrink-0">
              <span className="material-symbols-outlined text-[24px] sm:text-[28px]">precision_manufacturing</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-base sm:text-2xl font-black text-white tracking-tight truncate">
                  SMRT Autonomous TrackBot Fleet
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-black bg-[#E11A2B]/20 text-[#E11A2B] border border-[#E11A2B]/40">
                  {bots.length} Units
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-[#94A3B8] mt-0.5 truncate sm:whitespace-normal">
                Select an active robot unit to inspect live FLIR telemetry, sensor feeds, and robotic actuators.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSelectorModalOpen(false)}
            className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body: Fleet Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bots.map((bot) => {
              const isSelected = bot.id === selectedBotId;

              return (
                <div
                  key={bot.id}
                  onClick={() => {
                    selectBot(bot.id);
                    setIsSelectorModalOpen(false);
                  }}
                  className={`rounded-2xl border-2 p-4 sm:p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#12161F] to-[#1E2433] border-[#E11A2B] shadow-xl shadow-[#E11A2B]/25 ring-2 ring-[#E11A2B]'
                      : 'bg-[#12161F] border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  {/* Top card info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#06080C] border border-white/20 shrink-0 relative">
                        <img
                          src={bot.imageUrl}
                          alt={bot.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${
                            bot.status === 'AUTONOMOUS'
                              ? 'bg-emerald-400'
                              : bot.status === 'SCANNING'
                              ? 'bg-sky-400'
                              : bot.status === 'HELD'
                              ? 'bg-amber-400'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                            {bot.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                              bot.status === 'AUTONOMOUS'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : bot.status === 'SCANNING'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                : bot.status === 'HELD'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                            }`}
                          >
                            {bot.status}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#CBD5E1] mt-0.5 truncate">
                          {bot.callsign}
                        </span>
                        <span className="text-xs text-[#94A3B8] truncate mt-0.5">
                          {bot.corridor}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1 text-xs font-mono font-black text-white">
                        <span className="material-symbols-outlined text-[16px] text-emerald-400">
                          battery_charging_90
                        </span>
                        <span>{bot.batteryPct}%</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#94A3B8] mt-1">
                        {bot.speedKmH} KM/H
                      </span>
                    </div>
                  </div>

                  {/* Sector & Specialization */}
                  <div className="bg-[#06080C] p-3 rounded-xl border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94A3B8] font-bold">SECTOR:</span>
                      <span className="text-white font-black truncate max-w-[240px]">
                        {bot.sector}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94A3B8] font-bold">PAYLOAD:</span>
                      <span className="text-amber-300 font-bold truncate max-w-[240px]">
                        {bot.payload}
                      </span>
                    </div>
                  </div>

                  {/* Metrics & Select Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">
                          {bot.primaryMetric.label}
                        </span>
                        <span className="font-bold text-white">
                          {bot.primaryMetric.value} {bot.primaryMetric.unit}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-white/15"></div>
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">
                          {bot.secondaryMetric.label}
                        </span>
                        <span className="font-bold text-white">
                          {bot.secondaryMetric.value} {bot.secondaryMetric.unit}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#E11A2B] text-white shadow-md'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <span>SELECT</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#12161F] flex items-center justify-between flex-wrap gap-2 text-xs text-[#94A3B8] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>All 6 units connected via SMRT 5G Sub-Tunnel Mesh</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSelectorModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
          >
            Close Deck
          </button>
        </div>
      </div>
    </div>
  );
};
