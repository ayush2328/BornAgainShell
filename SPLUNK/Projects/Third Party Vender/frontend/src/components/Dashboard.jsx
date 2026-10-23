import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Layers, 
  ArrowRight,
  Info,
  Building,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard({ 
  metrics, 
  onSelectVendor, 
  onRunAssessmentFor,
  onNavigateTab 
}) {
  const [matrixView, setMatrixView] = useState('inherent'); // 'inherent' or 'residual'
  const [selectedCell, setSelectedCell] = useState(null);

  if (!metrics || metrics.total_vendors === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading risk intelligence analytics...</p>
      </div>
    );
  }

  const {
    total_vendors,
    inherent_risk_distribution = {},
    residual_risk_distribution = {},
    criticality_distribution = {},
    average_inherent_score,
    average_residual_score,
    risk_reduction_percentage,
    matrix_grid = [],
    mitigations_summary = {},
    critical_vendors = []
  } = metrics;

  const currentDist = matrixView === 'inherent' ? inherent_risk_distribution : residual_risk_distribution;
  const currentAvgScore = matrixView === 'inherent' ? average_inherent_score : average_residual_score;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner / Subject Notice */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Info size={22} color="var(--accent-cyan)" />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              SRMP Semi-Quantitative 5×5 Risk Assessment Active
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Formula: <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-cyan)' }}>Risk Score = Likelihood (1-5) × Impact (1-5)</code>. Residual risk reduces strictly when mitigating controls have documented audit verification.
            </p>
          </div>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => onNavigateTab('wizard')}
          style={{ fontSize: '0.8rem' }}
        >
          <span>Questionnaire Framework</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Total Vendors */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendor Inventory</span>
            <Building size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {total_vendors}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Active third-party supply chain partners
          </div>
        </div>

        {/* Card 2: High & Critical Vendors */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--risk-critical)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--risk-critical)', textTransform: 'uppercase' }}>High & Critical Exposure</span>
            <ShieldAlert size={18} color="var(--risk-critical)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--risk-critical)', marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {(inherent_risk_distribution.Critical || 0) + (inherent_risk_distribution.High || 0)}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              ({residual_risk_distribution.Critical || 0 + residual_risk_distribution.High || 0} residual)
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {inherent_risk_distribution.Critical || 0} Critical (Escalate) • {inherent_risk_distribution.High || 0} High (Remediate)
          </div>
        </div>

        {/* Card 3: Average Inherent vs Residual Score */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Inherent vs Residual</span>
            <Layers size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span>{average_inherent_score}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>→</span>
            <span style={{ color: 'var(--risk-low)' }}>{average_residual_score}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 400 }}>/ 25</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Scale 1 (Minimal) to 25 (Catastrophic)
          </div>
        </div>

        {/* Card 4: Risk Reduction Rate */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--risk-low)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--risk-low)', textTransform: 'uppercase' }}>Mitigation Reduction</span>
            <TrendingDown size={18} color="var(--risk-low)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--risk-low)', marginTop: '8px' }}>
            {risk_reduction_percentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {mitigations_summary.completion_rate}% controls verified with evidence
          </div>
        </div>
      </div>

      {/* Main Grid: 5x5 Heatmap Matrix + Side Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        
        {/* 5x5 Risk Matrix Container */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                5×5 Cybersecurity Risk Matrix Heatmap
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Interactive grid mapping vendors by Likelihood (vertical) vs Impact (horizontal). Click any cell to inspect vendors.
              </p>
            </div>

            {/* Inherent vs Residual View Toggle */}
            <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { setMatrixView('inherent'); setSelectedCell(null); }}
                style={{
                  background: matrixView === 'inherent' ? 'var(--accent-blue)' : 'transparent',
                  color: matrixView === 'inherent' ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Inherent Risk (Unmitigated)
              </button>
              <button
                onClick={() => { setMatrixView('residual'); setSelectedCell(null); }}
                style={{
                  background: matrixView === 'residual' ? 'var(--risk-low)' : 'transparent',
                  color: matrixView === 'residual' ? '#000000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Residual Risk (Treated)
              </button>
            </div>
          </div>

          {/* 5x5 Matrix Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            
            {/* Column Headers (Impact 1 to 5) */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', alignSelf: 'center' }}>
                LIKELIHOOD ↓
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>1 - Negligible</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>2 - Minor</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>3 - Moderate</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>4 - Major</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>5 - Catastrophic</div>
            </div>

            {/* Matrix Rows (Likelihood 5 down to 1) */}
            {matrix_grid.map((row, rIdx) => {
              const likelihoodLabel = 5 - rIdx;
              const likelihoodNames = [
                '5 - Almost Certain',
                '4 - Likely',
                '3 - Moderate',
                '2 - Unlikely',
                '1 - Rare'
              ];

              return (
                <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', gap: '8px', alignItems: 'stretch' }}>
                  
                  {/* Row Label */}
                  <div style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 600, 
                    color: 'var(--text-muted)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-end',
                    paddingRight: '8px',
                    textAlign: 'right'
                  }}>
                    {likelihoodNames[rIdx]}
                  </div>

                  {/* 5 Impact Cells in this Row */}
                  {row.map((cell, cIdx) => {
                    const count = matrixView === 'inherent' ? cell.inherent_count : cell.residual_count;
                    const vendorsInCell = matrixView === 'inherent' ? cell.inherent_vendors : cell.residual_vendors;
                    const cellClass = `cell-${cell.risk_level.toLowerCase()}`;
                    const isSelected = selectedCell && selectedCell.likelihood === cell.likelihood && selectedCell.impact === cell.impact;

                    return (
                      <div 
                        key={cIdx}
                        className={`matrix-cell ${cellClass}`}
                        onClick={() => setSelectedCell(cell)}
                        style={{
                          outline: isSelected ? '2px solid var(--accent-cyan)' : 'none',
                          transform: isSelected ? 'scale(1.03)' : 'none'
                        }}
                        title={`Score: ${cell.score} (${cell.risk_level}) • Likelihood: ${cell.likelihood}, Impact: ${cell.impact}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, opacity: 0.85 }}>
                            {cell.score}
                          </span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
                            {cell.risk_level}
                          </span>
                        </div>

                        {/* Vendors Badge */}
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {count > 0 ? (
                            <span style={{ 
                              background: 'rgba(0, 0, 0, 0.65)', 
                              color: '#ffffff', 
                              padding: '2px 7px', 
                              borderRadius: '999px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                            }}>
                              {count} {count === 1 ? 'vendor' : 'vendors'}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Bottom X-Axis Label */}
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              IMPACT (BUSINESS CRITICALITY & BLAST RADIUS) →
            </div>
          </div>

          {/* Matrix Legend */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Risk Bands:</span>
              <span className="badge badge-low">1–4: Low (Accept & Monitor)</span>
              <span className="badge badge-medium">5–9: Medium (Plan Improvements)</span>
              <span className="badge badge-high">10–16: High (Prioritize Mitigation)</span>
              <span className="badge badge-critical">17–25: Critical (Urgent Escalation)</span>
            </div>
          </div>

          {/* Selected Cell Drilldown Drawer */}
          {selectedCell && (
            <div style={{ marginTop: '18px', padding: '16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.45)', border: '1px solid var(--border-bright)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Cell ({selectedCell.likelihood}×{selectedCell.impact} = {selectedCell.score} {selectedCell.risk_level})
                  </span>
                  <span className={`badge badge-${selectedCell.risk_level.toLowerCase()}`}>
                    {matrixView === 'inherent' ? 'Inherent Risk' : 'Residual Risk'}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedCell(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ✕ Close
                </button>
              </div>

              {((matrixView === 'inherent' ? selectedCell.inherent_vendors : selectedCell.residual_vendors) || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {((matrixView === 'inherent' ? selectedCell.inherent_vendors : selectedCell.residual_vendors) || []).map((v) => (
                    <div 
                      key={v.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '10px 14px', 
                        borderRadius: '8px', 
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>{v.name}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Criticality: <strong style={{ color: 'var(--text-main)' }}>{v.criticality}</strong> • ID: {v.id}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          Score: {v.score}
                        </span>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => onSelectVendor(v.id)}
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No vendors currently mapped to this exact Likelihood/Impact coordinate in {matrixView} view.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Critical Attention & Risk Distributions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Urgent Attention Box */}
          <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--risk-critical)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={18} color="var(--risk-critical)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Priority Risk Attention
              </h4>
            </div>

            {critical_vendors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {critical_vendors.slice(0, 3).map((v) => (
                  <div 
                    key={v.id}
                    onClick={() => onSelectVendor(v.id)}
                    style={{ 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      background: 'rgba(239, 68, 68, 0.08)', 
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {v.name}
                      </span>
                      <span className={`badge badge-${v.inherent_risk_level.toLowerCase()}`}>
                        {v.inherent_risk_score} / 25
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {v.service_type}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--risk-critical)', marginTop: '4px', fontWeight: 600 }}>
                      Decision: {v.decision}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No critical risk vendors pending escalation.
              </p>
            )}

            <button 
              className="btn btn-secondary"
              onClick={() => onNavigateTab('vendors')}
              style={{ width: '100%', marginTop: '12px', fontSize: '0.8rem', justifyContent: 'center' }}
            >
              View All Vendors
            </button>
          </div>

          {/* Risk Band Comparison Visualizer */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
              Inherent vs Residual Shift
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Critical (17–25)', inCount: inherent_risk_distribution.Critical || 0, resCount: residual_risk_distribution.Critical || 0, color: 'var(--risk-critical)' },
                { label: 'High (10–16)', inCount: inherent_risk_distribution.High || 0, resCount: residual_risk_distribution.High || 0, color: 'var(--risk-high)' },
                { label: 'Medium (5–9)', inCount: inherent_risk_distribution.Medium || 0, resCount: residual_risk_distribution.Medium || 0, color: 'var(--risk-medium)' },
                { label: 'Low (1–4)', inCount: inherent_risk_distribution.Low || 0, resCount: residual_risk_distribution.Low || 0, color: 'var(--risk-low)' }
              ].map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {item.inCount} in → <strong style={{ color: item.color }}>{item.resCount} res</strong>
                    </span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${(item.resCount / total_vendors) * 100}%`, background: item.color, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Criticality Distribution */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              Tier Criticality Breakdown
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {Object.entries(criticality_distribution).map(([tier, count]) => (
                <div key={tier} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{tier}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
