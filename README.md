# AURA – Ransomware Attack Reconstruction & Evidence-Based Incident Analysis

> AURA is a cybersecurity incident analysis platform that reconstructs ransomware attacks from scattered security evidence and presents the findings as a clear, evidence-backed attack story.

## 📌 Project Information

| Category | Details |
|---|---|
| Project Title | Ransomware Attack Reconstruction & Evidence-Based Incident Analysis |
| Problem Statement ID | AURA-4.1 |
| Domain | Digital Forensics & Incident Response |
| Team Name | Debug_Squad |
| Focus | Ransomware Attack Reconstruction |

## 🚨 Problem Statement

During a ransomware incident, security evidence can be scattered across different sources such as authentication records, process activity, system logs, network activity, and file-related events.

Investigators need to understand how the attack progressed and connect individual events into a meaningful sequence.

The key questions are:

- What happened?
- When did it happen?
- How did the attack progress?
- Which events were related?
- What evidence supports each reconstructed stage?
- Where can security weaknesses be improved?

AURA addresses this challenge by reconstructing the ransomware attack from available security evidence and presenting the investigation in an understandable form.

## 💡 Our Solution

AURA – Ransomware Attack Reconstruction & Evidence-Based Incident Analysis turns scattered security data into a clear, evidence-backed attack story.

Instead of requiring investigators to manually examine individual logs separately, AURA correlates relevant events and reconstructs the attack path from entry to impact.

The platform helps investigators understand:

- What happened
- How the attack happened
- When each important event occurred
- Which evidence supports each stage
- Where security weaknesses can be strengthened

Raw Evidence → Normalized Events → Correlated Events → Attack Reconstruction → Evidence Analysis → Incident Understanding

## ✨ Key Features

- 🔍 Evidence Analysis – Analyze available incident-related security evidence.
- 🕒 Attack Timeline Reconstruction – Reconstruct important events chronologically.
- 🔗 Event Correlation – Connect related events using multiple relationships.
- 📊 Attack Visualization – Present reconstructed activity through timelines and attack graphs.
- 🛡️ MITRE ATT&CK Mapping – Map reconstructed activities to relevant attacker techniques.
- 🎯 IOC Analysis – Identify and present indicators associated with the incident.
- 📁 Evidence Linking – Connect reconstructed attack stages with supporting evidence.
- 📋 Incident Reporting – Present the reconstructed incident in a structured format.
- 🔎 Weakness Identification – Highlight areas where security defenses can be strengthened.
- ⚡ Investigation Support – Reduce the effort required to manually correlate scattered security events.

## 🔄 How AURA Works

Digital Evidence
        ↓
Log Ingestion
        ↓
Normalization
        ↓
Event Correlation
        ↓
AURA Reconstructor
        ↓
MITRE Mapping + IOC Engine + Evidence Engine
        ↓
Attack Timeline
        ↓
Attack Graph
        ↓
AURA Dashboard
        ↓
Incident Report

## ⚙️ Technical Approach

AURA follows an evidence-driven reconstruction pipeline.

### 1. Log Ingestion

Security telemetry is collected from available sources such as:

- Windows Event Logs
- Sysmon
- Network Data

### 2. Normalization

Different log formats are converted into a common event structure so that events from different sources can be analyzed together.

### 3. Event Correlation

Related events are connected using multiple factors:

- Time
- Host
- User
- Process
- Network relationships

This reduces the need to manually examine every event independently.

### 4. Attack Reconstruction

The correlated events are used to construct the sequence of activities that occurred during the incident.

### 5. Evidence Analysis

AURA connects reconstructed stages with the evidence supporting those stages.

### 6. MITRE ATT&CK Mapping

Relevant reconstructed activities can be mapped to the MITRE ATT&CK framework to provide additional context about attacker behavior.

### 7. Visualization

The reconstructed incident is presented through:

- Attack Timeline
- Attack Graph
- IOC information
- Evidence information
- Incident Dashboard
- Incident Report

## 🧩 Evidence Sources

AURA is designed around multiple sources of security telemetry:

### Windows Event Logs

Provides system and security-related event information that can contribute to incident reconstruction.

### Sysmon

Provides detailed system and process activity that can help connect events during investigation.

### Network Data

Provides network-level information that can help identify relationships between systems and activities.

These sources can be combined to build a more complete picture of the incident.

## 🛡️ MITRE ATT&CK Integration

AURA uses the MITRE ATT&CK framework as a reference for understanding attacker behavior.

Reconstructed activities can be associated with relevant tactics and techniques to help investigators understand different stages of the attack.

A ransomware incident can involve stages such as:

Initial Access
      ↓
Execution
      ↓
Persistence
      ↓
Privilege Escalation
      ↓
Defense Evasion
      ↓
Discovery
      ↓
Lateral Movement
      ↓
Impact

The MITRE ATT&CK mapping provides additional context to the reconstructed attack sequence.

## 🔄 Implementation Strategy

AURA follows six major stages:

### 01. Collect

Gather available security telemetry from different sources.

### 02. Normalize

Convert different log formats into a common event structure.

### 03. Correlate

Connect related events using:

- Time
- Host
- User
- Process
- Network relationships

### 04. Construct

Build the reconstructed attack sequence from correlated events.

### 05. Explain

Show the evidence supporting every reconstructed attack stage.

### 06. Improve

Identify security weaknesses and areas for remediation.

Collect → Normalize → Correlate → Construct → Explain → Improve

## 🛠️ Technology Stack

### Data Sources

