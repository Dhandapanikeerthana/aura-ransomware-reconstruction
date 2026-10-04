/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { DEMO_EVENTS } from './data/demoIncident';
import { runReconstructionEngine } from './engine/reconstructionEngine';
import { SecurityEvent, IncidentStatus, AnalystNote } from './types';

import { TopNav, ActiveTab } from './components/TopNav';
import { IncidentHeader } from './components/IncidentHeader';
import { DashboardView } from './components/DashboardView';
import { TimelineView } from './components/TimelineView';
import { EvidenceCenterView } from './components/EvidenceCenterView';
import { AttackGraphView } from './components/AttackGraphView';
import { MitreAttackView } from './components/MitreAttackView';
import { IocView } from './components/IocView';
import { WeaknessesView } from './components/WeaknessesView';
import { ReportView } from './components/ReportView';
import { EvidenceDetailModal } from './components/EvidenceDetailModal';
import { IngestionModal } from './components/IngestionModal';

const DEFAULT_NOTES: AnalystNote[] = [
  {
    id: 'NOTE-01',
    timestamp: '2026-10-02T10:25:00Z',
    author: 'Alex Mercer (Lead DFIR)',
    category: 'Evidence Verification',
    content:
      'Verified forensic integrity of C:\\Windows\\Temp\\lsass.dmp on WS-FIN-04. NTLM hash for CORP\\svc_backup corroborated with subsequent Kerberos Type 3 network logons (EID 4624) on FS-BACKUP-02.',
  },
  {
    id: 'NOTE-02',
    timestamp: '2026-10-02T10:30:00Z',
    author: 'Sarah Jenkins (SecOps)',
    category: 'Containment',
    content:
      'Perimeter firewall ACL active: Drop all TCP/UDP traffic to/from 185.220.101.45 (offshore exfil node) and 194.26.29.112 (C2 download server). Host WS-FIN-04 placed in micro-isolation.',
  },
  {
    id: 'NOTE-03',
    timestamp: '2026-10-02T10:45:00Z',
    author: 'Alex Mercer (Lead DFIR)',
    category: 'Legal / Notification',
    content:
      'Confirmed staging_clinical_records.7z contained unencrypted patient records from D:\\Shares\\Clinical_Records before exfiltration. Data privacy officer and legal council notified for HIPAA / state breach protocol.',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [status, setStatus] = useState<IncidentStatus>('INVESTIGATING');
  const [events, setEvents] = useState<SecurityEvent[]>(() => {
    const saved = localStorage.getItem('aura_incident_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_EVENTS;
      }
    }
    return DEMO_EVENTS;
  });

  const [notes, setNotes] = useState<AnalystNote[]>(() => {
    const saved = localStorage.getItem('aura_analyst_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_NOTES;
      }
    }
    return DEFAULT_NOTES;
  });

  const [inspectingEvent, setInspectingEvent] = useState<SecurityEvent | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [evidenceStageFilter, setEvidenceStageFilter] = useState<string>('all');

  // Run the post-incident reconstruction & correlation engine
  const reconstruction = useMemo(() => {
    return runReconstructionEngine(events);
  }, [events]);

  // Persist notes
  useEffect(() => {
    localStorage.setItem('aura_analyst_notes', JSON.stringify(notes));
  }, [notes]);

  const handleResetDemo = () => {
    setEvents(DEMO_EVENTS);
    setNotes(DEFAULT_NOTES);
    setStatus('INVESTIGATING');
    setEvidenceStageFilter('all');
    localStorage.removeItem('aura_incident_events');
  };

  const handleIngestEvents = (newEvents: SecurityEvent[]) => {
    setEvents(newEvents);
    setEvidenceStageFilter('all');
    setActiveTab('evidence');
    try {
      localStorage.setItem('aura_incident_events', JSON.stringify(newEvents));
    } catch (e) {
      console.warn('LocalStorage limit reached');
    }
  };

  const handleInspectEventId = (eventId: string) => {
    const found = events.find((e) => e.eventId === eventId);
    if (found) {
      setInspectingEvent(found);
    }
  };

  const handleNavigateToEvidenceForStage = (stageName: string) => {
    setEvidenceStageFilter(stageName);
    setActiveTab('evidence');
  };

  const handleAddNote = (note: AnalystNote) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Universal Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemo}
        onOpenIngest={() => setIsIngestModalOpen(true)}
        eventCount={events.length}
      />

      {/* Incident Status Strip */}
      <IncidentHeader
        status={status}
        onStatusChange={setStatus}
        eventCount={events.length}
        stageCount={reconstruction.stages.length}
        hostCount={3}
        userCount={2}
        iocCount={reconstruction.iocs.length}
      />

      {/* Main Forensic Viewport */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            events={events}
            stages={reconstruction.stages}
            mitreMappings={reconstruction.mitreMappings}
            iocs={reconstruction.iocs}
            weaknesses={reconstruction.weaknesses}
            onNavigateTab={setActiveTab}
            onSelectStage={handleNavigateToEvidenceForStage}
            onInspectEventId={handleInspectEventId}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            stages={reconstruction.stages}
            events={events}
            onInspectEventId={handleInspectEventId}
            onNavigateToEvidenceCenter={handleNavigateToEvidenceForStage}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceCenterView
            events={events}
            stages={reconstruction.stages}
            onInspectEvent={setInspectingEvent}
            selectedStageFilter={evidenceStageFilter}
            onClearStageFilter={() => setEvidenceStageFilter('all')}
          />
        )}

        {activeTab === 'graph' && (
          <AttackGraphView
            nodes={reconstruction.graphNodes}
            links={reconstruction.graphLinks}
            events={events}
            onInspectEventId={handleInspectEventId}
          />
        )}

        {activeTab === 'mitre' && (
          <MitreAttackView
            mitreMappings={reconstruction.mitreMappings}
            events={events}
            onInspectEventId={handleInspectEventId}
          />
        )}

        {activeTab === 'iocs' && (
          <IocView
            iocs={reconstruction.iocs}
            events={events}
            onInspectEventId={handleInspectEventId}
          />
        )}

        {activeTab === 'weaknesses' && (
          <WeaknessesView
            weaknesses={reconstruction.weaknesses}
            remediations={reconstruction.remediations}
            events={events}
            onInspectEventId={handleInspectEventId}
          />
        )}

        {activeTab === 'report' && (
          <ReportView
            events={events}
            stages={reconstruction.stages}
            mitreMappings={reconstruction.mitreMappings}
            iocs={reconstruction.iocs}
            weaknesses={reconstruction.weaknesses}
            remediations={reconstruction.remediations}
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onInspectEventId={handleInspectEventId}
          />
        )}
      </main>

      {/* Global Evidence Detail Inspector Modal */}
      <EvidenceDetailModal
        event={inspectingEvent}
        onClose={() => setInspectingEvent(null)}
        allEvents={events}
        stages={reconstruction.stages}
        onSelectEvent={setInspectingEvent}
      />

      {/* Telemetry Ingest & Normalizer Modal */}
      <IngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngestEvents={handleIngestEvents}
      />
    </div>
  );
}
