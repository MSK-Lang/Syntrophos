import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/primitives.js';

export default function AboutPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');

  return (
    <div style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 90 }}>
      {/* HERO */}
      <section style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
        <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)' }}>
          ABOUT SYNTHROPHOS
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 800, color: '#fff5e6', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Building an operating environment where AI understands the context behind the work.
        </h1>

        <p style={{ fontSize: 18, color: '#d99a4e', lineHeight: 1.6, maxWidth: 700 }}>
          Syntrophos connects your conversations, tasks, projects, schedule, knowledge, agents, and workflows into one intelligent environment.
        </p>
      </section>

      {/* SECTION 1: THE IDEA */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 60, display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            THE IDEA
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6', lineHeight: 1.2 }}>
            Connecting scattered software pieces.
          </h2>
        </div>

        <div style={{ fontSize: 16, color: '#d99a4e', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p>
            Most modern productivity software forces work into separate silos: communication lives in one app, tasks in another, project timelines in a third, and AI in a chat window that knows nothing about any of them.
          </p>
          <p>
            Syntrophos is designed around connecting those pieces into a shared context matrix, giving AI the structural understanding required to actually help execute work.
          </p>
        </div>
      </section>

      {/* SECTION 2: WHY SYNTHROPHOS EXISTS */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 60, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            PRODUCT PHILOSOPHY
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>WHY SYNTHROPHOS EXISTS</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div style={{ background: 'rgba(14, 7, 1, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>01 // CONTEXT FIRST</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>AI Must Understand Context</div>
            <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>
              AI shouldn’t be a generic text box. It should understand your connected projects, tasks, schedule, and team relationships.
            </div>
          </div>

          <div style={{ background: 'rgba(14, 7, 1, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>02 // OPERATIONAL AGENTS</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>AI Should Operate On Work</div>
            <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>
              Specialized autonomous operators break down goals, schedule meetings, and create structured tasks rather than returning isolated text.
            </div>
          </div>

          <div style={{ background: 'rgba(14, 7, 1, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>03 // HUMAN CONTROL</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>Humans Remain in Control</div>
            <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>
              Consequential state changes and task executions support explicit human-in-the-loop approval checkpoints.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW THE SYSTEM THINKS ABOUT WORK */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 60, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            OPERATIONAL FRAMEWORK
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>HOW THE SYSTEM THINKS ABOUT WORK</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, background: 'rgba(14, 7, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '24px' }}>
          <div>
            <div style={{ fontSize: 11, color: '#ffaa30', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>01 // CONTEXT</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff5e6', marginTop: 4 }}>Connected Graph</div>
            <div style={{ fontSize: 11, color: '#885522', marginTop: 6 }}>Projects, tasks, notes, meetings, and documents.</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#ffaa30', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>02 // INTELLIGENCE</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff5e6', marginTop: 4 }}>Agents &amp; Workflows</div>
            <div style={{ fontSize: 11, color: '#885522', marginTop: 6 }}>Operators that understand priorities and routines.</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#ffaa30', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>03 // ACTION</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff5e6', marginTop: 4 }}>Structured Execution</div>
            <div style={{ fontSize: 11, color: '#885522', marginTop: 6 }}>Tasks, communications, and scheduling items.</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#ffaa30', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>04 // RESULT</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff5e6', marginTop: 4 }}>Updated State</div>
            <div style={{ fontSize: 11, color: '#885522', marginTop: 6 }}>Work completed and context graph kept in sync.</div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PERSONAL + BUSINESS */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 60, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
              ADAPTABLE WORKSPACE
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>PERSONAL + BUSINESS</h2>
          </div>

          <div style={{ display: 'flex', gap: 8, background: 'rgba(16, 8, 2, 0.8)', padding: 4, borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.25)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              style={{
                background: activeTab === 'personal' ? '#ffaa30' : 'transparent',
                color: activeTab === 'personal' ? '#000000' : '#d99a4e',
                border: 'none',
                borderRadius: 4,
                padding: '6px 16px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              [ PERSONAL ]
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              style={{
                background: activeTab === 'business' ? '#ffaa30' : 'transparent',
                color: activeTab === 'business' ? '#000000' : '#d99a4e',
                border: 'none',
                borderRadius: 4,
                padding: '6px 16px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              [ BUSINESS ]
            </button>
          </div>
        </div>

        <div style={{ background: 'rgba(14, 7, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '32px' }}>
          {activeTab === 'personal' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66' }}>Personal Life, Tasks &amp; Knowledge</div>
              <div style={{ fontSize: 14, color: '#d99a4e', lineHeight: 1.6 }}>
                Organize your day, track commitments, remember context, and manage personal notes and knowledge in one peaceful environment.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ffcc66' }}>Team Operations &amp; Agent Workflows</div>
              <div style={{ fontSize: 14, color: '#d99a4e', lineHeight: 1.6 }}>
                Coordinate projects, people, team communications, agent workflows, and operational knowledge matrices.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: CURRENT + FUTURE MATURITY */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 60, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            PRODUCT MATURITY &amp; ROADMAP
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>CURRENT VS PLANNED CAPABILITIES</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: 'rgba(14, 7, 1, 0.9)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#34d399', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>CURRENTLY AVAILABLE (V1.0)</div>
            <ul style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.8, paddingLeft: 20 }}>
              <li>Full spatial 3D memory core visualization</li>
              <li>Unified Dashboard, Tasks, Projects &amp; Inbox</li>
              <li>People &amp; Schedule matrix with embedded calendar</li>
              <li>Intelligence Control Center (Agents &amp; Workflows)</li>
              <li>Searchable Knowledge Matrix &amp; usage telemetry</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(14, 7, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>PLANNED ROADMAP (FUTURE)</div>
            <ul style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.8, paddingLeft: 20 }}>
              <li>Real-time multi-agent background execution backend</li>
              <li>Live Google Calendar / Office 365 OAuth sync</li>
              <li>Dynamic spatial relationship graph engine</li>
              <li>End-to-end encrypted multi-device cloud sync</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.2)', paddingTop: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff5e6' }}>READY TO EXPLORE SYNTHROPHOS?</h2>
        <Button variant="primary" size="md" onClick={() => navigate('/sign-up')} style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', padding: '14px 32px' }}>
          [ GET STARTED NOW ]
        </Button>
      </section>
    </div>
  );
}
