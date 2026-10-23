import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import VendorDirectory from './components/VendorDirectory';
import AssessmentWizard from './components/AssessmentWizard';
import MitigationRegister from './components/MitigationRegister';
import AuditLogView from './components/AuditLogView';
import ReportModal from './components/ReportModal';
import SrmpAcademicModal from './components/SrmpAcademicModal';
import VendorDetailModal from './components/VendorDetailModal';
import {
  INITIAL_DEMO_VENDORS,
  INITIAL_DEMO_MITIGATIONS,
  INITIAL_DEMO_AUDIT_LOGS,
  computeDashboardMetrics,
  getRiskLevel,
  determineDecision,
  calculateResidualRisk,
  loadFromStorage,
  saveToStorage
} from './services/localDataService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendors, setVendors] = useState([]);
  const [mitigations, setMitigations] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Modals state
  const [selectedVendorForDetail, setSelectedVendorForDetail] = useState(null);
  const [wizardTargetVendorId, setWizardTargetVendorId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSrmpModalOpen, setIsSrmpModalOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync to localStorage as client fallback
  const syncLocalState = (newVendors, newMitigations, newAuditLogs) => {
    saveToStorage('tpv_sra_vendors', newVendors);
    saveToStorage('tpv_sra_mitigations', newMitigations);
    saveToStorage('tpv_sra_audit_logs', newAuditLogs);
    setVendors(newVendors);
    setMitigations(newMitigations);
    setAuditLogs(newAuditLogs);
    setMetrics(computeDashboardMetrics(newVendors, newMitigations));
  };

  // Fetch all initial data (with graceful Vercel / offline fallback)
  const refreshAllData = async () => {
    try {
      const [vRes, mRes, aRes, logRes] = await Promise.all([
        fetch('/api/vendors'),
        fetch('/api/mitigations'),
        fetch('/api/analytics/dashboard'),
        fetch('/api/audit')
      ]);

      if (vRes.ok && mRes.ok && aRes.ok && logRes.ok) {
        const [vData, mData, aData, logData] = await Promise.all([
          vRes.json(),
          mRes.json(),
          aRes.json(),
          logRes.json()
        ]);

        if (Array.isArray(vData) && vData.length > 0) {
          setVendors(vData);
          setMitigations(mData || []);
          setMetrics(aData || null);
          setAuditLogs(logData || []);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("FastAPI backend not active. Running on embedded client-side database for Vercel/offline mode:", err);
    }

    // Fallback: load from localStorage or pristine demo dataset
    const localVendors = loadFromStorage('tpv_sra_vendors', INITIAL_DEMO_VENDORS);
    const localMitigations = loadFromStorage('tpv_sra_mitigations', INITIAL_DEMO_MITIGATIONS);
    const localAudit = loadFromStorage('tpv_sra_audit_logs', INITIAL_DEMO_AUDIT_LOGS);
    const computedMetrics = computeDashboardMetrics(localVendors, localMitigations);

    setVendors(localVendors);
    setMitigations(localMitigations);
    setAuditLogs(localAudit);
    setMetrics(computedMetrics);
    setLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const toggleTheme = () => {
    setIsLightMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
      return next;
    });
  };

  // Vendor actions
  const handleSelectVendor = (vendorId) => {
    const v = vendors.find(x => x.id === vendorId);
    if (v) setSelectedVendorForDetail(v);
  };

  const handleRunAssessmentFor = (vendorId) => {
    setWizardTargetVendorId(vendorId);
    setActiveTab('wizard');
  };

  const handleCreateVendor = async (vendorData) => {
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      if (res.ok) {
        await refreshAllData();
        return;
      }
    } catch (err) {
      // Backend offline fallback
    }

    // Client-side fallback creation
    const newVendor = {
      ...vendorData,
      id: `VND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      inherent_likelihood: 3,
      inherent_impact: 3,
      inherent_risk_score: 9,
      inherent_risk_level: "Medium",
      residual_likelihood: 3,
      residual_impact: 3,
      residual_risk_score: 9,
      residual_risk_level: "Medium",
      decision: "Approve with Conditions",
      assessment_status: "Pending",
      identified_gaps: []
    };

    const newLog = {
      id: `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      user: "Risk Assessor (Ayush)",
      action: "Vendor Registered",
      entity_type: "Vendor",
      entity_id: newVendor.id,
      details: `Registered vendor ${newVendor.name} (${newVendor.service_type}) with Criticality=${newVendor.business_criticality}.`
    };

    syncLocalState([...vendors, newVendor], mitigations, [newLog, ...auditLogs]);
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshAllData();
        if (selectedVendorForDetail?.id === vendorId) setSelectedVendorForDetail(null);
        return;
      }
    } catch (err) {
      // Backend offline fallback
    }

    const remaining = vendors.filter(v => v.id !== vendorId);
    const newLog = {
      id: `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      user: "SecOps Admin",
      action: "Vendor Deprovisioned",
      entity_type: "Vendor",
      entity_id: vendorId,
      details: `Decommissioned vendor profile ${vendorId}.`
    };
    syncLocalState(remaining, mitigations.filter(m => m.vendor_id !== vendorId), [newLog, ...auditLogs]);
    if (selectedVendorForDetail?.id === vendorId) setSelectedVendorForDetail(null);
  };

  // Assessment submission
  const handleSubmitAssessment = async (assessmentPayload) => {
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentPayload)
      });
      if (res.ok) {
        await refreshAllData();
        setActiveTab('dashboard');
        return;
      }
    } catch (err) {
      // Backend offline fallback
    }

    // Client-side fallback submission
    const targetIdx = vendors.findIndex(v => v.id === assessmentPayload.vendor_id);
    if (targetIdx !== -1) {
      const updatedVendors = [...vendors];
      const verifiedCount = mitigations.filter(m => m.vendor_id === assessmentPayload.vendor_id && m.status === 'Verified').length;
      const { resL, resI, resScore, resLevel } = calculateResidualRisk(
        assessmentPayload.inherent_likelihood,
        assessmentPayload.inherent_impact,
        verifiedCount
      );

      updatedVendors[targetIdx] = {
        ...updatedVendors[targetIdx],
        assessment_status: "Assessed",
        last_assessment_date: new Date().toISOString().split('T')[0],
        inherent_likelihood: assessmentPayload.inherent_likelihood,
        inherent_impact: assessmentPayload.inherent_impact,
        inherent_risk_score: assessmentPayload.inherent_risk_score,
        inherent_risk_level: assessmentPayload.inherent_risk_level,
        residual_likelihood: resL,
        residual_impact: resI,
        residual_risk_score: resScore,
        residual_risk_level: resLevel,
        decision: assessmentPayload.decision,
        identified_gaps: assessmentPayload.identified_gaps || []
      };

      // Generate mitigation tasks for gaps
      const newMitigations = [...mitigations];
      (assessmentPayload.identified_gaps || []).forEach(gap => {
        newMitigations.push({
          id: `ACT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          vendor_id: assessmentPayload.vendor_id,
          vendor_name: updatedVendors[targetIdx].name,
          title: `Remediate: ${gap.slice(0, 60)}...`,
          description: `Mandate security improvement addressing gap: ${gap}`,
          control_type: "Preventive",
          associated_gap: gap,
          owner: "Security Engineering Lead",
          target_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: "Open",
          evidence: "",
          created_at: new Date().toISOString()
        });
      });

      const newLog = {
        id: `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        user: assessmentPayload.assessor_name || "Lead Assessor (Ayush)",
        action: "Cybersecurity Assessment Executed",
        entity_type: "Assessment",
        entity_id: `ASM-${Date.now().toString().slice(-4)}`,
        details: `NIST CSF 2.0 evaluation for ${updatedVendors[targetIdx].name}. Score=${assessmentPayload.inherent_risk_score} (${assessmentPayload.inherent_risk_level}).`
      };

      syncLocalState(updatedVendors, newMitigations, [newLog, ...auditLogs]);
      setActiveTab('dashboard');
    }
  };

  // Mitigation actions
  const handleUpdateMitigation = async (actionId, updates) => {
    try {
      const res = await fetch(`/api/mitigations/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await refreshAllData();
        return;
      }
    } catch (err) {
      // Backend offline fallback
    }

    const updatedMitigations = mitigations.map(m => m.id === actionId ? { ...m, ...updates } : m);
    const targetAction = updatedMitigations.find(m => m.id === actionId);
    let updatedVendors = [...vendors];

    if (targetAction) {
      const targetVendorIdx = updatedVendors.findIndex(v => v.id === targetAction.vendor_id);
      if (targetVendorIdx !== -1) {
        const v = updatedVendors[targetVendorIdx];
        const verifiedCount = updatedMitigations.filter(m => m.vendor_id === v.id && m.status === 'Verified').length;
        const { resL, resI, resScore, resLevel } = calculateResidualRisk(v.inherent_likelihood, v.inherent_impact, verifiedCount);

        updatedVendors[targetVendorIdx] = {
          ...v,
          residual_likelihood: resL,
          residual_impact: resI,
          residual_risk_score: resScore,
          residual_risk_level: resLevel
        };
      }
    }

    const newLog = {
      id: `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      user: "Lead Auditor (Ayush)",
      action: updates.status === 'Verified' ? "Security Control Verified" : "Mitigation Action Updated",
      entity_type: "Mitigation",
      entity_id: actionId,
      details: updates.status === 'Verified'
        ? `Verified control with audit evidence: "${updates.evidence || 'Verified'}"`
        : `Updated status to ${updates.status}`
    };

    syncLocalState(updatedVendors, updatedMitigations, [newLog, ...auditLogs]);
  };

  const handleCreateMitigation = async (actionData) => {
    try {
      const res = await fetch('/api/mitigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      if (res.ok) {
        await refreshAllData();
        return;
      }
    } catch (err) {
      // Backend offline fallback
    }

    const newAction = {
      ...actionData,
      id: `ACT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      created_at: new Date().toISOString()
    };
    syncLocalState(vendors, [...mitigations, newAction], auditLogs);
  };

  const handleDeleteMitigation = async (actionId) => {
    try {
      const res = await fetch(`/api/mitigations/${actionId}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshAllData();
        return;
      }
    } catch (err) {
      // Backend offline fallback
    }

    const remaining = mitigations.filter(m => m.id !== actionId);
    syncLocalState(vendors, remaining, auditLogs);
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (confirm("Reset all vendors, risk scores, and mitigations to pristine demo state?")) {
      try {
        await fetch('/api/audit/reset-demo', { method: 'POST' });
      } catch (err) {
        // Continue to reset local storage
      }
      localStorage.removeItem('tpv_sra_vendors');
      localStorage.removeItem('tpv_sra_mitigations');
      localStorage.removeItem('tpv_sra_audit_logs');
      syncLocalState(INITIAL_DEMO_VENDORS, INITIAL_DEMO_MITIGATIONS, INITIAL_DEMO_AUDIT_LOGS);
    }
  };

  // CSV Risk Register Export
  const handleExportCSV = () => {
    if (!vendors.length) return;

    const headers = [
      'Vendor ID',
      'Vendor Name',
      'Service Category',
      'Business Criticality',
      'Inherent Likelihood',
      'Inherent Impact',
      'Inherent Risk Score',
      'Inherent Risk Level',
      'Residual Likelihood',
      'Residual Impact',
      'Residual Risk Score',
      'Residual Risk Level',
      'Decision Status',
      'Assessment Status',
      'Last Assessment Date',
      'Owner Department',
      'Contact Email'
    ];

    const rows = vendors.map(v => [
      v.id,
      `"${v.name}"`,
      `"${v.service_type}"`,
      v.business_criticality,
      v.inherent_likelihood,
      v.inherent_impact,
      v.inherent_risk_score,
      v.inherent_risk_level,
      v.residual_likelihood,
      v.residual_impact,
      v.residual_risk_score,
      v.residual_risk_level,
      `"${v.decision}"`,
      v.assessment_status,
      v.last_assessment_date || '',
      `"${v.owner_department || ''}"`,
      v.contact_email || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vendor-Cybersecurity-Risk-Register-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar with stats and global controls */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewAssessment={() => { setWizardTargetVendorId(vendors[0]?.id || null); setActiveTab('wizard'); }}
        onNewVendor={() => setActiveTab('vendors')}
        onOpenReport={() => setIsReportModalOpen(true)}
        onExportCSV={handleExportCSV}
        onOpenSrmp={() => setIsSrmpModalOpen(true)}
        onResetDemo={handleResetDemo}
        isLightMode={isLightMode}
        toggleTheme={toggleTheme}
        metrics={metrics}
      />

      {/* Main Tab Content View */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            Loading Cybersecurity Risk Intelligence Data...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                metrics={metrics}
                onSelectVendor={handleSelectVendor}
                onRunAssessmentFor={handleRunAssessmentFor}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'vendors' && (
              <VendorDirectory 
                vendors={vendors}
                onSelectVendor={handleSelectVendor}
                onRunAssessment={handleRunAssessmentFor}
                onCreateVendor={handleCreateVendor}
                onDeleteVendor={handleDeleteVendor}
                onRecalculate={refreshAllData}
              />
            )}

            {activeTab === 'wizard' && (
              <AssessmentWizard 
                vendors={vendors}
                selectedVendorId={wizardTargetVendorId}
                onSubmitAssessment={handleSubmitAssessment}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'mitigations' && (
              <MitigationRegister 
                mitigations={mitigations}
                vendors={vendors}
                onUpdateMitigation={handleUpdateMitigation}
                onCreateMitigation={handleCreateMitigation}
                onDeleteMitigation={handleDeleteMitigation}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLogView logs={auditLogs} />
            )}
          </>
        )}
      </main>

      {/* Footer with Academic Attribution */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>Third-Party Vendor Cybersecurity Risk Analyzer (TPV-SRA)</strong> • Security Risk Management and Principles (SRMP) Project
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span>NIST CSF 2.0 (GV.SC) Aligned</span>
            <span>•</span>
            <span>NIST SP 800-161 Rev. 1 Supply Chain Risk</span>
            <span>•</span>
            <button 
              onClick={() => setIsSrmpModalOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}
            >
              Academic Concept Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        metrics={metrics}
        vendors={vendors}
        mitigations={mitigations}
      />

      <SrmpAcademicModal 
        isOpen={isSrmpModalOpen}
        onClose={() => setIsSrmpModalOpen(false)}
      />

      <VendorDetailModal 
        vendor={selectedVendorForDetail}
        mitigations={mitigations}
        onClose={() => setSelectedVendorForDetail(null)}
        onRunAssessment={handleRunAssessmentFor}
        onRecalculate={refreshAllData}
      />

    </div>
  );
}
