import React from 'react';
import { 
  Building, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Layers, 
  Database, 
  Lock, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function VendorDetailModal({ 
  vendor, 
  mitigations = [], 
  onClose, 
  onRunAssessment,
  onRecalculate 
}) {
  if (!vendor) return null;

  const vendorMitigations = mitigations.filter(m => m.vendor_id === vendor.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', maxHeight: '90vh', padding: '28px' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {vendor.name}
              </h2>
              <span className={`badge badge-${vendor.business_criticality.toLowerCase()}`}>
                Tier: {vendor.business_criticality}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {vendor.service_type} • Vendor ID: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{vendor.id}</code>
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Risk Scores Inherent vs Residual Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
          
          {/* Inherent Risk Card */}
          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: `1px solid var(--risk-${vendor.inherent_risk_level.toLowerCase()}-border)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inherent Risk (Raw)</span>
              <span className={`badge badge-${vendor.inherent_risk_level.toLowerCase()}`}>
                {vendor.inherent_risk_level}
              </span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
              {vendor.inherent_risk_score} <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 400 }}>/ 25</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Likelihood = {vendor.inherent_likelihood} × Impact = {vendor.inherent_impact}
            </div>
          </div>

          {/* Residual Risk Card */}
          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: `1px solid var(--risk-${vendor.residual_risk_level.toLowerCase()}-border)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Residual Risk (Treated)</span>
              <span className={`badge badge-${vendor.residual_risk_level.toLowerCase()}`}>
                {vendor.residual_risk_level}
              </span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--risk-low)', marginTop: '6px' }}>
              {vendor.residual_risk_score} <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 400 }}>/ 25</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Likelihood = {vendor.residual_likelihood} × Impact = {vendor.residual_impact}
            </div>
          </div>

        </div>

        {/* Decision Support Banner */}
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorized Decision Support Status:</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {vendor.decision}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => { onClose(); onRunAssessment(vendor.id); }}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            Launch Reassessment
          </button>
        </div>

        {/* Data & Systems Exposure */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Data Classifications Handled:
            </h4>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {vendor.data_handled?.map((d, i) => (
                <span key={i} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                  🔒 {d}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Internal Systems Connected:
            </h4>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {vendor.systems_accessed?.map((s, i) => (
                <span key={i} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  ⚡ {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Identified Gaps */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Identified Vulnerabilities & Gaps:
          </h4>
          {vendor.identified_gaps && vendor.identified_gaps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {vendor.identified_gaps.map((gap, idx) => (
                <div key={idx} style={{ fontSize: '0.8rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                  ⚠ {gap}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No critical gaps identified in latest assessment.
            </p>
          )}
        </div>

        {/* Associated Treatment Actions */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Risk Treatment Actions ({vendorMitigations.length}):
          </h4>
          {vendorMitigations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {vendorMitigations.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{m.title}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Owner: {m.owner} • Due: {m.target_date} • Type: {m.control_type}
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: m.status === 'Verified' ? '#34d399' : '#fbbf24',
                    background: m.status === 'Verified' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No open mitigation actions assigned.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
