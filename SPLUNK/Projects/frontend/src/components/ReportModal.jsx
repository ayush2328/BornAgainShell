import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  Building, 
  Layers, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';

export default function ReportModal({ isOpen, onClose, metrics, vendors = [], mitigations = [] }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // Document Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 595, 80, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('THIRD-PARTY VENDOR CYBERSECURITY RISK REPORT', 40, 42);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('SRMP Security Risk Management & Principles • NIST CSF 2.0 GV.SC / SP 800-161', 40, 60);

    // Summary Section
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. EXECUTIVE SUMMARY & POSTURE OVERVIEW', 40, 110);

    const summaryData = [
      ['Total Evaluated Vendors', `${metrics?.total_vendors || 0}`],
      ['Average Inherent Risk Score', `${metrics?.average_inherent_score || 0} / 25`],
      ['Average Residual Risk Score', `${metrics?.average_residual_score || 0} / 25`],
      ['Risk Reduction Percentage', `${metrics?.risk_reduction_percentage || 0}%`],
      ['Verified Mitigation Controls', `${mitigations.filter(m => m.status === 'Verified').length} of ${mitigations.length}`]
    ];

    autoTable(doc, {
      startY: 120,
      margin: { left: 40, right: 40 },
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5 }
    });

    // Vendor Inventory Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const nextY = doc.lastAutoTable.finalY + 30;
    doc.text('2. VENDOR RISK REGISTER & EVALUATION SUMMARY', 40, nextY);

    const tableRows = vendors.map(v => [
      v.id,
      v.name,
      v.business_criticality,
      `${v.inherent_risk_score} (${v.inherent_risk_level})`,
      `${v.residual_risk_score} (${v.residual_risk_level})`,
      v.decision
    ]);

    autoTable(doc, {
      startY: nextY + 10,
      margin: { left: 40, right: 40 },
      head: [['ID', 'Vendor Name', 'Criticality', 'Inherent Risk', 'Residual Risk', 'Decision']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 8, cellPadding: 5 }
    });

    // Mitigations Section
    const mitY = doc.lastAutoTable.finalY + 30;
    doc.text('3. ACTIVE RISK TREATMENT ROADMAP', 40, mitY);

    const mitRows = mitigations.map(m => [
      m.id,
      m.vendor_name,
      m.title,
      m.control_type,
      m.owner,
      m.status
    ]);

    autoTable(doc, {
      startY: mitY + 10,
      margin: { left: 40, right: 40 },
      head: [['Action ID', 'Vendor', 'Control Title', 'Type', 'Owner', 'Status']],
      body: mitRows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 7, cellPadding: 4 }
    });

    // Sign off section
    const signY = doc.lastAutoTable.finalY + 35;
    if (signY < 750) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE RISK ACCEPTANCE & AUDIT ATTESTATION:', 40, signY);
      doc.setFont('helvetica', 'normal');
      doc.text('Chief Information Security Officer (CISO): _______________________     Date: ____________', 40, signY + 25);
      doc.text('Lead Risk Assessor: ___________________________________________     Date: ____________', 40, signY + 45);
    }

    doc.save('Vendor-Cybersecurity-Risk-Audit-Report.pdf');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px', maxHeight: '90vh', padding: '32px' }}>
        
        {/* Modal Controls Bar */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} color="var(--accent-cyan)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Executive Risk Assessment Report Preview
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print Preview</span>
            </button>
            <button className="btn btn-primary" onClick={handleDownloadPDF}>
              <Download size={16} />
              <span>Download PDF</span>
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', marginLeft: '10px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-report" style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}>
          
          {/* Header Title */}
          <div style={{ borderBottom: '2px solid var(--accent-cyan)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  THIRD-PARTY VENDOR CYBERSECURITY RISK AUDIT REPORT
                </h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Security Risk Management and Principles (SRMP) Evaluation • NIST CSF 2.0 GV.SC & SP 800-161
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>Report Date: <strong>{new Date().toLocaleDateString()}</strong></div>
                <div>Classification: <strong style={{ color: '#f87171' }}>CONFIDENTIAL</strong></div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive KPI Metrics */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              1. Executive Risk Posture Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Vendors</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{metrics?.total_vendors}</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Inherent Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--risk-high)' }}>{metrics?.average_inherent_score} / 25</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Residual Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--risk-low)' }}>{metrics?.average_residual_score} / 25</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Reduction</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--risk-low)' }}>{metrics?.risk_reduction_percentage}%</div>
              </div>
            </div>
          </div>

          {/* Section 2: Vendor Risk Register Table */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              2. Vendor Risk Register (Likelihood × Impact)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '8px 10px' }}>Vendor ID</th>
                  <th style={{ padding: '8px 10px' }}>Vendor Name</th>
                  <th style={{ padding: '8px 10px' }}>Criticality</th>
                  <th style={{ padding: '8px 10px' }}>Inherent Risk</th>
                  <th style={{ padding: '8px 10px' }}>Residual Risk</th>
                  <th style={{ padding: '8px 10px' }}>Decision Support</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{v.id}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{v.name}</td>
                    <td style={{ padding: '8px 10px' }}>{v.business_criticality}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span className={`badge badge-${v.inherent_risk_level.toLowerCase()}`}>
                        {v.inherent_risk_score} ({v.inherent_risk_level})
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span className={`badge badge-${v.residual_risk_level.toLowerCase()}`}>
                        {v.residual_risk_score} ({v.residual_risk_level})
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>{v.decision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Risk Treatment Plan */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              3. Risk Treatment Action Roadmap
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '8px 10px' }}>Action Title</th>
                  <th style={{ padding: '8px 10px' }}>Vendor</th>
                  <th style={{ padding: '8px 10px' }}>Control Category</th>
                  <th style={{ padding: '8px 10px' }}>Owner</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {mitigations.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{m.title}</td>
                    <td style={{ padding: '8px 10px' }}>{m.vendor_name}</td>
                    <td style={{ padding: '8px 10px' }}>{m.control_type}</td>
                    <td style={{ padding: '8px 10px' }}>{m.owner}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: m.status === 'Verified' ? '#34d399' : '#fbbf24' }}>
                      {m.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Sign-off block */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Executive Sign-Off & Risk Acceptance Attestation:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
              <div>
                <div style={{ borderBottom: '1px solid var(--text-dim)', height: '30px', marginBottom: '8px' }}></div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Chief Information Security Officer (CISO)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorized Enterprise Risk Signatory</div>
              </div>
              <div>
                <div style={{ borderBottom: '1px solid var(--text-dim)', height: '30px', marginBottom: '8px' }}></div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lead Cybersecurity Risk Assessor</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SRMP Subject Assessor</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
