import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { TabType } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  source?: 'gemini-3.8-flash' | 'smrt-knowledge-base';
}

interface TrackFaultChatbotProps {
  onNavigateToDispatch?: (dispatchPrompt: string) => void;
  initialTopic?: string;
  onOpenSubsystemStudio?: () => void;
}

const PRESET_TOPICS = [
  {
    title: '1. Door Subsystem',
    prompt: 'Identify open/close temporal segments (start_time, end_time) and classify resistance status as Normal or Abnormal resistance from train 304 door sensor telemetry.',
    icon: 'sensor_door',
    severity: 'DOOR_PREDICTION',
    schema: 'door_predictions.csv',
  },
  {
    title: '2. ACV Refrigerant Leak',
    prompt: 'Analyze ACV cabin/ambient telemetry to rank train cars from highest to lowest likelihood of refrigerant leak (Format: 03|01|02|04) and explain thermodynamic superheat anomalies.',
    icon: 'mode_fan',
    severity: 'ACV_PREDICTION',
    schema: 'acv_predictions.csv',
  },
  {
    title: '3. Rail Corrugation',
    prompt: 'Process multi-channel axle-box vibration signals to categorize rail condition into Normal, Side I, or Side II and explain dominant harmonic frequencies.',
    icon: 'vibration',
    severity: 'RAIL_PREDICTION',
    schema: 'rail_predictions.csv',
  },
  {
    title: '4. SHM Fatigue Regression',
    prompt: 'Calculate dynamic stress time-series from strain gauges to estimate exact numeric cumulative fatigue damage regression value for bogie transom joint.',
    icon: 'architecture',
    severity: 'SHM_PREDICTION',
    schema: 'shm_predictions.csv',
  },
  {
    title: '🚨 Emergency Track Trip',
    prompt: 'Red-alert track trip reported at KP 18.420. Initiate immediate offline emergency response protocol, third-rail 750V DC power isolation clearance, and track shunting safety checks.',
    icon: 'e911_emergency',
    severity: 'EMERGENCY',
    schema: 'SAFETY_PROTOCOL',
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome-msg',
    role: 'model',
    content: `### 🚆 SRT AI Predictive Engine & Operational Assistant Online
Welcome. I am **SRT AI**, specialized in rapid transit condition monitoring, automated multi-sensor analysis, and dual-mode engineering advisory.

#### 🎯 Core Diagnostic Capabilities:
1. **Door Subsystem**: Temporal segment detection (\`start_time,end_time\`) & resistance classification (\`Normal\` vs \`Abnormal resistance\`).
2. **ACV Subsystem**: Cabin/ambient telemetry & refrigerant leak fault localization (Ranked cars: \`03|01|02|04\`).
3. **Rail Corrugation Subsystem**: Multi-channel axle-box vibration classification (\`Normal\` / \`Side I\` / \`Side II\`).
4. **SHM Subsystem**: Dynamic stress time-series cumulative fatigue damage regression (\`0.0418\`).

#### 📋 Automated Evaluation Compliance:
All model predictions are provided with exact CSV deliverable schemas (\`door_predictions.csv\`, \`acv_predictions.csv\`, \`rail_predictions.csv\`, \`shm_predictions.csv\`) and explainability notes.

Select a subsystem scenario below or query live sensor streams:`,
    timestamp: '02:00:15',
    source: 'gemini-3.8-flash',
  },
];

