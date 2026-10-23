from typing import List, Tuple, Dict, Any
from .models import AssessmentAnswer

STANDARD_QUESTIONS = [
    {
        "id": "AC-01",
        "category": "Access Control & Identity",
        "question": "Is Multi-Factor Authentication (MFA) mandatory for all vendor employees accessing organizational data or remote administration interfaces?",
        "nist_ref": "NIST CSF 2.0 PR.AA-01 / SP 800-161",
        "weight": 3,
        "control_type": "Preventive",
        "guidance": "Hardware keys, FIDO2, or Authenticator app (SMS MFA is considered partial compliance)."
    },
    {
        "id": "AC-02",
        "category": "Access Control & Identity",
        "question": "Does the vendor enforce Role-Based Access Control (RBAC) and the Principle of Least Privilege across administrative boundaries?",
        "nist_ref": "NIST CSF 2.0 PR.AA-05",
        "weight": 2,
        "control_type": "Preventive",
        "guidance": "Privileged roles must be segregated; no shared administrative accounts permitted."
    },
    {
        "id": "DP-01",
        "category": "Data Protection & Cryptography",
        "question": "Is organizational data encrypted in transit using modern cryptographic protocols (TLS 1.3/1.2) and at rest using strong standards (AES-256)?",
        "nist_ref": "NIST CSF 2.0 PR.DS-01 / PR.DS-02",
        "weight": 3,
        "control_type": "Preventive",
        "guidance": "Check encryption key rotation policies and whether customer-managed keys (CMK) are supported."
    },
    {
        "id": "DP-02",
        "category": "Data Protection & Cryptography",
        "question": "Does the vendor have documented data retention, secure sanitization, and end-of-contract data return/deletion procedures?",
        "nist_ref": "NIST CSF 2.0 PR.DS-10",
        "weight": 2,
        "control_type": "Preventive",
        "guidance": "NIST SP 800-88 sanitization certificates or verified cryptoshredding."
    },
    {
        "id": "IR-01",
        "category": "Incident Response & Breach Notification",
        "question": "Does the vendor have an active, tested Incident Response Plan with a contractual breach notification SLA of 72 hours or less?",
        "nist_ref": "NIST CSF 2.0 RS.MA-01 / GV.SC-08",
        "weight": 3,
        "control_type": "Detective",
        "guidance": "Evidence of annual tabletop exercises or documented post-incident review procedures."
    },
    {
        "id": "VM-01",
        "category": "Vulnerability & Patch Management",
        "question": "Does the vendor conduct recurring automated vulnerability scanning and remediate critical/high CVEs within 14 days?",
        "nist_ref": "NIST CSF 2.0 PR.IR-01 / DE.CM-08",
        "weight": 3,
        "control_type": "Detective",
        "guidance": "Quarterly third-party penetration testing summary reports (CREST, OSCP, or equivalent)."
    },
    {
        "id": "CO-01",
        "category": "Compliance & Security Certifications",
        "question": "Does the vendor possess valid, unexpired third-party security attestations (e.g., SOC 2 Type II, ISO/IEC 27001:2022, PCI-DSS)?",
        "nist_ref": "NIST CSF 2.0 GV.SC-06",
        "weight": 2,
        "control_type": "Detective",
        "guidance": "Review auditor's opinion letter and Section 3/4 testing exceptions in SOC 2 report."
    },
    {
        "id": "BC-01",
        "category": "Business Continuity & Resilience",
        "question": "Are automated, encrypted, and immutable/offline backups maintained, with tested Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?",
        "nist_ref": "NIST CSF 2.0 RC.RP-01",
        "weight": 2,
        "control_type": "Corrective",
        "guidance": "Verify DR exercise test report within the last 12 months."
    },
    {
        "id": "SC-01",
        "category": "Supply Chain & Fourth-Party Risk",
        "question": "Does the vendor maintain a formal supply-chain risk management program evaluating their own critical subcontractors and hosting providers?",
        "nist_ref": "NIST CSF 2.0 GV.SC-04 / GV.SC-07",
        "weight": 2,
        "control_type": "Directive",
        "guidance": "Software Bill of Materials (SBOM) or formal fourth-party security due diligence register."
    },
    {
        "id": "HS-01",
        "category": "Human & Physical Security",
        "question": "Are pre-employment background screenings conducted for personnel with administrative access, accompanied by mandatory security awareness training?",
        "nist_ref": "NIST CSF 2.0 PR.AT-01",
        "weight": 1,
        "control_type": "Preventive",
        "guidance": "Annual phishing simulations and role-specific secure development or admin training."
    }
]

