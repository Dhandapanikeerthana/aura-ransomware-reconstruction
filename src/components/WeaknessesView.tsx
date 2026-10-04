import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Shield,
  FileCode,
  Wrench,
} from 'lucide-react';
import { SecurityWeakness, RemediationRecommendation, SecurityEvent } from '../types';

interface WeaknessesViewProps {
  weaknesses: SecurityWeakness[];
  remediations: RemediationRecommendation[];
  events: SecurityEvent[];
  onInspectEventId: (eventId: string) => void;
}

export const WeaknessesView: React.FC<WeaknessesViewProps> = ({
  weaknesses,
  remediations,
  events,
  onInspectEventId,
}) => {
  const [selectedWeaknessId, setSelectedWeaknessId] = useState<string>(weaknesses[0]?.id || '');

  const activeWeakness = weaknesses.find((w) => w.id === selectedWeaknessId) || weaknesses[0];
  const activeRemediation = remediations.find((r) => r.weaknessId === activeWeakness?.id);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Immediate':
      case 'P1 - Immediate':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
      case 'High':
      case 'P2 - High':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'Medium':
      case 'P3 - Medium':
        return 'text-yellow-400 bg-yellow-950/80 border-yellow-800';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Glass Panel */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/[0.08] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.25)]">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              Root Weakness Identification &amp; Defensive Remediation
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Every identified architectural vulnerability is strictly backed by observed attack telemetry.
            Transforming post-incident forensic findings into concrete preventive engineering.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center font-mono text-xs">
          <span className="px-3.5 py-1.5 glass-card rounded-xl border border-orange-500/30 text-orange-300 font-semibold shadow-sm">
            {weaknesses.length} Root Weaknesses Discovered
          </span>
        </div>
      </div>

      {/* Main Grid: List on Left, Detail Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Weakness List */}
        <div className="space-y-2.5">
          {weaknesses.map((w, idx) => {
            const isSelected = w.id === activeWeakness?.id;
            return (
              <div
                key={w.id}
                onClick={() => setSelectedWeaknessId(w.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'glass-card border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span className="text-cyan-400 font-extrabold">{w.id}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getPriorityBadge(w.priority)}`}>
                    {w.priority}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white font-mono leading-snug">
                  {w.title}
                </h3>
                <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/[0.05] pt-2">
                  <span>Category: <strong className="text-slate-200">{w.category}</strong></span>
                  <span className="text-cyan-400/80 font-semibold">{w.observedEvidenceEventIds.length} Linked Events</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Selected Weakness Deep-Dive with Glass Design */}
        {activeWeakness && (
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel rounded-2xl p-6 space-y-5 border-white/[0.08] shadow-2xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                      {activeWeakness.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Category: <span className="text-slate-200 font-bold">{activeWeakness.category}</span>
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white font-mono tracking-tight">
                    {activeWeakness.title}
                  </h2>
                </div>
                <span className={`text-xs font-mono px-3 py-1 rounded-full border self-start sm:self-center font-bold ${getPriorityBadge(activeWeakness.priority)}`}>
                  PRIORITY: {activeWeakness.priority.toUpperCase()}
                </span>
              </div>

              {/* The Core Formula: Observed Evidence -> Weakness -> Remediation */}
              <div className="space-y-4">
                {/* 1. Observed Evidence */}
                <div className="glass-card border-cyan-500/30 p-4.5 rounded-xl space-y-2.5 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span>1. Concrete Observed Evidence</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                      {activeWeakness.observedEvidenceEventIds.length} Supporting Events
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {activeWeakness.evidenceExplanation}
                  </p>
                  <div className="pt-2.5 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono text-slate-400">Telemetry Provenance:</span>
                    {activeWeakness.observedEvidenceEventIds.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => onInspectEventId(eid)}
                        className="text-[10px] font-mono bg-black/40 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 px-2.5 py-0.5 rounded-md border border-white/[0.08] hover:border-cyan-500/40 flex items-center gap-1 transition-all"
                      >
                        <span>{eid}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Architectural Weakness & Impact */}
                <div className="glass-card border-amber-500/30 p-4.5 rounded-xl space-y-2.5 shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>2. Identified Architectural Weakness</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {activeWeakness.weaknessDescription}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-300 border-t border-white/[0.06]">
                    <span className="font-bold text-rose-300 font-mono">Incident Impact:</span>{' '}
                    <span>{activeWeakness.securityImpact}</span>
                  </div>
                </div>

                {/* 3. Recommended Remediation */}
                <div className="glass-card border-emerald-500/30 p-4.5 rounded-xl space-y-3 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]">
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>3. Recommended Remediation &amp; Control</span>
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed font-sans">
                    {activeWeakness.recommendedRemediation}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 font-mono border-t border-emerald-500/20">
                    Compliance Reference: <span className="text-emerald-300 font-semibold">{activeWeakness.cisControl}</span>
                  </div>
                </div>

                {/* Tactical Action Plan */}
                {activeRemediation && (
                  <div className="glass-card border-white/[0.08] p-4.5 rounded-xl space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-cyan-400" />
                        <span>Actionable Engineering Roadmap</span>
                      </span>
                      <div className="flex items-center gap-2.5 text-[11px]">
                        <span className="text-slate-400">
                          Effort: <span className="text-cyan-300 font-bold">{activeRemediation.effort}</span>
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">
                          Impact: <span className="text-emerald-400 font-bold">{activeRemediation.impact}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      {activeRemediation.actionSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-slate-200 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
