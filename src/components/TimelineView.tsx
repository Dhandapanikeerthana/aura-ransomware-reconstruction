import React, { useState } from 'react';
import {
  Clock,
  Shield,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Server,
  User,
  ExternalLink,
  CheckCircle2,
  FileSearch,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { ReconstructedStage, SecurityEvent } from '../types';

interface TimelineViewProps {
  stages: ReconstructedStage[];
  events: SecurityEvent[];
  onInspectEventId: (eventId: string) => void;
  onNavigateToEvidenceCenter: (stageName: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  stages,
  events,
  onInspectEventId,
  onNavigateToEvidenceCenter,
}) => {
  const [activeStageId, setActiveStageId] = useState<string>(stages[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Playback timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStageId((curr) => {
          const currentIndex = stages.findIndex((s) => s.id === curr);
          if (currentIndex === -1 || currentIndex >= stages.length - 1) {
            setIsPlaying(false);
            return stages[0]?.id || '';
          }
          return stages[currentIndex + 1].id;
        });
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, stages]);

  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'text-emerald-300 bg-emerald-950/80 border-emerald-800';
      case 'Medium':
        return 'text-amber-300 bg-amber-950/80 border-amber-800';
      case 'Low':
        return 'text-slate-300 bg-slate-800 border-slate-700';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const getStageColor = (idx: number, total: number) => {
    // Gradient from cyan (early) to orange (middle) to red (impact)
    if (idx < 2) return 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300';
    if (idx < 7) return 'border-blue-500/50 bg-blue-950/30 text-blue-300';
    if (idx < 9) return 'border-amber-500/50 bg-amber-950/30 text-amber-300';
    return 'border-rose-500/60 bg-rose-950/40 text-rose-300';
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls Header with Glass Panel */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/[0.08] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              Interactive Attack Reconstruction Timeline
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Trace the incident chronologically from initial delivery through lateral compromise to encryption.
            Every stage displays verified telemetry evidence, correlation criteria, and analytical confidence.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-start md:self-center font-mono text-xs">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Playback' : 'Replay Attack Chain'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStageId(stages[0]?.id || '');
            }}
            className="p-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.1] rounded-xl transition-all"
            title="Reset to Stage 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrubber / Stages Navigation Bar with Glass Styling */}
      <div className="glass-panel rounded-2xl p-4 overflow-x-auto scrollbar-none border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-2.5 min-w-max">
          {stages.map((stage, idx) => {
            const isActive = stage.id === activeStage?.id;
            const timeStr = stage.timestampStart.split('T')[1]?.substring(0, 5) || '';
            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStageId(stage.id);
                  }}
                  className={`flex flex-col text-left px-3.5 py-2.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-cyan-950/90 to-blue-950/80 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/40'
                      : 'glass-card border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.04] text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
                    <span className="text-slate-400 font-medium">{timeStr} UTC</span>
                    <span className="font-extrabold text-cyan-400">#{idx + 1}</span>
                  </div>
                  <div className={`text-xs font-bold font-mono mt-1 truncate max-w-[130px] ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {stage.stage}
                  </div>
                  <div className="text-[10px] text-cyan-300/80 font-mono mt-0.5">
                    {stage.evidenceEventIds.length} Events
                  </div>
                </button>
                {idx < stages.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Focus: Reconstructed Stage Forensic Dossier */}
      {activeStage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Stage Breakdown & Correlation Dossier */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stage Title Card with Glass Panel */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-white/[0.08] shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40 shadow-sm">
                      STAGE {stages.findIndex((s) => s.id === activeStage.id) + 1} OF {stages.length}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${getConfidenceBadge(activeStage.confidence)}`}>
                      CONFIDENCE: {activeStage.confidence.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white font-mono tracking-tight pt-1">
                    {activeStage.stage}: {activeStage.technique}
                  </h2>
                </div>

                <button
                  onClick={() => onNavigateToEvidenceCenter(activeStage.stage)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all font-semibold shadow-sm self-start sm:self-center"
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>Inspect in Evidence Center</span>
                </button>
              </div>

              {/* Stage Context Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="glass-card p-3 rounded-xl border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Time Window</span>
                  <span className="text-slate-100 font-bold">
                    {activeStage.timestampStart.split('T')[1]?.substring(0, 8)} -{' '}
                    {activeStage.timestampEnd.split('T')[1]?.substring(0, 8)}
                  </span>
                </div>
                <div className="glass-card p-3 rounded-xl border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Host System</span>
                  <span className="text-purple-300 font-bold truncate block">{activeStage.host}</span>
                </div>
                <div className="glass-card p-3 rounded-xl border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Active Account</span>
                  <span className="text-amber-300 font-bold truncate block">{activeStage.user}</span>
                </div>
                <div className="glass-card p-3 rounded-xl border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">MITRE ATT&amp;CK</span>
                  <span className="text-cyan-300 font-extrabold">{activeStage.techniqueId}</span>
                </div>
              </div>

              {/* The "Why AURA Reconstructed This" Glass Box */}
              <div className="glass-card border-cyan-500/30 p-4 rounded-xl space-y-2 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Correlation Logic: Why AURA Connected These Events</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {activeStage.correlationReason}
                </p>
              </div>

              {/* Attack Story & Reconstruction Narrative */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Reconstructed Incident Narrative
                </div>
                <p className="text-xs text-slate-200 leading-relaxed glass-card p-4 rounded-xl border-white/[0.06]">
                  {activeStage.attackStory}
                </p>
              </div>

              {/* Confidence Rationale */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Confidence Evaluation Rationale
                </div>
                <p className="text-xs text-slate-300 leading-relaxed glass-card p-3.5 rounded-xl border-white/[0.05]">
                  {activeStage.confidenceRationale}
                </p>
              </div>
            </div>
          </div>

          {/* Right Col: Underlying Evidence Events List with Glass Styling */}
          <div className="space-y-3">
            <div className="glass-panel rounded-2xl p-5 space-y-3.5 border-white/[0.08] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                    Supporting Telemetry Evidence
                  </span>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                  {activeStage.evidenceEventIds.length} Events
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Click any evidence event below to open the complete forensic inspector and inspect raw logs:
              </p>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {activeStage.evidenceEventIds.map((evtId) => {
                  const evtObj = events.find((e) => e.eventId === evtId);
                  if (!evtObj) return null;
                  return (
                    <div
                      key={evtId}
                      onClick={() => onInspectEventId(evtId)}
                      className="p-3.5 glass-card glass-card-hover rounded-xl cursor-pointer transition-all border-white/[0.06] hover:border-cyan-500/40 group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-cyan-400 font-bold group-hover:text-cyan-300">
                          {evtObj.eventId}
                        </span>
                        <span className="text-slate-400">
                          {evtObj.timestamp.split('T')[1]?.substring(0, 8)}
                        </span>
                      </div>

                      <div className="text-xs text-white font-semibold mb-1 line-clamp-1">
                        {evtObj.eventType}
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono line-clamp-2">
                        {evtObj.command || evtObj.filePath || evtObj.rawDetails}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{evtObj.logSource}</span>
                        <span className="text-cyan-400 group-hover:underline flex items-center gap-1 font-semibold">
                          Inspect <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
