import React, { useState } from 'react';

interface LiDARModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiDARModal: React.FC<LiDARModalProps> = ({ isOpen, onClose }) => {
  const [pointDensity, setPointDensity] = useState<'ultra' | 'standard'>('ultra');
  const [colorMode, setColorMode] = useState<'depth' | 'reflectance' | 'flir'>('depth');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#12161F] border border-white/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-3.5 sm:px-4 py-3 bg-[#191E2B] border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#E11A2B] text-[20px] sm:text-[22px] shrink-0">view_in_ar</span>
            <div className="min-w-0">
              <h3 className="font-headline-sm text-xs sm:text-sm text-white uppercase font-bold tracking-wider truncate">
                3D LiDAR Point Cloud Reconstruction
              </h3>
              <p className="font-label-sm text-[10px] text-[#94A3B8] truncate">
                KP 18.422 • North-South Line Downsurface
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded bg-[#06080C] hover:bg-white/10 flex items-center justify-center text-white transition shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Viewport Canvas Simulation */}
        <div className="relative h-64 bg-[#06080C] overflow-hidden flex items-center justify-center">
          {/* Animated 3D Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#E11A2B_1px,transparent_1px)] [background-size:16px_16px] opacity-35"></div>
          
          {/* Tunnel Wireframe SVG */}
          <svg className="w-full h-full" viewBox="0 0 400 240" fill="none">
            {/* Tunnel Arch */}
            <path
              d="M 50 220 C 50 80, 350 80, 350 220"
              stroke="#333D52"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M 100 220 C 100 120, 300 120, 300 220"
              stroke="#E11A2B"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
            {/* Rails */}
            <line x1="80" y1="210" x2="320" y2="210" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.3" />
            <line x1="120" y1="210" x2="160" y2="150" stroke="#E11A2B" strokeWidth="2" />
            <line x1="280" y1="210" x2="240" y2="150" stroke="#E11A2B" strokeWidth="2" />
            {/* Sleepers */}
            <line x1="130" y1="180" x2="270" y2="180" stroke="#94A3B8" strokeWidth="2" strokeOpacity="0.4" />
            <line x1="110" y1="200" x2="290" y2="200" stroke="#94A3B8" strokeWidth="3" strokeOpacity="0.6" />
            {/* Target Hotspot Sleeper #4092 */}
            <circle cx="200" cy="180" r="14" stroke="#E11A2B" strokeWidth="2" fill="#E11A2B" fillOpacity="0.2" className="animate-pulse" />
            <circle cx="200" cy="180" r="3" fill="#FFFFFF" />
            <text x="200" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
              SLEEPER #4092 (PLAY +0.42mm)
            </text>
            {/* Scanning Laser sweep line */}
            <line x1="0" y1="100" x2="400" y2="100" stroke="#E11A2B" strokeWidth="1" strokeDasharray="6 2" opacity="0.8">
              <animate attributeName="y1" values="40;220;40" dur="4s" repeatCount="indefinite" />
              <animate attributeName="y2" values="40;220;40" dur="4s" repeatCount="indefinite" />
            </line>
          </svg>

          {/* Telemetry HUD tags */}
          <div className="absolute top-2 left-2 bg-[#06080C]/90 px-2 py-1 rounded border border-white/10 font-label-sm text-[10px] text-white">
            POINTS: 4.8M/sec • DENSITY: {pointDensity === 'ultra' ? '0.2mm' : '1.0mm'}
          </div>
          <div className="absolute top-2 right-2 bg-[#E11A2B]/20 px-2 py-1 rounded border border-[#E11A2B]/40 font-label-sm text-[10px] text-[#E11A2B] font-bold">
            SCAN MODE: {colorMode.toUpperCase()}
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-label-sm text-[#94A3B8] bg-[#06080C]/80 px-2 py-1 rounded">
            <span>AZIMUTH: 184.2° | ELEV: -12.4°</span>
            <span className="text-white font-bold">GAUGE: 1,435.42 mm</span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-[#12161F] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] text-[#94A3B8] uppercase font-bold">Spectral Map</span>
            <div className="flex gap-1">
              {(['depth', 'reflectance', 'flir'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setColorMode(mode)}
                  className={`px-2.5 py-1 rounded font-label-sm text-[10px] uppercase font-bold transition ${
                    colorMode === mode
                      ? 'bg-[#E11A2B] text-white'
                      : 'bg-[#191E2B] text-[#94A3B8] hover:text-white border border-white/10'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] text-[#94A3B8] uppercase font-bold">Lidar Resolution</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPointDensity('ultra')}
                className={`px-2.5 py-1 rounded font-label-sm text-[10px] uppercase font-bold transition ${
                  pointDensity === 'ultra'
                    ? 'bg-white text-black'
                    : 'bg-[#191E2B] text-[#94A3B8] hover:text-white border border-white/10'
                }`}
              >
                Ultra (0.2mm)
              </button>
              <button
                onClick={() => setPointDensity('standard')}
                className={`px-2.5 py-1 rounded font-label-sm text-[10px] uppercase font-bold transition ${
                  pointDensity === 'standard'
                    ? 'bg-white text-black'
                    : 'bg-[#191E2B] text-[#94A3B8] hover:text-white border border-white/10'
                }`}
              >
                Fast (1.0mm)
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-1 w-full py-2.5 bg-[#191E2B] hover:bg-[#222838] text-white font-headline-sm text-xs uppercase font-bold rounded border border-white/15 transition"
          >
            Return to Telemetry Console
          </button>
        </div>
      </div>
    </div>
  );
};
