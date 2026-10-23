import React from 'react';
import { ShieldCheck, History, User, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function AuditLogView({ logs = [] }) {
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header explanation */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderLeft: '4px solid var(--accent-purple)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={22} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Audit Trail & Governance Log (SRMP Audit & Documentation)
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Maintains a tamper-evident audit record of all vendor registrations, risk score recalculations, mitigation verifications, and executive risk treatment decisions.
          </p>
        </div>
        <span className="badge badge-outline" style={{ fontFamily: 'var(--font-mono)' }}>
          SOC 2 CC7 / ISO 27001 A.12.4 Compliant Log
        </span>
      </div>

      {/* Logs Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp (UTC)</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Actor / User</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Event Action</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Entity</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Details & Audit Evidence</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr 
                  key={log.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Timestamp */}
                  <td style={{ padding: '14px 18px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                  </td>

                  {/* Actor */}
                  <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                      <User size={13} color="var(--accent-cyan)" />
                      <span>{log.user}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      color: log.action.includes('Verified') ? 'var(--risk-low)' : 
                             log.action.includes('Escalation') ? 'var(--risk-critical)' : 'var(--text-main)' 
                    }}>
                      {log.action}
                    </span>
                  </td>

                  {/* Entity */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      background: 'rgba(255, 255, 255, 0.06)', 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {log.entity_type}: {log.entity_id}
                    </span>
                  </td>

                  {/* Details */}
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
