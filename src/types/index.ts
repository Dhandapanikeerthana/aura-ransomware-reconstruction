export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';

export type AttackStageName =
  | 'Initial Access'
  | 'Execution'
  | 'Privilege Escalation'
  | 'Persistence'
  | 'Defense Evasion'
  | 'Credential Access'
  | 'Discovery'
  | 'Lateral Movement'
  | 'Collection'
  | 'Exfiltration'
  | 'Impact';

export interface SecurityEvent {
  eventId: string;
  timestamp: string; // ISO 8601
  host: string;
  username: string;
  eventType: string;
  process?: string;
  parentProcess?: string;
  processId?: number;
  parentProcessId?: number;
  sourceIp?: string;
  destinationIp?: string;
  destinationHost?: string;
  destinationPort?: number;
  filePath?: string;
  command?: string;
  severity: SeverityLevel;
  logSource: string;
  rawDetails?: string;
  fileHash?: string;
  category?: string;
  mitreTechniqueId?: string;
}

export interface CorrelationReason {
  type:
    | 'time_and_host'
    | 'parent_child_process'
    | 'same_user_pivot'
    | 'network_pivot'
    | 'file_hash_match'
    | 'credential_reuse'
    | 'sequential_execution';
  description: string;
  linkedEventIds: string[];
}

export interface ReconstructedStage {
  id: string;
  stage: AttackStageName;
  timestampStart: string;
  timestampEnd: string;
  host: string;
  user: string;
  technique: string;
  techniqueId: string;
  evidenceEventIds: string[];
  correlationReason: string;
  confidence: ConfidenceLevel;
  confidenceRationale: string;
  relatedIndicators: string[];
  summary: string;
  attackStory: string;
}

export interface MitreTechniqueMapping {
  techniqueId: string;
  techniqueName: string;
  tactic: AttackStageName;
  subtechnique?: string;
  description: string;
  supportingEventIds: string[];
  relatedStage: AttackStageName;
  confidence: ConfidenceLevel;
}

export type IocType =
  | 'IP Address'
  | 'Domain'
  | 'File Hash (SHA256)'
  | 'File Path'
  | 'Process Name'
  | 'Suspicious Command'
  | 'Compromised Account'
  | 'Compromised Host';

export interface IOC {
  id: string;
  type: IocType;
  value: string;
  relatedEventIds: string[];
  firstSeen: string;
  lastSeen: string;
  associatedHost: string;
  associatedUser: string;
  context: string;
  reputation: 'Malicious' | 'Suspicious' | 'Compromised Internal';
}

export interface SecurityWeakness {
  id: string;
  title: string;
  category: 'Authentication' | 'Privileges' | 'Network' | 'Endpoint' | 'Backups' | 'Logging';
  observedEvidenceEventIds: string[];
  evidenceExplanation: string;
  weaknessDescription: string;
  securityImpact: string;
  recommendedRemediation: string;
  cisControl: string;
  priority: 'Immediate' | 'High' | 'Medium';
}

export interface RemediationRecommendation {
  id: string;
  title: string;
  weaknessId: string;
  priority: 'P1 - Immediate' | 'P2 - High' | 'P3 - Medium';
  category: string;
  effort: 'Low' | 'Medium' | 'High';
  impact: 'High' | 'Medium';
  actionSteps: string[];
  cisBenchmark: string;
}

export interface AnalystNote {
  id: string;
  timestamp: string;
  author: string;
  content: string;
  category: 'Hypothesis' | 'Evidence Verification' | 'Containment' | 'Legal / Notification';
  taggedEventIds?: string[];
}

export interface IncidentState {
  incidentId: string;
  incidentName: string;
  organization: string;
  detectedAt: string;
  status: IncidentStatus;
  leadAnalyst: string;
  events: SecurityEvent[];
  stages: ReconstructedStage[];
  mitreMappings: MitreTechniqueMapping[];
  iocs: IOC[];
  weaknesses: SecurityWeakness[];
  remediations: RemediationRecommendation[];
  notes: AnalystNote[];
}

export interface AttackGraphNode {
  id: string;
  label: string;
  type: 'attacker' | 'user' | 'host' | 'process' | 'network' | 'file' | 'impact';
  subtitle?: string;
  severity?: SeverityLevel;
  eventIds: string[];
  x: number;
  y: number;
}

export interface AttackGraphLink {
  source: string;
  target: string;
  label: string;
  correlationReason?: string;
  eventIds: string[];
}
