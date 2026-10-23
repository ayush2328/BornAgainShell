from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/srmp", tags=["SRMP Academic Framework"])

@router.get("/mapping")
def get_srmp_academic_mapping():
    return {
        "subject": "Security Risk Management and Principles (SRMP)",
        "project_title": "Third-Party Vendor Cybersecurity Risk Analyzer (TPV-SRA)",
        "frameworks_referenced": [
            "NIST Cybersecurity Framework (CSF) 2.0 - Supplier Risk (GV.SC)",
            "NIST SP 800-161 Rev. 1 - Cybersecurity Supply Chain Risk Management (C-SCRM)",
            "ISO/IEC 27001:2022 Annex A 5.19 - 5.22 (Supplier Relationships)",
            "ISO 31000:2018 - Risk Management Guidelines"
        ],
        "core_concepts": [
            {
                "concept": "Asset Identification",
                "definition": "Locating, cataloging, and classifying organizational hardware, software, sensitive customer data, and vital third-party integrations.",
                "project_implementation": "Vendor inventory module captures data classifications handled (PII, Financial, PHI, IP) and internal systems accessed (Production DB, SSO, API Webhooks).",
                "academic_rationale": "Without knowing what assets are exposed to external parties, impact cannot be accurately quantified."
            },
            {
                "concept": "Threat Identification",
                "definition": "Identifying potential threat events, adversary vectors, or failure scenarios that could compromise confidentiality, integrity, or availability.",
                "project_implementation": "Models realistic threat scenarios per vendor: supply chain code injection, credential stuffing on vendor jump hosts, ransomware affecting vendor backups, and cloud outages.",
                "academic_rationale": "External vendors present an extended attack surface and lateral movement vector into the primary corporate network."
            },
            {
                "concept": "Vulnerability Assessment",
                "definition": "Evaluating flaws, weaknesses, or absence of security controls within an entity's operational and technical environment.",
                "project_implementation": "Automated 10-domain cybersecurity questionnaire evaluating MFA, encryption standards, patch SLA, penetration testing, and certifications to pinpoint exact gaps.",
                "academic_rationale": "Vulnerabilities represent the operational gaps that turn theoretical threats into actual exploitable security risks."
            },
            {
                "concept": "Risk Analysis (Likelihood × Impact)",
                "definition": "Systematic process to estimate the probability of an adverse security event and the magnitude of resulting organizational consequences.",
                "project_implementation": "5×5 semi-quantitative risk scoring engine. Likelihood (1-5) derived inversely from control compliance; Impact (1-5) computed from vendor criticality and asset sensitivity.",
                "academic_rationale": "Formula: Risk Score = Likelihood × Impact (1 to 25 scale). Allows consistent risk comparison across diverse third-party relationships."
            },
            {
                "concept": "Risk Evaluation & Acceptance Criteria",
                "definition": "Comparing calculated risk scores against the organization's predefined risk appetite and tolerance thresholds.",
                "project_implementation": "Categorizes scores into 4 distinct bands: Low (1-4: Accept), Medium (5-9: Plan Improvements), High (10-16: Prioritize Mitigation), Critical (17-25: Escalate for Urgent Decision).",
                "academic_rationale": "Provides objective decision-support for vendor onboarding, conditional approvals, or contract termination."
            },
            {
                "concept": "Risk Treatment (The 4 Ts)",
                "definition": "Selecting and implementing options to modify risk: Treat/Mitigate, Tolerate/Accept, Terminate/Avoid, or Transfer/Share.",
                "project_implementation": "Mitigation tracking module assigns owners and deadlines. Supports Treat (mandate MFA/encryption), Tolerate (accept low residual score), Terminate (deprovision critical vendor), and Transfer (cyber insurance/contractual indemnification).",
                "academic_rationale": "Residual risk must only decrease when mitigation controls are verified with tangible audit evidence, never prematurely."
            },
            {
                "concept": "Security Controls (Defense-in-Depth)",
                "definition": "Safeguards designed to protect the confidentiality, integrity, and availability of information systems.",
                "project_implementation": "Classifies recommended actions into Preventive (MFA, RBAC, Encryption), Detective (SOC 2, Vulnerability Scans, Audit Logs), and Corrective (Tested Backups, IR Playbooks).",
                "academic_rationale": "Ensures holistic multi-layered defense rather than relying exclusively on contractual promises."
            },
            {
                "concept": "Continuous Monitoring & Review",
                "definition": "Ongoing verification that risk posture remains within acceptable boundaries over time as threat environments evolve.",
                "project_implementation": "Tracks assessment expirations, flags overdue reviews, and monitors open mitigation actions with active deadline countdowns.",
                "academic_rationale": "Third-party risk is dynamic; annual point-in-time assessments must be reinforced with continuous posture reviews."
            },
            {
                "concept": "Audit Trail & Documentation",
                "definition": "Maintaining verifiable, tamper-evident logs of risk evaluations, approvals, and remediation actions for governance and regulatory compliance.",
                "project_implementation": "Immutable audit trail logging every assessment change, score recalculation, and mitigation verification event with timestamps and actor identities.",
                "academic_rationale": "Essential for SOC 2 Trust Services Criteria, ISO 27001 auditor review, and post-incident forensic accountability."
            }
        ],
        "nist_csf_2_mapping": [
            {
                "category": "GV.SC-04",
                "description": "Suppliers are known and prioritized by criticality",
                "project_feature": "Tiering classification (Critical Tier 1 through Low Tier 4) and centralized inventory"
            },
            {
                "category": "GV.SC-06",
                "description": "Planning and due diligence are performed to reduce risks prior to entering supplier relationships",
                "project_feature": "Pre-onboarding security assessment questionnaire and automated risk scoring engine"
            },
            {
                "category": "GV.SC-07",
                "description": "Risks posed by suppliers are understood, recorded, prioritized, and treated",
                "project_feature": "5x5 Inherent and Residual Risk Matrix Heatmap and centralized Mitigation Register"
            },
            {
                "category": "GV.SC-08",
                "description": "Relevant suppliers are included in incident planning, response, and recovery activities",
                "project_feature": "Incident response SLA verification (72-hour notification) in assessment questionnaire"
            }
        ]
    }
