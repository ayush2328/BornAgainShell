// Embedded Client-Side Data & Scoring Engine for Vercel & Offline Deployment
// Security Risk Management and Principles (SRMP)

const STORAGE_KEYS = {
  VENDORS: 'tpv_sra_vendors',
  MITIGATIONS: 'tpv_sra_mitigations',
  AUDIT: 'tpv_sra_audit_logs'
};

export const INITIAL_DEMO_VENDORS = [
  {
    id: "VND-101",
    name: "CloudOps Infrastructure",
    service_type: "Cloud Provider (IaaS / PaaS)",
    description: "Primary cloud hosting provider hosting core microservices, transactional databases, and compute clusters.",
    contact_name: "Sarah Jenkins",
    contact_email: "s.jenkins@cloudops-infra.io",
    contact_phone: "+1-800-555-0199",
    website: "https://cloudops-infra.io",
    business_criticality: "High",
    data_handled: ["PII", "Proprietary IP / Source Code", "Internal Data"],
    systems_accessed: ["Production Cloud DB", "Customer Facing Portal"],
    contract_start: "2024-01-01",
    contract_end: "2027-01-01",
    owner_department: "DevOps & Cloud Engineering",
    assessment_status: "Assessed",
    last_assessment_date: "2026-09-15",
    next_assessment_date: "2026-12-15",
    inherent_likelihood: 4,
    inherent_impact: 4,
    inherent_risk_score: 16,
    inherent_risk_level: "High",
    residual_likelihood: 2,
    residual_impact: 3,
    residual_risk_score: 6,
    residual_risk_level: "Medium",
    decision: "Require Remediation",
    identified_gaps: [
      "MFA not enforced for all privileged tenant root/admin accounts",
      "Incident response drill evidence not provided within SLA (72h)"
    ]
  },
  {
    id: "VND-102",
    name: "PaySwift Gateway",
    service_type: "Payment Gateway",
    description: "Tier-1 PCI-DSS compliant credit card tokenization, recurrent billing, and localized payment gateway.",
    contact_name: "Marcus Vance",
    contact_email: "compliance@payswift-pay.com",
    contact_phone: "+1-888-PAY-FAST",
    website: "https://payswift-pay.com",
    business_criticality: "Critical",
    data_handled: ["Financial / Payment Data", "Cardholder Data (PCI)"],
    systems_accessed: ["Billing Engine", "Core API Webhook"],
    contract_start: "2023-06-15",
    contract_end: "2026-06-15",
    owner_department: "Finance & FinOps",
    assessment_status: "Assessed",
    last_assessment_date: "2026-09-10",
    next_assessment_date: "2026-12-10",
    inherent_likelihood: 1,
    inherent_impact: 4,
    inherent_risk_score: 4,
    inherent_risk_level: "Low",
    residual_likelihood: 1,
    residual_impact: 3,
    residual_risk_score: 3,
    residual_risk_level: "Low",
    decision: "Approve",
    identified_gaps: []
  },
  {
    id: "VND-103",
    name: "TalentPulse HRMS",
    service_type: "HRMS / SaaS Software",
    description: "Enterprise cloud-based human resource management, employee performance, salary disbursement, and benefits portal.",
    contact_name: "Elena Rostova",
    contact_email: "security@talentpulse-cloud.com",
    contact_phone: "+1-415-555-8821",
    website: "https://talentpulse-cloud.com",
    business_criticality: "High",
    data_handled: ["PII", "Employee Bank Records", "Healthcare / PHI"],
    systems_accessed: ["SSO / Identity Provider", "Corporate VPN"],
    contract_start: "2024-03-01",
    contract_end: "2025-03-01",
    owner_department: "People & HR",
    assessment_status: "In Review",
    last_assessment_date: "2026-09-20",
    next_assessment_date: "2026-12-20",
    inherent_likelihood: 4,
    inherent_impact: 3,
    inherent_risk_score: 12,
    inherent_risk_level: "High",
    residual_likelihood: 2,
    residual_impact: 3,
    residual_risk_score: 6,
    residual_risk_level: "Medium",
    decision: "Require Remediation",
    identified_gaps: [
      "Missing independent SOC 2 Type II attestation (only SOC 1 Type I submitted)",
      "Lack of offsite immutable disaster recovery backup drills"
    ]
  },
  {
    id: "VND-104",
    name: "ByteShield IT Support",
    service_type: "Managed IT Services / MSP",
    description: "Third-party outsourced IT desktop helpdesk, server patch management, and remote active directory engineering.",
    contact_name: "Derek Cole",
    contact_email: "operations@byteshield-msp.net",
    contact_phone: "+1-650-555-0912",
    website: "https://byteshield-msp.net",
    business_criticality: "Critical",
    data_handled: ["Corporate IP", "Internal Admin Credentials"],
    systems_accessed: ["Corporate VPN", "Internal Network", "Production Cloud DB"],
    contract_start: "2023-09-01",
    contract_end: "2025-09-01",
    owner_department: "Internal IT Ops",
    assessment_status: "Overdue",
    last_assessment_date: "2024-08-10",
    next_assessment_date: "2026-10-01",
    inherent_likelihood: 5,
    inherent_impact: 4,
    inherent_risk_score: 20,
    inherent_risk_level: "Critical",
    residual_likelihood: 4,
    residual_impact: 4,
    residual_risk_score: 16,
    residual_risk_level: "High",
    decision: "Reject/Escalate",
    identified_gaps: [
      "Shared root accounts used across technicians without named individual logging",
      "Jump host does not enforce FIDO2 or hardware MFA",
      "No contractual supply chain review for tier-4 contractors"
    ]
  },
  {
    id: "VND-105",
    name: "SwiftDeliver Logistics",
    service_type: "Logistics & Supply Chain API",
    description: "Global freight tracking and automated shipment label generation API integrated into checkout fulfillment.",
    contact_name: "Ayesha Patel",
    contact_email: "api-support@swiftdeliver.org",
    contact_phone: "+44-20-7946-0922",
    website: "https://swiftdeliver.org",
    business_criticality: "Low",
    data_handled: ["Shipping Address (Low PII)"],
    systems_accessed: ["Webhook / API"],
    contract_start: "2024-05-10",
    contract_end: "2026-05-10",
    owner_department: "Supply Chain & Ops",
    assessment_status: "Assessed",
    last_assessment_date: "2026-09-18",
    next_assessment_date: "2026-12-18",
    inherent_likelihood: 3,
    inherent_impact: 2,
    inherent_risk_score: 6,
    inherent_risk_level: "Medium",
    residual_likelihood: 2,
    residual_impact: 2,
    residual_risk_score: 4,
    residual_risk_level: "Low",
    decision: "Approve with Conditions",
    identified_gaps: ["API rate-limiting threshold documentation not provided"]
  },
  {
    id: "VND-106",
    name: "Apex AI Analytics",
    service_type: "AI & Machine Learning SaaS",
    description: "External Large Language Model API provider for automated customer support sentiment classification.",
    contact_name: "Dr. Aris Thorne",
    contact_email: "security@apex-ai-labs.com",
    contact_phone: "+1-415-555-7731",
    website: "https://apex-ai-labs.com",
    business_criticality: "Medium",
    data_handled: ["Customer Support Transcripts", "Internal Analytics"],
    systems_accessed: ["Webhook / API"],
    contract_start: "2024-07-01",
    contract_end: "2025-07-01",
    owner_department: "Customer Experience",
    assessment_status: "Assessed",
    last_assessment_date: "2026-09-22",
    next_assessment_date: "2026-12-22",
    inherent_likelihood: 3,
    inherent_impact: 3,
    inherent_risk_score: 9,
    inherent_risk_level: "Medium",
    residual_likelihood: 2,
    residual_impact: 2,
    residual_risk_score: 4,
    residual_risk_level: "Low",
    decision: "Approve with Conditions",
    identified_gaps: ["Data retention policy does not explicitly guarantee zero training on customer prompts"]
  }
];

