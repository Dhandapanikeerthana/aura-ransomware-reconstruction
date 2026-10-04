import React from 'react';
import {
  ShieldAlert,
  Layers,
  Clock,
  FileSearch,
  Network,
  Binary,
  AlertTriangle,
  FileText,
  Upload,
  RotateCcw,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'timeline'
  | 'evidence'
  | 'graph'
  | 'mitre'
  | 'iocs'
  | 'weaknesses'
  | 'report';

interface TopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onResetDemo: () => void;
  onOpenIngest: () => void;
  eventCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onResetDemo,
  onOpenIngest,
  eventCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'timeline', label: 'Attack Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'evidence', label: 'Evidence Center', icon: <FileSearch className="w-4 h-4 text-cyan-400" /> },
    { id: 'graph', label: 'Attack Graph', icon: <Network className="w-4 h-4" /> },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'iocs', label: 'IOCs', icon: <Binary className="w-4 h-4" /> },
    { id: 'weaknesses', label: 'Weaknesses', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'report', label: 'Incident Report', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080d18]/75 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 font-mono">
              AURA
            </span>
            <span className="text-[11px] font-mono text-cyan-400/80 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 hidden xl:inline">
              DFIR RECONSTRUCTION
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Glass segmented buttons with subtle luminous glow) */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none p-1 rounded-xl bg-slate-900/40 border border-white/[0.05] backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'evidence' && (
                  <span className="text-[10px] px-1.5 py-0.2 font-mono bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                    {eventCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onResetDemo}
            title="Reload verified 52-event synthetic ransomware dataset"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-lg backdrop-blur-md hover:text-white transition-all whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Demo Incident</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] whitespace-nowrap border border-cyan-400/30"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Telemetry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
