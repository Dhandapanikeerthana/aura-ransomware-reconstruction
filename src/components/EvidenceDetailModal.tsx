import React, { useState } from 'react';
import {
  X,
  FileCode,
  GitBranch,
  Shield,
  Clock,
  Server,
  User,
  Activity,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { SecurityEvent, ReconstructedStage } from '../types';

interface EvidenceDetailModalProps {
  event: SecurityEvent | null;
  onClose: () => void;
  allEvents: SecurityEvent[];
  stages: ReconstructedStage[];
  onSelectEvent: (event: SecurityEvent) => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  event,
  onClose,
  allEvents,
  stages,
  onSelectEvent,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'forensics' | 'raw' | 'correlations'>('forensics');

  if (!event) return null;

  // Find stage that includes this event
  const relatedStage = stages.find((s) => s.evidenceEventIds.includes(event.eventId));

  // Find related events (same host within +/- 3 minutes, or parent-child process match)
  const eventTime = new Date(event.timestamp).getTime();
  const correlatedEvents = allEvents.filter((e) => {
    if (e.eventId === event.eventId) return false;
    const t = new Date(e.timestamp).getTime();
    const diffSeconds = Math.abs((t - eventTime) / 1000);

    // Parent child match
    const isChild = event.processId && e.parentProcessId === event.processId;
    const isParent = event.parentProcessId && e.processId === event.parentProcessId;
    // Same user and host within 120s
    const isCloseUserHost =
      e.host === event.host && e.username === event.username && diffSeconds <= 180;
    // Network pivot
    const isNetworkPair =
      (event.destinationIp && e.sourceIp === event.destinationIp) ||
      (event.sourceIp && e.destinationIp === event.sourceIp);

    return isChild || isParent || isCloseUserHost || isNetworkPair;
  });

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (sev: string) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="glass-panel border-white/[0.15] w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950/90 px-3 py-1 rounded-lg border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              {event.eventId}
            </span>
            <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md border ${getSeverityBadge(event.severity)}`}>
              {event.severity.toUpperCase()}
            </span>
            <span className="text-sm font-bold text-white tracking-tight">
              {event.eventType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRaw}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg border border-white/[0.08] font-mono transition-all"
              title="Copy event JSON payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Sub-navigation with Glass Pills */}
        <div className="px-6 py-2.5 bg-black/40 border-b border-white/[0.06] flex items-center gap-2 text-xs">
          <button
            onClick={() => setViewTab('forensics')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-all ${
              viewTab === 'forensics'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Evidence → Correlation → Conclusion
          </button>
          <button
            onClick={() => setViewTab('correlations')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              viewTab === 'correlations'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>Linked Events</span>
            <span className="font-mono text-[10px] bg-white/[0.08] px-2 py-0.5 rounded-full text-cyan-300">
              {correlatedEvents.length}
            </span>
          </button>
          <button
            onClick={() => setViewTab('raw')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-all ${
              viewTab === 'raw'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Raw Telemetry Log
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {viewTab === 'forensics' && (
            <>
              {/* Three-tier forensic reasoning card with Glass Aesthetics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Evidence */}
                <div className="glass-card rounded-xl p-4 flex flex-col justify-between border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>1. Observed Evidence</span>
                    </div>
                    <div className="text-xs text-slate-100 font-semibold mb-1">
                      {event.eventType}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {event.rawDetails || 'Concrete telemetry recorded by endpoint agent.'}
                    </p>
                  </div>
                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.08] text-[11px] font-mono text-slate-400">
                    Source: <span className="text-cyan-300 font-medium">{event.logSource}</span>
                  </div>
                </div>

                {/* 2. Correlation */}
                <div className="glass-card rounded-xl p-4 flex flex-col justify-between border-blue-500/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-2 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>2. Correlation Logic</span>
                    </div>
                    <div className="text-xs text-slate-100 font-semibold mb-1">
                      Why Connected:
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {relatedStage?.correlationReason ||
                        `Linked via timestamp (${event.timestamp}), host (${event.host}), and executing context (${event.username}).`}
                    </p>
                  </div>
                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.08] text-[11px] font-mono text-slate-400">
                    Confidence: <span className="text-emerald-400 font-bold">{relatedStage?.confidence || 'High'}</span>
                  </div>
                </div>

                {/* 3. Conclusion */}
                <div className="glass-card rounded-xl p-4 flex flex-col justify-between border-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-2 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>3. Attack Conclusion</span>
                    </div>
                    <div className="text-xs text-amber-200 font-semibold mb-1">
                      {relatedStage ? relatedStage.stage : 'Corroborating Event'}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {relatedStage?.summary || 'Reconstructed attack behavior backed by verified telemetry log.'}
                    </p>
                  </div>
                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.08] text-[11px] font-mono text-slate-400">
                    MITRE: <span className="text-amber-300 font-medium">{event.mitreTechniqueId || relatedStage?.techniqueId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Normalized telemetry attributes table */}
              <div className="glass-card rounded-xl overflow-hidden border border-white/[0.08]">
                <div className="px-5 py-3 bg-white/[0.03] border-b border-white/[0.08] font-mono text-[11px] font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Normalized Forensic Properties</span>
                </div>
                <div className="divide-y divide-white/[0.04] font-mono text-[11px]">
                  <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                    <span className="text-slate-400 font-medium">Timestamp (UTC)</span>
                    <span className="col-span-2 sm:col-span-3 text-slate-100">{event.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                    <span className="text-slate-400 font-medium">Host System</span>
                    <span className="col-span-2 sm:col-span-3 text-slate-100 flex items-center gap-1.5">
                      <Server className="w-3 h-3 text-purple-400" />
                      <span>{event.host}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                    <span className="text-slate-400 font-medium">Security Context / User</span>
                    <span className="col-span-2 sm:col-span-3 text-slate-100 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-amber-400" />
                      <span>{event.username}</span>
                    </span>
                  </div>
                  {event.process && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                      <span className="text-slate-400 font-medium">Process</span>
                      <span className="col-span-2 sm:col-span-3 text-cyan-300 break-all font-medium">
                        {event.process} {event.processId && `(PID: ${event.processId})`}
                      </span>
                    </div>
                  )}
                  {event.parentProcess && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                      <span className="text-slate-400 font-medium">Parent Process</span>
                      <span className="col-span-2 sm:col-span-3 text-slate-200 break-all">
                        {event.parentProcess} {event.parentProcessId && `(PID: ${event.parentProcessId})`}
                      </span>
                    </div>
                  )}
                  {event.command && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-3 hover:bg-white/[0.03]">
                      <span className="text-slate-400 font-medium">Command / Argument</span>
                      <span className="col-span-2 sm:col-span-3 text-emerald-300 bg-black/60 p-2.5 rounded-lg border border-white/[0.08] break-all font-mono leading-relaxed shadow-inner">
                        {event.command}
                      </span>
                    </div>
                  )}
                  {(event.sourceIp || event.destinationIp) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                      <span className="text-slate-400 font-medium">Network Connection</span>
                      <span className="col-span-2 sm:col-span-3 text-cyan-200">
                        {event.sourceIp || '10.0.10.42'} → {event.destinationIp}
                        {event.destinationPort ? `:${event.destinationPort}` : ''}
                        {event.destinationHost ? ` (${event.destinationHost})` : ''}
                      </span>
                    </div>
                  )}
                  {event.filePath && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                      <span className="text-slate-400 font-medium">Target File Path</span>
                      <span className="col-span-2 sm:col-span-3 text-amber-200 break-all">{event.filePath}</span>
                    </div>
                  )}
                  {event.fileHash && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                      <span className="text-slate-400 font-medium">SHA256 Hash</span>
                      <span className="col-span-2 sm:col-span-3 text-purple-300 break-all">{event.fileHash}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-2.5 hover:bg-white/[0.03]">
                    <span className="text-slate-400 font-medium">Telemetry Source</span>
                    <span className="col-span-2 sm:col-span-3 text-slate-300">{event.logSource}</span>
                  </div>
                </div>
              </div>

              {/* Process Ancestry tree visualization */}
              {event.parentProcess && event.process && (
                <div className="glass-card rounded-xl p-4 border border-white/[0.08]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Process Ancestry &amp; Lineage</span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-slate-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.05]">
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-white/[0.08] rounded">PARENT</span>
                      <span className="truncate">{event.parentProcess}</span>
                      {event.parentProcessId && <span className="text-slate-500">PID: {event.parentProcessId}</span>}
                    </div>
                    <div className="pl-6 text-cyan-400 text-xs flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-mono text-cyan-400 font-semibold">Spawned</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-200 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/40 shadow-sm">
                      <span className="text-[10px] text-cyan-200 bg-cyan-900/80 px-1.5 py-0.5 rounded font-bold">CHILD (THIS EVENT)</span>
                      <span className="truncate font-bold">{event.process}</span>
                      {event.processId && <span className="text-cyan-400">PID: {event.processId}</span>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {viewTab === 'correlations' && (
            <div className="space-y-3">
              <div className="p-3.5 glass-card rounded-xl border border-white/[0.08] text-xs text-slate-200">
                <span className="font-bold text-cyan-300 font-mono">Correlation Engine Findings:</span>{' '}
                {correlatedEvents.length > 0 ? (
                  <span>
                    AURA identified {correlatedEvents.length} related security events sharing execution ancestry, host
                    affinity, account context, or network sockets within the incident window.
                  </span>
                ) : (
                  <span>No direct sibling events within the immediate 180-second window.</span>
                )}
              </div>

              <div className="space-y-2">
                {correlatedEvents.map((ce) => (
                  <div
                    key={ce.eventId}
                    onClick={() => onSelectEvent(ce)}
                    className="p-3.5 glass-card-hover rounded-xl border border-white/[0.06] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 font-mono text-[11px]">
                        <span className="text-cyan-400 font-bold">{ce.eventId}</span>
                        <span className="text-slate-500">{ce.timestamp}</span>
                        <span className="text-slate-300">{ce.host}</span>
                        <span className="text-amber-400">{ce.username}</span>
                      </div>
                      <div className="text-xs text-white font-medium">{ce.eventType}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xl font-mono">
                        {ce.command || ce.filePath || ce.rawDetails}
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 font-mono px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800/60">
                      <span>Inspect</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewTab === 'raw' && (
            <div className="relative">
              <pre className="p-4 bg-black/60 border border-white/[0.1] rounded-xl font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Forensic Evidence Record: Validated Untrusted Telemetry</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 rounded-lg font-medium transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