export const INITIAL_DEMO_MITIGATIONS = [
  {
    id: "ACT-201",
    vendor_id: "VND-101",
    vendor_name: "CloudOps Infrastructure",
    title: "Mandate FIDO2/Hardware MFA for Cloud Root Accounts",
    description: "Configure conditional access policies to strictly deny access to tenant management portals without phishing-resistant MFA tokens.",
    control_type: "Preventive",
    associated_gap: "MFA not enforced for all privileged tenant root/admin accounts",
    owner: "Cloud Architecture Lead",
    target_date: "2026-11-15",
    status: "Verified",
    evidence: "SSO policy screenshot and tenant audit logs verified by Security Assessor.",
    created_at: new Date().toISOString()
  },
  {
    id: "ACT-202",
    vendor_id: "VND-101",
    vendor_name: "CloudOps Infrastructure",
    title: "Establish 72-Hour Breach Notification SLA in Master Agreement",
    description: "Draft and sign an updated Vendor Security Agreement (VSA) amendment with mandatory notification triggers.",
    control_type: "Directive",
    associated_gap: "Incident response drill evidence not provided within SLA (72h)",
    owner: "Legal & Vendor Management",
    target_date: "2026-12-01",
    status: "In Progress",
    evidence: "Amendment sent to CloudOps Legal team on 2026-10-01.",
    created_at: new Date().toISOString()
  },
  {
    id: "ACT-203",
    vendor_id: "VND-103",
    vendor_name: "TalentPulse HRMS",
    title: "Require SOC 2 Type II Attestation within 90 Days",
    description: "Formally request an independent AICPA SOC 2 Type II audit report covering Security and Confidentiality Trust Services Criteria.",
    control_type: "Detective",
    associated_gap: "Missing independent SOC 2 Type II attestation",
    owner: "Compliance Lead",
    target_date: "2026-12-15",
    status: "Open",
    evidence: "Formal letter dispatched with compliance requirements.",
    created_at: new Date().toISOString()
  },
  {
    id: "ACT-204",
    vendor_id: "VND-104",
    vendor_name: "ByteShield IT Support",
    title: "Decommission Shared Administrative Credentials & Enforce PAM",
    description: "Transition all technician remote sessions through an enterprise Privileged Access Management (PAM) vault with ephemeral credential rotation.",
    control_type: "Preventive",
    associated_gap: "Shared root accounts used across technicians without named individual logging",
    owner: "Chief Information Security Officer (CISO)",
    target_date: "2026-11-10",
    status: "Open",
    evidence: "Escalated to Executive Steering Committee due to Critical Risk score (20/25).",
    created_at: new Date().toISOString()
  },
  {
    id: "ACT-205",
    vendor_id: "VND-106",
    vendor_name: "Apex AI Analytics",
    title: "Execute Zero Data Retention & No-Training Addendum",
    description: "Execute Enterprise AI Data Protection Addendum guaranteeing customer payloads are discarded immediately post-inference.",
    control_type: "Directive",
    associated_gap: "Data retention policy does not explicitly guarantee zero training on customer prompts",
    owner: "AI Governance Lead",
    target_date: "2026-10-10",
    status: "Verified",
    evidence: "Counter-signed Enterprise Zero Retention Addendum (Doc ID #AI-DPA-991).",
    created_at: new Date().toISOString()
  }
];