def calculate_impact(criticality: str, data_handled: List[str], systems_accessed: List[str]) -> int:
    """Calculate Impact score (1 to 5) based on asset criticality, data sensitivity, and blast radius."""
    base_impact_map = {
        "Critical": 4,
        "High": 3,
        "Medium": 2,
        "Low": 1
    }
    impact = base_impact_map.get(criticality, 2)
    
    # Check data sensitivity
    sensitive_data = {"PII", "Financial / Payment Data", "Cardholder Data (PCI)", "Healthcare / PHI", "Proprietary IP / Source Code"}
    if any(d in sensitive_data for d in data_handled):
        impact += 1
        
    # Check systems blast radius
    core_systems = {"Production Cloud DB", "Customer Facing Portal", "Corporate VPN", "SSO / Identity Provider", "Billing Engine"}
    if any(s in core_systems for s in systems_accessed):
        impact += 1

    return min(5, max(1, impact))

def calculate_likelihood(answers: List[AssessmentAnswer]) -> Tuple[int, List[str], List[str]]:
    """
    Calculate Likelihood score (1 to 5) based on security posture gaps.
    Returns: (likelihood_score, identified_gaps, recommended_controls)
    """
    if not answers:
        return 3, ["No security questionnaire answers submitted yet."], ["Conduct baseline NIST CSF 2.0 vendor assessment."]

    total_weight = 0
    earned_weight = 0
    gaps = []
    recommendations = []

    for a in answers:
        w = a.weight if hasattr(a, "weight") and a.weight else 2
        total_weight += w
        resp = a.response.lower().strip()
        
        if resp == "yes":
            earned_weight += w
        elif resp == "partial":
            earned_weight += (w * 0.5)
            gaps.append(f"Partial implementation in {a.category}: {a.question}")
            recommendations.append(f"Upgrade {a.category} control to full compliance ({a.nist_ref})")
        elif resp == "no":
            gaps.append(f"Missing control in {a.category}: {a.question}")
            recommendations.append(f"Mandate implementation of {a.category} control ({a.nist_ref}) prior to full production access")
        elif resp == "na":
            total_weight -= w  # Exclude from scoring if not applicable

    if total_weight == 0:
        return 1, gaps, recommendations

    compliance_ratio = earned_weight / total_weight

    # Inverse mapping: Lower compliance = Higher likelihood of security incident
    if compliance_ratio >= 0.90:
        likelihood = 1  # Rare / Very Low
    elif compliance_ratio >= 0.75:
        likelihood = 2  # Unlikely / Low
    elif compliance_ratio >= 0.55:
        likelihood = 3  # Moderate / Possible
    elif compliance_ratio >= 0.35:
        likelihood = 4  # Likely / High
    else:
        likelihood = 5  # Almost Certain / Critical

    return likelihood, gaps, recommendations

def get_risk_level(score: int) -> str:
    """Project risk bands: 1-4 Low, 5-9 Medium, 10-16 High, 17-25 Critical."""
    if score <= 4:
        return "Low"
    elif score <= 9:
        return "Medium"
    elif score <= 16:
        return "High"
    else:
        return "Critical"

def determine_decision(risk_level: str) -> str:
    if risk_level == "Low":
        return "Approve"
    elif risk_level == "Medium":
        return "Approve with Conditions"
    elif risk_level == "High":
        return "Require Remediation"
    else:
        return "Reject/Escalate"

def calculate_residual_risk(
    inherent_likelihood: int, 
    inherent_impact: int, 
    verified_mitigations_count: int, 
    in_progress_count: int
) -> Tuple[int, int, int, str]:
    """
    Residual risk decreases only when controls are verified with evidence.
    Returns: (residual_likelihood, residual_impact, residual_score, residual_level)
    """
    # Likelihood reduction: Every 2 verified controls reduces likelihood by 1 (min 1)
    likelihood_reduction = (verified_mitigations_count // 2) + (1 if verified_mitigations_count >= 1 else 0)
    # In-progress actions do not reduce risk until verified with audit evidence!
    
    residual_likelihood = max(1, inherent_likelihood - likelihood_reduction)
    
    # Impact is largely fixed by business criticality, but can decrease slightly (max by 1)
    # if compensating controls such as cyber insurance, strict contract liability, or air-gapping exist
    impact_reduction = 1 if verified_mitigations_count >= 3 else 0
    residual_impact = max(1, inherent_impact - impact_reduction)
    
    residual_score = residual_likelihood * residual_impact
    residual_level = get_risk_level(residual_score)
    
    return residual_likelihood, residual_impact, residual_score, residual_level
