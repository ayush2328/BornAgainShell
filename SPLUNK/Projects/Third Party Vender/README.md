# Third-Party Vendor Cybersecurity Risk Analyzer (TPV-SRA)

**Subject:** Security Risk Management and Principles (SRMP)  
**Standard & Frameworks:** NIST Cybersecurity Framework (CSF) 2.0 (Govern: `GV.SC`), NIST SP 800-161 Rev. 1 (Supply Chain Risk Management), ISO/IEC 27001:2022 (A.5.19 - A.5.22)

---

## 🛡️ Project Overview

In modern enterprises, organizations rely heavily on third-party service providers (AWS, payment gateways, HRMS SaaS, MSP IT contractors, APIs). If an external vendor has weak cybersecurity controls, it exposes the hiring organization to data breaches, ransomware, compliance penalties, and service outages.

**TPV-SRA** is an end-to-end Cybersecurity Vendor Risk Management platform that:
1. Maintains a **centralized third-party vendor inventory** with asset criticality classifications.
2. Conducts standardized cybersecurity due diligence assessments aligned with **NIST CSF 2.0 & SP 800-161**.
3. Calculates **Likelihood × Impact (5×5 Risk Matrix)** to determine Inherent and Residual Risk.
4. Manages a **Risk Treatment & Mitigation Action Register** with verified audit evidence tracking.
5. Generates **Executive Reports (PDF export)**, CSV risk registers, and chronological audit logs for governance review.

---

## 🏛️ Application Architecture & Technology Stack

- **Frontend:** React 19 + Vite, Vanilla CSS with Cyber Dark Glassmorphism, Lucide Icons, Canvas Confetti, jsPDF + jspdf-autotable.
- **Backend / API:** Python 3.14 + FastAPI, Pydantic v2 schemas, RESTful API endpoints.
- **Database:** MongoDB (`vendor_risk_analyzer` database) with automatic local JSON fallback (`backend/data/store.json`).
- **Interactive Visualizations:** Interactive 5×5 Risk Matrix Heatmap with Inherent vs. Residual toggle and cell drilldown.

---

## 📦 Core Modules

### Module 1 — Centralized Vendor Inventory
- Captures vendor identity, service category, contact details, business criticality tier (Critical Tier 1 through Low Tier 4).
- Maps **Asset Identification**: Data types handled (PII, Financial/PCI, PHI, Corporate IP) and internal systems accessed (Production DB, Customer Portal, Corporate VPN, SSO).

### Module 2 — Cybersecurity Assessment Questionnaire
- 10-domain standardized questionnaire covering:
  - Access Control & MFA (Hardware / FIDO2)
  - Data Protection & Cryptography (TLS 1.3 / AES-256)
  - Incident Response Plan (<72-hour breach SLA)
  - Vulnerability & Patch Management (<14-day SLA)
  - Compliance Attestations (SOC 2 Type II, ISO 27001)
  - Business Continuity & Tested Backups (RTO/RPO)
  - Fourth-Party / Supply Chain Risk
  - Human & Physical Security

### Module 3 — 5×5 Risk Scoring Engine
- **Inherent Risk Score = Likelihood × Impact (1 to 25 scale)**
- **Impact (1–5):** Derived from business criticality tier, data sensitivity, and blast radius.
- **Likelihood (1–5):** Derived inversely from questionnaire compliance:
  - $\ge 90\%$ compliance $\rightarrow$ Likelihood 1 (Rare)
  - $75\% - 89\%$ $\rightarrow$ Likelihood 2 (Unlikely)
  - $55\% - 74\%$ $\rightarrow$ Likelihood 3 (Moderate)
  - $35\% - 54\%$ $\rightarrow$ Likelihood 4 (Likely)
  - $< 35\%$ $\rightarrow$ Likelihood 5 (Almost Certain)
- **Risk Bands:**
  - `1–4`: **Low** (Accept & Monitor)
  - `5–9`: **Medium** (Plan Improvements)
  - `10–16`: **High** (Prioritize Mitigation)
  - `17–25`: **Critical** (Urgent Escalation / Reject)

