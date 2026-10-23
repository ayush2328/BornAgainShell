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

  // Fetch all initial data
  const refreshAllData = async () => {
    try {
      const [vRes, mRes, aRes, logRes] = await Promise.all([
        fetch('/api/vendors'),
        fetch('/api/mitigations'),
        fetch('/api/analytics/dashboard'),
        fetch('/api/audit')
      ]);

      const [vData, mData, aData, logData] = await Promise.all([
        vRes.json(),
        mRes.json(),
        aRes.json(),
        logRes.json()
      ]);

      setVendors(vData || []);
      setMitigations(mData || []);
      setMetrics(aData || null);
      setAuditLogs(logData || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
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
      }
    } catch (err) {
      console.error("Failed to create vendor:", err);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
      await fetch(`/api/vendors/${vendorId}`, { method: 'DELETE' });
      await refreshAllData();
      if (selectedVendorForDetail?.id === vendorId) {
        setSelectedVendorForDetail(null);
      }
    } catch (err) {
      console.error("Failed to delete vendor:", err);
    }
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
      }
    } catch (err) {
      console.error("Failed to submit assessment:", err);
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
      }
    } catch (err) {
      console.error("Failed to update mitigation:", err);
    }
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
      }
    } catch (err) {
      console.error("Failed to create mitigation:", err);
    }
  };

  const handleDeleteMitigation = async (actionId) => {
    try {
      await fetch(`/api/mitigations/${actionId}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (err) {
      console.error("Failed to delete mitigation:", err);
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (confirm("Reset all vendors, risk scores, and mitigations to pristine demo state?")) {
      try {
        await fetch('/api/audit/reset-demo', { method: 'POST' });
        await refreshAllData();
      } catch (err) {
        console.error("Failed to reset demo:", err);
      }
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
