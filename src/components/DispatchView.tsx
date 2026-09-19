import React, { useState, useEffect } from 'react';
import { useTrackBot } from '../context/TrackBotContext';
import { TRACK_CAM_INSPECTION, RAIL_THERMAL_SCAN } from '../assets/assetUrls';

interface DispatchViewProps {
  initialPrompt?: string;
}

interface MessageEntry {
  id: string;
  sender: 'tech' | 'transit_ai';
  author: string;
  time: string;
  content: string;
  badges?: string[];
  statusBadge?: string;
  steps?: { step: string; status: string }[];
}

export const DispatchView: React.FC<DispatchViewProps> = ({ initialPrompt = '' }) => {
  const { selectedBot, setIsSelectorModalOpen } = useTrackBot();
  const [promptInput, setPromptInput] = useState<string>(initialPrompt);
  const [toast, setToast] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Live messages list so technician can dispatch new prompts dynamically
  const [conversation, setConversation] = useState<MessageEntry[]>([
    {
      id: 'msg-1',
      sender: 'tech',
      author: 'Lead Tech Chen (T-88)',
      time: '02:15:20 AM',
      content:
        'Inspect sleeper #4092 rail clip. If torque under 120Nm, apply automated pneumatic retorque and seal with anti-vibration epoxy before revenue line handover.',
      badges: ['AUDIO DISPATCHED', '4K FLIR CAM ATTACHED'],
    },
    {
      id: 'msg-2',
      sender: 'transit_ai',
      author: 'TransitLLM Autonomous Synthesis',
      time: '02:15:28 AM',
      statusBadge: 'CONFIRMED (SAFE)',
      content:
        'Confirmed. Analyzing sleeper #4092. Pre-emptive micro-fix will prevent morning track vibration alerts. Estimated duration: 6 mins. Risk to 05:12 AM revenue service: 0.0%.',
      steps: [
        { step: '1. Deploy robotic socket head #3', status: 'READY' },
        { step: '2. Pneumatic spin torque to 175 Nm ±2', status: 'ARMED' },
        { step: '3. Inject fast-cure polymer seal', status: 'PENDING AUTH' },
      ],
    },
  ]);

  useEffect(() => {
    if (initialPrompt) {
      setPromptInput(initialPrompt);
    }
  }, [initialPrompt]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const applyPreset = (presetText: string) => {
    setPromptInput(presetText);
    showToast(`Template loaded: "${presetText.slice(0, 32)}..."`);
  };

  const toggleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      showToast('Microphone active: Tunnel noise suppression online...');
      setTimeout(() => {
        setIsRecording(false);
        setPromptInput('Tighten sleeper #4092 clip to 175 Nm and inject polymer seal');
        showToast('Speech transcribed: "Tighten sleeper #4092 clip to 175 Nm and inject polymer seal"');
      }, 2500);
    } else {
      setIsRecording(false);
      showToast('Voice intercom ready.');
    }
  };

  const captureTunnelPhoto = () => {
    showToast('4K LiDAR/FLIR snap captured. Point cloud attached to active prompt station.');
  };

  const dispatchCustomPrompt = () => {
    const text = promptInput.trim();
    if (!text) {
      showToast('Please type a command or tap a glove-optimized quick preset.');
      return;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + ' AM';

    const newTechMsg: MessageEntry = {
      id: `tech-${Date.now()}`,
      sender: 'tech',
      author: 'Lead Tech Chen (T-88)',
      time: timeStr,
      content: text,
      badges: ['MANUAL DISPATCH', 'STATION CONSOLE'],
    };

    setConversation((prev) => [...prev, newTechMsg]);
    setPromptInput('');
    showToast('Command dispatched to TransitLLM. Synthesizing robot kinematics...');

    // Simulate AI synthesis reply
    setTimeout(() => {
      const aiReply: MessageEntry = {
        id: `ai-${Date.now()}`,
        sender: 'transit_ai',
        author: 'TransitLLM Autonomous Synthesis',
        time: new Date().toTimeString().split(' ')[0] + ' AM',
        statusBadge: 'PLANNED & VERIFIED',
        content: `Subroutine generated for: "${text.slice(0, 60)}...". Trajectory locked, 0 risk to 05:12 AM revenue service. Ready for execution.`,
        steps: [
          { step: '1. Position optical sensor array', status: 'ALIGNED' },
          { step: '2. Execute torque / remedial protocol', status: 'ARMED' },
          { step: '3. Record post-fix acoustic resonance', status: 'QUEUED' },
        ],
      };
      setConversation((prev) => [...prev, aiReply]);
    }, 1200);
  };

  const handleAuthorizeFix = () => {
    setIsAuthorizing(true);
    showToast('Engaging TrackBot-04 pneumatic actuator at KP 18.422...');

    setTimeout(() => {
      setIsAuthorizing(false);
      setIsAuthorized(true);
      showToast('AUTONOMOUS TASK DISPATCHED: 175 Nm achieved. Fast-polymer seal cured.');
      // Update step 3 in the conversation
      setConversation((prev) =>
        prev.map((m) => {
          if (m.steps) {
            return {
              ...m,
              steps: [
                { step: '1. Deploy robotic socket head #3', status: 'COMPLETED' },
                { step: '2. Pneumatic spin torque to 175 Nm ±2', status: 'TORQUED 175 Nm' },
                { step: '3. Inject fast-cure polymer seal', status: 'INJECTED & CURED' },
              ],
            };
          }
          return m;
        })
      );
    }, 1800);
  };

  const handleSimulateFix = () => {
    setIsSimulating(true);
    showToast('Running finite element analysis on KP 18.422 sleeper clip profile...');

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult('SIMULATION SUCCESS: Residual harmonic vibration reduced by 92.4%. Zero shear crack risk under 80 km/h EMU pass.');
      showToast('FEA Simulation validated. Safe for morning peak revenue.');
    }, 1400);
  };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          id="statusToast"
          className="font-mono text-xs sm:text-sm text-center py-2.5 sm:py-3 px-3 sm:px-4 bg-[#06080C] rounded-xl text-white border-2 border-[#e11a2b] shadow-2xl animate-fade-in sticky top-20 sm:top-24 z-40 font-bold max-w-[92vw] mx-auto"
        >
          {toast}
        </div>
      )}

      {/* AI Connection & Telemetry Beacon Banner */}
      <div className="w-full bg-[#191E2B] rounded-2xl p-4 sm:p-6 border border-white/15 shadow-xl">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="relative w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-[#06080C] flex items-center justify-center shrink-0 border-2 border-white/15 shadow-inner">
              <span className="material-symbols-outlined text-[#e11a2b] text-[24px] sm:text-[28px]">smart_toy</span>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e11a2b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#e11a2b]"></span>
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-headline-sm text-base sm:text-xl text-white truncate font-extrabold">
                  TransitLLM / SMRT Core v4.2
                </span>
                <span className="font-mono text-[10px] sm:text-xs bg-[#e11a2b]/25 px-2 py-0.5 rounded text-white font-extrabold shrink-0 border border-[#e11a2b]">
                  99.8% LINK
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs sm:text-sm text-[#94A3B8] truncate font-medium font-mono">
                  LINKED: <strong className="text-white">{selectedBot.name}</strong> ({selectedBot.payload})
                </span>
                <button
                  type="button"
                  onClick={() => setIsSelectorModalOpen(true)}
                  className="font-mono text-[11px] text-[#E11A2B] hover:text-white underline uppercase font-bold cursor-pointer transition-colors"
                >
                  Switch Unit
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end shrink-0 sm:pl-2">
            <span className="font-mono text-xs text-[#CBD5E1] uppercase font-bold truncate">
              {selectedBot.primaryMetric.label}
            </span>
            <span className="font-mono text-xl sm:text-3xl text-white font-black tracking-tight">
              {selectedBot.primaryMetric.value}
              <span className="text-xs sm:text-sm text-[#94A3B8] ml-1">{selectedBot.primaryMetric.unit}</span>
            </span>
          </div>
        </div>
        <div className="mt-4 pt-3 flex items-center justify-between text-[#CBD5E1] text-xs sm:text-sm border-t border-white/10 font-mono flex-wrap gap-2">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <span className="material-symbols-outlined text-[16px] text-[#e11a2b]">explore</span> {selectedBot.kpLocation} • {selectedBot.corridor}
          </span>
          <span className="flex items-center gap-1.5 text-[#e11a2b] font-extrabold">
            <span className="material-symbols-outlined text-[16px]">bolt</span> SMRT PERMANENT WAY ({selectedBot.status})
          </span>
        </div>
      </div>

      {/* Tactical Micro-Fix Prompts Section */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm text-[#CBD5E1] uppercase tracking-wider flex items-center gap-2 font-extrabold font-mono">
            <span className="material-symbols-outlined text-[20px] text-[#e11a2b]">touch_app</span> GLOVE-OPTIMIZED DIRECTIVES
          </span>
          <span className="font-mono text-xs text-white uppercase font-extrabold bg-[#272a2e] px-2.5 py-1 rounded-md border border-white/20">
            4 PRE-SETS READY
          </span>
        </div>

        {/* Quick Chips Grid (Roomy 64px Touch Bounds) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            className="flex items-center justify-between p-4 min-h-[64px] bg-[#12161F] hover:bg-[#191E2B] rounded-xl text-left transition active:scale-[0.98] group shadow-md border-2 border-white/10 hover:border-white/20 cursor-pointer"
            onClick={() => applyPreset('Tighten loose rail clips at Sleeper #4092 to 180 Nm')}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#06080C] flex items-center justify-center shrink-0 text-[#e11a2b] shadow-inner">
                <span className="material-symbols-outlined text-[22px]">build</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base text-white group-hover:text-[#e11a2b] font-bold truncate">
                  Tighten Sleeper #4092 Clip
                </span>
                <span className="text-xs sm:text-sm text-[#94A3B8]">Torque limit: 180 Nm</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#94A3B8] group-hover:text-[#e11a2b] text-[22px] shrink-0">
              chevron_right
            </span>
          </button>

          <button
            className="flex items-center justify-between p-4 min-h-[64px] bg-[#12161F] hover:bg-[#191E2B] rounded-xl text-left transition active:scale-[0.98] group shadow-md border-2 border-white/10 hover:border-white/20 cursor-pointer"
            onClick={() => applyPreset('Apply localized composite thermal weld on micro-fracture at KP 18.42')}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#06080C] flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
                <span className="material-symbols-outlined text-[22px]">local_fire_department</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base text-white group-hover:text-amber-400 font-bold truncate">
                  Thermal Composite Weld
                </span>
                <span className="text-xs sm:text-sm text-[#94A3B8]">Micro-fracture at KP 18.42</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#94A3B8] group-hover:text-white text-[22px] shrink-0">
              chevron_right
            </span>
          </button>

          <button
            className="flex items-center justify-between p-4 min-h-[64px] bg-[#12161F] hover:bg-[#191E2B] rounded-xl text-left transition active:scale-[0.98] group shadow-md border-2 border-white/10 hover:border-white/20 cursor-pointer"
            onClick={() => applyPreset('Perform pre-emptive vibration dampening patch before 04:00 AM')}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#06080C] flex items-center justify-center shrink-0 text-sky-400 shadow-inner">
                <span className="material-symbols-outlined text-[22px]">waves</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base text-white group-hover:text-sky-400 font-bold truncate">
                  Vibration Dampening Patch
                </span>
                <span className="text-xs sm:text-sm text-[#94A3B8]">Pre-emptive window: 04:00 AM</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#94A3B8] group-hover:text-white text-[22px] shrink-0">
              chevron_right
            </span>
          </button>

          <button
            className="flex items-center justify-between p-4 min-h-[64px] bg-[#12161F] hover:bg-[#191E2B] rounded-xl text-left transition active:scale-[0.98] group shadow-md border-2 border-white/10 hover:border-white/20 cursor-pointer"
            onClick={() => applyPreset('Laser-scan rail gauge clearance for morning peak clearance')}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#06080C] flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
                <span className="material-symbols-outlined text-[22px]">view_in_ar</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base text-white group-hover:text-emerald-400 font-bold truncate">
                  Laser Gauge Clearance Scan
                </span>
                <span className="text-xs sm:text-sm text-[#94A3B8]">Morning peak readiness</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#94A3B8] group-hover:text-white text-[22px] shrink-0">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* Live Conversation & Chain-of-Thought Stream */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm text-[#CBD5E1] uppercase tracking-wider flex items-center gap-2 font-extrabold font-mono">
            <span className="material-symbols-outlined text-[18px] text-white">forum</span> ACTIVE DISPATCH STREAM
          </span>
          <span className="font-mono text-xs text-[#94A3B8]">INTERACT 02:18</span>
        </div>

        {/* Dynamic messages stream */}
        {conversation.map((msg) => (
          <div
            key={msg.id}
            className={`w-full rounded-2xl p-5 sm:p-6 shadow-xl space-y-3 border-2 border-white/10 ${
              msg.sender === 'tech' ? 'bg-[#0E121A]' : 'bg-[#191E2B]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${
                    msg.sender === 'tech'
                      ? 'bg-[#e11a2b]/20 text-[#e11a2b] border-[#e11a2b]/60'
                      : 'bg-white/15 text-white border-white/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {msg.sender === 'tech' ? 'person' : 'psychology'}
                  </span>
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  {msg.author}
                </span>
              </div>
              <span className="font-mono text-xs sm:text-sm text-[#CBD5E1]">
                {msg.statusBadge ? (
                  <span className="bg-[#e11a2b]/30 text-white font-extrabold px-3 py-1 rounded-md border border-[#e11a2b]">
                    {msg.statusBadge}
                  </span>
                ) : (
                  msg.time
                )}
              </span>
            </div>

            <p className="text-base sm:text-lg text-white leading-relaxed font-medium">{msg.content}</p>

            {msg.badges && (
              <div className="flex gap-2 pt-1 flex-wrap">
                {msg.badges.map((b, i) => (
                  <span
                    key={i}
                    className="font-mono text-xs bg-[#06080C] px-3 py-1 rounded-md text-white flex items-center gap-1.5 border border-white/15"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#e11a2b]">
                      {b.includes('AUDIO') ? 'mic' : 'center_focus_strong'}
                    </span>
                    {b}
                  </span>
                ))}
              </div>
            )}

            {msg.steps && (
              <div className="mt-3 bg-[#06080C] rounded-xl p-4 space-y-2 border border-white/15">
                {msg.steps.map((st, i) => (
                  <div key={i} className="flex items-center justify-between text-[#CBD5E1] font-mono text-xs sm:text-sm">
                    <span className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-[#e11a2b] text-[18px]">
                        {st.status.includes('COMPLETED') || st.status.includes('INJECTED') || st.status.includes('TORQUED')
                          ? 'check_circle'
                          : 'radio_button_checked'}
                      </span>
                      {st.step}
                    </span>
                    <span
                      className={`font-black ${
                        st.status.includes('INJECTED') || st.status.includes('TORQUED')
                          ? 'text-emerald-400'
                          : st.status.includes('PENDING')
                          ? 'text-[#e11a2b]'
                          : 'text-white'
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Optical Camera Feed & Vision Analysis Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative h-40 rounded-xl bg-[#06080C] overflow-hidden border border-white/15 group shadow-inner">
            <img
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              alt="Subway tunnel CAM-01 track view"
              src={TRACK_CAM_INSPECTION}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-transparent to-transparent"></div>
            <div className="absolute top-2.5 left-2.5 bg-[#06080C]/90 px-2.5 py-1 rounded-md text-xs font-mono text-white font-bold border border-white/20">
              CAM-01 TRACK VIEW
            </div>
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-[#0b0e12]/90 px-2.5 py-1 rounded-md font-mono">
              <span className="w-2 h-2 rounded-full bg-[#e11a2b] animate-pulse"></span>
              <span className="text-xs text-[#ffb4ab] font-extrabold">TORQUE DEFICIT: 94 Nm</span>
            </div>
          </div>

          <div className="relative h-40 rounded-xl bg-[#06080C] overflow-hidden border border-white/15 group shadow-inner">
            <img
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              alt="Subway FLIR Thermal Scan"
              src={RAIL_THERMAL_SCAN}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-transparent to-transparent"></div>
            <div className="absolute top-2.5 left-2.5 bg-[#06080C]/90 px-2.5 py-1 rounded-md text-xs font-mono text-white font-bold border border-white/20">
              FLIR THERMAL SCAN
            </div>
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-[#0b0e12]/90 px-2.5 py-1 rounded-md font-mono">
              <span className="text-xs text-white font-extrabold">DELTA T: +4.6°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Micro-Fix Action Confirmation Card (Tactical HMI Card) */}
      <div className="w-full bg-[#12161F] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 border border-white/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#e11a2b] text-[28px]">
              precision_manufacturing
            </span>
            <h2 className="text-lg sm:text-xl text-white uppercase tracking-tight font-extrabold">
              Micro-Fix Protocol Payload
            </h2>
          </div>
          <span className="font-mono text-xs sm:text-sm bg-[#e11a2b]/25 text-white px-3 py-1 rounded-md font-black border border-[#e11a2b]">
            {isAuthorized ? 'EXECUTED' : 'DISPATCH QUEUE'}
          </span>
        </div>

        {/* Parameter Cluster Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
          <div className="bg-[#06080C] rounded-xl p-4 flex flex-col justify-between border border-white/10 shadow-inner">
            <span className="text-xs text-[#94A3B8] uppercase font-bold">TARGET ASSET</span>
            <span className="text-base sm:text-lg text-white font-black truncate mt-1">Outer Rail Clip #4092</span>
            <span className="text-xs text-[#e11a2b] font-bold mt-0.5">KP 18.422 (Zone 4B)</span>
          </div>
          <div className="bg-[#06080C] rounded-xl p-4 flex flex-col justify-between border border-white/10 shadow-inner">
            <span className="text-xs text-[#94A3B8] uppercase font-bold">REMEDY METHOD</span>
            <span className="text-base sm:text-lg text-white font-black truncate mt-1">Pneumatic 175 Nm</span>
            <span className="text-xs text-[#CBD5E1] font-bold mt-0.5">+ SMRT Fast-Polymer Seal</span>
          </div>
        </div>

        {/* Revenue Protection Impact Notice */}
        <div className="bg-[#191E2B] rounded-xl p-4 sm:p-5 flex items-start gap-4 border-l-4 border-[#e11a2b] shadow-md">
          <div className="w-10 h-10 rounded-lg bg-[#e11a2b]/20 text-[#e11a2b] flex items-center justify-center shrink-0 mt-0.5 border border-[#e11a2b]/40">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base text-white font-black uppercase tracking-wide">
              Revenue Impact Mitigation
            </span>
            <p className="text-sm sm:text-base text-[#CBD5E1] mt-1 leading-relaxed">
              Eliminates projected <span className="font-bold text-[#e11a2b]">15-minute speed restriction</span> during the 07:30 AM morning rush. Prevents cascading 42,000 passenger-minute delay.
            </p>
          </div>
        </div>

        {/* Simulation Output Card if triggered */}
        {simulationResult && (
          <div className="p-4 bg-[#06080C] rounded-xl border-2 border-emerald-500/50 text-sm font-mono text-emerald-300 flex items-start gap-3 shadow-lg">
            <span className="material-symbols-outlined text-[24px] text-emerald-400 shrink-0">insights</span>
            <span className="leading-relaxed font-semibold">{simulationResult}</span>
          </div>
        )}

        {/* Primary Rugged CTAs - Extra Large Touch Targets */}
        <div className="flex flex-col space-y-3 pt-2">
          <button
            className={`w-full min-h-[64px] text-white font-headline-sm uppercase rounded-xl flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all font-black tracking-wide cursor-pointer text-base sm:text-lg ${
              isAuthorized
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/40'
                : 'bg-[#e11a2b] hover:bg-[#c0001d] shadow-[#e11a2b]/30'
            }`}
            id="authBtn"
            disabled={isAuthorizing}
            onClick={handleAuthorizeFix}
          >
            {isAuthorizing ? (
              <>
                <span className="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
                <span>EXECUTING ROBOTIC CYCLE...</span>
              </>
            ) : isAuthorized ? (
              <>
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
                <span>FIX EXECUTED: 175 Nm REACHED & SEALED</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[28px]">power_settings_new</span>
                <span>Authorize AI Self-Healing Micro-Fix</span>
              </>
            )}
          </button>

          <button
            className="w-full min-h-[56px] bg-[#191E2B] text-white hover:bg-[#222838] uppercase rounded-xl flex items-center justify-center gap-2.5 transition active:scale-[0.98] border-2 border-white/15 cursor-pointer font-mono font-bold text-sm sm:text-base shadow-md"
            id="simBtn"
            disabled={isSimulating}
            onClick={handleSimulateFix}
          >
            {isSimulating ? (
              <>
                <span className="material-symbols-outlined text-[22px] animate-spin">sync</span>
                <span>CALCULATING FINITE ELEMENT ANALYSIS...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px] text-[#e11a2b]">tune</span>
                <span>Simulate Fix Outcome &amp; Thermal Curve</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conversational Command Input Station (Glove-friendly) */}
      <div className="w-full bg-[#191E2B] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 border border-white/15">
        <div className="flex items-center justify-between px-1 font-mono">
          <span className="text-xs sm:text-sm text-[#CBD5E1] uppercase flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-[18px] text-[#e11a2b]">terminal</span> FIELD PROMPT STATION
          </span>
          <span
            className={`text-xs sm:text-sm font-extrabold ${
              isRecording ? 'text-[#e11a2b] animate-pulse' : 'text-white'
            }`}
            id="voiceStatus"
          >
            {isRecording ? 'LISTENING (NOISE CANCELLED)...' : 'VOICE INTERCOM READY'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="relative flex-1 min-w-0">
            <input
              className="w-full h-12 sm:h-16 bg-[#06080C] rounded-xl px-3 sm:px-4 text-white placeholder:text-[#94A3B8]/60 text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#e11a2b] border-2 border-white/15 font-medium"
              id="promptInput"
              placeholder="Type maintenance instruction..."
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  dispatchCustomPrompt();
                }
              }}
            />
          </div>

          {/* Glove-friendly tactile buttons - 48px on mobile, 64px on sm+ */}
          <button
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl text-white flex items-center justify-center shrink-0 transition active:scale-95 shadow-md border-2 cursor-pointer ${
              isRecording ? 'border-[#e11a2b] bg-[#e11a2b]/30 text-[#e11a2b]' : 'border-white/15 bg-[#12161F] hover:bg-white/10'
            }`}
            onClick={toggleVoiceRecording}
            title="Audio Input"
          >
            <span className={`material-symbols-outlined text-[22px] sm:text-[26px] ${isRecording ? 'animate-pulse text-[#e11a2b]' : ''}`}>
              mic
            </span>
          </button>

          <button
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#12161F] text-white hover:bg-white/10 flex items-center justify-center shrink-0 transition active:scale-95 shadow-md border-2 border-white/15 cursor-pointer"
            onClick={captureTunnelPhoto}
            title="Camera Inspection"
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[26px]">photo_camera</span>
          </button>

          <button
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#e11a2b] hover:bg-[#c0001d] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xl shadow-[#e11a2b]/40 cursor-pointer"
            onClick={dispatchCustomPrompt}
            title="Send Command"
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[26px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