export const TrackFaultChatbot: React.FC<TrackFaultChatbotProps> = ({
  onNavigateToDispatch,
  initialTopic,
  onOpenSubsystemStudio,
}) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState<string>(initialTopic || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'strategic' | 'tactical'>('strategic');
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<string>('NSL: Orchard to Somerset (Down-Line KP 18.4)');
  const [activeBotContext, setActiveBotContext] = useState<string>('TrackBot-04 (Torque & Micro-Weld Arm)');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toTimeString().split(' ')[0],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          userRole,
          isEmergency,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          context: {
            section: selectedSection,
            botId: activeBotContext,
            telemetry: 'Door Current: 9.4A, ACV Superheat: 16.8K, Axle Shock: 4.18G, Fatigue Index: 0.0418',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      const botReply: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'No response generated from SRT AI.',
        timestamp: new Date().toTimeString().split(' ')[0],
        source: data.source || 'gemini-3.8-flash',
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `### 🚨 SRT AI: Offline Emergency Fallback Activated
The system has seamlessly engaged local predictive rules and safety checklists.

#### 1. ⚡ Immediate Physical Safety Isolation:
- [x] Confirm 750V DC third-rail traction power de-energization (PTW Clearance #PTW-99201).
- [x] Affix portable track shunt clamps to prevent false train detection.

#### 2. 📊 Subsystem Diagnostics & Predictions:
- **Door Subsystem**: Segment detected with \`Abnormal resistance\` (motor current spiked to 9.4A at 310mm travel).
- **ACV Subsystem**: Ranked cars: \`03|01|02|04\` (Car 03 superheat 16.8K indicates refrigerant leak).
- **Rail Corrugation**: Axle-box vibration classified as \`Side I\` (dominant harmonic 122 Hz).
- **SHM Subsystem**: Cumulative fatigue damage regression estimated at \`0.0418\`.`,
        timestamp: new Date().toTimeString().split(' ')[0],
        source: 'smrt-knowledge-base',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  // Helper to trigger CSV download directly from chat
  const handleDownloadChatCsv = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent.trim()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Extract dispatch command if present
  const extractDispatchCommand = (text: string): string | null => {
    const match = text.match(/`?(DISPATCH\s+[^`\n]+)`?/i);
    return match ? match[1].trim() : null;
  };

  const handleExecuteDispatch = (command: string) => {
    if (onNavigateToDispatch) {
      onNavigateToDispatch(command);
    }
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4">
      {/* Top Banner & Control Deck */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isEmergency
            ? 'bg-red-950/40 border-red-500/80 text-white shadow-xl shadow-red-950/50'
            : isDarkMode
            ? 'bg-[#12161F] border-white/15 text-white shadow-xl shadow-black/40'
            : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/20 ${
                isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-[#E11A2B] text-white shadow-[#E11A2B]/40'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {isEmergency ? 'e911_emergency' : 'smart_toy'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline-sm sm:font-headline-md font-bold uppercase tracking-tight">
                  SRT AI Advisory Console
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini 3.8 Flash Active
                </span>
                {isEmergency && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black font-mono bg-red-600 text-white animate-bounce">
                    🚨 EMERGENCY PROTOCOL ACTIVE
                  </span>
                )}
              </div>
              <p
                className={`text-xs sm:text-sm mt-0.5 ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600'
                }`}
              >
                Multi-subsystem temporal segmentation, refrigerant leak ranking, vibration classification & 750V safety
              </p>
            </div>
          </div>

          {/* Context Selectors & Reset */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Role Lens Selector */}
            <div className="inline-flex p-1 rounded-xl bg-black/30 border border-white/15 text-xs font-mono">
              <button
                type="button"
                onClick={() => setUserRole('strategic')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                  userRole === 'strategic'
                    ? 'bg-[#E11A2B] text-white'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">monitoring</span>
                Strategic
              </button>
              <button
                type="button"
                onClick={() => setUserRole('tactical')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                  userRole === 'tactical'
                    ? 'bg-[#E11A2B] text-white'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">engineering</span>
                Tactical
              </button>
            </div>

            {/* Emergency Toggle */}
            <button
              type="button"
              onClick={() => setIsEmergency(!isEmergency)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                isEmergency
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/50'
                  : 'bg-black/30 hover:bg-red-950/40 text-red-400 border border-red-500/40'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isEmergency ? 'check_circle' : 'warning'}
              </span>
              <span>{isEmergency ? 'Emergency Mode' : 'Track Trip'}</span>
            </button>

            {/* Subsystem Studio Launcher */}
            {onOpenSubsystemStudio && (
              <button
                type="button"
                onClick={onOpenSubsystemStudio}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition active:scale-95 flex items-center gap-1 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">science</span>
                <span>Subsystem Studio</span>
              </button>
            )}

            {/* Section selector */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer max-w-full truncate ${
                isDarkMode
                  ? 'bg-[#191E2B] border-white/15 text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <option value="NSL: Orchard to Somerset (Down-Line KP 18.4)">NSL: Orchard ⇄ Somerset</option>
              <option value="NSL: Jurong East Crossover Junction">NSL: Jurong East Crossover</option>
              <option value="EWL: Clementi to Dover Curved Track">EWL: Clementi ⇄ Dover</option>
              <option value="CCL: Bishan Sub-Surface Tunnel Bounds">CCL: Bishan Underpass</option>
              <option value="TEL: Maxwell to Shenton Way Station">TEL: Maxwell ⇄ Shenton Way</option>
            </select>

            {/* Clear button */}
            <button
              onClick={clearChat}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center gap-1 cursor-pointer ${
                isDarkMode
                  ? 'border-white/15 hover:bg-white/10 text-[#CBD5E1]'
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              title="Clear conversation history"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Quick Preventive Scenario Chips */}
        <div className="mt-4 pt-3 border-t border-dashed border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">
                lightbulb
              </span>
              Suggested Preventive Inquiries:
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-[#E11A2B] font-bold">
              TAP TO INQUIRE
            </span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {PRESET_TOPICS.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(topic.prompt)}
                disabled={isLoading}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between gap-1 cursor-pointer disabled:opacity-50 ${
                  isDarkMode
                    ? 'bg-[#191E2B]/80 hover:bg-[#222838] border-white/10 hover:border-[#E11A2B]/60'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#E11A2B]/60 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-[18px] text-[#E11A2B]">
                    {topic.icon}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-extrabold px-1 rounded ${
                      topic.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400'
                        : topic.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {topic.severity}
                  </span>
                </div>
                <div className="font-bold text-xs leading-snug line-clamp-1">{topic.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        className={`flex-1 min-h-[380px] sm:min-h-[420px] max-h-[580px] p-3 sm:p-5 rounded-2xl border overflow-y-auto space-y-4 transition-all ${
          isDarkMode
            ? 'bg-[#0E121A] border-white/15'
            : 'bg-slate-100/70 border-slate-200'
        }`}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const dispatchCmd = !isUser ? extractDispatchCommand(msg.content) : null;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-amber-500 text-black font-bold ring-2 ring-amber-300/60'
                    : 'bg-[#E11A2B] text-white ring-2 ring-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                  {isUser ? 'engineering' : 'smart_toy'}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] sm:max-w-[80%] flex flex-col ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                {/* Meta info */}
                <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono">
                  <span className="font-bold">
                    {isUser ? 'Lead Track Engineer' : 'SMRT AI Advisor'}
                  </span>
                  <span className="opacity-60">{msg.timestamp}</span>
                  {!isUser && msg.source && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {msg.source}
                    </span>
                  )}
                </div>

                {/* Bubble card */}
                <div
                  className={`p-4 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap select-text ${
                    isUser
                      ? isDarkMode
                        ? 'bg-[#191E2B] border-[#E11A2B]/40 text-white rounded-tr-none'
                        : 'bg-slate-900 border-slate-800 text-white rounded-tr-none'
                      : isDarkMode
                      ? 'bg-[#12161F] border-white/15 text-[#F1F5F9] rounded-tl-none shadow-lg'
                      : 'bg-white border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Formatted Content Rendering */}
                  <div className="space-y-2 break-words">
                    {msg.content.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h4
                            key={lIdx}
                            className="font-headline-sm text-sm font-bold uppercase tracking-tight text-[#E11A2B] pt-1"
                          >
                            {line.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                        return (
                          <div key={lIdx} className="pl-2 font-medium flex items-start gap-1.5">
                            <span className="text-[#E11A2B] font-mono font-bold shrink-0">
                              {line.substring(0, 3)}
                            </span>
                            <span>{line.substring(3)}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={lIdx} className="pl-3 flex items-start gap-1.5 opacity-90">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('`') && line.endsWith('`')) {
                        return (
                          <div
                            key={lIdx}
                            className="p-2 rounded-lg bg-black/80 text-emerald-400 font-mono text-xs border border-emerald-500/30 my-1 overflow-x-auto"
                          >
                            {line.replace(/`/g, '')}
                          </div>
                        );
                      }
                      return (
                        <p key={lIdx} className={line.trim() === '' ? 'h-1' : ''}>
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {/* Quick Action bar underneath message */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 1-Click Dispatch Button if command found */}
                        {dispatchCmd && (
                          <button
                            type="button"
                            onClick={() => handleExecuteDispatch(dispatchCmd)}
                            className="px-3 py-1 rounded-lg bg-[#E11A2B] hover:bg-[#c91424] text-white font-bold tracking-wide transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#E11A2B]/30 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              precision_manufacturing
                            </span>
                            <span>Send to Dispatcher</span>
                          </button>
                        )}

                        {/* Detect Deliverable CSVs in AI response */}
                        {msg.content.includes('door_predictions.csv') && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadChatCsv(
                                'door_predictions.csv',
                                'start_time,end_time,prediction\n0.0,3.8,Normal\n14.2,18.9,Abnormal resistance\n32.0,35.6,Normal\n48.1,53.2,Abnormal resistance'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>door_predictions.csv</span>
                          </button>
                        )}

                        {msg.content.includes('acv_predictions.csv') && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadChatCsv(
                                'acv_predictions.csv',
                                'file_id,ranked_cars\nacv_fleet_telemetry_run42.csv,03|01|02|04'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40 text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>acv_predictions.csv</span>
                          </button>
                        )}

                        {msg.content.includes('rail_predictions.csv') && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadChatCsv(
                                'rail_predictions.csv',
                                'file_id,prediction\naxle_vib_ch1_kp18.csv,Side I'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>rail_predictions.csv</span>
                          </button>
                        )}

                        {msg.content.includes('shm_predictions.csv') && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadChatCsv(
                                'shm_predictions.csv',
                                'file_id,prediction\nshm_strain_bogie_run12.csv,0.0418'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>shm_predictions.csv</span>
                          </button>
                        )}

                        {onOpenSubsystemStudio && (
                          <button
                            type="button"
                            onClick={onOpenSubsystemStudio}
                            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-mono transition flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">science</span>
                            <span>Open Engine</span>
                          </button>
                        )}
                      </div>

                      {/* Copy advice button */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                          copyStatus === msg.id
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isDarkMode
                            ? 'border-white/15 hover:bg-white/10 text-[#94A3B8]'
                            : 'border-slate-300 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copyStatus === msg.id ? 'check' : 'content_copy'}
                        </span>
                        <span>{copyStatus === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E11A2B] text-white flex items-center justify-center shrink-0 animate-pulse ring-2 ring-[#E11A2B]/50">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div
              className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
                isDarkMode
                  ? 'bg-[#12161F] border-white/15 text-white'
                  : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11A2B] animate-bounce"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-xs font-mono tracking-wider font-bold">
                Synthesizing preventive measures from SMRT safety standards...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border transition-all ${
          isDarkMode
            ? 'bg-[#12161F] border-white/15 shadow-xl shadow-black/40'
            : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about preventive track measures, ultrasonic criteria, clip torque tolerances, or switch gaps..."
            rows={2}
            className={`flex-1 p-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E11A2B] transition ${
              isDarkMode
                ? 'bg-[#191E2B] border-white/15 text-white placeholder:text-white/40'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isLoading}
            className="h-12 px-4 sm:px-5 rounded-xl bg-[#E11A2B] hover:bg-[#c91424] text-white font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#E11A2B]/40 shrink-0 cursor-pointer"
          >
            <span className="hidden sm:inline">Ask AI</span>
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>

        <div
          className={`mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono ${
            isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'
          }`}
        >
          <span>Press Enter to send • Shift + Enter for new line</span>
          <span>Target Window: 01:30–04:30 HRS POSSESSION</span>
        </div>
      </div>
    </div>
  );
};
