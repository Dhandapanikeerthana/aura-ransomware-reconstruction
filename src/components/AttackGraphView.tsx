import React, { useState } from 'react';
import {
  Network,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Server,
  User,
  Cpu,
  Globe,
  FileCode,
  Flame,
  ExternalLink,
  Info,
} from 'lucide-react';
import { AttackGraphNode, AttackGraphLink, SecurityEvent } from '../types';

interface AttackGraphViewProps {
  nodes: AttackGraphNode[];
  links: AttackGraphLink[];
  events: SecurityEvent[];
  onInspectEventId: (eventId: string) => void;
}

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({
  nodes,
  links,
  events,
  onInspectEventId,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-ext-attacker');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Filter nodes if needed
  const visibleNodes = nodes.filter((n) => {
    if (typeFilter === 'all') return true;
    return n.type === typeFilter;
  });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'attacker':
        return <Globe className="w-4 h-4 text-rose-400" />;
      case 'user':
        return <User className="w-4 h-4 text-amber-400" />;
      case 'host':
        return <Server className="w-4 h-4 text-purple-400" />;
      case 'process':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'network':
        return <Network className="w-4 h-4 text-blue-400" />;
      case 'file':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'impact':
        return <Flame className="w-4 h-4 text-rose-500" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNodeBorder = (type: string, isSelected: boolean) => {
    if (isSelected) return 'stroke-cyan-400 stroke-2 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]';
    switch (type) {
      case 'attacker':
        return 'stroke-rose-700/80 stroke-1';
      case 'user':
        return 'stroke-amber-700/80 stroke-1';
      case 'host':
        return 'stroke-purple-700/80 stroke-1';
      case 'process':
        return 'stroke-cyan-700/80 stroke-1';
      case 'network':
        return 'stroke-blue-700/80 stroke-1';
      case 'file':
        return 'stroke-emerald-700/80 stroke-1';
      case 'impact':
        return 'stroke-rose-600/90 stroke-1';
      default:
        return 'stroke-slate-700 stroke-1';
    }
  };

  // Find incoming and outgoing links for selected node
  const connectedLinks = links.filter(
    (l) => l.source === selectedNodeId || l.target === selectedNodeId
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/[0.08] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Network className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              Interactive Attack Reconstruction Graph
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Forensic topology representing the complete attack flow: Attacker Activity → Compromised User → Host Systems → Process Spawns → Internal Network Traversal → Encrypted Impact.
          </p>
        </div>

        {/* Graph Controls */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="flex items-center bg-[#070b14]/70 border border-white/[0.1] rounded-xl p-1 backdrop-blur-md shadow-md">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-cyan-300 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] ml-1 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Graph Canvas + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas / SVG Area (3 cols) with Frosted Glass Styling */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-5 relative overflow-hidden min-h-[580px] flex flex-col justify-between shadow-2xl border-white/[0.08]">
          {/* Top Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap z-10 mb-3">
            {[
              { id: 'all', label: 'All Entities' },
              { id: 'attacker', label: 'Threat Actor' },
              { id: 'user', label: 'Accounts' },
              { id: 'host', label: 'Hosts' },
              { id: 'process', label: 'Processes' },
              { id: 'network', label: 'Network Sockets' },
              { id: 'file', label: 'Staged Files' },
              { id: 'impact', label: 'Impact Nodes' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
                  typeFilter === f.id
                    ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* SVG Diagram Canvas */}
          <div className="flex-1 w-full overflow-auto relative rounded-xl bg-black/40 border border-white/[0.04]">
            <svg
              viewBox="0 0 1100 620"
              className="w-full h-full min-w-[900px] transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
                </marker>
              </defs>

              {/* Draw Links */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isConnectedToSelected =
                  link.source === selectedNodeId || link.target === selectedNodeId;

                // Midpoint for label
                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2;

                return (
                  <g key={idx} className="cursor-pointer">
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isConnectedToSelected ? '#06b6d4' : '#334155'}
                      strokeWidth={isConnectedToSelected ? 2.5 : 1.5}
                      strokeDasharray={isConnectedToSelected ? 'none' : '4 2'}
                      markerEnd={isConnectedToSelected ? 'url(#arrow-active)' : 'url(#arrow)'}
                      className="transition-colors"
                    />
                    <rect
                      x={midX - 40}
                      y={midY - 10}
                      width={80}
                      height={18}
                      rx={5}
                      fill="#0b101d"
                      stroke={isConnectedToSelected ? '#06b6d4' : '#1e293b'}
                      strokeWidth={1}
                    />
                    <text
                      x={midX}
                      y={midY + 3}
                      fill={isConnectedToSelected ? '#67e8f9' : '#94a3b8'}
                      fontSize={9}
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {link.label}
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {visibleNodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isDimmed = typeFilter !== 'all' && node.type !== typeFilter;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer group"
                    opacity={isDimmed ? 0.3 : 1}
                  >
                    {/* Node Card */}
                    <rect
                      x={-80}
                      y={-30}
                      width={160}
                      height={60}
                      rx={12}
                      fill={isSelected ? '#0c2236' : '#0c1424'}
                      className={getNodeBorder(node.type, isSelected)}
                    />

                    {/* Node Icon Circle */}
                    <circle
                      cx={-55}
                      cy={0}
                      r={14}
                      fill="#070a12"
                      stroke={isSelected ? '#06b6d4' : '#334155'}
                      strokeWidth={1}
                    />

                    {/* Node Label */}
                    <text
                      x={-35}
                      y={-6}
                      fill={isSelected ? '#ffffff' : '#e2e8f0'}
                      fontSize={11}
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {node.label.length > 15 ? `${node.label.substring(0, 14)}…` : node.label}
                    </text>

                    {/* Node Subtitle */}
                    <text
                      x={-35}
                      y={12}
                      fill="#94a3b8"
                      fontSize={9}
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {node.subtitle?.length && node.subtitle.length > 20
                        ? `${node.subtitle.substring(0, 19)}…`
                        : node.subtitle}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="z-10 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Click any graph node to inspect telemetry evidence &amp; causal linkages</span>
            <span className="text-cyan-300 font-semibold">{visibleNodes.length} Active Graph Entities</span>
          </div>
        </div>

        {/* Right Side: Selected Entity Dossier (1 col) with Glass Styling */}
        <div className="space-y-4">
          {selectedNode ? (
            <div className="glass-panel rounded-2xl p-5 space-y-4 border-white/[0.08] shadow-2xl">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                    {getNodeIcon(selectedNode.type)}
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-bold">
                    {selectedNode.type}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-mono">{selectedNode.label}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedNode.subtitle}</p>
              </div>

              {/* Linked Relationships */}
              <div className="space-y-2.5 border-t border-white/[0.08] pt-3.5">
                <div className="text-[11px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                  Connected Attack Vectors ({connectedLinks.length})
                </div>
                <div className="space-y-2">
                  {connectedLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-3 glass-card rounded-xl border-white/[0.06] text-[11px] text-slate-200 font-mono space-y-1"
                    >
                      <div className="text-cyan-300 font-bold flex items-center gap-1">
                        <span>→ {link.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {link.correlationReason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Underlying Log Events */}
              <div className="space-y-2.5 border-t border-white/[0.08] pt-3.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300 font-bold uppercase tracking-wider">Supporting Telemetry</span>
                  <span className="text-cyan-400 font-extrabold">{selectedNode.eventIds.length} Events</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedNode.eventIds.map((evtId) => {
                    const evt = events.find((e) => e.eventId === evtId);
                    if (!evt) return null;
                    return (
                      <div
                        key={evtId}
                        onClick={() => onInspectEventId(evtId)}
                        className="p-2.5 glass-card glass-card-hover rounded-xl border-white/[0.06] hover:border-cyan-500/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-cyan-400 font-bold group-hover:text-cyan-300">
                            {evt.eventId}
                          </span>
                          <span className="text-slate-400">
                            {evt.timestamp.split('T')[1]?.substring(0, 8)}
                          </span>
                        </div>
                        <div className="text-[11px] text-white font-medium truncate mt-0.5">{evt.eventType}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {evt.command || evt.filePath || evt.rawDetails}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 text-center text-slate-400 border-white/[0.08]">
              <Info className="w-6 h-6 mx-auto mb-2 text-cyan-400/60" />
              <p className="text-xs">Select a graph entity to view detailed causal forensic linkages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
