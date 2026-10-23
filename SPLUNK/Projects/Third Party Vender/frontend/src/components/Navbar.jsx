import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  BookOpen, 
  RotateCcw, 
  PlusCircle, 
  Sun, 
  Moon,
  AlertTriangle
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onNewAssessment, 
  onNewVendor,
  onOpenReport, 
  onExportCSV, 
  onOpenSrmp, 
  onResetDemo,
  isLightMode,
  toggleTheme,
  metrics
}) {
  return (
    <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-glass)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Top Bar */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Brand & Academic context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
          }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                TPV-SRA
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', fontWeight: 600, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                NIST CSF 2.0 / SP 800-161
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Third-Party Vendor Cybersecurity Risk Analyzer <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>• SRMP Subject Project</span>
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onOpenSrmp}
            title="View SRMP Academic Concepts & NIST Mapping"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <BookOpen size={16} color="#38bdf8" />
            <span>SRMP Syllabus Guide</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onOpenReport}
            title="Generate Executive Risk Assessment PDF Report"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <FileText size={16} color="#a855f7" />
            <span>Executive Report</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onExportCSV}
            title="Export Vendor Risk Register to CSV"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Download size={16} color="#10b981" />
            <span>Export CSV</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onResetDemo}
            title="Reset demo vendors, mitigations, and scores to pristine state"
            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
          >
            <RotateCcw size={15} color="var(--text-muted)" />
            <span>Reset Demo</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={onNewAssessment}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <PlusCircle size={16} />
            <span>Run Assessment</span>
          </button>

          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: '8px', 
              padding: '6px 10px', 
              cursor: 'pointer',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Light / Dark mode"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '4px', overflowX: 'auto' }}>
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Executive Dashboard & 5×5 Heatmap
        </button>
        <button 
          className={`nav-tab ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          🏢 Vendor Inventory ({metrics?.total_vendors || 0})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'wizard' ? 'active' : ''}`}
          onClick={() => setActiveTab('wizard')}
        >
          🛡️ Cybersecurity Assessment Wizard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'mitigations' ? 'active' : ''}`}
          onClick={() => setActiveTab('mitigations')}
        >
          📋 Risk Treatment & Mitigations ({metrics?.mitigations_summary?.total || 0})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📜 Audit Trail & Logs
        </button>
      </div>
    </header>
  );
}
