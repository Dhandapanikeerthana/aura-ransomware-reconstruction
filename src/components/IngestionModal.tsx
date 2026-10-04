import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowRight,
  FileCode,
  Shield,
} from 'lucide-react';
import { SecurityEvent } from '../types';
import { DEMO_EVENTS } from '../data/demoIncident';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestEvents: (events: SecurityEvent[], sourceName: string) => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  onIngestEvents,
}) => {
  const [activePreset, setActivePreset] = useState<'demo52' | 'early12' | 'lateral18' | 'custom'>('demo52');
  const [customText, setCustomText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setCustomText(text);
        setActivePreset('custom');
        setParseError(null);
      } catch (err: any) {
        setParseError(`Failed to read file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitIngestion = () => {
    setIsProcessing(true);
    setParseError(null);

    try {
      if (activePreset === 'demo52') {
        onIngestEvents(DEMO_EVENTS, 'Demo Incident: Full Double Extortion Ransomware (52 Events)');
        onClose();
        return;
      }

      if (activePreset === 'early12') {
        const sliced = DEMO_EVENTS.slice(0, 12);
        onIngestEvents(sliced, 'Demo Subset: Phishing & Privilege Escalation (12 Events)');
        onClose();
        return;
      }

      if (activePreset === 'lateral18') {
        const sliced = DEMO_EVENTS.slice(23, 41);
        onIngestEvents(sliced, 'Demo Subset: Lateral Movement & Exfiltration (18 Events)');
        onClose();
        return;
      }

      // Custom ingestion: parse JSON or CSV
      if (!customText.trim()) {
        setParseError('Please paste or upload JSON or CSV telemetry content.');
        setIsProcessing(false);
        return;
      }

      let parsed: any[] = [];
      const trimmed = customText.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const json = JSON.parse(trimmed);
        parsed = Array.isArray(json) ? json : [json];
      } else {
        // Simple CSV parse
        const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV must contain a header row and at least one data row.');
        }
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        parsed = lines.slice(1).map((line, rowIdx) => {
          const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          const rowObj: any = { eventId: `CUSTOM-${rowIdx + 1}` };
          headers.forEach((h, colIdx) => {
            rowObj[h] = cols[colIdx] || '';
          });
          return rowObj;
        });
      }

      // Normalize into SecurityEvent schema
      const normalized: SecurityEvent[] = parsed.map((item, idx) => {
        return {
          eventId: item.eventId || item.EventID || item.id || `EVT-UPLOAD-${1000 + idx}`,
          timestamp: item.timestamp || item.TimeCreated || item['@timestamp'] || new Date().toISOString(),
          host: item.host || item.Computer || item.HostName || 'UNKNOWN-HOST',
          username: item.username || item.User || item.Account || 'UNKNOWN-USER',
          eventType: item.eventType || item.EventName || item.TaskCategory || 'Normalized Log Record',
          process: item.process || item.Image || item.ProcessName,
          parentProcess: item.parentProcess || item.ParentImage,
          processId: Number(item.processId || item.ProcessId) || undefined,
          parentProcessId: Number(item.parentProcessId || item.ParentProcessId) || undefined,
          sourceIp: item.sourceIp || item.SourceIp || item.src_ip,
          destinationIp: item.destinationIp || item.DestinationIp || item.dest_ip,
          destinationHost: item.destinationHost || item.DestinationHost,
          destinationPort: Number(item.destinationPort || item.DestinationPort || item.dest_port) || undefined,
          filePath: item.filePath || item.TargetFilename || item.path,
          command: item.command || item.CommandLine || item.cmd,
          severity: (item.severity || item.Severity || 'Medium') as any,
          logSource: item.logSource || item.Source || item.Channel || 'Custom Ingest',
          rawDetails: item.rawDetails || item.Message || item.details || JSON.stringify(item),
          fileHash: item.fileHash || item.Hashes,
          category: item.category || 'Uploaded Telemetry',
          mitreTechniqueId: item.mitreTechniqueId || item.TechniqueId,
        };
      });

      if (normalized.length === 0) {
        throw new Error('No valid event records could be extracted from input.');
      }

      onIngestEvents(normalized, `Custom Telemetry Ingest (${normalized.length} Events)`);
      onClose();
    } catch (err: any) {
      setParseError(`Parse / Validation Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="glass-panel border-white/[0.12] w-full max-w-2xl flex flex-col rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-mono text-sm font-bold text-white tracking-wide">
              Security Telemetry Ingestion &amp; Event Normalizer
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div className="p-3.5 glass-card border-cyan-500/30 rounded-xl text-slate-300 space-y-1 shadow-sm">
            <span className="font-semibold text-cyan-300 font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Untrusted Evidence Policy:
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All ingested logs are parsed into AURA's normalized schema. Uploaded telemetry will never execute commands or payloads; data is processed strictly as forensic post-incident evidence.
            </p>
          </div>

          {/* Presets vs Custom */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Select Telemetry Ingestion Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActivePreset('demo52')}
                className={`p-3.5 text-left rounded-xl border transition-all ${
                  activePreset === 'demo52'
                    ? 'bg-gradient-to-br from-cyan-950/90 to-blue-950/80 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30'
                    : 'glass-card border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                }`}
              >
                <div className="font-bold font-mono text-xs flex items-center justify-between">
                  <span className="text-white">Full Ransomware Chain</span>
                  <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-900/50 px-1.5 py-0.5 rounded border border-cyan-500/30">52 Events</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  Complete end-to-end incident from phishing macro to shadow copy purge &amp; .aura_locked encryption.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePreset('early12')}
                className={`p-3.5 text-left rounded-xl border transition-all ${
                  activePreset === 'early12'
                    ? 'bg-gradient-to-br from-cyan-950/90 to-blue-950/80 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30'
                    : 'glass-card border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                }`}
              >
                <div className="font-bold font-mono text-xs flex items-center justify-between">
                  <span className="text-white">Initial Breach Subset</span>
                  <span className="text-[10px] text-amber-300 font-semibold bg-amber-900/50 px-1.5 py-0.5 rounded border border-amber-500/30">12 Events</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  Initial access, Base64 PowerShell execution cradle, and fodhelper UAC bypass on WS-FIN-04.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePreset('lateral18')}
                className={`p-3.5 text-left rounded-xl border transition-all ${
                  activePreset === 'lateral18'
                    ? 'bg-gradient-to-br from-cyan-950/90 to-blue-950/80 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30'
                    : 'glass-card border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                }`}
              >
                <div className="font-bold font-mono text-xs flex items-center justify-between">
                  <span className="text-white">Lateral Pivot &amp; Exfil</span>
                  <span className="text-[10px] text-purple-300 font-semibold bg-purple-900/50 px-1.5 py-0.5 rounded border border-purple-500/30">18 Events</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  Compromised backup account pivot to FS-BACKUP-02, 7z staging, and 20.9 GB rclone cloud transfer.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePreset('custom')}
                className={`p-3.5 text-left rounded-xl border transition-all ${
                  activePreset === 'custom'
                    ? 'bg-gradient-to-br from-cyan-950/90 to-blue-950/80 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30'
                    : 'glass-card border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                }`}
              >
                <div className="font-bold font-mono text-xs flex items-center justify-between">
                  <span className="text-white">Custom Log Upload</span>
                  <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-900/50 px-1.5 py-0.5 rounded border border-emerald-500/30">JSON / CSV</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  Upload Windows Event Logs, Sysmon JSON, firewall logs, or CSV event dumps from your environment.
                </div>
              </button>
            </div>
          </div>

          {/* Custom File or Text Box */}
          {activePreset === 'custom' && (
            <div className="space-y-2 pt-2 border-t border-white/[0.08] animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Paste or Upload Raw Log Data
                </span>
                <label className="cursor-pointer text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose file...</span>
                  <input
                    type="file"
                    accept=".json,.csv,.txt,.log"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={6}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder='[{"eventId":"EVT-01","timestamp":"2026-10-02T10:00:00Z","host":"WS-01","username":"user1","eventType":"Process Creation","process":"cmd.exe","severity":"High","logSource":"Sysmon"}]'
                className="w-full bg-[#070b14]/70 border border-white/[0.1] rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70"
              />
            </div>
          )}

          {parseError && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2 shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/[0.03] border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 glass-card hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-all border border-white/[0.08]"
          >
            Cancel
          </button>

          <button
            onClick={handleCommitIngestion}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/30"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ingest &amp; Run Reconstruction Engine</span>
          </button>
        </div>
      </div>
    </div>
  );
};
