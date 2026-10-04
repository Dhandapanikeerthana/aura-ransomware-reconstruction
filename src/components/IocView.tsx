import React, { useState } from 'react';
import {
  Binary,
  Search,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldAlert,
  Globe,
  FileCode,
  Terminal,
  UserX,
  Server,
  Filter,
} from 'lucide-react';
import { IOC, SecurityEvent } from '../types';

interface IocViewProps {
  iocs: IOC[];
  events: SecurityEvent[];
  onInspectEventId: (eventId: string) => void;
}

export const IocView: React.FC<IocViewProps> = ({
  iocs,
  events,
  onInspectEventId,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const types = Array.from(new Set(iocs.map((i) => i.type)));

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportStix = () => {
    const stixBundle = {
      type: 'bundle',
      id: `bundle--${Date.now()}`,
      spec_version: '2.1',
      objects: iocs.map((ioc) => ({
        type: 'indicator',
        spec_version: '2.1',
        id: `indicator--${ioc.id.toLowerCase()}`,
        created: ioc.firstSeen,
        modified: ioc.lastSeen,
        name: `${ioc.type}: ${ioc.value}`,
        description: ioc.context,
        indicator_types: ['malicious-activity'],
        pattern_type: 'stix',
        pattern: `[file:hashes.'SHA-256' = '${ioc.value}']`,
        valid_from: ioc.firstSeen,
      })),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stixBundle, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `AURA_STIX2.1_IOC_Bundle_${Date.now()}.json`;
    a.click();
    a.remove();
  };

  const handleExportCsv = () => {
    const headers = ['IOC_ID', 'Type', 'Value', 'Reputation', 'Associated_Host', 'Associated_User', 'First_Seen', 'Context'];
    const rows = iocs.map((i) => [
      i.id,
      `"${i.type}"`,
      `"${i.value}"`,
      i.reputation,
      `"${i.associatedHost}"`,
      `"${i.associatedUser}"`,
      i.firstSeen,
      `"${i.context.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Incident_IOCs_${Date.now()}.csv`;
    a.click();
    a.remove();
  };

  const filteredIocs = iocs.filter((ioc) => {
    if (filterType !== 'all' && ioc.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ioc.value.toLowerCase().includes(q) ||
        ioc.type.toLowerCase().includes(q) ||
        ioc.context.toLowerCase().includes(q) ||
        ioc.associatedHost.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getReputationBadge = (rep: string) => {
    switch (rep) {
      case 'Malicious':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
      case 'Suspicious':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'Compromised Internal':
        return 'text-purple-300 bg-purple-950/80 border-purple-800';
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
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <Binary className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              Extracted Indicators of Compromise (IOCs)
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            High-fidelity technical artifacts extracted from correlated event logs. Every indicator connects back to primary evidence logs and affected systems.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center font-mono text-xs">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 glass-card rounded-xl border border-white/[0.1] text-slate-200 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportStix}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export STIX 2.1</span>
          </button>
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
            placeholder="Search IOC value, hash, IP, context..."
            className="w-full bg-[#070b14]/70 border border-white/[0.1] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/70"
          />
        </div>

        {/* Filter by type */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white glass-card hover:bg-white/[0.06]'
            }`}
          >
            All Types ({iocs.length})
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all ${
                filterType === t
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white glass-card hover:bg-white/[0.06]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table of IOCs with Glass Styling */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.08] font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3">Indicator Value</th>
                <th className="py-3 px-3">Reputation</th>
                <th className="py-3 px-3">Host / Context</th>
                <th className="py-3 px-3">Associated User</th>
                <th className="py-3 px-3">Supporting Evidence</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {filteredIocs.map((ioc) => (
                <tr key={ioc.id} className="hover:bg-white/[0.04] transition-all">
                  {/* Type */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="text-slate-200 text-xs font-medium">{ioc.type}</span>
                  </td>

                  {/* Value with copy button */}
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 font-bold break-all max-w-sm">
                        {ioc.value}
                      </span>
                      <button
                        onClick={() => handleCopy(ioc.id, ioc.value)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.08] transition-colors shrink-0"
                        title="Copy to clipboard"
                      >
                        {copiedId === ioc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-sm">
                      {ioc.context}
                    </div>
                  </td>

                  {/* Reputation */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getReputationBadge(ioc.reputation)}`}>
                      {ioc.reputation}
                    </span>
                  </td>

                  {/* Associated Host */}
                  <td className="py-3 px-3 whitespace-nowrap text-purple-300 font-medium">
                    {ioc.associatedHost}
                  </td>

                  {/* Associated User */}
                  <td className="py-3 px-3 whitespace-nowrap text-amber-300 font-medium">
                    {ioc.associatedUser}
                  </td>

                  {/* Related Events */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {ioc.relatedEventIds.map((eid) => (
                        <button
                          key={eid}
                          onClick={() => onInspectEventId(eid)}
                          className="text-[10px] bg-black/40 hover:bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-md border border-white/[0.08] hover:border-cyan-500/40 flex items-center gap-1 transition-all"
                        >
                          <span>{eid}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Copy Action */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleCopy(ioc.id, ioc.value)}
                      className="px-2.5 py-1 text-[11px] text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg transition-all"
                    >
                      {copiedId === ioc.id ? 'Copied!' : 'Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