export const INITIAL_DEMO_AUDIT_LOGS = [
  {
    id: "LOG-001",
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    user: "Risk Assessor (Ayush)",
    action: "Vendor Risk Assessment Completed",
    entity_type: "Vendor",
    entity_id: "VND-101",
    details: "Calculated Inherent Risk Score: 16 (High: L=4, I=4) for CloudOps Infrastructure."
  },
  {
    id: "LOG-002",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    user: "Security Lead (Priya)",
    action: "Mitigation Control Verified",
    entity_type: "Mitigation",
    entity_id: "ACT-201",
    details: "Verified Hardware MFA policy for CloudOps. Reduced Residual Risk to 6 (Medium: L=2, I=3)."
  },
  {
    id: "LOG-003",
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    user: "CISO (Chief Officer)",
    action: "Risk Treatment Escalation",
    entity_type: "Vendor",
    entity_id: "VND-104",
    details: "Escalated ByteShield IT Support due to Critical Inherent Risk 20/25 (Shared root credentials)."
  },
  {
    id: "LOG-004",
    timestamp: new Date().toISOString(),
    user: "Compliance Officer",
    action: "SRMP NIST CSF 2.0 Audit Log Review",
    entity_type: "System",
    entity_id: "AUDIT-SYNC",
    details: "Automated inventory audit synchronized with NIST SP 800-161 Rev. 1 supply-chain criteria."
  }
];

export function getRiskLevel(score) {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium";
  if (score <= 16) return "High";
  return "Critical";
}

export function determineDecision(level) {
  if (level === "Low") return "Approve";
  if (level === "Medium") return "Approve with Conditions";
  if (level === "High") return "Require Remediation";
  return "Reject/Escalate";
}

