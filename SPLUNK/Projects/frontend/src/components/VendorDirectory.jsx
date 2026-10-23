import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  Filter, 
  Plus, 
  Shield, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  CheckCircle,
  FileSpreadsheet,
  Calendar,
  Layers,
  Database,
  Lock
} from 'lucide-react';

export default function VendorDirectory({ 
  vendors = [], 
  onSelectVendor, 
  onRunAssessment, 
  onCreateVendor, 
  onDeleteVendor,
  onRecalculate 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new vendor
  const [formData, setFormData] = useState({
    name: '',
    service_type: 'Cloud Provider (IaaS / PaaS)',
    description: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    business_criticality: 'Medium',
    data_handled: ['PII'],
    systems_accessed: ['Webhook / API'],
    contract_start: new Date().toISOString().split('T')[0],
    contract_end: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    owner_department: 'IT & Security'
  });

  const availableDataTypes = [
    'PII',
    'Financial / Payment Data',
    'Cardholder Data (PCI)',
    'Healthcare / PHI',
    'Proprietary IP / Source Code',
    'Internal Data',
    'Public Data'
  ];

  const availableSystems = [
    'Production Cloud DB',
    'Customer Facing Portal',
    'Corporate VPN',
    'SSO / Identity Provider',
    'Webhook / API',
    'Billing Engine',
    'Internal Network'
  ];

  const toggleDataType = (type) => {
    if (formData.data_handled.includes(type)) {
      setFormData({ ...formData, data_handled: formData.data_handled.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, data_handled: [...formData.data_handled, type] });
    }
  };

  const toggleSystem = (sys) => {
    if (formData.systems_accessed.includes(sys)) {
      setFormData({ ...formData, systems_accessed: formData.systems_accessed.filter(s => s !== sys) });
    } else {
      setFormData({ ...formData, systems_accessed: [...formData.systems_accessed, sys] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onCreateVendor(formData);
    setIsModalOpen(false);
    setFormData({
      name: '',
      service_type: 'Cloud Provider (IaaS / PaaS)',
      description: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      business_criticality: 'Medium',
      data_handled: ['PII'],
      systems_accessed: ['Webhook / API'],
      contract_start: new Date().toISOString().split('T')[0],
      contract_end: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      owner_department: 'IT & Security'
    });
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrit = criticalityFilter === 'ALL' || v.business_criticality === criticalityFilter;
    const matchesRisk = riskFilter === 'ALL' || v.inherent_risk_level === riskFilter;
    return matchesSearch && matchesCrit && matchesRisk;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Controls Bar: Search, Filters, and New Vendor */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Left: Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Search vendor name, service category, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              width: '100%',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>

        {/* Middle: Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Criticality:</span>
            <select 
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Tiers</option>
              <option value="Critical">Critical (Tier 1)</option>
              <option value="High">High (Tier 2)</option>
              <option value="Medium">Medium (Tier 3)</option>
              <option value="Low">Low (Tier 4)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Inherent Risk:</span>
            <select 
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Bands</option>
              <option value="Critical">Critical (17–25)</option>
              <option value="High">High (10–16)</option>
              <option value="Medium">Medium (5–9)</option>
              <option value="Low">Low (1–4)</option>
            </select>
          </div>
        </div>

        {/* Right: Register Vendor Button */}
        <button 
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>Register New Vendor</span>
        </button>

      </div>

      {/* Vendors Inventory Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Vendor / Service</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Tier Criticality</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Inherent Risk (L×I)</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Residual Risk</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Assessment Status</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Decision Status</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr 
                  key={vendor.id}
                  style={{ 
                    borderBottom: '1px solid var(--border-subtle)', 
                    transition: 'background 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Vendor Name & Category */}
                  <td style={{ padding: '14px 18px' }} onClick={() => onSelectVendor(vendor.id)}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {vendor.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {vendor.service_type} • <span style={{ fontFamily: 'var(--font-mono)' }}>{vendor.id}</span>
                    </div>
                  </td>

                  {/* Criticality */}
                  <td style={{ padding: '14px 18px' }} onClick={() => onSelectVendor(vendor.id)}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: vendor.business_criticality === 'Critical' ? '#f87171' : 
                             vendor.business_criticality === 'High' ? '#fb923c' : 
                             vendor.business_criticality === 'Medium' ? '#fbbf24' : '#34d399'
                    }}>
                      ● {vendor.business_criticality}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Dept: {vendor.owner_department || 'IT'}
                    </div>
                  </td>

                  {/* Inherent Risk */}
                  <td style={{ padding: '14px 18px' }} onClick={() => onSelectVendor(vendor.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge badge-${vendor.inherent_risk_level.toLowerCase()}`}>
                        {vendor.inherent_risk_score} • {vendor.inherent_risk_level}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      L={vendor.inherent_likelihood} × I={vendor.inherent_impact}
                    </div>
                  </td>

                  {/* Residual Risk */}
                  <td style={{ padding: '14px 18px' }} onClick={() => onSelectVendor(vendor.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge badge-${vendor.residual_risk_level.toLowerCase()}`}>
                        {vendor.residual_risk_score} • {vendor.residual_risk_level}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      L={vendor.residual_likelihood} × I={vendor.residual_impact}
                    </div>
                  </td>

                  {/* Assessment Status */}
                  <td style={{ padding: '14px 18px' }} onClick={() => onSelectVendor(vendor.id)}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '3px 8px', 
                      borderRadius: '4px',
                      background: vendor.assessment_status === 'Overdue' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.1)',
                      color: vendor.assessment_status === 'Overdue' ? '#f87171' : 'var(--text-main)',
                      border: `1px solid ${vendor.assessment_status === 'Overdue' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                      fontWeight: 600
                    }}>
                      {vendor.assessment_status}
                    </span>
                    {vendor.last_assessment_date && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        Last: {vendor.last_assessment_date}
                      </div>
                    )}
                  </td>

                  {/* Decision Status */}
                  <td style={{ padding: '14px 18px' }} onClick={() => onSelectVendor(vendor.id)}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700,
                      color: vendor.decision === 'Approve' ? 'var(--risk-low)' : 
                             vendor.decision === 'Reject/Escalate' ? 'var(--risk-critical)' : 
                             vendor.decision === 'Require Remediation' ? 'var(--risk-high)' : 'var(--risk-medium)'
                    }}>
                      {vendor.decision}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={(e) => { e.stopPropagation(); onRunAssessment(vendor.id); }}
                        style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                        title="Run or Update Cybersecurity Assessment"
                      >
                        Assess
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={(e) => { e.stopPropagation(); onSelectVendor(vendor.id); }}
                        style={{ fontSize: '0.75rem', padding: '5px 8px' }}
                        title="View Detailed Vendor Profile"
                      >
                        Profile
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
                            onDeleteVendor(vendor.id);
                          }
                        }}
                        style={{ fontSize: '0.75rem', padding: '5px 8px' }}
                        title="Delete Vendor"
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

      {/* New Vendor Registration Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Register Third-Party Vendor
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Module 1: Establish centralized vendor inventory record for supply chain due diligence.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Company / Vendor Name *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., SecureHost Cloud Services" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Service Category *
                  </label>
                  <select 
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Cloud Provider (IaaS / PaaS)">Cloud Provider (IaaS / PaaS)</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                    <option value="HRMS / SaaS Software">HRMS / SaaS Software</option>
                    <option value="Managed IT Services / MSP">Managed IT Services / MSP</option>
                    <option value="Logistics & Supply Chain API">Logistics & Supply Chain API</option>
                    <option value="AI & Machine Learning SaaS">AI & Machine Learning SaaS</option>
                    <option value="Cybersecurity Service Provider">Cybersecurity Service Provider</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Business Criticality (Asset Impact) *
                  </label>
                  <select 
                    value={formData.business_criticality}
                    onChange={(e) => setFormData({ ...formData, business_criticality: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Critical">Critical (Tier 1: Core Customer Infrastructure / High Blast Radius)</option>
                    <option value="High">High (Tier 2: Sensitive Data / Internal Operations)</option>
                    <option value="Medium">Medium (Tier 3: Standard Corporate SaaS)</option>
                    <option value="Low">Low (Tier 4: Minimal Data Access / Auxiliary)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Owner Department
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., DevOps / FinOps / HR" 
                    value={formData.owner_department}
                    onChange={(e) => setFormData({ ...formData, owner_department: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* Data Handled Multi-select Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Data Types Handled (Asset Identification)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableDataTypes.map((type) => {
                    const isSelected = formData.data_handled.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => toggleDataType(type)}
                        style={{
                          background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                          border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Systems Accessed */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Internal Systems Accessed
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableSystems.map((sys) => {
                    const isSelected = formData.systems_accessed.includes(sys);
                    return (
                      <button
                        type="button"
                        key={sys}
                        onClick={() => toggleSystem(sys)}
                        style={{
                          background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? 'var(--accent-purple)' : 'var(--text-muted)',
                          border: `1px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{sys}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Contact Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Security Officer" 
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Contact Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="security@vendor.com" 
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Contract Expiry Date
                  </label>
                  <input 
                    type="date" 
                    value={formData.contract_end}
                    onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
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
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Register Vendor & Initialize Risk
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
