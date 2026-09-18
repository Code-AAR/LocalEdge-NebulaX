import React, { createContext, useContext, useState, useEffect } from 'react';
import { TrackBot } from '../types';
import { TRACKBOTS_FLEET } from '../data/trackbots';

interface TrackBotContextType {
  bots: TrackBot[];
  selectedBot: TrackBot;
  selectedBotId: string;
  selectBot: (botId: string) => void;
  toggleSelectedBotHold: () => { nextState: boolean; message: string };
  isSelectorModalOpen: boolean;
  setIsSelectorModalOpen: (open: boolean) => void;
}

const TrackBotContext = createContext<TrackBotContextType | undefined>(undefined);

export const TrackBotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bots, setBots] = useState<TrackBot[]>(() => {
    try {
      const saved = localStorage.getItem('smrt_active_bot_id');
      if (saved) {
        const found = TRACKBOTS_FLEET.find((b) => b.id === saved);
        if (found) return TRACKBOTS_FLEET;
      }
    } catch {
      // ignore
    }
    return TRACKBOTS_FLEET;
  });

  const [selectedBotId, setSelectedBotId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('smrt_active_bot_id');
      if (saved && TRACKBOTS_FLEET.some((b) => b.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'trackbot-04'; // Default to TrackBot-04
  });

  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('smrt_active_bot_id', selectedBotId);
    } catch {
      // ignore
    }
  }, [selectedBotId]);

  const selectBot = (botId: string) => {
    if (bots.some((b) => b.id === botId)) {
      setSelectedBotId(botId);
    }
  };

  const selectedBot = bots.find((b) => b.id === selectedBotId) || bots[0];

  const toggleSelectedBotHold = () => {
    const isCurrentlyHeld = selectedBot.status === 'HELD';
    const nextHeld = !isCurrentlyHeld;
    const newStatus = nextHeld ? 'HELD' : 'AUTONOMOUS';
    const newSpeed = nextHeld ? 0.0 : (selectedBot.speedKmH === 0 ? 4.2 : selectedBot.speedKmH);

    setBots((prev) =>
      prev.map((b) =>
        b.id === selectedBot.id
          ? {
              ...b,
              status: newStatus,
              speedKmH: newSpeed,
            }
          : b
      )
    );

    const message = nextHeld
      ? `EMERGENCY BRAKE ENGAGED: ${selectedBot.name} locked at ${selectedBot.kpLocation}`
      : `BRAKES RELEASED: ${selectedBot.name} resumed autonomous patrol`;

    return { nextState: nextHeld, message };
  };

  return (
    <TrackBotContext.Provider
      value={{
        bots,
        selectedBot,
        selectedBotId,
        selectBot,
        toggleSelectedBotHold,
        isSelectorModalOpen,
        setIsSelectorModalOpen,
      }}
    >
      {children}
    </TrackBotContext.Provider>
  );
};

export const useTrackBot = (): TrackBotContextType => {
  const context = useContext(TrackBotContext);
  if (!context) {
    throw new Error('useTrackBot must be used within a TrackBotProvider');
  }
  return context;
};
