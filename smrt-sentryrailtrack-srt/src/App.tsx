import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TelemetryView } from './components/TelemetryView';
import { TrackPulseSubsystemEngine } from './components/TrackPulseSubsystemEngine';
import { TrackFaultChatbot } from './components/TrackFaultChatbot';
import { DispatchView } from './components/DispatchView';
import { SelfHealView } from './components/SelfHealView';
import { RiskAlertView } from './components/RiskAlertView';
import { SettingsModal } from './components/SettingsModal';
import { TrackBotSelectorModal } from './components/TrackBotSelector';
import { ThemeProvider } from './context/ThemeContext';
import { TrackBotProvider } from './context/TrackBotContext';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('telemetry-&-live-map');
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [initialDispatchPrompt, setInitialDispatchPrompt] = useState<string>('');
  const [chatTopic, setChatTopic] = useState<string | undefined>(undefined);

  // Synchronize Senior Mode across entire document hierarchy for global text scaling
  useEffect(() => {
    if (seniorMode) {
      document.documentElement.classList.add('senior-mode');
      document.body.classList.add('senior-mode');
    } else {
      document.documentElement.classList.remove('senior-mode');
      document.body.classList.remove('senior-mode');
    }
  }, [seniorMode]);

  const handleNavigate = (tab: TabType, promptTemplate?: string) => {
    if (tab === 'ai-prompt-&-dispatch' && promptTemplate) {
      setInitialDispatchPrompt(promptTemplate);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskAiAdvisor = (prompt: string) => {
    setChatTopic(prompt);
    setActiveTab('ai-fault-advisor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDispatch = (prompt: string) => {
    setInitialDispatchPrompt(prompt);
    setActiveTab('ai-prompt-&-dispatch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubsystemStudio = () => {
    setActiveTab('trackpulse-subsystems');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        seniorMode ? 'senior-mode text-lg' : ''
      }`}
    >
      <Header
        activeTab={activeTab}
        seniorMode={seniorMode}
        setSeniorMode={setSeniorMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiAdvisor={() => handleNavigate('ai-fault-advisor')}
      />

      <main className="flex-1 pb-20 sm:pb-28 pt-18 sm:pt-24 w-full max-w-full overflow-x-hidden">
        {activeTab === 'telemetry-&-live-map' && (
          <TelemetryView onNavigate={handleNavigate} />
        )}

        {activeTab === 'trackpulse-subsystems' && (
          <TrackPulseSubsystemEngine onAskAiAdvisor={handleAskAiAdvisor} />
        )}

        {activeTab === 'ai-fault-advisor' && (
          <TrackFaultChatbot
            initialTopic={chatTopic}
            onNavigateToDispatch={handleNavigateToDispatch}
            onOpenSubsystemStudio={handleOpenSubsystemStudio}
          />
        )}

        {activeTab === 'ai-prompt-&-dispatch' && (
          <DispatchView initialPrompt={initialDispatchPrompt} />
        )}

        {activeTab === 'micro-fix-log-&-self-healing-history' && (
          <SelfHealView />
        )}

        {activeTab === 'commuter-risk-analytics-&-early-warning' && (
          <RiskAlertView
            onNavigateToAiAdvisor={(p) =>
              handleAskAiAdvisor(p || 'Assess track risk for commuter network')
            }
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <TrackBotSelectorModal />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        seniorMode={seniorMode}
        setSeniorMode={setSeniorMode}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TrackBotProvider>
        <MainApp />
      </TrackBotProvider>
    </ThemeProvider>
  );
}