- Windows Event Logs
- Sysmon
- Network Data

### Core Engine

- Python

Used for ingestion, normalization, and event correlation.

### Event Processing

- Pandas

Used for cleaning and joining events into a common structure.

### Attack Graph

- NetworkX

Used to represent relationships between users, hosts, processes, and network events.

### Visualization

- Plotly

Used for interactive attack timeline and graph visualization.

### Dashboard

- Streamlit

Used for the investigation dashboard and incident reporting interface.

### Storage

- SQLite / PostgreSQL

Used for storing incidents and relationships between incidents and evidence.

### Security Framework

- MITRE ATT&CK

Used for mapping reconstructed activities to relevant attacker techniques.

### Development

- Git
- GitHub

## 🧩 Challenges & Mitigation

| Challenge | AURA Approach |
|---|---|
| Fragmented logs | Unified event normalization |
| Large event volume | Rule-based correlation |
| False correlations | Multi-factor event correlation |
| Missing telemetry | Evidence confidence indicators |
| Analyst complexity | Visual timeline and attack graph |
| Performance overhead | Lightweight processing pipeline |

## 🎯 Target Users

### SOC / Security Teams

Provides structured incident reconstruction and investigation capabilities without requiring a large SOC team.

### Colleges & Universities

Helps security teams understand how an incident progressed across their environment.

### Security Analysts

Provides evidence-linked attack stages instead of requiring manual correlation across multiple logs.

### Management

Provides an understandable incident summary and highlights identified security gaps.

## 📈 Long-Term Value

AURA supports a continuous security improvement cycle:

Incident Reconstruction
        ↓
Weakness Identification
        ↓
Remediation
        ↓
Improved Preparedness

AURA supports future security improvement; it does not claim to guarantee ransomware prevention.

## 📊 Scalability

AURA is designed with a scalable progression in mind:

Prototype
    ↓
College / University
    ↓
MSME
    ↓
Multi-site Organization
    ↓
Enterprise SOC

The approach can be extended as the scale and complexity of the monitored environment increases.

## 📸 Screenshots

### Dashboard

<!-- Add your dashboard screenshot here -->

![AURA Dashboard]<img width="1535" height="862" alt="Dashboard" src="https://github.com/user-attachments/assets/ac1e6255-35da-4c10-ac2a-006e9d6143f1" />


### Attack Timeline

<!-- Add your attack timeline screenshot here -->

![Attack Timeline]<img width="1533" height="865" alt="Attack timeline" src="https://github.com/user-attachments/assets/fc17000d-8657-4eee-9848-9e6a7db68917" />


### Incident Analysis

<!-- Add your incident analysis screenshot here -->

![Incident Analysis]<img width="1532" height="862" alt="Incident Analysis" src="https://github.com/user-attachments/assets/79068792-a2fd-4b3e-9473-c17d58111417" />


## 📂 Project Structure

aura-ransomware-reconstruction/
│
├── screenshots/
│   ├── dashboard.png
│   ├── attack-timeline.png
│   └── incident-analysis.png
│
├── src/
│   ├── components/
│   ├── data/
│   ├── engine/
│   └── types/
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts

## 🚀 Run Locally

### Prerequisites

Make sure you have:

- Node.js
- npm
- Git

### 1. Clone the Repository

git clone https://github.com/Dhandapanikeerthana/aura-ransomware-reconstruction.git

### 2. Navigate to the Project

cd aura-ransomware-reconstruction

### 3. Install Dependencies

npm install

### 4. Configure Environment Variables

If the project requires a Gemini API key, create a .env.local file and configure:

GEMINI_API_KEY=your_api_key_here

Never commit your actual API key to GitHub.

The repository should contain only the example environment configuration.

### 5. Start the Development Server

npm run dev

The application will be available at the local development URL displayed in the terminal.

## 🔐 Security Note

AURA is intended for:

- Defensive cybersecurity analysis
- Digital forensics education
- Incident investigation
- Security research

The project focuses on reconstructing and understanding ransomware incidents from available evidence.

AURA does not provide ransomware creation or deployment functionality.

## 🌱 Future Enhancements

Potential future improvements include:

- Automated evidence ingestion
- Support for additional log formats
- Advanced event correlation
- Real-time monitoring
- Automated incident reports
- Improved MITRE ATT&CK mapping
- Additional visualization options
- AI-assisted incident summarization
- Exportable forensic investigation reports
- Expanded evidence-source support

## 📚 Research & References

- MITRE ATT&CK – Attack techniques and adversary behavior
- CISA – Ransomware guidance and incident-response resources
- NIST – Cybersecurity incident response and risk-management guidance
- CERT-In – Indian cybersecurity advisories and guidance
- Sophos – Ransomware research covering organizations and educational institutions
- Academic Research – Ransomware detection, attack reconstruction, digital forensics, and security-event correlation
- Indian Incident Case Studies – C-Edge Technologies / small Indian banks – 2024
- National Aerospace Laboratories – 2023

## 🏆 Project

### AURA – Ransomware Attack Reconstruction & Evidence-Based Incident Analysis

AURA was developed as a cybersecurity hackathon project focused on making ransomware incident reconstruction more structured, understandable, and evidence-driven.

The project focuses on helping investigators understand:

What happened?
      ↓
How did it happen?
      ↓
What evidence supports it?
      ↓
Where are the weaknesses?
      ↓
How can defenses be improved?

## 👩‍💻 Team

### Debug_Squad

- Keerthana D
- Mahashree M
- Atchay B

