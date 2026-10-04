# AURA – Ransomware Attack Reconstruction & Evidence-Based Incident Analysis

> **AURA** is a cybersecurity incident analysis platform that reconstructs ransomware attacks from scattered digital evidence and presents the findings as a clear, chronological attack timeline.

## 🚨 Problem Statement

During a ransomware attack, evidence is often scattered across different sources such as login records, program execution logs, network activity, and file-system events.

For small organizations, colleges, and other institutions without dedicated Security Operations Center (SOC) teams, analyzing this evidence manually can be difficult and time-consuming.

The challenge is not only detecting suspicious activity, but also understanding:

* **What happened?**
* **When did it happen?**
* **How did the attack progress?**
* **Which activities were related to the attack?**
* **What evidence supports each event?**

## 💡 Our Solution

**AURA (Ransomware Attack Reconstruction & Evidence-Based Incident Analysis)** helps organize and reconstruct ransomware incidents from available digital evidence.

Instead of viewing individual logs separately, AURA connects relevant events and presents them as an understandable attack timeline.

The platform helps users move from **raw evidence → correlated events → attack timeline → incident understanding**.

## ✨ Key Features

* 🔍 **Evidence Analysis** – Analyze different types of incident-related evidence.
* 🕒 **Attack Timeline Reconstruction** – Arrange important events chronologically.
* 🔗 **Event Correlation** – Connect related activities across different evidence sources.
* 📊 **Incident Visualization** – Present attack progression in an easier-to-understand format.
* 🛡️ **MITRE ATT&CK Mapping** – Associate observed attack activities with relevant MITRE ATT&CK techniques.
* 📁 **Evidence-Based Analysis** – Support findings using available digital evidence.
* ⚡ **Faster Investigation** – Reduce the effort required to manually connect scattered events.
* 🏫 **Designed for Smaller Organizations** – Useful for environments that may not have dedicated SOC resources.

## 🔄 How AURA Works

```text
        Digital Evidence
               │
               ▼
     ┌───────────────────┐
     │ Evidence Collection│
     └─────────┬─────────┘
               │
               ▼
     ┌───────────────────┐
     │ Event Processing   │
     └─────────┬─────────┘
               │
               ▼
     ┌───────────────────┐
     │ Event Correlation  │
     └─────────┬─────────┘
               │
               ▼
     ┌───────────────────┐
     │ Timeline           │
     │ Reconstruction     │
     └─────────┬─────────┘
               │
               ▼
     ┌───────────────────┐
     │ MITRE ATT&CK       │
     │ Mapping             │
     └─────────┬─────────┘
               │
               ▼
     ┌───────────────────┐
     │ Incident Analysis  │
     └───────────────────┘
```

## 🧩 Evidence Sources

AURA can work with different types of incident-related evidence, including:

* Authentication and login records
* Program/process execution records
* Network activity
* File-system activity
* Security-related logs
* Other available forensic evidence

These sources can be analyzed together to build a more complete picture of the incident.

## 🛡️ MITRE ATT&CK Integration

AURA uses the **MITRE ATT&CK framework** as a reference for understanding attacker behavior.

Observed activities can be associated with relevant tactics and techniques, helping investigators understand the possible stages of an attack.

Example:

```text
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
Impact
```

## 🎯 Target Users

AURA is designed with environments in mind where cybersecurity investigation resources may be limited:

* Small and medium-sized organizations
* Colleges and universities
* Educational institutions
* Small IT teams
* Security learners and researchers
* Incident-response teams

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* [Add your frontend framework here if used]

### Backend

* [Add backend technology here if used]

### AI / Data Analysis

* [Add AI/ML technologies used in your implementation]

### Security Framework

* MITRE ATT&CK

### Development Tools

* Git
* GitHub
* [Add other tools used in the project]

> **Note:** Update the technology list above to match the actual implementation before submitting the project.

## 📂 Project Structure

```text
aura-ransomware-reconstruction/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── .env.local
├── package.json
├── README.md
└── ...
```

> The structure may vary depending on the final implementation.

## 🚀 Run Locally

### Prerequisites

Make sure you have:

* Node.js
* npm
* Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/aura-ransomware-reconstruction.git
```

### 2. Navigate to the project

```bash
cd aura-ransomware-reconstruction
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure the API key

Create or update `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

**Do not commit your `.env.local` file or expose your API key publicly.**

### 5. Start the development server

```bash
npm run dev
```

The application will then be available through the local development URL shown in your terminal.

## 📸 Screenshots

### Dashboard

<!-- Add your dashboard screenshot here -->

![AURA Dashboard](screenshots/dashboard.png)

### Attack Timeline

<!-- Add your attack timeline screenshot here -->

![Attack Timeline](screenshots/attack-timeline.png)

### Incident Analysis

<!-- Add your incident analysis screenshot here -->

![Incident Analysis](screenshots/incident-analysis.png)

## 🔐 Security Note

AURA is intended for **defensive cybersecurity analysis, education, and incident investigation**.

The project focuses on understanding ransomware incidents through available evidence and reconstructing attack activity. It does not provide ransomware creation or deployment functionality.

## 🌱 Future Enhancements

Potential future improvements include:

* Automated evidence ingestion
* Support for additional log formats
* Advanced event correlation
* Real-time monitoring
* Automated incident reports
* Improved MITRE ATT&CK mapping
* Additional visualization options
* AI-assisted incident summarization
* Exportable forensic investigation reports

## 🏆 Project

**AURA – Ransomware Attack Reconstruction & Evidence-Based Incident Analysis**

Developed as a cybersecurity hackathon project with a focus on making ransomware incident analysis more understandable and accessible for organizations with limited security resources.

---

## 👩‍💻 Contributors

Add your team members here:

* **Keerthana Dhandapani**
* **Atchaya B** 
* **Maha Shree M**

---

