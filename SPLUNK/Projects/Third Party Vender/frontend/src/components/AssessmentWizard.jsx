import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  AlertCircle, 
  FileCheck2, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  Check, 
  X, 
  Minus,
  Sparkles,
  Layers,
  Lock,
  Server,
  FileText,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function AssessmentWizard({ 
  vendors = [], 
  selectedVendorId = null, 
  onSubmitAssessment,
  onNavigateTab 
}) {
  const [questions, setQuestions] = useState([]);
  const [targetVendorId, setTargetVendorId] = useState(selectedVendorId || (vendors[0]?.id || ''));
  const [assessorName, setAssessorName] = useState('Ayush (Lead Risk Assessor)');
  const [assessorNotes, setAssessorNotes] = useState('');
  const [answers, setAnswers] = useState({});
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch standard questions from API
  useEffect(() => {
    fetch('/api/assessments/questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        // Initialize default responses
        const initAnswers = {};
        data.forEach(q => {
          initAnswers[q.id] = {
            question_id: q.id,
            category: q.category,
            question: q.question,
            nist_ref: q.nist_ref,
            weight: q.weight || 2,
            response: 'yes',
            evidence: '',
            gap_notes: ''
          };
        });
        setAnswers(initAnswers);
      })
      .catch(err => console.error("Failed to load questions:", err));
  }, []);

  // Update target vendor if prop changes
  useEffect(() => {
    if (selectedVendorId) {
      setTargetVendorId(selectedVendorId);
    }
  }, [selectedVendorId]);

  const targetVendor = vendors.find(v => v.id === targetVendorId) || vendors[0];

  const handleResponseChange = (questionId, responseValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        response: responseValue
      }
    }));
  };

  const handleEvidenceChange = (questionId, evidenceText) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        evidence: evidenceText
      }
    }));
  };

  // Real-time calculation of Likelihood and Impact
  const calculateLiveScore = () => {
    if (!targetVendor || questions.length === 0) {
      return { likelihood: 3, impact: 3, score: 9, level: 'Medium', decision: 'Approve with Conditions', gaps: [] };
    }

    // Impact
    const baseImpactMap = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    let impact = baseImpactMap[targetVendor.business_criticality] || 2;
    if (targetVendor.data_handled?.some(d => ['PII', 'Financial / Payment Data', 'Cardholder Data (PCI)', 'Healthcare / PHI'].includes(d))) {
      impact += 1;
    }
    if (targetVendor.systems_accessed?.some(s => ['Production Cloud DB', 'Customer Facing Portal', 'Corporate VPN', 'SSO / Identity Provider'].includes(s))) {
      impact += 1;
    }
    impact = Math.min(5, Math.max(1, impact));

    // Likelihood from answers
    let totalWeight = 0;
    let earnedWeight = 0;
    const gaps = [];

    Object.values(answers).forEach(a => {
      const w = a.weight || 2;
      totalWeight += w;
      if (a.response === 'yes') {
        earnedWeight += w;
      } else if (a.response === 'partial') {
        earnedWeight += (w * 0.5);
        gaps.push(`${a.category}: ${a.question}`);
      } else if (a.response === 'no') {
        gaps.push(`${a.category}: ${a.question}`);
      } else if (a.response === 'na') {
        totalWeight -= w;
      }
    });

    const ratio = totalWeight > 0 ? (earnedWeight / totalWeight) : 1;
    let likelihood = 3;
    if (ratio >= 0.90) likelihood = 1;
    else if (ratio >= 0.75) likelihood = 2;
    else if (ratio >= 0.55) likelihood = 3;
    else if (ratio >= 0.35) likelihood = 4;
    else likelihood = 5;

    const score = likelihood * impact;
    let level = 'Medium';
    if (score <= 4) level = 'Low';
    else if (score <= 9) level = 'Medium';
    else if (score <= 16) level = 'High';
    else level = 'Critical';

    let decision = 'Approve with Conditions';
    if (level === 'Low') decision = 'Approve';
    else if (level === 'High') decision = 'Require Remediation';
    else if (level === 'Critical') decision = 'Reject/Escalate';

    return { likelihood, impact, score, level, decision, gaps };
  };

  const live = calculateLiveScore();

  // --- PRESET SCENARIOS ---
  const loadPreset = (presetType) => {
    let newAnswers = { ...answers };
    let matchingVendorId = targetVendorId;
    let newAssessorNotes = assessorNotes;

    if (presetType === 'byteshield_critical') {
      matchingVendorId = vendors.find(v => v.name.includes('ByteShield'))?.id || targetVendorId;
      newAssessorNotes = 'CRITICAL ESCALATION: Audit reveals shared admin accounts on jump hosts and missing MFA across outsourced technicians.';
      const presetResponses = {
        'AC-01': { response: 'no', evidence: 'Jump host allows password-only logins; MFA missing for technicians.' },
        'AC-02': { response: 'no', evidence: 'Shared generic administrator credentials used without named user logs.' },
        'DP-01': { response: 'partial', evidence: 'TLS used in transit, but session logs stored in plain text.' },
        'DP-02': { response: 'no', evidence: 'No data sanitization certificate or NIST SP 800-88 compliance.' },
        'IR-01': { response: 'no', evidence: 'Vendor contract contains no 72-hour breach notification SLA.' },
        'VM-01': { response: 'no', evidence: 'No periodic vulnerability scans; critical unpatched CVEs found.' },
        'CO-01': { response: 'no', evidence: 'Vendor holds no independent security certifications (no SOC 2 / ISO).' },
        'BC-01': { response: 'partial', evidence: 'Backups taken to local NAS, but not air-gapped or immutable.' },
        'SC-01': { response: 'no', evidence: 'Unvetted fourth-party subcontractors utilized without notification.' },
        'HS-01': { response: 'partial', evidence: 'Basic ID checks only; no security training or criminal screenings.' }
      };
      Object.keys(presetResponses).forEach(qid => {
        if (newAnswers[qid]) {
          newAnswers[qid] = { ...newAnswers[qid], ...presetResponses[qid] };
        }
      });
      setNotification('🚨 Loaded Preset: ByteShield MSP (Critical Risk 20/25 - Reject/Escalate)');
    } else if (presetType === 'cloudops_high') {
      matchingVendorId = vendors.find(v => v.name.includes('CloudOps'))?.id || targetVendorId;
      newAssessorNotes = 'HIGH RISK: MFA not enforced for all root cloud accounts and incident response exercise evidence missing.';
      const presetResponses = {
        'AC-01': { response: 'no', evidence: 'Root tenant administration accounts lack hardware/FIDO2 MFA.' },
        'AC-02': { response: 'yes', evidence: 'Named accounts and RBAC matrix verified for engineers.' },
        'DP-01': { response: 'yes', evidence: 'TLS 1.3 enforced and customer data encrypted with AES-256 KMS.' },
        'DP-02': { response: 'yes', evidence: 'NIST SP 800-88 sanitization upon contract termination.' },
        'IR-01': { response: 'no', evidence: 'No contractual 72-hour breach SLA in master agreement.' },
        'VM-01': { response: 'partial', evidence: 'Monthly scans run, but critical patch SLA averages 28 days.' },
        'CO-01': { response: 'yes', evidence: 'SOC 2 Type II and ISO/IEC 27001:2022 attestations verified.' },
        'BC-01': { response: 'yes', evidence: 'Automated daily geo-redundant backups with tested RTO 4h.' },
        'SC-01': { response: 'partial', evidence: 'Subprocessor register maintained but formal SBOM missing.' },
        'HS-01': { response: 'yes', evidence: 'Background checks and phishing simulations completed.' }
      };
      Object.keys(presetResponses).forEach(qid => {
        if (newAnswers[qid]) {
          newAnswers[qid] = { ...newAnswers[qid], ...presetResponses[qid] };
        }
      });
      setNotification('⚠️ Loaded Preset: CloudOps Infrastructure (High Risk 16/25 - Require Remediation)');
    } else if (presetType === 'payswift_compliant') {
      matchingVendorId = vendors.find(v => v.name.includes('PaySwift'))?.id || targetVendorId;
      newAssessorNotes = 'COMPLIANT: Full PCI-DSS Level 1 & SOC 2 Type II audit verified. Hardware tokens & zero standing privilege.';
      const presetResponses = {
        'AC-01': { response: 'yes', evidence: 'Hardware security keys (FIDO2) mandatory for all staff.' },
        'AC-02': { response: 'yes', evidence: 'Zero Standing Privileges (ZSP) via PAM with full session audit.' },
        'DP-01': { response: 'yes', evidence: 'FIPS 140-3 HSM encryption for cardholder data; TLS 1.3 only.' },
        'DP-02': { response: 'yes', evidence: 'Automated PCI-DSS compliant sanitization and deletion.' },
        'IR-01': { response: 'yes', evidence: 'Contractual 24h breach notification SLA; Mandiant retainer.' },
        'VM-01': { response: 'yes', evidence: 'Continuous Qualys scanning with 7-day critical patch SLA.' },
        'CO-01': { response: 'yes', evidence: 'PCI-DSS v4.0 Level 1 AoC and SOC 2 Type II verified.' },
        'BC-01': { response: 'yes', evidence: 'Multi-region active-active setup with 99.999% SLA and RTO < 5m.' },
        'SC-01': { response: 'yes', evidence: 'Continuous automated SBOM dependency scanning (Snyk).' },
        'HS-01': { response: 'yes', evidence: 'Comprehensive background checks & monthly adaptive training.' }
      };
      Object.keys(presetResponses).forEach(qid => {
        if (newAnswers[qid]) {
          newAnswers[qid] = { ...newAnswers[qid], ...presetResponses[qid] };
        }
      });
      setNotification('✅ Loaded Preset: PaySwift Gateway (Low Risk 4/25 - Approved)');
    }

    setAnswers(newAnswers);
    setTargetVendorId(matchingVendorId);
    setAssessorNotes(newAssessorNotes);
    setTimeout(() => setNotification(null), 6000);
  };

  // --- FILE UPLOAD HANDLER (JSON & CSV) ---
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (file.name.endsWith('.json')) {
          parseJSONAssessment(content, file.name);
        } else if (file.name.endsWith('.csv')) {
          parseCSVAssessment(content, file.name);
        } else {
          alert('Unsupported file format. Please upload a .json or .csv assessment file.');
        }
      } catch (err) {
        console.error('File parsing error:', err);
        alert(`Failed to parse assessment file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const parseJSONAssessment = (jsonText, filename) => {
    const data = JSON.parse(jsonText);
    const answersList = data.answers || (Array.isArray(data) ? data : []);

    if (!Array.isArray(answersList) || answersList.length === 0) {
      throw new Error('No valid "answers" array found in JSON file.');
    }

    const updatedAnswers = { ...answers };
    let matchCount = 0;

    answersList.forEach(item => {
      const qid = (item.question_id || item.id || '').toUpperCase().trim();
      if (updatedAnswers[qid]) {
        const resp = (item.response || item.answer || 'yes').toLowerCase().trim();
        updatedAnswers[qid] = {
          ...updatedAnswers[qid],
          response: ['yes', 'partial', 'no', 'na'].includes(resp) ? resp : 'yes',
          evidence: item.evidence || item.evidence_notes || updatedAnswers[qid].evidence,
          gap_notes: item.gap_notes || item.gaps || ''
        };
        matchCount++;
      }
    });

    if (data.assessment_metadata) {
      if (data.assessment_metadata.assessor_name) setAssessorName(data.assessment_metadata.assessor_name);
      if (data.assessment_metadata.assessor_notes) setAssessorNotes(data.assessment_metadata.assessor_notes);
      if (data.assessment_metadata.vendor_id) {
        const found = vendors.find(v => v.id === data.assessment_metadata.vendor_id);
        if (found) setTargetVendorId(found.id);
      }
    }

    setAnswers(updatedAnswers);
    setNotification(`📁 Successfully loaded '${filename}'! (${matchCount} control questions updated)`);
    setTimeout(() => setNotification(null), 6000);
  };

  const parseCSVAssessment = (csvText, filename) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error('CSV file has insufficient rows.');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
    const idIdx = headers.findIndex(h => h.includes('id'));
    const respIdx = headers.findIndex(h => h.includes('response') || h.includes('answer'));
    const evidenceIdx = headers.findIndex(h => h.includes('evidence') || h.includes('note'));

    if (idIdx === -1 || respIdx === -1) {
      throw new Error('CSV must have headers containing "Question_ID" and "Response".');
    }

    const updatedAnswers = { ...answers };
    let matchCount = 0;

    for (let i = 1; i < lines.length; i++) {
      // Regex CSV splitter handling commas inside quotes
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      const qid = (values[idIdx] || '').toUpperCase().trim();
      const resp = (values[respIdx] || 'yes').toLowerCase().trim();
      const ev = evidenceIdx !== -1 ? (values[evidenceIdx] || '') : '';

      if (updatedAnswers[qid]) {
        updatedAnswers[qid] = {
          ...updatedAnswers[qid],
          response: ['yes', 'partial', 'no', 'na'].includes(resp) ? resp : 'yes',
          evidence: ev || updatedAnswers[qid].evidence
        };
        matchCount++;
      }
    }

    setAnswers(updatedAnswers);
    setNotification(`📊 Successfully loaded CSV '${filename}'! (${matchCount} control questions populated)`);
    setTimeout(() => setNotification(null), 6000);
  };

  // --- EXPORT CURRENT ANSWERS TO JSON FILE ---
  const handleExportJSON = () => {
    const exportData = {
      assessment_metadata: {
        title: `Cybersecurity Assessment - ${targetVendor?.name || 'Vendor'}`,
        vendor_id: targetVendor?.id || 'VND-CUSTOM',
        vendor_name: targetVendor?.name || 'Custom Vendor',
        assessor_name: assessorName,
        assessment_date: new Date().toISOString().split('T')[0],
        assessor_notes: assessorNotes,
        inherent_risk_score: live.score,
        inherent_risk_level: live.level,
        decision_support: live.decision
      },
      answers: Object.values(answers)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assessment-${(targetVendor?.name || 'vendor').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- DOWNLOAD BLANK TEMPLATES ---
  const handleDownloadTemplateJSON = () => {
    const templateData = {
      assessment_metadata: {
        title: "Standard NIST CSF 2.0 Vendor Assessment Template",
        vendor_id: targetVendor?.id || "VND-101",
        vendor_name: targetVendor?.name || "Vendor Name",
        assessor_name: assessorName,
        assessment_date: new Date().toISOString().split('T')[0],
        assessor_notes: "Enter custom assessment notes here..."
      },
      instructions: "Set 'response' to 'yes', 'partial', 'no', or 'na'. Add evidence notes in 'evidence'.",
      answers: questions.map(q => ({
        question_id: q.id,
        category: q.category,
        nist_ref: q.nist_ref,
        weight: q.weight,
        response: "yes",
        evidence: "Documented evidence / policy verification notes...",
        gap_notes: ""
      }))
    };

    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assessment_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplateCSV = () => {
    const csvRows = [
      ['Question_ID', 'Category', 'NIST_Reference', 'Response', 'Evidence_Notes', 'Gap_Description'].join(',')
    ];
    questions.forEach(q => {
      csvRows.push([
        q.id,
        `"${q.category}"`,
        `"${q.nist_ref}"`,
        'yes',
        `"Documented verification notes for ${q.id}"`,
        '""'
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assessment_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetVendor) return;

    setIsSubmitting(true);
    const answersList = Object.values(answers);

    const payload = {
      id: '',
      vendor_id: targetVendor.id,
      assessor_name: assessorName,
      assessment_date: new Date().toISOString().split('T')[0],
      answers: answersList,
      inherent_likelihood: live.likelihood,
      inherent_impact: live.impact,
      inherent_risk_score: live.score,
      inherent_risk_level: live.level,
      identified_gaps: live.gaps,
      recommended_actions: live.gaps.map(g => `Mandate control remediation: ${g}`),
      decision: live.decision,
      assessor_notes: assessorNotes
    };

    try {
      await onSubmitAssessment(payload);
      // Trigger confetti celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group questions by category
  const categories = ['ALL', ...new Set(questions.map(q => q.category))];
  const displayedQuestions = activeCategory === 'ALL' 
    ? questions 
    : questions.filter(q => q.category === activeCategory);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Hidden file input for uploading assessment files */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".json,.csv" 
        style={{ display: 'none' }} 
      />

      {/* Notification Toast */}
      {notification && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)', 
          border: '1px solid var(--accent-cyan)', 
          borderRadius: '10px', 
          padding: '12px 18px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <CheckCircle2 size={20} color="var(--accent-cyan)" />
            <span>{notification}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Toolbar: Upload Data, Load Presets, Download Template */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderLeft: '4px solid var(--accent-cyan)' }}>
        
        {/* Left: Quick Upload Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
            title="Upload any JSON or CSV assessment data file to auto-populate all answers"
          >
            <Upload size={16} />
            <span>Upload Assessment File (JSON / CSV)</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={handleExportJSON}
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            title="Export the currently filled assessment into a JSON file"
          >
            <Download size={15} color="var(--accent-cyan)" />
            <span>Export to JSON</span>
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleDownloadTemplateJSON}
              style={{ fontSize: '0.78rem', padding: '6px 10px' }}
              title="Download clean blank JSON template"
            >
              <FileText size={14} />
              <span>Blank JSON</span>
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleDownloadTemplateCSV}
              style={{ fontSize: '0.78rem', padding: '6px 10px' }}
              title="Download clean CSV template for Excel"
            >
              <FileSpreadsheet size={14} color="#10b981" />
              <span>Blank CSV (Excel)</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Scenario Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ⚡ Quick Load Scenarios:
          </span>
          <button
            className="badge badge-critical"
            onClick={() => loadPreset('byteshield_critical')}
            style={{ cursor: 'pointer', padding: '5px 10px', textTransform: 'none', fontSize: '0.75rem' }}
            title="Load ByteShield Critical Risk MSP (20/25 - Reject/Escalate)"
          >
            🔴 ByteShield (Critical 20/25)
          </button>
          <button
            className="badge badge-high"
            onClick={() => loadPreset('cloudops_high')}
            style={{ cursor: 'pointer', padding: '5px 10px', textTransform: 'none', fontSize: '0.75rem' }}
            title="Load CloudOps High Risk AWS Provider (16/25 - Remediate)"
          >
            🟡 CloudOps (High 16/25)
          </button>
          <button
            className="badge badge-low"
            onClick={() => loadPreset('payswift_compliant')}
            style={{ cursor: 'pointer', padding: '5px 10px', textTransform: 'none', fontSize: '0.75rem' }}
            title="Load PaySwift Compliant Gateway (4/25 - Approved)"
          >
            🟢 PaySwift (Low 4/25)
          </button>
        </div>

      </div>

      {/* Target Vendor Picker & Assessment Header */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Standardized Cybersecurity Assessment (NIST CSF 2.0 / SP 800-161)
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Evaluate third-party cybersecurity maturity across 10 key control domains. Scores calculate live in real-time.
          </p>
        </div>

        {/* Target Vendor Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assessing Vendor:</span>
          <select 
            value={targetVendorId}
            onChange={(e) => setTargetVendorId(e.target.value)}
            style={{
              background: 'rgba(30, 41, 59, 0.9)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-bright)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {vendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.business_criticality} Tier)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Questionnaire (Left) + Live Calculator & Findings (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Questionnaire */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeCategory === cat ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: `1px solid ${activeCategory === cat ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Question Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayedQuestions.map((q) => {
              const currentAns = answers[q.id]?.response || 'yes';
              const currentEvidence = answers[q.id]?.evidence || '';

              return (
                <div key={q.id} className="glass-panel" style={{ padding: '20px' }}>
                  
                  {/* Category and NIST ref header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)' }}>
                        {q.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
                        {q.category}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {q.nist_ref}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {q.question}
                  </div>

                  {/* Auditor Guidance */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', background: 'rgba(0, 0, 0, 0.25)', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)' }}>
                    💡 <strong>Assessment Guidance:</strong> {q.guidance}
                  </div>

                  {/* Response Radio Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <label 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 14px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: currentAns === 'yes' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: currentAns === 'yes' ? '#34d399' : 'var(--text-muted)',
                        border: `1px solid ${currentAns === 'yes' ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-subtle)'}`
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        value="yes" 
                        checked={currentAns === 'yes'} 
                        onChange={() => handleResponseChange(q.id, 'yes')}
                        style={{ display: 'none' }}
                      />
                      <Check size={14} />
                      <span>Compliant (Yes)</span>
                    </label>

                    <label 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 14px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: currentAns === 'partial' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: currentAns === 'partial' ? '#fbbf24' : 'var(--text-muted)',
                        border: `1px solid ${currentAns === 'partial' ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-subtle)'}`
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        value="partial" 
                        checked={currentAns === 'partial'} 
                        onChange={() => handleResponseChange(q.id, 'partial')}
                        style={{ display: 'none' }}
                      />
                      <Minus size={14} />
                      <span>Partial Control</span>
                    </label>

                    <label 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 14px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: currentAns === 'no' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: currentAns === 'no' ? '#f87171' : 'var(--text-muted)',
                        border: `1px solid ${currentAns === 'no' ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)'}`
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        value="no" 
                        checked={currentAns === 'no'} 
                        onChange={() => handleResponseChange(q.id, 'no')}
                        style={{ display: 'none' }}
                      />
                      <X size={14} />
                      <span>Gap (No)</span>
                    </label>

                    <label 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        background: currentAns === 'na' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: currentAns === 'na' ? '#cbd5e1' : 'var(--text-dim)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        value="na" 
                        checked={currentAns === 'na'} 
                        onChange={() => handleResponseChange(q.id, 'na')}
                        style={{ display: 'none' }}
                      />
                      <span>N/A</span>
                    </label>
                  </div>

                  {/* Evidence / Artifacts Reference Input */}
                  <div>
                    <input 
                      type="text" 
                      placeholder="Audit evidence note (e.g., SOC 2 Section 4 exception, ISO cert #, Jump host policy doc)..."
                      value={currentEvidence}
                      onChange={(e) => handleEvidenceChange(q.id, e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: 'var(--text-main)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-sans)'
                      }}
                    />
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Sidebar: Real-time Risk Score Calculation & Submission */}
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Live Score Card */}
          <div className="glass-panel" style={{ padding: '24px', borderTop: `4px solid var(--risk-${live.level.toLowerCase()})` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Real-Time Risk Scoring Engine
              </span>
              <Sparkles size={16} color="var(--accent-cyan)" />
            </div>

            {/* Inherent Score Big Display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                  {live.score}
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', fontWeight: 400 }}> / 25</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Inherent Risk Score
                </div>
              </div>
              <div>
                <span className={`badge badge-${live.level.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  {live.level} Risk
                </span>
              </div>
            </div>

            {/* Likelihood and Impact breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Likelihood</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {live.likelihood} / 5
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>From control gaps</div>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Impact</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {live.impact} / 5
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>From asset criticality</div>
              </div>
            </div>

            {/* Recommended Decision */}
            <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recommended Decision Support:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '2px' }}>
                {live.decision}
              </div>
            </div>

            {/* Identified Gaps list */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Gaps Identified ({live.gaps.length})
                </span>
              </div>
              {live.gaps.length > 0 ? (
                <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {live.gaps.map((gap, i) => (
                    <div key={i} style={{ fontSize: '0.7rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 8px', borderRadius: '4px', borderLeft: '2px solid #ef4444' }}>
                      ⚠ {gap}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '4px' }}>
                  ✓ All assessed controls compliant!
                </div>
              )}
            </div>

            {/* Assessor Metadata Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Lead Assessor Name
                </label>
                <input 
                  type="text" 
                  value={assessorName}
                  onChange={(e) => setAssessorName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Assessment Notes & Observations
                </label>
                <textarea 
                  rows={2}
                  placeholder="Additional context or caveats for steering committee..."
                  value={assessorNotes}
                  onChange={(e) => setAssessorNotes(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            {/* Submit Assessment Button */}
            <button 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', justifyContent: 'center' }}
            >
              {isSubmitting ? 'Calculating & Saving...' : 'Save Assessment & Generate Mitigations'}
            </button>

          </div>

          {/* Academic Info Reminder */}
          <div className="glass-panel" style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-main)' }}>SRMP Evaluation Rule:</strong> Submitting this assessment updates the vendor's Inherent Risk and automatically creates open mitigation action items for each identified gap in the Risk Treatment register.
          </div>

        </div>

      </div>

    </div>
  );
}
