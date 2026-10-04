import React from 'react';
import {
  ShieldAlert,
  GitCommit,
  Layers,
  Binary,
  AlertTriangle,
  Server,
  User,
  ArrowRight,
  TrendingUp,
  Cpu,
  FileSearch,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  SecurityEvent,
  ReconstructedStage,
  MitreTechniqueMapping,
  IOC,
  SecurityWeakness,
} from '../types';

interface DashboardViewProps {
  events: SecurityEvent[];
  stages: ReconstructedStage[];
  mitreMappings: MitreTechniqueMapping[];
  iocs: IOC[];
  weaknesses: SecurityWeakness[];
  onNavigateTab: (tab: any) => void;
  onSelectStage: (stageName: string) => void;
  onInspectEventId: (eventId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  stages,
  mitreMappings,
  iocs,
  weaknesses,
  onNavigateTab,
  onSelectStage,
  onInspectEventId,
}) => {
  // Aggregate sources
  const sourceCounts: Record<string, number> = {};
  events.forEach((e) => {
    sourceCounts[e.logSource] = (sourceCounts[e.logSource] || 0) + 1;
  });

  // Severity counts
  const severityCounts: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Info: 0,
  };
  events.forEach((e) => {
    if (severityCounts[e.severity] !== undefined) {
      severityCounts[e.severity]++;
    }
  });

  return (
    <div className="space-y-4">
      {/* Top Incident Summary Cards with Glassmorphism */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Total Telemetry</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <GitCommit className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums tracking-tight">
              {events.length}
            </div>
            <div className="text-[10px] text-cyan-300/80 font-mono mt-0.5">Normalized Events</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Attack Chain</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tabular-nums tracking-tight">
              {stages.length}
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">Reconstructed Stages</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">MITRE ATT&amp;CK</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-300 tabular-nums tracking-tight">
              {mitreMappings.length}
            </div>
            <div className="text-[10px] text-rose-400/80 font-mono mt-0.5">Mapped Techniques</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Forensic IOCs</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Binary className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300 tabular-nums tracking-tight">
              {iocs.length}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Extracted Indicators</div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Compromised</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Server className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-300 tabular-nums tracking-tight">
              3 <span className="text-xs font-normal text-slate-400">Hosts</span>
            </div>
            <div className="text-[10px] text-purple-300/80 font-mono mt-0.5">2 Domain Accounts</div>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Root Gaps</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-orange-300 tabular-nums tracking-tight">
              {weaknesses.length}
            </div>
            <div className="text-[10px] text-orange-400/80 font-mono mt-0.5">Architectural Gaps</div>
          </div>
        </div>
      </div>

      {/* Attack Stage Progression Horizontal Ribbon */}
      <div className="glass-panel rounded-2xl p-5 space-y-3.5 border-white/[0.08] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
              Reconstructed Ransomware Attack Chain Progression
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-300/80 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
            10:01:14 UTC → 10:22:45 UTC (Elapsed: 21m 31s)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2 pt-1">
          {stages.map((stg, i) => (
            <button
              key={stg.id}
              onClick={() => {
                onSelectStage(stg.stage);
                onNavigateTab('evidence');
              }}
              className="p-2.5 glass-card glass-card-hover rounded-xl text-left transition-all group flex flex-col justify-between border-white/[0.07] hover:border-cyan-500/50"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="font-semibold text-slate-500">0{i + 1}</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded border border-emerald-800/60">{stg.confidence[0]}</span>
              </div>
              <div className="text-[11px] font-bold font-mono text-slate-100 group-hover:text-cyan-300 truncate my-1.5">
                {stg.stage}
              </div>
              <div className="text-[9px] font-mono text-cyan-400/80 truncate">
                {stg.evidenceEventIds.length} Events
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Middle Row: Event Volume Histogram & Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Timeline Volume Histogram */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 space-y-3.5 border-white/[0.08] shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
                Telemetry Event Velocity Over Incident Timeframe
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-300/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              Correlated Bursts
            </span>
          </div>

          <div className="h-44 w-full flex items-end gap-1.5 pt-4 px-2">
            {[
              { time: '10:01', label: 'Initial Access', count: 3, sev: 'Medium' },
              { time: '10:02', label: 'PowerShell Cradle', count: 5, sev: 'Critical' },
              { time: '10:03', label: 'UAC Bypass', count: 4, sev: 'High' },
              { time: '10:04', label: 'Run Keys', count: 3, sev: 'High' },
              { time: '10:06', label: 'Disable Defender', count: 4, sev: 'Critical' },
              { time: '10:07', label: 'LSASS Dump', count: 4, sev: 'Critical' },
              { time: '10:09', label: 'AD Discovery', count: 4, sev: 'Medium' },
              { time: '10:11', label: 'Lateral SMB/WMI', count: 6, sev: 'High' },
              { time: '10:14', label: '7z Archive Staging', count: 4, sev: 'High' },
              { time: '10:17', label: 'rclone Exfil (20GB)', count: 4, sev: 'Critical' },
              { time: '10:19', label: 'VSS Purge', count: 4, sev: 'Critical' },
              { time: '10:21', label: 'AuraCrypt Detonation', count: 7, sev: 'Critical' },
            ].map((bar, idx) => {
              const heightPercent = (bar.count / 7) * 100;
              const barGradient =
                bar.sev === 'Critical'
                  ? 'bg-gradient-to-t from-rose-600/70 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : bar.sev === 'High'
                  ? 'bg-gradient-to-t from-amber-600/70 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-gradient-to-t from-cyan-600/70 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                  onClick={() => onNavigateTab('evidence')}
                >
                  {/* Tooltip with Glass Effect */}
                  <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity bg-[#090e1c]/95 border border-white/[0.15] px-2.5 py-1 rounded-lg text-[10px] font-mono text-white whitespace-nowrap z-20 pointer-events-none shadow-2xl backdrop-blur-xl">
                    {bar.time}: {bar.label} ({bar.count} evts)
                  </div>
                  <div className="w-full bg-white/[0.02] border border-white/[0.04] rounded-t-lg h-32 flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${barGradient}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 rotate-45 mt-2 origin-left">
                    {bar.time}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-6 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/[0.08]">
            <span>Primary Velocity Acceleration: Double-extortion exfiltration (10:17) followed by encryption (10:21)</span>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View Interactive Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Telemetry Sources & Severities */}
        <div className="glass-panel rounded-2xl p-5 space-y-4 border-white/[0.08] shadow-xl">
          <div>
            <div className="text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-white/[0.08] pb-2.5 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Evidence Ingest Sources</span>
            </div>
            <div className="space-y-2.5 mt-3 text-xs font-mono">
              {Object.entries(sourceCounts).map(([src, count]) => {
                const pct = Math.round((count / events.length) * 100);
                return (
                  <div key={src} className="space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="truncate max-w-[160px] text-slate-200">{src}</span>
                      <span className="text-cyan-300 tabular-nums font-semibold">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden border border-white/[0.05]">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-3.5">
            <div className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-2.5">
              Severity Distribution
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 glass-card rounded-xl border-rose-500/30 shadow-[0_0_12px_-2px_rgba(244,63,94,0.2)]">
                <div className="text-rose-400 font-extrabold text-sm">{severityCounts.Critical} Critical</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ransomware, Exfil, LSASS</div>
              </div>
              <div className="p-2.5 glass-card rounded-xl border-amber-500/30 shadow-[0_0_12px_-2px_rgba(245,158,11,0.2)]">
                <div className="text-amber-400 font-extrabold text-sm">{severityCounts.High} High</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Lateral, Staging, RunKey</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Affected Entities Matrix */}
      <div className="glass-panel rounded-2xl p-5 space-y-3.5 border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/30">
              <Server className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
              Affected Systems &amp; Compromised Identities
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/80 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
            High Containment Priority
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-mono text-xs">
          {/* Host 1 */}
          <div className="p-4 glass-card glass-card-hover rounded-xl space-y-2.5 border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">WS-FIN-04.corp.local</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800 font-bold shadow-sm">
                PATIENT ZERO
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>IP: <span className="text-cyan-300">10.0.10.42</span> (Finance Subnet)</div>
              <div>Vector: Phishing Macro (Invoice_PO9921_Oct2026.xlsm)</div>
              <div>Impact: LSASS Memory Dump, User Files Encrypted</div>
            </div>
            <button
              onClick={() => onNavigateTab('evidence')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 pt-1.5 font-semibold"
            >
              <span>Inspect 24 Telemetry Events</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Host 2 */}
          <div className="p-4 glass-card glass-card-hover rounded-xl space-y-2.5 border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">FS-BACKUP-02.corp.local</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800 font-bold shadow-sm">
                CRITICAL TARGET
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>IP: <span className="text-cyan-300">10.0.10.15</span> (Core Storage)</div>
              <div>Vector: Lateral WMI/SMB via svc_backup</div>
              <div>Impact: 20.9 GB Exfiltrated, Shadow Copies Wiped, Shares Encrypted</div>
            </div>
            <button
              onClick={() => onNavigateTab('evidence')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 pt-1.5 font-semibold"
            >
              <span>Inspect 25 Telemetry Events</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Host 3 */}
          <div className="p-4 glass-card glass-card-hover rounded-xl space-y-2.5 border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">DC-CORP-01.corp.local</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800 font-bold shadow-sm">
                RECON TARGET
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>IP: <span className="text-cyan-300">10.0.10.5</span> (Domain Controller)</div>
              <div>Activity: Kerberos Service Ticket Auth (4624 Type 3)</div>
              <div>Status: Contained before malicious payload execution</div>
            </div>
            <button
              onClick={() => onNavigateTab('evidence')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 pt-1.5 font-semibold"
            >
              <span>Inspect 3 Telemetry Events</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
