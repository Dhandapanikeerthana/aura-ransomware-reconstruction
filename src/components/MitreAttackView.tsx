import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle2,
  Filter,
  Info,
  Layers,
} from 'lucide-react';
import { MitreTechniqueMapping, SecurityEvent, AttackStageName } from '../types';

interface MitreAttackViewProps {
  mitreMappings: MitreTechniqueMapping[];
  events: SecurityEvent[];
  onInspectEventId: (eventId: string) => void;
}

export const MitreAttackView: React.FC<MitreAttackViewProps> = ({
  mitreMappings,
  events,
  onInspectEventId,
}) => {
  const [selectedTactic, setSelectedTactic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tactics: AttackStageName[] = [
    'Initial Access',
    'Execution',
    'Privilege Escalation',
    'Persistence',
    'Defense Evasion',
    'Credential Access',
    'Discovery',
    'Lateral Movement',
    'Collection',
    'Exfiltration',
    'Impact',
  ];

  const filteredMappings = mitreMappings.filter((m) => {
    if (selectedTactic !== 'all' && m.tactic !== selectedTactic) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.techniqueId.toLowerCase().includes(q) ||
        m.techniqueName.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tactic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header with Glass Panel */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/[0.08] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              MITRE ATT&amp;CK Framework Mapping
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Every MITRE technique below is strictly supported by concrete security telemetry. Techniques are only mapped when verifiable event evidence exists.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="px-3.5 py-1.5 glass-card rounded-xl border border-cyan-500/30 text-xs font-mono text-cyan-300 font-semibold shadow-sm">
            {filteredMappings.length} Evidence-Backed Techniques
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-cyan-400/80 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. T1486), name, or description..."
            className="w-full bg-[#070b14]/70 border border-white/[0.1] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/70"
          />
        </div>

        {/* Tactic buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          <button
            onClick={() => setSelectedTactic('all')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all ${
              selectedTactic === 'all'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white glass-card hover:bg-white/[0.06]'
            }`}
          >
            All Tactics ({mitreMappings.length})
          </button>
          {tactics.map((t) => {
            const count = mitreMappings.filter((m) => m.tactic === t).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => setSelectedTactic(t)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all ${
                  selectedTactic === t
                    ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white glass-card hover:bg-white/[0.06]'
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Techniques with Frosted Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredMappings.map((mapping) => (
          <div
            key={mapping.techniqueId}
            className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between space-y-3.5 border-white/[0.07] hover:border-cyan-500/40 shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  {mapping.techniqueId}
                </span>
                <span className="text-[10px] font-mono uppercase bg-white/[0.04] text-slate-400 px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                  {mapping.tactic}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white font-mono">{mapping.techniqueName}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{mapping.description}</p>
            </div>

            <div className="space-y-2 border-t border-white/[0.06] pt-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Supporting Telemetry:</span>
                <span className="text-emerald-400 font-bold">Confidence: {mapping.confidence}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {mapping.supportingEventIds.map((evtId) => {
                  const ev = events.find((e) => e.eventId === evtId);
                  return (
                    <button
                      key={evtId}
                      onClick={() => onInspectEventId(evtId)}
                      className="flex items-center gap-1 font-mono text-[10px] bg-black/40 hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-200 px-2 py-0.5 rounded-md border border-white/[0.08] hover:border-cyan-500/40 transition-all"
                      title={ev ? `${ev.eventType}: ${ev.command || ev.filePath || ''}` : 'Inspect Event'}
                    >
                      <span>{evtId}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
