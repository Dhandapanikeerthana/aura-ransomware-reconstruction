import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  Calendar,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Binary,
} from 'lucide-react';
import {
  IncidentState,
  SecurityEvent,
  ReconstructedStage,
  MitreTechniqueMapping,
  IOC,
  SecurityWeakness,
  RemediationRecommendation,
  AnalystNote,
} from '../types';

interface ReportViewProps {
  events: SecurityEvent[];
  stages: ReconstructedStage[];
  mitreMappings: MitreTechniqueMapping[];
  iocs: IOC[];
  weaknesses: SecurityWeakness[];
  remediations: RemediationRecommendation[];
  notes: AnalystNote[];
  onAddNote: (note: AnalystNote) => void;
  onDeleteNote: (noteId: string) => void;
  onInspectEventId: (eventId: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  events,
  stages,
  mitreMappings,
  iocs,
  weaknesses,
  remediations,
  notes,
  onAddNote,
  onDeleteNote,
  onInspectEventId,
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Forensic Lead (A. Mercer)');
  const [newNoteCategory, setNewNoteCategory] = useState<AnalystNote['category']>('Evidence Verification');
  const [showAddNote, setShowAddNote] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    let md = `# AURA POST-INCIDENT RECONSTRUCTION REPORT\n`;
    md += `**Incident ID:** INC-2026-9042\n`;
    md += `**Target Organization:** St. Jude Regional Healthcare & College Network\n`;
    md += `**Date:** October 02, 2026\n`;
    md += `**Classification:** TLP:AMBER | CRITICAL - P1\n\n`;

    md += `## 1. EXECUTIVE SUMMARY\n`;
    md += `Between 10:01:14 UTC and 10:22:45 UTC on October 2, 2026, the organization sustained a sophisticated dual-extortion ransomware incident resulting in unauthorized data exfiltration of 20.9 GB of sensitive records, permanent destruction of local volume shadow copies and backup catalogs, followed by rapid multi-threaded AES+RSA file encryption across financial workstations and primary storage repositories.\n\n`;

    md += `## 2. OBSERVED EVIDENCE vs. ANALYST INTERPRETATION vs. RECOMMENDED ACTIONS\n\n`;
    md += `### PART A: OBSERVED EVIDENCE (Verifiable Telemetry)\n`;
    events.slice(0, 15).forEach((e) => {
      md += `- **${e.eventId}** [${e.timestamp}] Host: ${e.host} | User: ${e.username} | ${e.eventType} | ${e.command || e.filePath || e.rawDetails}\n`;
    });
    md += `*(Total normalized events: ${events.length})*\n\n`;

    md += `### PART B: RECONSTRUCTED ATTACK CHAIN (Analyst Interpretation)\n`;
    stages.forEach((s, idx) => {
      md += `#### Stage ${idx + 1}: ${s.stage} (${s.techniqueId})\n`;
      md += `- **Confidence:** ${s.confidence} (${s.confidenceRationale})\n`;
      md += `- **Correlation:** ${s.correlationReason}\n`;
      md += `- **Narrative:** ${s.attackStory}\n\n`;
    });

    md += `### PART C: RECOMMENDED ACTIONS (Remediation)\n`;
    remediations.forEach((r) => {
      md += `#### ${r.priority}: ${r.title}\n`;
      r.actionSteps.forEach((step) => {
        md += `  - ${step}\n`;
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Post_Incident_Report_INC-2026-9042_${Date.now()}.md`;
    a.click();
    a.remove();
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const note: AnalystNote = {
      id: `NOTE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: newNoteAuthor,
      category: newNoteCategory,
      content: newNoteContent.trim(),
    };

    onAddNote(note);
    setNewNoteContent('');
    setShowAddNote(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Export Actions */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/[0.08] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              Post-Incident DFIR Investigation Report
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Forensic grade report strictly separating <strong>Observed Evidence</strong> from{' '}
            <strong>Analyst Interpretation</strong> and <strong>Recommended Actions</strong>. Ready for executive debrief and regulatory disclosure.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center font-mono text-xs">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 glass-card rounded-xl border border-white/[0.1] text-slate-200 hover:text-white hover:bg-white/[0.08] transition-all shadow-md"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* The Formal Document Paper */}
      <div className="glass-panel border-white/[0.1] rounded-2xl p-6 sm:p-10 space-y-8 max-w-5xl mx-auto shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-white/[0.12] pb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-widest bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              OFFICIAL DFIR INCIDENT REPORT
            </span>
            <span className="font-mono text-xs text-rose-400 font-bold bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800/80 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
              CLASSIFICATION: TLP:AMBER | CRITICAL - P1
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight pt-2">
            AuraCrypt Ransomware Intrusion, Data Exfiltration &amp; Host Reconstruction
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs font-mono text-slate-400 border-t border-white/[0.08]">
            <div>Case ID: <span className="text-cyan-300 font-semibold">INC-2026-9042</span></div>
            <div>Date: <span className="text-slate-200">October 02, 2026</span></div>
            <div>Organization: <span className="text-slate-200">St. Jude Regional Healthcare</span></div>
            <div>Investigator: <span className="text-slate-200">Alex Mercer (Lead DFIR)</span></div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2.5">
          <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.4)]"></span>
            1. Executive Summary
          </h2>
          <div className="glass-card border-white/[0.08] p-5 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2 shadow-inner">
            <p>
              Between 10:01:14 UTC and 10:22:45 UTC on October 2, 2026, the organization sustained a targeted dual-extortion ransomware attack originating from a malicious macro spreadsheet delivered via spearphishing to employee <code className="text-amber-300 font-mono">m.chen</code> on workstation <code className="text-purple-300 font-mono">WS-FIN-04</code>.
            </p>
            <p>
              Within 21 minutes, threat actors leveraged UAC bypass techniques to elevate to SYSTEM integrity, dumped memory from LSASS to acquire domain backup service credentials (<code className="text-amber-300 font-mono">svc_backup</code>), moved laterally across a flat network to the core file and backup server (<code className="text-purple-300 font-mono">FS-BACKUP-02</code>), staged and exfiltrated 20.9 GB of encrypted confidential financial and patient data to offshore VPS <code className="text-rose-300 font-mono">185.220.101.45</code>, permanently destroyed Volume Shadow Copies and backup catalogs, and launched high-speed encryption across network shares appending the <code className="text-cyan-300 font-mono">.aura_locked</code> extension.
            </p>
          </div>
        </div>

        {/* 2. Core Tripartite Separation: Observed Evidence vs Interpretation vs Recommendations */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.4)]"></span>
            2. Evidence-First Forensic Findings
          </h2>

          {/* Tripartite Breakdown Cards */}
          <div className="space-y-4">
            {/* Tier 1: Observed Evidence */}
            <div className="glass-card border-white/[0.08] rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.08] pb-2.5">
                <span className="font-bold text-cyan-400 uppercase tracking-wider">
                  PART A: OBSERVED EVIDENCE (Unimpeachable Telemetry)
                </span>
                <span className="text-cyan-300 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">{events.length} Verified Events</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The findings below are directly derived from Sysmon, Windows Security, Windows Defender, and perimeter firewall logs. No conclusions are drawn without verifiable log artifacts:
              </p>

              <div className="divide-y divide-white/[0.06] font-mono text-[11px]">
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">10:01:14 UTC</span>
                  <span className="text-slate-200">OUTLOOK.EXE dropped Invoice_PO9921_Oct2026.xlsm (SHA256: e3b0c442...)</span>
                  <span className="text-cyan-400 font-bold shrink-0">EVT-1001</span>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">10:02:03 UTC</span>
                  <span className="text-slate-200">EXCEL.EXE spawned cmd.exe with Base64 PowerShell cradle</span>
                  <span className="text-cyan-400 font-bold shrink-0">EVT-1004</span>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">10:03:15 UTC</span>
                  <span className="text-slate-200">fodhelper.exe hijacked ms-settings registry protocol (UAC bypass)</span>
                  <span className="text-cyan-400 font-bold shrink-0">EVT-1009</span>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">10:07:45 UTC</span>
                  <span className="text-slate-200">procdump64.exe dumped LSASS memory (GrantedAccess: 0x1FFFFF)</span>
                  <span className="text-cyan-400 font-bold shrink-0">EVT-1020</span>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">10:11:05 UTC</span>
                  <span className="text-slate-200">Kerberos Type 3 network logon to FS-BACKUP-02 using CORP\svc_backup</span>
                  <span className="text-cyan-400 font-bold shrink-0">EVT-1028</span>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">10:17:42 UTC</span>
                  <span className="text-slate-200">rclone outbound HTTPS flow (20.9 GB) to offshore IP 185.220.101.45</span>
                  <span className="text-cyan-400 font-bold shrink-0">EVT-1040</span>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">10:19:10 UTC</span>
                  <span className="text-slate-200">vssadmin.exe delete shadows /all /quiet executed by SYSTEM</span>
                  <span className="text-cyan-400 font-bold shrink-0">EVT-1042</span>
                </div>
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">10:20:45 UTC</span>
                  <span className="text-slate-200">aura_crypt.exe encrypted D:\Shares appending .aura_locked</span>
                  <span className="text-cyan-400 font-bold shrink-0">EVT-1047</span>
                </div>
              </div>
            </div>

            {/* Tier 2: Analyst Interpretation */}
            <div className="glass-card border-white/[0.08] rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.08] pb-2.5">
                <span className="font-bold text-amber-400 uppercase tracking-wider">
                  PART B: ANALYST INTERPRETATION &amp; ATTACK RECONSTRUCTION
                </span>
                <span className="text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">{stages.length} Correlated Stages</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Forensic synthesis demonstrates the threat actor operated with high automation. The dwell time of 21 minutes indicates automated script execution post-initial macro activation. Credential dumping occurred within 6 minutes of initial compromise, followed immediately by targeted reconnaissance of the backup repository rather than general domain wide spraying. This indicates pre-programmed target profiling specifically aimed at disabling backups before encrypting business operational data.
              </p>
            </div>

            {/* Tier 3: Recommended Actions */}
            <div className="glass-card border-white/[0.08] rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.08] pb-2.5">
                <span className="font-bold text-emerald-400 uppercase tracking-wider">
                  PART C: STRATEGIC &amp; TACTICAL RECOMMENDED ACTIONS
                </span>
                <span className="text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">{remediations.length} Primary Controls</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {remediations.map((rem) => (
                  <div key={rem.id} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] font-mono">
                    <div className="flex items-center justify-between text-slate-100 font-bold mb-1">
                      <span>{rem.title}</span>
                      <span className="text-[10px] text-rose-400 font-semibold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">{rem.priority}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Standard: <span className="text-cyan-300">{rem.cisBenchmark}</span> | Effort: {rem.effort} | Impact: {rem.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Forensic Analyst Notes & Chain of Custody */}
        <div className="space-y-3.5 border-t border-white/[0.12] pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.4)]"></span>
              3. Forensic Analyst Case Notes &amp; Chain of Custody
            </h2>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 rounded-xl hover:bg-cyan-900 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddNote ? 'Cancel' : 'Add Case Note'}</span>
            </button>
          </div>

          {showAddNote && (
            <form onSubmit={handleCreateNote} className="glass-card border-cyan-500/40 p-4 sm:p-5 rounded-xl space-y-3.5 font-mono text-xs shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Analyst Name / Role</label>
                  <input
                    type="text"
                    value={newNoteAuthor}
                    onChange={(e) => setNewNoteAuthor(e.target.value)}
                    className="w-full bg-[#070b14]/70 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Note Category</label>
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value as any)}
                    className="w-full bg-[#070b14]/70 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Evidence Verification">Evidence Verification</option>
                    <option value="Hypothesis">Hypothesis</option>
                    <option value="Containment">Containment</option>
                    <option value="Legal / Notification">Legal / Notification</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Forensic Note Observation</label>
                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record verification notes, memory dump hash verifications, containment steps..."
                  className="w-full bg-[#070b14]/70 border border-white/[0.1] rounded-lg p-2.5 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-md transition-all"
                >
                  Save Note to Report
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {notes.map((note) => (
              <div key={note.id} className="p-3.5 glass-card rounded-xl border-white/[0.07] font-mono text-xs flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-cyan-400 font-bold">{note.author}</span>
                    <span className="text-slate-500">{note.timestamp.replace('T', ' ').substring(0, 19)} UTC</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-800/40">
                      {note.category}
                    </span>
                  </div>
                  <p className="text-slate-200 font-sans text-xs pt-0.5 leading-relaxed">{note.content}</p>
                </div>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Investigation Sign-Off */}
        <div className="border-t border-white/[0.12] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-slate-400">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Forensic Lead Sign-Off</div>
            <div className="text-slate-100 font-bold">Alex Mercer, Senior DFIR Lead (GIAC GCFA/GNFA)</div>
            <div className="text-[11px] text-cyan-400/90">AURA Incident Investigation Engine v3.4</div>
          </div>
          <div className="space-y-1 sm:text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Chain of Custody Status</div>
            <div className="text-emerald-400 font-bold">Verified Hash Integrity (SHA256 Match)</div>
            <div className="text-[11px] text-slate-300">Evidence Preserved for Regulatory &amp; Legal Review</div>
          </div>
        </div>
      </div>
    </div>
  );
};