export function calculateResidualRisk(inherentL, inherentI, verifiedCount) {
  const reduction = Math.floor(verifiedCount / 2) + (verifiedCount >= 1 ? 1 : 0);
  const resL = Math.max(1, inherentL - reduction);
  const impactReduction = verifiedCount >= 3 ? 1 : 0;
  const resI = Math.max(1, inherentI - impactReduction);
  const resScore = resL * resI;
  const resLevel = getRiskLevel(resScore);
  return { resL, resI, resScore, resLevel };
}

export function computeDashboardMetrics(vendors, mitigations) {
  const total = vendors.length;
  if (total === 0) return null;

  const inDist = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const resDist = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const critDist = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const statusDist = { Assessed: 0, "In Review": 0, Pending: 0, Overdue: 0 };

  let inSum = 0;
  let resSum = 0;

  // 5x5 grid (row 5 down to 1, col 1 up to 5)
  const matrixCells = [];
  for (let l = 5; l >= 1; l--) {
    const row = [];
    for (let i = 1; i <= 5; i++) {
      const score = l * i;
      row.push({
        likelihood: l,
        impact: i,
        score,
        risk_level: getRiskLevel(score),
        inherent_count: 0,
        inherent_vendors: [],
        residual_count: 0,
        residual_vendors: []
      });
    }
    matrixCells.push(row);
  }

  vendors.forEach(v => {
    inDist[v.inherent_risk_level] = (inDist[v.inherent_risk_level] || 0) + 1;
    resDist[v.residual_risk_level] = (resDist[v.residual_risk_level] || 0) + 1;
    critDist[v.business_criticality] = (critDist[v.business_criticality] || 0) + 1;
    statusDist[v.assessment_status] = (statusDist[v.assessment_status] || 0) + 1;

    inSum += v.inherent_risk_score;
    resSum += v.residual_risk_score;

    const lIn = Math.min(5, Math.max(1, v.inherent_likelihood));
    const iIn = Math.min(5, Math.max(1, v.inherent_impact));
    const rIdxIn = 5 - lIn;
    const cIdxIn = iIn - 1;
    if (rIdxIn >= 0 && rIdxIn < 5 && cIdxIn >= 0 && cIdxIn < 5) {
      matrixCells[rIdxIn][cIdxIn].inherent_count++;
      matrixCells[rIdxIn][cIdxIn].inherent_vendors.push({
        id: v.id,
        name: v.name,
        criticality: v.business_criticality,
        score: v.inherent_risk_score,
        level: v.inherent_risk_level
      });
    }

    const lRes = Math.min(5, Math.max(1, v.residual_likelihood));
    const iRes = Math.min(5, Math.max(1, v.residual_impact));
    const rIdxRes = 5 - lRes;
    const cIdxRes = iRes - 1;
    if (rIdxRes >= 0 && rIdxRes < 5 && cIdxRes >= 0 && cIdxRes < 5) {
      matrixCells[rIdxRes][cIdxRes].residual_count++;
      matrixCells[rIdxRes][cIdxRes].residual_vendors.push({
        id: v.id,
        name: v.name,
        criticality: v.business_criticality,
        score: v.residual_risk_score,
        level: v.residual_risk_level
      });
    }
  });

  const mitStatus = { Open: 0, "In Progress": 0, Implemented: 0, Verified: 0 };
  mitigations.forEach(m => {
    mitStatus[m.status] = (mitStatus[m.status] || 0) + 1;
  });

  const avgInherent = Number((inSum / total).toFixed(1));
  const avgResidual = Number((resSum / total).toFixed(1));
  const riskReduction = inSum > 0 ? Number((((inSum - resSum) / inSum) * 100).toFixed(1)) : 0;

  return {
    total_vendors: total,
    inherent_risk_distribution: inDist,
    residual_risk_distribution: resDist,
    criticality_distribution: critDist,
    assessment_status_distribution: statusDist,
    average_inherent_score: avgInherent,
    average_residual_score: avgResidual,
    risk_reduction_percentage: riskReduction,
    matrix_grid: matrixCells,
    mitigations_summary: {
      total: mitigations.length,
      by_status: mitStatus,
      completion_rate: mitigations.length > 0 
        ? Number((((mitStatus.Verified + mitStatus.Implemented) / mitigations.length) * 100).toFixed(1)) 
        : 0
    },
    critical_vendors: vendors.filter(v => ["Critical", "High"].includes(v.inherent_risk_level))
  };
}

// Local storage management helpers
export function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save failed:', e);
  }
}
