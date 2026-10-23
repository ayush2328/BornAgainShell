import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  FileCheck, 
  TrendingDown, 
  AlertTriangle,
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function SrmpAcademicModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('concepts'); // 'concepts' | 'nist' | 'viva'

  if (!isOpen) return null;

  const concepts = [
    {
      title: "1. Asset Identification & Classification",
      srmp: "Identify critical assets, data sensitivity, and vendor dependencies.",
      project: "Vendor Registration captures exact data classifications handled (PII, Financial/PCI, PHI, Corporate IP) and production systems connected (Production DB, Customer Portal, Corporate VPN, SSO).",
      why: "Inherent impact cannot be measured without knowing the blast radius and asset value exposed to the external party."
    },
    {
      title: "2. Threat Identification & Attack Vectors",
      srmp: "Identify potential adverse events (e.g., data breach, credential compromise, supply chain pivot, ransomware, cloud outage).",
      project: "Models realistic third-party threat scenarios: compromised vendor jump hosts (ByteShield), tenant root account takeovers (CloudOps), and third-party subcontractor breaches.",
      why: "Suppliers represent an indirect attack vector bypassing perimeter firewalls via authorized credentials."
    },
    {
      title: "3. Vulnerability Assessment",
      srmp: "Find security flaws and operational control gaps through structured questionnaires and evidence reviews.",
      project: "Standardized 10-domain questionnaire evaluates MFA, encryption at rest/transit, patch SLAs (<14 days), incident response drills, and SOC 2 / ISO 27001 certifications.",
      why: "Vulnerabilities represent the weakness turning a theoretical threat into an exploitable risk."
    },
    {
      title: "4. Risk Analysis (Likelihood × Impact)",
      srmp: "Calculate risk magnitude using a standardized semi-quantitative formula.",
      project: "Formula: Risk Score = Likelihood (1–5) × Impact (1–5), generating an inherent score from 1 to 25. Likelihood is calculated inversely from questionnaire compliance; Impact is computed from asset criticality.",
      why: "Provides mathematical objectivity rather than emotional guesswork for vendor onboarding."
    },
    {
      title: "5. Risk Evaluation & Acceptance Criteria",
      srmp: "Compare calculated scores against organizational risk appetite and tolerance thresholds.",
      project: "Classified into 4 distinct project risk bands:\n• 1–4: Low (Accept & Monitor)\n• 5–9: Medium (Plan Improvements)\n• 10–16: High (Prioritize Mitigation)\n• 17–25: Critical (Urgent Escalation / Reject)",
      why: "Establishes clear governance thresholds for executive decision-makers."
    },
    {
      title: "6. Risk Treatment (The 4 Ts)",
      srmp: "Select treatment strategies: Treat (Mitigate), Tolerate (Accept), Terminate (Avoid), or Transfer (Share).",
      project: "Mitigation Register links actions to owners and deadlines. Supports Treat (mandate MFA/encryption), Tolerate (acceptable residual score), Terminate (decommission high-risk vendor), and Transfer (cyber insurance/indemnity).",
      why: "Residual risk decreases only when controls are verified with tangible audit evidence, never prematurely."
    },
    {
      title: "7. Security Controls (Defense-in-Depth)",
      srmp: "Implement preventive, detective, and corrective controls.",
      project: "Categorizes mitigation actions into: Preventive (MFA, RBAC, KMS Encryption), Detective (SOC 2 Type II, Vulnerability Scans), and Corrective (Tested DR Backups, IR Playbooks).",
      why: "Ensures balanced multi-layered security rather than reliance solely on contract clauses."
    },
    {
      title: "8. Continuous Monitoring & Review",
      srmp: "Periodic reassessment and ongoing verification of vendor risk posture over time.",
      project: "Automated tracking of assessment expiry dates, overdue review flags, and mitigation action deadline countdowns.",
      why: "Vendor risk is dynamic; point-in-time assessments decay as third-party software changes."
    },
    {
      title: "9. Audit Trail & Documentation",
      srmp: "Maintain verifiable records of risk evaluations, approvals, and evidence for regulatory compliance.",
      project: "Immutable chronological audit log capturing every assessment change, score recalculation, and mitigation verification event with timestamps and actor identities.",
      why: "Essential for SOC 2 Trust Services Criteria, ISO 27001 auditor review, and accountability."
    }
  ];

  const nistItems = [
    {
      code: "GV.SC-04",
      title: "Suppliers Known & Prioritized",
      detail: "Suppliers and third-party partners are identified, prioritized, and categorized by their criticality to organizational mission."
    },
    {
      code: "GV.SC-06",
      title: "Pre-contract Due Diligence",
      detail: "Planning and due diligence are performed to reduce supply-chain risks prior to entering supplier relationships."
    },
    {
      code: "GV.SC-07",
      title: "Supplier Risk Treatment",
      detail: "Risks posed by suppliers are understood, recorded, prioritized, monitored, and treated according to organizational risk appetite."
    },
    {
      code: "GV.SC-08",
      title: "Incident Planning & Integration",
      detail: "Relevant suppliers are integrated into incident response planning, testing, and contractual breach notification SLAs (<72 hours)."
    }
  ];

  const vivaQuestions = [
    {
      q: "Professor: Why does Residual Risk NOT reduce automatically when recommendations are generated?",
      a: "Because issuance of a recommendation is only a proposal. Under SRMP principles, risk only decreases when compensating security controls are implemented and verified with tangible audit evidence (e.g. verified policy screenshot, SOC 2 auditor testing exception clearance). Prematurely reducing risk creates a false sense of security."
    },
    {
      q: "Professor: How is Likelihood calculated from the questionnaire?",
      a: "Each questionnaire item has a weighted importance (1 to 3). Compliant answers earn full weight, partial answers earn 50%, and non-compliant answers earn 0. The earned-to-total compliance ratio maps inversely to Likelihood: 90%+ compliance = Likelihood 1 (Rare), 75%-89% = 2 (Unlikely), 55%-74% = 3 (Moderate), 35%-54% = 4 (Likely), <35% = 5 (Almost Certain)."
    },
    {
      q: "Professor: What makes Third-Party Risk different from Internal Risk?",
      a: "Organizations cannot directly install endpoint agents or control external vendor internal systems. Therefore, third-party risk management relies on contractual SLAs, verified third-party attestations (SOC 2, ISO 27001), continuous questionnaire due diligence, and strict least-privilege boundary enforcement."
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '88vh', padding: '28px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={24} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                SRMP Subject Curriculum & Academic Framework
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Security Risk Management and Principles • NIST CSF 2.0 GV.SC & NIST SP 800-161 Rev. 1 Alignment
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('concepts')}
            style={{
              background: activeTab === 'concepts' ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'concepts' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Core SRMP Concepts (9 Pillars)
          </button>

          <button
            onClick={() => setActiveTab('nist')}
            style={{
              background: activeTab === 'nist' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'nist' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            NIST CSF 2.0 GV.SC Mapping
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            style={{
              background: activeTab === 'viva' ? 'var(--risk-low)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'viva' ? '#000000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🎓 Professor Defense & Viva Q&A
          </button>
        </div>

        {/* Tab Content 1: 9 Core Concepts */}
        {activeTab === 'concepts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {concepts.map((c, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '16px', 
                  borderRadius: '10px', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--border-subtle)' 
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                  {c.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  <strong>Concept:</strong> {c.srmp}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', background: 'rgba(0, 0, 0, 0.25)', padding: '8px', borderRadius: '6px' }}>
                  💻 <strong>Project Implementation:</strong> {c.project}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontStyle: 'italic' }}>
                  🎯 <strong>Academic Rationale:</strong> {c.why}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 2: NIST Mapping */}
        {activeTab === 'nist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                NIST Cybersecurity Framework 2.0 introduced the <strong>Govern (GV)</strong> function, placing special emphasis on <strong>Cybersecurity Supply Chain Risk Management (GV.SC)</strong>. Our project directly implements these guidelines.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
              {nistItems.map((n) => (
                <div key={n.code} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-purple)' }}>
                      {n.code}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {n.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {n.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Viva Q&A */}
        {activeTab === 'viva' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                💡 Key talking points prepared for your demonstration and evaluation:
              </p>
            </div>

            {vivaQuestions.map((v, idx) => (
              <div key={idx} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--risk-medium)', marginBottom: '8px' }}>
                  {v.q}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5, background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid var(--risk-low)' }}>
                  {v.a}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
