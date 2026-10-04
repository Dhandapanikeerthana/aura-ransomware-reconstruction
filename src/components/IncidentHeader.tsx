import React from 'react';
import {
  ShieldAlert,
  Server,
  UserX,
  Binary,
  GitCommit,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { IncidentStatus } from '../types';

interface IncidentHeaderProps {
  status: IncidentStatus;
  onStatusChange: (newStatus: IncidentStatus) => void;
  eventCount: number;
  stageCount: number;
  hostCount: number;
  userCount: number;
  iocCount: number;
}

export const IncidentHeader: React.FC<IncidentHeaderProps> = ({
  status,
  onStatusChange,
  eventCount,
  stageCount,
  hostCount,
  userCount,
  iocCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const statuses: IncidentStatus[] = ['NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED'];

  const getStatusStyle = (st: IncidentStatus) => {
    switch (st) {
      case 'NEW':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'ACKNOWLEDGED':
        return 'text-blue-400 bg-blue-950/40 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
      case 'INVESTIGATING':
        return 'text-cyan-300 bg-cyan-950/60 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30';
      case 'RESOLVED':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    }
  };

  return (
    <div className="bg-[#090e1c]/60 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 py-2.5">
      <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Incident info & organization */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-950/70 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)] tracking-wider">
              CRITICAL · P1
            </span>
            <span className="text-xs font-bold text-white font-mono tracking-wide">
              INC-2026-9042
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <div className="text-xs text-slate-300 flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">Case:</span>
            <span className="text-slate-200">AuraCrypt Ransomware Intrusion &amp; Double Extortion</span>
          </div>

          <span className="text-slate-600 hidden md:inline">·</span>

          <div className="text-xs text-slate-400 hidden md:flex items-center gap-1.5">
            <span>Target:</span>
            <span className="text-cyan-200/90 font-mono text-[11px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
              St. Jude Regional Healthcare &amp; College Network
            </span>
          </div>
        </div>

        {/* Right: Telemetry metrics summary & status controller */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
            <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-100 font-bold">{eventCount}</span>
            <span className="text-slate-400 text-[11px]">Events</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-100 font-bold">{stageCount}</span>
            <span className="text-slate-400 text-[11px]">Stages</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-100 font-bold">{hostCount}</span>
            <span className="text-slate-400 text-[11px]">Hosts</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
            <UserX className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-100 font-bold">{userCount}</span>
            <span className="text-slate-400 text-[11px]">Accounts</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
            <Binary className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-100 font-bold">{iocCount}</span>
            <span className="text-slate-400 text-[11px]">IOCs</span>
          </div>

          {/* Status selector with glass dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${getStatusStyle(
                status
              )}`}
            >
              <span className="opacity-80">STATUS:</span>
              <span>{status}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#090e1c]/95 border border-white/[0.12] rounded-xl shadow-2xl backdrop-blur-2xl z-50 py-1.5">
                <div className="px-3 py-1 text-[10px] text-slate-500 font-mono uppercase tracking-wider border-b border-white/[0.08]">
                  Update Investigation
                </div>
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onStatusChange(st);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                  >
                    <span>{st}</span>
                    {status === st && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
