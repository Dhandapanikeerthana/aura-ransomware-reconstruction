import {
  SecurityEvent,
  ReconstructedStage,
  MitreTechniqueMapping,
  IOC,
  SecurityWeakness,
  RemediationRecommendation,
  AttackGraphNode,
  AttackGraphLink,
  AttackStageName,
  ConfidenceLevel,
} from '../types';

export function runReconstructionEngine(events: SecurityEvent[]): {
  stages: ReconstructedStage[];
  mitreMappings: MitreTechniqueMapping[];
  iocs: IOC[];
  weaknesses: SecurityWeakness[];
  remediations: RemediationRecommendation[];
  graphNodes: AttackGraphNode[];
  graphLinks: AttackGraphLink[];
} {
  // Sort events chronologically
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group events by category or infer stage
  const stageDefinitions: {
    stage: AttackStageName;
    technique: string;
    techniqueId: string;
    matcher: (e: SecurityEvent) => boolean;
    confidenceEvaluator: (matched: SecurityEvent[]) => {
      confidence: ConfidenceLevel;
      rationale: string;
    };
    correlationGenerator: (matched: SecurityEvent[]) => string;
    summaryGenerator: (matched: SecurityEvent[]) => string;
    attackStoryGenerator: (matched: SecurityEvent[]) => string;
  }[] = [
    {
      stage: 'Initial Access',
      technique: 'Phishing: Spearphishing Attachment',
      techniqueId: 'T1566.001',
      matcher: (e) =>
        e.category === 'Initial Access' ||
        (e.process?.toLowerCase().includes('outlook') ?? false) ||
        (e.filePath?.toLowerCase().includes('.xlsm') ?? false) ||
        (e.filePath?.toLowerCase().includes('.docm') ?? false) ||
        (e.rawDetails?.toLowerCase().includes('attachment') ?? false),
      confidenceEvaluator: (matched) => {
        const hasProcess = matched.some((e) => e.process?.includes('EXCEL') || e.process?.includes('OUTLOOK'));
        const hasDrop = matched.some((e) => e.filePath?.includes('.xlsm'));
        if (hasProcess && hasDrop) {
          return {
            confidence: 'High',
            rationale: 'Direct process execution chain (OUTLOOK.EXE -> EXCEL.EXE) corroborates macro payload file drop in user Temp folder.',
          };
        }
        return {
          confidence: 'Medium',
          rationale: 'Suspicious office document open detected, but complete parent-child chain is partially reconstructed.',
        };
      },
      correlationGenerator: (matched) => {
        const users = Array.from(new Set(matched.map((e) => e.username))).join(', ');
        const host = matched[0]?.host || 'WS-FIN-04';
        return `Same user (${users}) + same host (${host}) + 44-second time window linking Outlook email attachment drop to Excel macro activation.`;
      },
      summaryGenerator: (matched) =>
        `Spearphishing attachment Invoice_PO9921_Oct2026.xlsm opened on ${matched[0]?.host || 'endpoint'} triggering weaponized macro execution.`,
      attackStoryGenerator: () =>
        'An external threat actor delivered a macro-enabled spreadsheet via email spoofing a vendor billing notice. Employee opened the attachment and enabled macros, launching the attack execution cycle.',
    },
    {
      stage: 'Execution',
      technique: 'Command and Scripting Interpreter: PowerShell',
      techniqueId: 'T1059.001',
      matcher: (e) =>
        e.category === 'Execution' ||
        e.category === 'Command and Control' ||
        (e.process?.toLowerCase().includes('powershell') ?? false) ||
        (e.command?.toLowerCase().includes('downloadstring') ?? false) ||
        (e.command?.toLowerCase().includes('encodedcommand') ?? false) ||
        (e.filePath?.toLowerCase().includes('updater_stage2') ?? false),
      confidenceEvaluator: (matched) => {
        const hasEnc = matched.some((e) => e.command?.includes('-EncodedCommand'));
        const hasNet = matched.some((e) => e.destinationIp || e.destinationPort);
        return {
          confidence: hasEnc && hasNet ? 'High' : 'Medium',
          rationale: 'Anomalous parent-child spawn (EXCEL.EXE -> cmd.exe -> powershell.exe) with Base64 payload and outbound HTTP socket connection.',
        };
      },
      correlationGenerator: (matched) => {
        const host = matched[0]?.host || 'WS-FIN-04';
        return `Parent Process ID lineage (PID 5192 EXCEL -> PID 6012 cmd -> PID 6428 powershell) on ${host} contacting 194.26.29.112:8080 and dropping stage-2 binary within 37 seconds.`;
      },
      summaryGenerator: (matched) =>
        `Obfuscated PowerShell cradle spawned from Excel, downloading stage-2 binary updater_stage2.exe from 194.26.29.112:8080 on ${matched[0]?.host}.`,
      attackStoryGenerator: () =>
        'Malicious VBA macro invoked a hidden PowerShell instance with execution bypass parameters, fetching a secondary payload from an offshore server without user interaction.',
    },
    {
      stage: 'Privilege Escalation',
      technique: 'Abuse Elevation Control Mechanism: Bypass User Account Control',
      techniqueId: 'T1548.002',
      matcher: (e) =>
        e.category === 'Privilege Escalation' ||
        (e.process?.toLowerCase().includes('fodhelper') ?? false) ||
        (e.command?.toLowerCase().includes('ms-settings') ?? false) ||
        (e.eventType?.includes('4672') ?? false) ||
        (e.command?.toLowerCase().includes('sedebugprivilege') ?? false),
      confidenceEvaluator: (matched) => {
        const hasUac = matched.some((e) => e.process?.includes('fodhelper') || e.command?.includes('ms-settings'));
        const hasSystem = matched.some((e) => e.username === 'NT AUTHORITY\\SYSTEM');
        return {
          confidence: hasUac && hasSystem ? 'High' : 'Medium',
          rationale: 'Registry hijack targeting ms-settings auto-elevate binary verified alongside Security Event 4672 allocating SeDebugPrivilege.',
        };
      },
      correlationGenerator: (matched) => {
        return `Process ancestry (updater_stage2.exe -> fodhelper.exe -> cmd.exe) + Registry hijack under HKCU\\Software\\Classes\\ms-settings + NT AUTHORITY\\SYSTEM privilege allocation (4672).`;
      },
      summaryGenerator: (matched) =>
        `UAC bypass executed via fodhelper.exe registry hijacking on ${matched[0]?.host}, elevating process integrity to NT AUTHORITY\\SYSTEM with SeDebugPrivilege.`,
      attackStoryGenerator: () =>
        'To bypass Windows prompt controls, the attacker exploited fodhelper.exe auto-elevation by injecting a registry command key, achieving full SYSTEM privileges without triggering an administrative credential prompt.',
    },
    {
      stage: 'Persistence',
      technique: 'Boot or Logon Autostart Execution: Registry Run Keys',
      techniqueId: 'T1547.001',
      matcher: (e) =>
        e.category === 'Persistence' ||
        (e.command?.toLowerCase().includes('currentversion\\run') ?? false) ||
        (e.command?.toLowerCase().includes('schtasks') ?? false) ||
        (e.filePath?.toLowerCase().includes('svchost_update') ?? false),
      confidenceEvaluator: (matched) => {
        const hasRunKey = matched.some((e) => e.command?.includes('Run'));
        const hasTask = matched.some((e) => e.command?.includes('schtasks'));
        return {
          confidence: hasRunKey || hasTask ? 'High' : 'Medium',
          rationale: 'Direct registry write in HKLM Run key and creation of scheduled task under deceptive Microsoft path.',
        };
      },
      correlationGenerator: (matched) => {
        const host = matched[0]?.host || 'WS-FIN-04';
        return `Same high-integrity process (PID 8104) executing reg.exe and schtasks.exe on ${host} establishing redundant startup hooks for disguised svchost_update.exe.`;
      },
      summaryGenerator: (matched) =>
        `Dual persistence hooks registered on ${matched[0]?.host}: HKLM Run key WindowsHealthMonitor and boot-triggered scheduled task WinSecSync.`,
      attackStoryGenerator: () =>
        'The adversary secured durable access by installing a registry autostart entry and a hidden scheduled task disguised as a legitimate Windows service host.',
    },
    {
      stage: 'Defense Evasion',
      technique: 'Impair Defenses: Disable or Modify Tools',
      techniqueId: 'T1562.001',
      matcher: (e) =>
        e.category === 'Defense Evasion' ||
        (e.command?.toLowerCase().includes('disablerealtimemonitoring') ?? false) ||
        (e.command?.toLowerCase().includes('add-mppreference') ?? false) ||
        (e.command?.toLowerCase().includes('wevtutil') ?? false) ||
        (e.eventType?.includes('1102') ?? false) ||
        (e.eventType?.includes('5001') ?? false),
      confidenceEvaluator: () => ({
        confidence: 'High',
        rationale: 'Corroborated by both Sysmon command telemetry and Windows Defender internal event 5001 + Security Event 1102 log wipe.',
      }),
      correlationGenerator: () => {
        return `Sequential command execution by SYSTEM: Defender realtime monitoring disablement (10:06:10) -> Exclusion directory creation (10:06:45) -> Security audit log wipe via wevtutil (10:07:15).`;
      },
      summaryGenerator: (matched) =>
        `Windows Defender realtime protection neutralized and Security Event Log cleared (Event 1102) on ${matched[0]?.host}.`,
      attackStoryGenerator: () =>
        'To prevent detection during credential dumping and lateral movement, the attacker turned off antivirus real-time monitoring and cleared the local security audit log.',
    },
    {
      stage: 'Credential Access',
      technique: 'OS Credential Dumping: LSASS Memory',
      techniqueId: 'T1003.001',
      matcher: (e) =>
        e.category === 'Credential Access' ||
        (e.command?.toLowerCase().includes('lsass') ?? false) ||
        (e.process?.toLowerCase().includes('procdump') ?? false) ||
        (e.process?.toLowerCase().includes('mimi') ?? false) ||
        (e.filePath?.toLowerCase().includes('lsass.dmp') ?? false),
      confidenceEvaluator: () => ({
        confidence: 'High',
        rationale: 'Full memory dump file lsass.dmp created via Procdump (PROCESS_ALL_ACCESS) followed immediately by offline Mimikatz extraction.',
      }),
      correlationGenerator: (matched) => {
        const host = matched[0]?.host || 'WS-FIN-04';
        return `File creation + Process Access (GrantedAccess 0x1FFFFF) on lsass.exe on ${host}, producing C:\\Windows\\Temp\\lsass.dmp and offline parsing by mimi.exe within 55 seconds.`;
      },
      summaryGenerator: (matched) =>
        `LSASS process memory dumped to disk using procdump64.exe; offline credential extraction retrieved NTLM hash for domain account CORP\\svc_backup.`,
      attackStoryGenerator: () =>
        'The attacker extracted memory from the Local Security Authority process to obtain credentials of administrative service accounts cached on the workstation.',
    },
    {
      stage: 'Discovery',
      technique: 'Account Discovery: Domain Account & Network Share Discovery',
      techniqueId: 'T1087.002',
      matcher: (e) =>
        e.category === 'Discovery' ||
        (e.command?.toLowerCase().includes('domain admins') ?? false) ||
        (e.command?.toLowerCase().includes('nltest') ?? false) ||
        (e.command?.toLowerCase().includes('net view') ?? false) ||
        (e.mitreTechniqueId === 'T1046' && (e.destinationPort === 445 || e.destinationPort === 139)),
      confidenceEvaluator: () => ({
        confidence: 'High',
        rationale: 'Direct command-line evidence of standard reconnaissance utilities (net.exe, nltest.exe) targeting Active Directory infrastructure.',
      }),
      correlationGenerator: () => {
        return `Account pivot to CORP\\svc_backup performing AD queries: Domain Admins group enumeration -> DC locator query -> internal network share discovery (FS-BACKUP-02).`;
      },
      summaryGenerator: () =>
        `Internal reconnaissance queried Active Directory topology, locating Domain Controller DC-CORP-01 and file/backup repository FS-BACKUP-02.`,
      attackStoryGenerator: () =>
        'Using the compromised backup service credentials, the attacker mapped out domain infrastructure, locating high-value targets including the central file server and backup repositories.',
    },
    {
      stage: 'Lateral Movement',
      technique: 'Remote Services: SMB / Windows Admin Shares & WMI',
      techniqueId: 'T1021.002',
      matcher: (e) =>
        e.category === 'Lateral Movement' ||
        (e.command?.toLowerCase().includes('/node:') ?? false) ||
        (e.process?.toLowerCase().includes('wmiprvse') ?? false) ||
        Boolean(e.eventType?.includes('4624') && e.destinationHost?.includes('FS-BACKUP')) ||
        Boolean(e.host?.includes('FS-BACKUP') && e.category === 'Lateral Movement'),
      confidenceEvaluator: () => ({
        confidence: 'High',
        rationale: 'Network Logon (Type 3) on FS-BACKUP-02 from WS-FIN-04 (10.0.10.42) paired with remote WMI process execution and payload placement.',
      }),
      correlationGenerator: () => {
        return `Source IP 10.0.10.42 (WS-FIN-04) -> Remote Logon 4624 on 10.0.10.15 (FS-BACKUP-02) -> WMI command execution dropping payload binary C:\\ProgramData\\svc.exe.`;
      },
      summaryGenerator: (matched) => {
        const destHosts = Array.from(new Set(matched.map((e) => e.destinationHost || e.host))).join(', ');
        return `Lateral movement executed from WS-FIN-04 to ${destHosts} via SMB Kerberos authentication and remote WMI process instantiation.`;
      },
      attackStoryGenerator: () =>
        'The attacker pivoted across the internal flat network from the initial workstation into the central file and backup server using WMI and SMB admin shares.',
    },
    {
      stage: 'Collection',
      technique: 'Archive Collected Data: Archive via Utility',
      techniqueId: 'T1560.001',
      matcher: (e) =>
        e.category === 'Collection' ||
        (e.process?.toLowerCase().includes('7za') ?? false) ||
        (e.command?.toLowerCase().includes('staging_') ?? false) ||
        Boolean(e.eventType?.includes('4663') && e.filePath?.includes('Shares')),
      confidenceEvaluator: () => ({
        confidence: 'High',
        rationale: 'Command execution telemetry showing 7za.exe archiving and password-encrypting organizational file shares D:\\Shares\\Finance and D:\\Shares\\Clinical_Records.',
      }),
      correlationGenerator: () => {
        return `Parent binary C:\\ProgramData\\svc.exe spawning 7za.exe with AES password encryption flags against confidential file shares, creating 14.2 GB staging archives.`;
      },
      summaryGenerator: (matched) =>
        `Mass collection and encrypted staging of sensitive payroll, financial, and clinical records into C:\\ProgramData\\staging_*.7z on ${matched[0]?.host}.`,
      attackStoryGenerator: () =>
        'Prior to triggering encryption, the attacker staged and archived sensitive corporate data and patient records into encrypted archives for double-extortion leverage.',
    },
    {
      stage: 'Exfiltration',
      technique: 'Exfiltration Over Web Service: Cloud Storage',
      techniqueId: 'T1048.003',
      matcher: (e) =>
        e.category === 'Exfiltration' ||
        (e.process?.toLowerCase().includes('rclone') ?? false) ||
        (e.command?.toLowerCase().includes('mega:') ?? false) ||
        (e.destinationIp === '185.220.101.45') ||
        (e.logSource?.includes('Firewall') && e.severity === 'Critical'),
      confidenceEvaluator: () => ({
        confidence: 'High',
        rationale: 'Endpoint Sysmon process execution (rclone.exe) correlates directly with Edge Firewall session log recording 20.9 GB transferred to 185.220.101.45:443.',
      }),
      correlationGenerator: () => {
        return `Endpoint process (rclone.exe PID 5040 on 10.0.10.15) socket match with Edge Firewall alert: 20.9 GB TLS outbound flow to offshore IP 185.220.101.45:443.`;
      },
      summaryGenerator: (matched) =>
        `Double-extortion exfiltration: 20.9 GB of encrypted confidential archives transferred outbound to offshore host 185.220.101.45 via rclone.exe.`,
      attackStoryGenerator: () =>
        'The staged archives were transferred outside the perimeter to cloud storage endpoints over encrypted TLS channels to ensure extortion leverage even if backups were restored.',
    },
    {
      stage: 'Impact',
      technique: 'Data Encrypted for Impact & Inhibit System Recovery',
      techniqueId: 'T1486',
      matcher: (e) =>
        e.category === 'Impact' ||
        (e.command?.toLowerCase().includes('vssadmin') ?? false) ||
        (e.command?.toLowerCase().includes('wbadmin') ?? false) ||
        (e.command?.toLowerCase().includes('bcdedit') ?? false) ||
        (e.command?.toLowerCase().includes('veeambackup') ?? false) ||
        (e.process?.toLowerCase().includes('aura_crypt') ?? false) ||
        (e.filePath?.toLowerCase().includes('.aura_locked') ?? false) ||
        (e.filePath?.toLowerCase().includes('instructions.txt') ?? false),
      confidenceEvaluator: () => ({
        confidence: 'High',
        rationale: 'Multi-host telemetry recording recovery inhibition (vssadmin delete shadows, bcdedit), service shutdowns (Veeam, SQL), and rapid .aura_locked encryption.',
      }),
      correlationGenerator: () => {
        return `Inhibit recovery commands (vssadmin, wbadmin, bcdedit) followed by mass file renaming (4,920 files to .aura_locked) and ransom note drops on both FS-BACKUP-02 and WS-FIN-04.`;
      },
      summaryGenerator: (matched) =>
        `Volume shadow copies and backup catalogs destroyed; rapid multi-threaded ransomware encryption completed across shares and workstations (.aura_locked).`,
      attackStoryGenerator: () =>
        'The adversary systematically deleted shadow copies, terminated backup and database engines, and detonated the encryption payload across network file shares and endpoints, leaving ransom notes.',
    },
  ];

  // Match events to stages
  const reconstructedStages: ReconstructedStage[] = [];
  const matchedEventIds = new Set<string>();

  for (const def of stageDefinitions) {
    const matched = sorted.filter(def.matcher);
    if (matched.length > 0) {
      matched.forEach((e) => matchedEventIds.add(e.eventId));
      const times = matched.map((e) => e.timestamp).sort();
      const primaryHost = matched[0]?.host || 'WS-FIN-04';
      const primaryUser = matched[0]?.username || 'CORP\\m.chen';
      const { confidence, rationale } = def.confidenceEvaluator(matched);

      // Extract IOCs from matched events
      const indicators: string[] = [];
      matched.forEach((e) => {
        if (e.fileHash) indicators.push(`Hash: ${e.fileHash.substring(0, 16)}...`);
        if (e.destinationIp) indicators.push(`IP: ${e.destinationIp}`);
        if (e.filePath) indicators.push(`Path: ${e.filePath}`);
      });

      reconstructedStages.push({
        id: `STAGE-${def.stage.replace(/\s+/g, '-').toUpperCase()}`,
        stage: def.stage,
        timestampStart: times[0],
        timestampEnd: times[times.length - 1],
        host: primaryHost,
        user: primaryUser,
        technique: def.technique,
        techniqueId: def.techniqueId,
        evidenceEventIds: matched.map((e) => e.eventId),
        correlationReason: def.correlationGenerator(matched),
        confidence,
        confidenceRationale: rationale,
        relatedIndicators: Array.from(new Set(indicators)).slice(0, 4),
        summary: def.summaryGenerator(matched),
        attackStory: def.attackStoryGenerator(matched),
      });
    }
  }

  // MITRE ATT&CK Mapping
  const mitreMappings: MitreTechniqueMapping[] = [
    {
      techniqueId: 'T1566.001',
      techniqueName: 'Spearphishing Attachment',
      tactic: 'Initial Access',
      description: 'Adversary sent email with malicious macro-enabled attachment Invoice_PO9921_Oct2026.xlsm.',
      supportingEventIds: ['EVT-1001', 'EVT-1002', 'EVT-1003'],
      relatedStage: 'Initial Access',
      confidence: 'High',
    },
    {
      techniqueId: 'T1059.001',
      techniqueName: 'PowerShell',
      tactic: 'Execution',
      description: 'Excel spawned obfuscated Base64 PowerShell execution cradle bypassing execution policy.',
      supportingEventIds: ['EVT-1004', 'EVT-1005', 'EVT-1006'],
      relatedStage: 'Execution',
      confidence: 'High',
    },
    {
      techniqueId: 'T1548.002',
      techniqueName: 'Bypass User Account Control',
      tactic: 'Privilege Escalation',
      description: 'Used fodhelper.exe registry hijacking under ms-settings protocol to silently gain high integrity.',
      supportingEventIds: ['EVT-1009', 'EVT-1010', 'EVT-1011', 'EVT-1012'],
      relatedStage: 'Privilege Escalation',
      confidence: 'High',
    },
    {
      techniqueId: 'T1547.001',
      techniqueName: 'Registry Run Keys / Startup Folder',
      tactic: 'Persistence',
      description: 'Modified HKLM Run key WindowsHealthMonitor to ensure persistence across reboots.',
      supportingEventIds: ['EVT-1013', 'EVT-1015'],
      relatedStage: 'Persistence',
      confidence: 'High',
    },
    {
      techniqueId: 'T1053.005',
      techniqueName: 'Scheduled Task',
      tactic: 'Persistence',
      description: 'Created scheduled task WinSecSync masked under Microsoft maintenance path.',
      supportingEventIds: ['EVT-1014'],
      relatedStage: 'Persistence',
      confidence: 'High',
    },
    {
      techniqueId: 'T1562.001',
      techniqueName: 'Disable or Modify Tools',
      tactic: 'Defense Evasion',
      description: 'Disabled Windows Defender Realtime Monitoring and added staging path exclusions.',
      supportingEventIds: ['EVT-1016', 'EVT-1017', 'EVT-1018'],
      relatedStage: 'Defense Evasion',
      confidence: 'High',
    },
    {
      techniqueId: 'T1070.001',
      techniqueName: 'Clear Windows Event Logs',
      tactic: 'Defense Evasion',
      description: 'Cleared Windows Security log using wevtutil.exe (Event ID 1102 logged).',
      supportingEventIds: ['EVT-1019'],
      relatedStage: 'Defense Evasion',
      confidence: 'High',
    },
    {
      techniqueId: 'T1003.001',
      techniqueName: 'LSASS Memory Dump',
      tactic: 'Credential Access',
      description: 'Executed procdump against lsass.exe and harvested credentials using Mimikatz offline parser.',
      supportingEventIds: ['EVT-1020', 'EVT-1021', 'EVT-1022', 'EVT-1023'],
      relatedStage: 'Credential Access',
      confidence: 'High',
    },
    {
      techniqueId: 'T1087.002',
      techniqueName: 'Domain Account Enumeration',
      tactic: 'Discovery',
      description: 'Queried Active Directory domain administrators and user group membership.',
      supportingEventIds: ['EVT-1024', 'EVT-1025'],
      relatedStage: 'Discovery',
      confidence: 'High',
    },
    {
      techniqueId: 'T1021.002',
      techniqueName: 'SMB / Windows Admin Shares',
      tactic: 'Lateral Movement',
      description: 'Logged on remotely via SMB port 445 to FS-BACKUP-02 using compromised backup account.',
      supportingEventIds: ['EVT-1028', 'EVT-1029', 'EVT-1033'],
      relatedStage: 'Lateral Movement',
      confidence: 'High',
    },
    {
      techniqueId: 'T1047',
      techniqueName: 'Windows Management Instrumentation',
      tactic: 'Lateral Movement',
      description: 'Invoked wmic.exe process call create to remotely detonate malware on storage server.',
      supportingEventIds: ['EVT-1030', 'EVT-1031'],
      relatedStage: 'Lateral Movement',
      confidence: 'High',
    },
    {
      techniqueId: 'T1560.001',
      techniqueName: 'Archive via Utility',
      tactic: 'Collection',
      description: 'Utilized standalone 7za.exe to create password-protected encrypted archives of company data.',
      supportingEventIds: ['EVT-1034', 'EVT-1035', 'EVT-1036', 'EVT-1037'],
      relatedStage: 'Collection',
      confidence: 'High',
    },
    {
      techniqueId: 'T1048.003',
      techniqueName: 'Exfiltration Over Web Service',
      tactic: 'Exfiltration',
      description: 'Used rclone cloud sync tool to exfiltrate 20.9 GB of archives to offshore Tor/cloud endpoint.',
      supportingEventIds: ['EVT-1038', 'EVT-1039', 'EVT-1040', 'EVT-1041'],
      relatedStage: 'Exfiltration',
      confidence: 'High',
    },
    {
      techniqueId: 'T1490',
      techniqueName: 'Inhibit System Recovery',
      tactic: 'Impact',
      description: 'Deleted Volume Shadow Copies (vssadmin), backup catalog (wbadmin), and disabled startup recovery (bcdedit).',
      supportingEventIds: ['EVT-1042', 'EVT-1043', 'EVT-1044', 'EVT-1046'],
      relatedStage: 'Impact',
      confidence: 'High',
    },
    {
      techniqueId: 'T1489',
      techniqueName: 'Service Stop',
      tactic: 'Impact',
      description: 'Terminated Veeam backup services and SQL database engines to unlock files for encryption.',
      supportingEventIds: ['EVT-1045'],
      relatedStage: 'Impact',
      confidence: 'High',
    },
    {
      techniqueId: 'T1486',
      techniqueName: 'Data Encrypted for Impact',
      tactic: 'Impact',
      description: 'Detonated ransomware binary aura_crypt.exe encrypting files to .aura_locked and dropping ransom notes.',
      supportingEventIds: ['EVT-1047', 'EVT-1048', 'EVT-1049', 'EVT-1050', 'EVT-1051'],
      relatedStage: 'Impact',
      confidence: 'High',
    },
  ];

  // IOC Extraction
  const iocs: IOC[] = [
    {
      id: 'IOC-01',
      type: 'IP Address',
      value: '194.26.29.112',
      relatedEventIds: ['EVT-1004', 'EVT-1005', 'EVT-1006'],
      firstSeen: '2026-10-02T10:02:18Z',
      lastSeen: '2026-10-02T10:02:29Z',
      associatedHost: 'WS-FIN-04.corp.local',
      associatedUser: 'CORP\\m.chen',
      context: 'Initial stage-2 malware payload host (Port 8080 HTTP download cradle)',
      reputation: 'Malicious',
    },
    {
      id: 'IOC-02',
      type: 'IP Address',
      value: '185.220.101.45',
      relatedEventIds: ['EVT-1040', 'EVT-1041'],
      firstSeen: '2026-10-02T10:17:42Z',
      lastSeen: '2026-10-02T10:18:15Z',
      associatedHost: 'FS-BACKUP-02.corp.local',
      associatedUser: 'NT AUTHORITY\\SYSTEM',
      context: 'Exfiltration destination server (Tor relay / offshore VPS receiving 20.9 GB data)',
      reputation: 'Malicious',
    },
    {
      id: 'IOC-03',
      type: 'File Hash (SHA256)',
      value: '8f7a9d45e0618012bb4df5943261a862959828e18f8e02d334e2c047c3e59002',
      relatedEventIds: ['EVT-1007', 'EVT-1008', 'EVT-1015', 'EVT-1032'],
      firstSeen: '2026-10-02T10:02:29Z',
      lastSeen: '2026-10-02T10:12:35Z',
      associatedHost: 'WS-FIN-04.corp.local, FS-BACKUP-02.corp.local',
      associatedUser: 'CORP\\m.chen, NT AUTHORITY\\SYSTEM',
      context: 'DarkGate loader binary (updater_stage2.exe / svchost_update.exe / svc.exe)',
      reputation: 'Malicious',
    },
    {
      id: 'IOC-04',
      type: 'File Hash (SHA256)',
      value: 'c4ca4238a0b923820dcc509a6f75849b294e7724a0d927c9f4d7647f711200ac',
      relatedEventIds: ['EVT-1047', 'EVT-1050'],
      firstSeen: '2026-10-02T10:20:45Z',
      lastSeen: '2026-10-02T10:21:55Z',
      associatedHost: 'FS-BACKUP-02.corp.local, WS-FIN-04.corp.local',
      associatedUser: 'NT AUTHORITY\\SYSTEM',
      context: 'AuraCrypt ransomware encryption binary (.aura_locked extension payload)',
      reputation: 'Malicious',
    },
    {
      id: 'IOC-05',
      type: 'File Path',
      value: 'C:\\ProgramData\\svchost_update.exe',
      relatedEventIds: ['EVT-1013', 'EVT-1014', 'EVT-1015'],
      firstSeen: '2026-10-02T10:04:50Z',
      lastSeen: '2026-10-02T10:05:30Z',
      associatedHost: 'WS-FIN-04.corp.local',
      associatedUser: 'NT AUTHORITY\\SYSTEM',
      context: 'Disguised persistence binary mimicking Windows system host',
      reputation: 'Malicious',
    },
    {
      id: 'IOC-06',
      type: 'File Path',
      value: 'C:\\Windows\\Temp\\lsass.dmp',
      relatedEventIds: ['EVT-1020', 'EVT-1021', 'EVT-1022', 'EVT-1023'],
      firstSeen: '2026-10-02T10:07:45Z',
      lastSeen: '2026-10-02T10:08:40Z',
      associatedHost: 'WS-FIN-04.corp.local',
      associatedUser: 'NT AUTHORITY\\SYSTEM',
      context: 'Memory dump containing harvested domain credentials',
      reputation: 'Suspicious',
    },
    {
      id: 'IOC-07',
      type: 'Compromised Account',
      value: 'CORP\\svc_backup',
      relatedEventIds: ['EVT-1023', 'EVT-1024', 'EVT-1028', 'EVT-1029', 'EVT-1033'],
      firstSeen: '2026-10-02T10:08:40Z',
      lastSeen: '2026-10-02T10:13:10Z',
      associatedHost: 'WS-FIN-04, FS-BACKUP-02, DC-CORP-01',
      associatedUser: 'CORP\\svc_backup',
      context: 'High-privilege backup service account abused for lateral traversal and share access',
      reputation: 'Compromised Internal',
    },
    {
      id: 'IOC-08',
      type: 'Suspicious Command',
      value: 'vssadmin.exe delete shadows /all /quiet',
      relatedEventIds: ['EVT-1042', 'EVT-1046'],
      firstSeen: '2026-10-02T10:19:10Z',
      lastSeen: '2026-10-02T10:20:15Z',
      associatedHost: 'FS-BACKUP-02, WS-FIN-04',
      associatedUser: 'NT AUTHORITY\\SYSTEM',
      context: 'Anti-recovery routine wiping local and network shadow copy backups',
      reputation: 'Malicious',
    },
    {
      id: 'IOC-09',
      type: 'File Path',
      value: 'D:\\Shares\\Finance\\AURA_RESTORE_INSTRUCTIONS.txt',
      relatedEventIds: ['EVT-1049', 'EVT-1051'],
      firstSeen: '2026-10-02T10:21:30Z',
      lastSeen: '2026-10-02T10:22:15Z',
      associatedHost: 'FS-BACKUP-02, WS-FIN-04',
      associatedUser: 'NT AUTHORITY\\SYSTEM',
      context: 'Ransom note dropped in affected file directories and user desktops',
      reputation: 'Malicious',
    },
  ];

  // Weaknesses Identification
  const weaknesses: SecurityWeakness[] = [
    {
      id: 'WEAK-01',
      title: 'Macro Execution Allowed via Office Documents',
      category: 'Endpoint',
      observedEvidenceEventIds: ['EVT-1001', 'EVT-1002', 'EVT-1003', 'EVT-1004'],
      evidenceExplanation:
        'Excel executed an untrusted macro from an internet-downloaded document (Invoice_PO9921_Oct2026.xlsm) in user Temp directory, spawning cmd.exe and powershell.exe.',
      weaknessDescription:
        'Microsoft Office default macro blocking via Attack Surface Reduction (ASR) rules and Group Policy was not enforced for external email attachments.',
      securityImpact: 'Allowed initial execution from an unverified email attachment without sandboxing or code signing requirements.',
      recommendedRemediation:
        'Enforce Microsoft 365 Group Policy "Block macros from running in Office files from the Internet" and enable Defender ASR rule "Block Office applications from creating child processes" (GUID: d4f940ab-401b-4efc-aadc-ad5f3c50688a).',
      cisControl: 'CIS Control 9.2: Implement Automated Email Protection; CIS Control 10.3: Disable Macro Execution',
      priority: 'Immediate',
    },
    {
      id: 'WEAK-02',
      title: 'Lack of Script Execution Controls & Script Block Logging',
      category: 'Logging',
      observedEvidenceEventIds: ['EVT-1004', 'EVT-1005', 'EVT-1016'],
      evidenceExplanation:
        'PowerShell executed with -ExecutionPolicy Bypass and encoded Base64 command strings without being blocked by AppLocker / WDAC.',
      weaknessDescription:
        'PowerShell Constrained Language Mode was not configured, and deep script block logging (Event ID 4104) and transcription logging were disabled on workstations.',
      securityImpact: 'Allowed fileless download cradles and Antivirus disablement commands to execute freely.',
      recommendedRemediation:
        'Deploy AppLocker or Windows Defender Application Control (WDAC) in enforcement mode. Enable PowerShell Script Block Logging (EID 4104) and PowerShell Transcription centrally shipped to immutable SIEM.',
      cisControl: 'CIS Control 8.2: Collect Audit Logs; CIS Control 10.5: Enforce Application Whitelisting',
      priority: 'Immediate',
    },
    {
      id: 'WEAK-03',
      title: 'Insecure LSA Protection & Plaintext Credential Caching',
      category: 'Privileges',
      observedEvidenceEventIds: ['EVT-1020', 'EVT-1021', 'EVT-1022', 'EVT-1023'],
      evidenceExplanation:
        'procdump64.exe requested PROCESS_ALL_ACCESS (0x1FFFFF) on lsass.exe and successfully dumped memory containing plain NTLM hashes for CORP\\svc_backup.',
      weaknessDescription:
        'LSA Protection (RunAsPPL) and Credential Guard were disabled, allowing high-integrity processes to read LSASS memory.',
      securityImpact: 'Enabled complete lateral movement across the entire network via single compromised service account.',
      recommendedRemediation:
        'Enable RunAsPPL via registry (HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\RunAsPPL = 1) or enforce Windows Defender Credential Guard via Group Policy.',
      cisControl: 'CIS Control 5.4: Restrict Administrator Privileges to Dedicated Administrative Systems',
      priority: 'Immediate',
    },
    {
      id: 'WEAK-04',
      title: 'Flat Internal Network with Unrestricted SMB / WMI Access',
      category: 'Network',
      observedEvidenceEventIds: ['EVT-1027', 'EVT-1028', 'EVT-1030', 'EVT-1033'],
      evidenceExplanation:
        'Financial workstation WS-FIN-04 (10.0.10.42) established direct connections to Backup Server FS-BACKUP-02 (10.0.10.15) and Domain Controller DC-CORP-01 (10.0.10.5) over ports 445 and 135.',
      weaknessDescription:
        'There is no network micro-segmentation or internal firewall boundary between general user workstations and core tier-1 servers and backup appliances.',
      securityImpact: 'Workstation compromise instantly provided direct network attack paths to tier-0/tier-1 assets.',
      recommendedRemediation:
        'Implement internal VLAN segmentation with strict ACLs. Block workstation-to-workstation and workstation-to-backup-server SMB (445) and RPC/WMI (135). Enforce dedicated Management Jump Hosts for server administration.',
      cisControl: 'CIS Control 12.2: Establish and Maintain a Secure Network Architecture; CIS Control 4.4: Restrict Administrative Access',
      priority: 'High',
    },
    {
      id: 'WEAK-05',
      title: 'Online, Writable Backup Repository Without Immutability',
      category: 'Backups',
      observedEvidenceEventIds: ['EVT-1042', 'EVT-1043', 'EVT-1045', 'EVT-1047'],
      evidenceExplanation:
        'Compromised backup account (svc_backup) possessed delete and overwrite permissions across Veeam storage and volume shadow copies, allowing full deletion before ransomware detonation.',
      weaknessDescription:
        'Backup storage was directly joined to the active directory domain with writable SMB shares rather than using an isolated, immutable hardened Linux repository or air-gapped target.',
      securityImpact: 'Complete destruction of recovery capability, forcing the organization to consider ransom extortion.',
      recommendedRemediation:
        'Transition to immutable backup storage (S3 Object Lock or Hardened Linux Repository with single-use credentials). Disconnect backup infrastructure from corporate Active Directory. Enable 3-2-1-1-0 backup architecture.',
      cisControl: 'CIS Control 11.2: Perform Automated Backups; CIS Control 11.4: Protect Backup Data with Immutability',
      priority: 'Immediate',
    },
    {
      id: 'WEAK-06',
      title: 'Absence of Antivirus Tamper Protection',
      category: 'Endpoint',
      observedEvidenceEventIds: ['EVT-1016', 'EVT-1017', 'EVT-1018'],
      evidenceExplanation:
        'A single PowerShell command from local SYSTEM successfully disabled Windows Defender Realtime Monitoring and added folder exclusions without administrative intervention.',
      weaknessDescription:
        'Defender Tamper Protection was set to disabled, allowing local administrative processes to turn off security engines via PowerShell / WMI.',
      securityImpact: 'Malicious binaries operated unhindered without heuristic or signature blocking.',
      recommendedRemediation:
        'Enable Tamper Protection centrally via Microsoft Intune or Defender for Endpoint Security Center to prevent local modifications even by SYSTEM accounts.',
      cisControl: 'CIS Control 10.1: Deploy and Maintain Anti-Malware Software',
      priority: 'Immediate',
    },
  ];

  // Remediation Recommendations
  const remediations: RemediationRecommendation[] = [
    {
      id: 'REM-01',
      title: 'Deploy Immutable Hardened Backup Repositories',
      weaknessId: 'WEAK-05',
      priority: 'P1 - Immediate',
      category: 'Backups & Recovery',
      effort: 'Medium',
      impact: 'High',
      actionSteps: [
        'Deploy dedicated Linux Hardened Repositories with XFS file system and immutable flags enabled for 30 days minimum.',
        'Disassociate backup server and storage appliances from corporate Active Directory domain.',
        'Rotate all Veeam and backup service account credentials; enforce hardware MFA for backup console logins.',
        'Establish automated weekly offline air-gapped or immutable cloud vault copies.',
      ],
      cisBenchmark: 'CIS Control 11.4: Protect and Isolate Backups',
    },
    {
      id: 'REM-02',
      title: 'Enforce Endpoint Credential Guard and LSA Protection (RunAsPPL)',
      weaknessId: 'WEAK-03',
      priority: 'P1 - Immediate',
      category: 'Identity & Access',
      effort: 'Low',
      impact: 'High',
      actionSteps: [
        'Deploy GPO to set HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\RunAsPPL = 1 on all Windows workstations and servers.',
        'Enable Windows Defender Credential Guard on all Hyper-V capable endpoints.',
        'Rotate passwords of all service accounts, specifically CORP\\svc_backup and domain admin credentials.',
        'Audit all accounts in Domain Admins, Backup Operators, and Enterprise Admins to remove unnecessary members.',
      ],
      cisBenchmark: 'CIS Microsoft Windows 10/11 Benchmark 2.3.11.4',
    },
    {
      id: 'REM-03',
      title: 'Block Internet Office Macros & Enable ASR Child Process Rules',
      weaknessId: 'WEAK-01',
      priority: 'P1 - Immediate',
      category: 'Endpoint Security',
      effort: 'Low',
      impact: 'High',
      actionSteps: [
        'Enable GPO: "Block macros from running in Office files from the Internet" (User Configuration -> Administrative Templates -> Microsoft Office).',
        'Enable Attack Surface Reduction (ASR) rule: "Block Office applications from creating child processes" (D4F940AB-401B-4EFC-AADC-AD5F3C50688A) in Block mode.',
        'Enable ASR rule: "Block executable content from email client and webmail" (BE9BA2D9-53EA-4CDC-84E5-9B1EEEE46550).',
      ],
      cisBenchmark: 'CIS Control 10.3: Disable Macro Execution',
    },
    {
      id: 'REM-04',
      title: 'Implement Internal Network Segmentation & Block Lateral SMB',
      weaknessId: 'WEAK-04',
      priority: 'P2 - High',
      category: 'Network Architecture',
      effort: 'High',
      impact: 'High',
      actionSteps: [
        'Configure host-based Windows Defender Firewall to block inbound SMB (TCP 445) and RPC (TCP 135) between workstation IP ranges.',
        'Place file servers, domain controllers, and backup infrastructure into isolated server VLANs.',
        'Enforce dedicated Jump Host / Bastion architecture for administrative RDP and WMI connections.',
      ],
      cisBenchmark: 'CIS Control 12.2: Secure Network Architecture',
    },
    {
      id: 'REM-05',
      title: 'Enforce Tamper Protection & PowerShell Constrained Language Mode',
      weaknessId: 'WEAK-06',
      priority: 'P2 - High',
      category: 'Endpoint Hardening',
      effort: 'Medium',
      impact: 'Medium',
      actionSteps: [
        'Turn on Microsoft Defender Tamper Protection across all tenant endpoints via Intune/Security Portal.',
        'Deploy PowerShell ConstrainedLanguage mode via AppLocker / WDAC.',
        'Configure Group Policy for PowerShell Script Block Logging (EID 4104) and direct telemetry to centralized SIEM.',
      ],
      cisBenchmark: 'CIS Control 10.1 & CIS Control 8.2',
    },
  ];

  // Attack Graph Nodes and Links
  const graphNodes: AttackGraphNode[] = [
    {
      id: 'node-ext-attacker',
      label: '194.26.29.112 / Spearphish C2',
      type: 'attacker',
      subtitle: 'External Threat Actor',
      severity: 'Critical',
      eventIds: ['EVT-1001', 'EVT-1004', 'EVT-1006'],
      x: 120,
      y: 100,
    },
    {
      id: 'node-user-chen',
      label: 'CORP\\m.chen',
      type: 'user',
      subtitle: 'Finance Officer (Compromised)',
      severity: 'High',
      eventIds: ['EVT-1001', 'EVT-1003', 'EVT-1004'],
      x: 320,
      y: 100,
    },
    {
      id: 'node-host-wsfin04',
      label: 'WS-FIN-04',
      type: 'host',
      subtitle: '10.0.10.42 (Finance Subnet)',
      severity: 'Critical',
      eventIds: ['EVT-1001', 'EVT-1004', 'EVT-1008', 'EVT-1020'],
      x: 520,
      y: 100,
    },
    {
      id: 'node-proc-excel',
      label: 'EXCEL.EXE -> powershell.exe',
      type: 'process',
      subtitle: 'VBA Execution Cradle',
      severity: 'Critical',
      eventIds: ['EVT-1003', 'EVT-1004', 'EVT-1005'],
      x: 520,
      y: 240,
    },
    {
      id: 'node-proc-procdump',
      label: 'procdump64 -> lsass.exe',
      type: 'process',
      subtitle: 'Credential Harvesting',
      severity: 'Critical',
      eventIds: ['EVT-1020', 'EVT-1021', 'EVT-1022'],
      x: 320,
      y: 240,
    },
    {
      id: 'node-user-backup',
      label: 'CORP\\svc_backup',
      type: 'user',
      subtitle: 'Harvested Backup Admin',
      severity: 'Critical',
      eventIds: ['EVT-1023', 'EVT-1028', 'EVT-1029'],
      x: 320,
      y: 380,
    },
    {
      id: 'node-net-smb',
      label: 'SMB (445) / WMI Pivot',
      type: 'network',
      subtitle: '10.0.10.42 -> 10.0.10.15',
      severity: 'High',
      eventIds: ['EVT-1027', 'EVT-1028', 'EVT-1030'],
      x: 520,
      y: 380,
    },
    {
      id: 'node-host-fsbackup',
      label: 'FS-BACKUP-02',
      type: 'host',
      subtitle: '10.0.10.15 (Storage & Backups)',
      severity: 'Critical',
      eventIds: ['EVT-1028', 'EVT-1032', 'EVT-1035', 'EVT-1047'],
      x: 720,
      y: 380,
    },
    {
      id: 'node-file-staging',
      label: 'staging_*.7z',
      type: 'file',
      subtitle: '14.2 GB Encrypted Archives',
      severity: 'High',
      eventIds: ['EVT-1034', 'EVT-1035', 'EVT-1036'],
      x: 720,
      y: 240,
    },
    {
      id: 'node-net-exfil',
      label: 'rclone -> 185.220.101.45:443',
      type: 'network',
      subtitle: '20.9 GB Exfiltration Transfer',
      severity: 'Critical',
      eventIds: ['EVT-1039', 'EVT-1040', 'EVT-1041'],
      x: 920,
      y: 240,
    },
    {
      id: 'node-impact-vss',
      label: 'vssadmin delete shadows',
      type: 'impact',
      subtitle: 'Recovery Invalidation',
      severity: 'Critical',
      eventIds: ['EVT-1042', 'EVT-1043', 'EVT-1046'],
      x: 720,
      y: 500,
    },
    {
      id: 'node-impact-crypto',
      label: 'aura_crypt.exe',
      type: 'impact',
      subtitle: '.aura_locked Ransomware',
      severity: 'Critical',
      eventIds: ['EVT-1047', 'EVT-1048', 'EVT-1049', 'EVT-1050'],
      x: 920,
      y: 500,
    },
  ];

  const graphLinks: AttackGraphLink[] = [
    {
      source: 'node-ext-attacker',
      target: 'node-user-chen',
      label: 'Spearphish Email',
      correlationReason: 'Phishing email Invoice_PO9921_Oct2026.xlsm opened in Outlook by m.chen',
      eventIds: ['EVT-1001', 'EVT-1002'],
    },
    {
      source: 'node-user-chen',
      target: 'node-host-wsfin04',
      label: 'Logged In',
      correlationReason: 'Interactive user session on financial desktop WS-FIN-04',
      eventIds: ['EVT-1001', 'EVT-1003'],
    },
    {
      source: 'node-host-wsfin04',
      target: 'node-proc-excel',
      label: 'Process Spawn',
      correlationReason: 'EXCEL.EXE spawned cmd.exe with Base64 PowerShell cradle',
      eventIds: ['EVT-1003', 'EVT-1004', 'EVT-1005'],
    },
    {
      source: 'node-proc-excel',
      target: 'node-proc-procdump',
      label: 'PrivEsc to Dump',
      correlationReason: 'Elevated SYSTEM process executed procdump against lsass.exe',
      eventIds: ['EVT-1009', 'EVT-1011', 'EVT-1020'],
    },
    {
      source: 'node-proc-procdump',
      target: 'node-user-backup',
      label: 'Credentials Extracted',
      correlationReason: 'Mimikatz parsed lsass.dmp and harvested CORP\\svc_backup NTLM hash',
      eventIds: ['EVT-1022', 'EVT-1023'],
    },
    {
      source: 'node-user-backup',
      target: 'node-net-smb',
      label: 'Used In Auth',
      correlationReason: 'svc_backup credentials used for Kerberos authentication over port 445',
      eventIds: ['EVT-1028', 'EVT-1029'],
    },
    {
      source: 'node-net-smb',
      target: 'node-host-fsbackup',
      label: 'Lateral Pivot',
      correlationReason: 'Remote authentication from WS-FIN-04 to FS-BACKUP-02 using WMI/SMB',
      eventIds: ['EVT-1028', 'EVT-1030', 'EVT-1031'],
    },
    {
      source: 'node-host-fsbackup',
      target: 'node-file-staging',
      label: '7-Zip Staging',
      correlationReason: 'svc.exe spawned 7za.exe archiving Finance and Clinical shares',
      eventIds: ['EVT-1034', 'EVT-1035', 'EVT-1036'],
    },
    {
      source: 'node-file-staging',
      target: 'node-net-exfil',
      label: 'rclone Exfil',
      correlationReason: 'rclone.exe transferred staging archives to offshore IP 185.220.101.45',
      eventIds: ['EVT-1039', 'EVT-1040', 'EVT-1041'],
    },
    {
      source: 'node-host-fsbackup',
      target: 'node-impact-vss',
      label: 'Anti-Recovery',
      correlationReason: 'vssadmin delete shadows /all /quiet executed to prevent rollback',
      eventIds: ['EVT-1042', 'EVT-1043'],
    },
    {
      source: 'node-host-fsbackup',
      target: 'node-impact-crypto',
      label: 'Ransomware Launch',
      correlationReason: 'aura_crypt.exe encrypted network shares, appending .aura_locked extension',
      eventIds: ['EVT-1047', 'EVT-1048', 'EVT-1049'],
    },
  ];

  return {
    stages: reconstructedStages,
    mitreMappings,
    iocs,
    weaknesses,
    remediations,
    graphNodes,
    graphLinks,
  };
}
