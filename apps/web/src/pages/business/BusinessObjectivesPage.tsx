import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/lib/services/business/useBusiness.js';
import { IconZap, IconPlus, IconWorkflow, IconCheckCircle } from '@/lib/icons.js';

export default function BusinessObjectivesPage() {
  const navigate = useNavigate();
  const { objectives, workflows, projects } = useBusiness();
  const [filter, setFilter] = useState<'all' | 'on_track' | 'at_risk' | 'completed'>('all');

  const filteredObjectives = objectives.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#000000',
        color: '#ffcc66',
        fontFamily: 'var(--font-sans)',
        padding: '24px 32px 80px 32px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#ffaa30',
              letterSpacing: '0.12em',
              marginBottom: 4,
            }}
          >
            STRATEGIC OUTCOMES & OKRS
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#ffcc66',
              margin: 0,
              letterSpacing: '0.02em',
              textShadow: '0 0 10px rgba(255, 170, 48, 0.4)',
            }}
          >
            Business Objectives
          </h1>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(20, 10, 2, 0.8)', padding: 3, borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.25)' }}>
          {(['all', 'on_track', 'at_risk', 'completed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(255, 170, 48, 0.25)' : 'transparent',
                color: filter === f ? '#ffcc66' : '#885522',
                border: 'none',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Objectives Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
        {filteredObjectives.map((obj) => {
          const linkedWfs = workflows.filter((w) => w.objectiveId === obj.id);
          const linkedProjs = projects.filter((p) => obj.linkedProjectIds.includes(p.id));

          return (
            <div
              key={obj.id}
              style={{
                background: 'rgba(15, 8, 2, 0.8)',
                border: obj.status === 'at_risk' ? '1px solid rgba(255, 80, 50, 0.4)' : '1px solid rgba(255, 170, 48, 0.25)',
                borderRadius: 8,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: 3,
                      background: obj.status === 'at_risk' ? 'rgba(255, 80, 50, 0.2)' : 'rgba(255, 170, 48, 0.2)',
                      border: obj.status === 'at_risk' ? '1px solid rgba(255, 80, 50, 0.5)' : '1px solid rgba(255, 170, 48, 0.4)',
                      color: obj.status === 'at_risk' ? '#ff8877' : '#ffcc66',
                    }}
                  >
                    {obj.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffcc66', marginTop: 8 }}>
                    {obj.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#d99a4e', marginTop: 4 }}>
                    {obj.description}
                  </div>
                </div>
              </div>

              {/* Progress Meter */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                  <span style={{ color: '#885522' }}>OVERALL FULFILLMENT</span>
                  <span style={{ color: obj.status === 'at_risk' ? '#ff8877' : '#ffaa30', fontWeight: 600 }}>
                    {obj.progress}%
                  </span>
                </div>
                <div style={{ height: 6, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${obj.progress}%`,
                      height: '100%',
                      background: obj.status === 'at_risk' ? '#ff5533' : 'linear-gradient(90deg, #ffaa30, #ffcc66)',
                      boxShadow: '0 0 8px rgba(255, 170, 48, 0.5)',
                    }}
                  />
                </div>
              </div>

              {/* Key Results Checklist */}
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 8 }}>
                  KEY RESULTS ({obj.keyResults.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {obj.keyResults.map((kr) => {
                    const pct = Math.min(100, Math.round((kr.current / kr.target) * 100));
                    return (
                      <div
                        key={kr.id}
                        style={{
                          background: 'rgba(5, 3, 1, 0.6)',
                          border: '1px solid rgba(255, 170, 48, 0.12)',
                          borderRadius: 4,
                          padding: '8px 10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: '#ffcc66' }}>{kr.title}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#ffaa30' }}>
                            {kr.current} / {kr.target} {kr.unit}
                          </span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(255, 170, 48, 0.1)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#ffaa30' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Linked Workflows / Projects Footer */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 170, 48, 0.12)',
                  paddingTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span style={{ color: '#885522' }}>
                  {linkedWfs.length} Workflows · {linkedProjs.length} Projects
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/business/fulfillment')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffaa30',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  View Pipeline →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