### Module 4 — Risk Treatment & Residual Risk Engine
- Implements the **4 Ts**: Treat, Tolerate, Terminate, Transfer.
- Recommends Preventive, Detective, and Corrective controls.
- **Key SRMP Principle:** Residual risk does **NOT** drop automatically just because recommendations were issued. The residual score decreases **only when a control is verified with audit evidence**.

### Module 5 — Executive Dashboard & Reporting
- Real-time KPI indicators (Inherent vs. Residual averages, Risk Reduction %).
- Interactive 5×5 Matrix Heatmap with clickable cells.
- Print-ready and downloadable **Executive Risk Audit Report (PDF)** with CISO sign-off attestation.
- Full **CSV Risk Register** export for spreadsheets.
- Immutable **Audit Trail** compliant with SOC 2 CC7 / ISO 27001 A.12.4.

---

## 👥 Pre-Loaded Demonstration Vendors

1. **CloudOps Infrastructure (AWS Cloud Provider)**:
   - Criticality: High (Tier 2) | Inherent Score: 16 (High) $\rightarrow$ Residual Score: 6 (Medium)
   - Finding: MFA not enforced for all root tenant users; IR SLA missing.
2. **PaySwift Gateway (Payment Processor)**:
   - Criticality: Critical (Tier 1) | Inherent Score: 4 (Low) $\rightarrow$ Residual Score: 3 (Low)
   - Finding: PCI-DSS Level 1 & SOC 2 Type II compliant; fully approved.
3. **TalentPulse HRMS (HR Software)**:
   - Criticality: High (Tier 2) | Inherent Score: 12 (High) $\rightarrow$ Residual Score: 6 (Medium)
   - Finding: Missing SOC 2 Type II attestation and offsite DR drills.
4. **ByteShield IT Support (Managed IT Services / MSP)**:
   - Criticality: Critical (Tier 1) | Inherent Score: 20 (Critical) $\rightarrow$ Residual Score: 16 (High)
   - Finding: Shared root credentials without individual logging; jump host missing MFA. Escalated for rejection/remediation.
5. **SwiftDeliver Logistics (Supply Chain API)**:
   - Criticality: Low (Tier 4) | Inherent Score: 6 (Medium) $\rightarrow$ Residual Score: 4 (Low)
   - Finding: Minor API rate limit documentation gap.
6. **Apex AI Analytics (GenAI API)**:
   - Criticality: Medium (Tier 3) | Inherent Score: 9 (Medium) $\rightarrow$ Residual Score: 4 (Low)
   - Finding: Zero Data Retention addendum verified.

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch Script
In the project directory, run:
```bash
./run.sh
```
This starts both the FastAPI backend on `http://127.0.0.1:8000` and the Vite frontend on `http://127.0.0.1:5173`.

### Option 2: Manual Start
1. **Backend:**
   ```bash
   source .venv/bin/activate
   cd backend
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
3. Open your browser and navigate to: **`http://127.0.0.1:5173`**

---

## 🎓 Viva & Presentation Defense Points for the Professor

1. **Why is Third-Party Vendor Risk Management so critical today?**
   * *Answer:* Organizations no longer operate within traditional network perimeters. Attackers frequently breach enterprise targets not by attacking core firewalls, but by pivoting through trusted third-party software, compromised vendor credentials, or vulnerable cloud configurations (e.g. SolarWinds, Target breach).
2. **How does our project enforce the NIST CSF 2.0 GV.SC guidelines?**
   * *Answer:* GV.SC emphasizes that third-party risk is an executive governance responsibility. We implement GV.SC-04 (identifying and tiering suppliers), GV.SC-06 (standardized pre-contract due diligence), GV.SC-07 (recording and treating risks in a risk register), and GV.SC-08 (verifying vendor incident response integration).
3. **Why does residual risk only decrease when evidence is verified?**
   * *Answer:* In risk management, issuing a recommendation represents an intention, not an operational safeguard. Prematurely reducing a risk score without verifying implementation creates dangerous audit blindness.
