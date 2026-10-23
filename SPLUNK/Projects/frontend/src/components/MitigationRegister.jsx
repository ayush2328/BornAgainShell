import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  User, 
  Calendar, 
  FileCheck, 
  Trash2, 
  TrendingDown,
  Info
} from 'lucide-react';

export default function MitigationRegister({ 
  mitigations = [], 
  vendors = [], 
  onUpdateMitigation, 
  onCreateMitigation, 
  onDeleteMitigation 
}) {
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [verifyModalAction, setVerifyModalAction] = useState(null);
  const [evidenceInput, setEvidenceInput] = useState('');
  const [isNewActionModalOpen, setIsNewActionModalOpen] = useState(false);

  // New action form state
  const [newAction, setNewAction] = useState({
    vendor_id: vendors[0]?.id || '',
    title: '',
    description: '',
    control_type: 'Preventive',
    associated_gap: '',
    owner: 'Security Operations',
    target_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    status: 'Open',
    evidence: ''
  });

  const handleOpenVerifyModal = (action) => {
    setVerifyModalAction(action);
    setEvidenceInput(action.evidence || '');
  };

  const handleConfirmVerification = () => {
    if (!verifyModalAction) return;
    onUpdateMitigation(verifyModalAction.id, {
      status: 'Verified',
      evidence: evidenceInput || 'Verified audit evidence examined by Risk Assessor.'
    });
    setVerifyModalAction(null);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleStatusQuickChange = (actionId, newStatus) => {
    if (newStatus === 'Verified') {
      const act = mitigations.find(m => m.id === actionId);
      if (act) handleOpenVerifyModal(act);
      return;
    }
    onUpdateMitigation(actionId, { status: newStatus });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newAction.title || !newAction.vendor_id) return;
    const v = vendors.find(x => x.id === newAction.vendor_id);
    onCreateMitigation({
      ...newAction,
      vendor_name: v ? v.name : 'Unknown Vendor'
    });
    setIsNewActionModalOpen(false);
    setNewAction({
      vendor_id: vendors[0]?.id || '',
      title: '',
      description: '',
      control_type: 'Preventive',
      associated_gap: '',
      owner: 'Security Operations',
      target_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      status: 'Open',
      evidence: ''
    });
  };

  const filtered = mitigations.filter(m => {
    const matchesVendor = selectedVendorFilter === 'ALL' || m.vendor_id === selectedVendorFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || m.status === selectedStatusFilter;
    return matchesVendor && matchesStatus;
  });

  const verifiedCount = mitigations.filter(m => m.status === 'Verified').length;
  const inProgressCount = mitigations.filter(m => m.status === 'In Progress').length;
  const openCount = mitigations.filter(m => m.status === 'Open').length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Notice on Residual Risk verification */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderLeft: '4px solid var(--risk-low)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingDown size={22} color="var(--risk-low)" />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Risk Treatment & Residual Risk Reduction Rule
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              SRMP Principle: Recommendations alone do NOT reduce risk. Marking an action as <strong>Verified</strong> with documented evidence triggers the scoring engine to recalculate the vendor's residual risk!
            </p>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsNewActionModalOpen(true)}
          style={{ fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>Add Treatment Action</span>
        </button>
      </div>

      {/* Filter and KPI Header */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Vendor:</span>
            <select 
              value={selectedVendorFilter}
              onChange={(e) => setSelectedVendorFilter(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Vendors ({vendors.length})</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            <select 
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Statuses ({mitigations.length})</option>
              <option value="Open">Open ({openCount})</option>
              <option value="In Progress">In Progress ({inProgressCount})</option>
              <option value="Verified">Verified with Evidence ({verifiedCount})</option>
            </select>
          </div>
        </div>

        {/* Status Counts Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-low">
            ✓ {verifiedCount} Verified (Residual Applied)
          </span>
          <span className="badge badge-medium">
            ⏳ {inProgressCount} In Progress
          </span>
          <span className="badge badge-outline">
            ● {openCount} Open
          </span>
        </div>

      </div>

      {/* Mitigations Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Action Title / Control</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Vendor</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Control Type</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Owner</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Deadline</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((action) => (
                <tr 
                  key={action.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Title & Description */}
                  <td style={{ padding: '14px 18px', maxWidth: '320px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {action.description}
                    </div>
                    {action.evidence && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginTop: '4px', background: 'rgba(56, 189, 248, 0.08)', padding: '4px 8px', borderRadius: '4px' }}>
                        📎 Evidence: {action.evidence}
                      </div>
                    )}
                  </td>

                  {/* Vendor */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {action.vendor_name}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {action.vendor_id}
                    </div>
                  </td>

                  {/* Control Type */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: action.control_type === 'Preventive' ? 'rgba(56, 189, 248, 0.15)' :
                                 action.control_type === 'Detective' ? 'rgba(139, 92, 246, 0.15)' :
                                 action.control_type === 'Corrective' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                      color: action.control_type === 'Preventive' ? 'var(--accent-cyan)' :
                             action.control_type === 'Detective' ? 'var(--accent-purple)' :
                             action.control_type === 'Corrective' ? 'var(--risk-medium)' : 'var(--text-main)'
                    }}>
                      {action.control_type}
                    </span>
                  </td>

                  {/* Owner */}
                  <td style={{ padding: '14px 18px', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} color="var(--text-muted)" />
                      <span>{action.owner}</span>
                    </div>
                  </td>

                  {/* Deadline */}
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="var(--text-muted)" />
                      <span>{action.target_date}</span>
                    </div>
                  </td>

                  {/* Status Dropdown / Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <select
                      value={action.status}
                      onChange={(e) => handleStatusQuickChange(action.id, e.target.value)}
                      style={{
                        background: action.status === 'Verified' ? 'rgba(16, 185, 129, 0.2)' :
                                   action.status === 'In Progress' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                        color: action.status === 'Verified' ? '#34d399' :
                               action.status === 'In Progress' ? '#fbbf24' : 'var(--text-main)',
                        border: `1px solid ${action.status === 'Verified' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Verified">Verified (Evidence Verified)</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {action.status !== 'Verified' && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleOpenVerifyModal(action)}
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          title="Verify control with audit evidence to reduce vendor residual risk"
                        >
                          Verify Evidence
                        </button>
                      )}
                      <button 
                        className="btn btn-danger"
                        onClick={() => {
                          if (confirm(`Delete action '${action.title}'?`)) {
                            onDeleteMitigation(action.id);
                          }
                        }}
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Control Modal */}
      {verifyModalAction && (
        <div className="modal-overlay" onClick={() => setVerifyModalAction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={24} color="var(--risk-low)" />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Verify Control Implementation
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  SRMP Evidence Review for: {verifyModalAction.vendor_name}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {verifyModalAction.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Control Type: <strong>{verifyModalAction.control_type}</strong> • Owner: <strong>{verifyModalAction.owner}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Audit Evidence Description & Verification Notes *
              </label>
              <textarea 
                rows={3}
                required
                placeholder="e.g., Reviewed tenant SSO Conditional Access policy screenshot; FIDO2 token authentication confirmed for all root accounts."
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  resize: 'none'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Documenting evidence satisfies SOC 2 Type II and ISO 27001 auditor requirements.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setVerifyModalAction(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmVerification}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                Confirm Verification & Recalculate Risk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Action Modal */}
      {isNewActionModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewActionModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              Create Risk Treatment Action
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Define specific preventative, detective, or corrective controls to treat vendor vulnerabilities.
            </p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Target Vendor *
                </label>
                <select 
                  value={newAction.vendor_id}
                  onChange={(e) => setNewAction({ ...newAction, vendor_id: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.business_criticality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Action Title *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Implement TLS 1.3 Key Rotation & KMS Envelope Encryption" 
                  value={newAction.title}
                  onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Control Category
                  </label>
                  <select 
                    value={newAction.control_type}
                    onChange={(e) => setNewAction({ ...newAction, control_type: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Preventive">Preventive (Stops Threat Event)</option>
                    <option value="Detective">Detective (Identifies Threat Event)</option>
                    <option value="Corrective">Corrective (Restores from Impact)</option>
                    <option value="Directive">Directive (Policy / Contract Clause)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Assigned Owner
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Chief Information Security Officer" 
                    value={newAction.owner}
                    onChange={(e) => setNewAction({ ...newAction, owner: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Target Completion Date
                </label>
                <input 
                  type="date" 
                  value={newAction.target_date}
                  onChange={(e) => setNewAction({ ...newAction, target_date: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewActionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Action
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
