import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileSearch,
  Download,
  Terminal,
  Server,
  User,
  Shield,
  Clock,
  Activity,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SecurityEvent, ReconstructedStage, SeverityLevel, AttackStageName } from '../types';

interface EvidenceCenterViewProps {
  events: SecurityEvent[];
  stages: ReconstructedStage[];
  onInspectEvent: (event: SecurityEvent) => void;
  selectedStageFilter?: string;
  onClearStageFilter?: () => void;
}

export const EvidenceCenterView: React.FC<EvidenceCenterViewProps> = ({
  events,
  stages,
  onInspectEvent,
  selectedStageFilter: initialStageFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>(initialStageFilter || 'all');
  const [selectedHost, setSelectedHost] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract unique hosts, users, sources
  const hosts = useMemo(() => Array.from(new Set(events.map((e) => e.host))), [events]);
  const users = useMemo(() => Array.from(new Set(events.map((e) => e.username))), [events]);
  const sources = useMemo(() => Array.from(new Set(events.map((e) => e.logSource))), [events]);
  const stageNames: AttackStageName[] = [
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

  // Current stage details if stage is filtered
  const activeStageObject = useMemo(() => {
    if (selectedStage === 'all') return null;
    return stages.find((s) => s.stage === selectedStage);
  }, [selectedStage, stages]);

  // Filtering logic
  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        // Search term across fields
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = evt.eventId.toLowerCase().includes(q);
          const matchHost = evt.host.toLowerCase().includes(q);
          const matchUser = evt.username.toLowerCase().includes(q);
          const matchProc = evt.process?.toLowerCase().includes(q) ?? false;
          const matchCmd = evt.command?.toLowerCase().includes(q) ?? false;
          const matchFile = evt.filePath?.toLowerCase().includes(q) ?? false;
          const matchIp =
            (evt.sourceIp?.toLowerCase().includes(q) ?? false) ||
            (evt.destinationIp?.toLowerCase().includes(q) ?? false);
          const matchRaw = evt.rawDetails?.toLowerCase().includes(q) ?? false;
          const matchType = evt.eventType.toLowerCase().includes(q);
          if (
            !matchId &&
            !matchHost &&
            !matchUser &&
            !matchProc &&
            !matchCmd &&
            !matchFile &&
            !matchIp &&
            !matchRaw &&
            !matchType
          ) {
            return false;
          }
        }

        // Stage filter
        if (selectedStage !== 'all') {
          const stageObj = stages.find((s) => s.stage === selectedStage);
          if (stageObj && !stageObj.evidenceEventIds.includes(evt.eventId)) {
            return false;
          }
        }

        // Host filter
        if (selectedHost !== 'all' && evt.host !== selectedHost) return false;

        // User filter
        if (selectedUser !== 'all' && evt.username !== selectedUser) return false;

        // Severity filter
        if (selectedSeverity !== 'all' && evt.severity !== selectedSeverity) return false;

        // Source filter
        if (selectedSource !== 'all' && evt.logSource !== selectedSource) return false;

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [
    events,
    searchTerm,
    selectedStage,
    selectedHost,
    selectedUser,
    selectedSeverity,
    selectedSource,
    sortOrder,
    stages,
  ]);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AURA_Evidence_Export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'High':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800';
      case 'Low':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Evidence Center Forensic Purpose with Glass Panel */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <FileSearch className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              Evidence Center &amp; Post-Incident Telemetry Inspection
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Examine normalized logs, timestamps, hosts, accounts, processes, network sockets, and file activity.
            Every attack stage conclusion reached by AURA links directly to verified underlying security events below.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] rounded-xl hover:text-white transition-all shadow-md whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Filtered ({filteredEvents.length})</span>
          </button>
        </div>
      </div>

      {/* Reconstructed Stage Correlation Summary Banner (When Stage is Active) */}
      {activeStageObject && (
        <div className="glass-panel border-cyan-500/40 rounded-2xl p-5 text-xs text-slate-200 shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)] animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-white/[0.08] mb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-bold shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                RECONSTRUCTED STAGE
              </span>
              <span className="font-bold text-sm text-white font-mono">{activeStageObject.stage}</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-400 font-mono font-semibold">{activeStageObject.techniqueId}</span>
              <span className="text-slate-300 font-medium">({activeStageObject.technique})</span>
            </div>

            <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
              <div className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                Confidence:{' '}
                <span className="text-emerald-400 font-bold">{activeStageObject.confidence}</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                Evidence Events:{' '}
                <span className="text-cyan-300 font-bold">{activeStageObject.evidenceEventIds.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold tracking-wider">
                Why AURA Reconstructed This:
              </div>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                {activeStageObject.correlationReason}
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] uppercase font-mono text-blue-400 font-bold tracking-wider">
                Confidence Rationale:
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {activeStageObject.confidenceRationale}
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] uppercase font-mono text-amber-400 font-bold tracking-wider">
                Extracted Indicators:
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeStageObject.relatedIndicators.map((ind, i) => (
                  <span
                    key={i}
                    className="font-mono text-[10px] bg-slate-900/90 text-amber-200 px-2 py-0.5 rounded-md border border-amber-500/30 truncate max-w-full"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar with Frosted Glass Styling */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3.5">
        {/* Search bar + Sort Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400/80 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search across commands, processes, paths, IPs, hashes, event IDs, raw telemetry..."
              className="w-full bg-[#070b14]/70 border border-white/[0.1] rounded-xl pl-10 pr-12 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.08]"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-mono text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl transition-all whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>

        {/* Multi-faceted Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Stage Filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Attack Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-[#080d18]/80 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500/60"
            >
              <option value="all">All Stages ({events.length})</option>
              {stageNames.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          {/* Host Filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Target Host
            </label>
            <select
              value={selectedHost}
              onChange={(e) => setSelectedHost(e.target.value)}
              className="w-full bg-[#080d18]/80 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500/60"
            >
              <option value="all">All Hosts ({hosts.length})</option>
              {hosts.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Account / Context
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-[#080d18]/80 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500/60"
            >
              <option value="all">All Accounts ({users.length})</option>
              {users.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-[#080d18]/80 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500/60"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Info">Info</option>
            </select>
          </div>

          {/* Log Source Filter */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Telemetry Source
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-[#080d18]/80 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500/60"
            >
              <option value="all">All Sources ({sources.length})</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter status row */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] text-[11px] text-slate-400 font-mono">
          <div>
            Showing <span className="text-cyan-300 font-bold">{filteredEvents.length}</span> of{' '}
            <span className="text-slate-200">{events.length}</span> normalized security events
          </div>
          {(selectedStage !== 'all' ||
            selectedHost !== 'all' ||
            selectedUser !== 'all' ||
            selectedSeverity !== 'all' ||
            selectedSource !== 'all' ||
            searchTerm) && (
            <button
              onClick={() => {
                setSelectedStage('all');
                setSelectedHost('all');
                setSelectedUser('all');
                setSelectedSeverity('all');
                setSelectedSource('all');
                setSearchTerm('');
              }}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Normalized Forensic Events Data Table with Glass Styling */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.08] font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3.5 whitespace-nowrap">Event ID</th>
                <th className="py-3 px-3 whitespace-nowrap">Timestamp (UTC)</th>
                <th className="py-3 px-3 whitespace-nowrap">Severity</th>
                <th className="py-3 px-3 whitespace-nowrap">Host</th>
                <th className="py-3 px-3 whitespace-nowrap">User</th>
                <th className="py-3 px-3 whitespace-nowrap">Event Type / Source</th>
                <th className="py-3 px-4 min-w-[260px]">Process / Command / File</th>
                <th className="py-3 px-3 whitespace-nowrap">Stage Link</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <Info className="w-7 h-7 text-cyan-400/60" />
                      <p className="text-sm font-medium text-slate-300">No security events match the current filter criteria.</p>
                      <button
                        onClick={() => {
                          setSelectedStage('all');
                          setSelectedHost('all');
                          setSelectedUser('all');
                          setSelectedSeverity('all');
                          setSelectedSource('all');
                          setSearchTerm('');
                        }}
                        className="text-xs text-cyan-400 hover:underline mt-1"
                      >
                        Clear filters to view all telemetry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const stage = stages.find((s) => s.evidenceEventIds.includes(evt.eventId));
                  return (
                    <tr
                      key={evt.eventId}
                      onClick={() => onInspectEvent(evt)}
                      className="hover:bg-white/[0.05] cursor-pointer transition-all duration-150 group"
                    >
                      {/* Event ID */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="text-cyan-400 font-bold group-hover:text-cyan-300 flex items-center gap-1">
                          {evt.eventId}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                        {evt.timestamp.replace('T', ' ').replace('Z', '')}
                      </td>

                      {/* Severity */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getSeverityBadge(evt.severity)}`}>
                          {evt.severity}
                        </span>
                      </td>

                      {/* Host */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Server className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{evt.host.split('.')[0]}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-amber-300">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[110px]">{evt.username.split('\\').pop()}</span>
                        </div>
                      </td>

                      {/* Event Type & Source */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-slate-200 text-xs font-semibold truncate max-w-[180px]">{evt.eventType}</div>
                        <div className="text-[10px] text-slate-400">{evt.logSource}</div>
                      </td>

                      {/* Command / File / Details */}
                      <td className="py-2.5 px-4">
                        {evt.command ? (
                          <div className="text-emerald-300 text-[11px] truncate max-w-sm font-mono" title={evt.command}>
                            {evt.command}
                          </div>
                        ) : evt.filePath ? (
                          <div className="text-amber-200 text-[11px] truncate max-w-sm font-mono" title={evt.filePath}>
                            {evt.filePath}
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[11px] truncate max-w-sm">
                            {evt.rawDetails || 'Network Socket Activity'}
                          </div>
                        )}
                        {evt.destinationIp && (
                          <div className="text-[10px] text-cyan-400/90 font-medium">
                            → {evt.destinationIp}:{evt.destinationPort}
                          </div>
                        )}
                      </td>

                      {/* Reconstructed Stage Link */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {stage ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-medium">
                            {stage.stage}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Corroborating</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectEvent(evt);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 text-[11px] text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all font-semibold shadow-sm"
                        >
                          <span>Examine</span>
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
