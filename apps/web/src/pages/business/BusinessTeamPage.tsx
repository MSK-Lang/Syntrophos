import { useState } from 'react';
import { useBusiness } from '@/lib/services/business/useBusiness.js';
import { IconTasks, IconCheckCircle, IconMail } from '@/lib/icons.js';

export default function BusinessTeamPage() {
  const { team } = useBusiness();
  const [deptFilter, setDeptFilter] = useState<'all' | 'Executive' | 'Operations' | 'Growth'>('all');

  const filteredTeam = team.filter((m) => {
    if (deptFilter === 'all') return true;
    return m.department === deptFilter;
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
            HUMAN OPERATORS & DECISION MAKERS
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
            Team & Human-in-the-Loop Capacity
          </h1>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(20, 10, 2, 0.8)', padding: 3, borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.25)' }}>
          {(['all', 'Executive', 'Operations', 'Growth'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDeptFilter(d)}
              style={{
                background: deptFilter === d ? 'rgba(255, 170, 48, 0.25)' : 'transparent',
                color: deptFilter === d ? '#ffcc66' : '#885522',
                border: 'none',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Team Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {filteredTeam.map((member) => (
          <div
            key={member.id}
            style={{
              background: 'rgba(15, 8, 2, 0.8)',
              border: '1px solid rgba(255, 170, 48, 0.25)',
              borderRadius: 8,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: 'rgba(255, 170, 48, 0.2)',
                  border: '1px solid rgba(255, 170, 48, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#ffcc66',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {member.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffcc66' }}>{member.name}</div>
                <div style={{ fontSize: '12px', color: '#ffaa30' }}>{member.role}</div>
                <div style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)' }}>
                  {member.department} · {member.email}
                </div>
              </div>
            </div>

            {/* Workload Meter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                <span style={{ color: '#885522' }}>CURRENT WORKLOAD</span>
                <span style={{ color: member.currentWorkload > 75 ? '#ff8877' : '#ffcc66', fontWeight: 600 }}>
                  {member.currentWorkload}%
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${member.currentWorkload}%`,
                    height: '100%',
                    background: member.currentWorkload > 75 ? '#ff6644' : '#ffaa30',
                  }}
                />
              </div>
            </div>

            {/* Pending Approvals */}
            <div
              style={{
                background: 'rgba(5, 3, 1, 0.6)',
                border: '1px solid rgba(255, 170, 48, 0.15)',
                borderRadius: 4,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
              }}
            >
              <span style={{ color: '#ffcc66' }}>Pending Approvals Assigned</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: member.pendingApprovalsCount > 0 ? '#ffaa30' : '#885522',
                  fontWeight: 600,
                }}
              >
                {member.pendingApprovalsCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
