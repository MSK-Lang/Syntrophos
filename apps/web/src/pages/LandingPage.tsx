import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/primitives.js';
import {
  IconDashboard,
  IconMail,
  IconTasks,
  IconFolder,
  IconCalendar,
  IconBot,
  IconGraph,
  IconChevronRight,
  IconCheckCircle,
} from '@/lib/icons.js';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'dashboard' | 'intelligence' | 'knowledge' | 'inbox'>('dashboard');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [dualMode, setDualMode] = useState<'personal' | 'business'>('personal');
  const [activeStoryStep, setActiveStoryStep] = useState<number>(1);

  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);
  const section5Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -35% 0px',
      threshold: 0.25,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const stepAttr = entry.target.getAttribute('data-story-step');
          if (stepAttr) {
            setActiveStoryStep(parseInt(stepAttr, 10));
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    const refs = [section1Ref, section2Ref, section3Ref, section4Ref, section5Ref];
    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToStep = (stepNum: number) => {
    const targetMap: Record<number, React.RefObject<HTMLDivElement | null>> = {
      1: section1Ref,
      2: section2Ref,
      3: section3Ref,
      4: section4Ref,
      5: section5Ref,
    };
    targetMap[stepNum]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const storySteps = [
    { num: 1, label: 'THE PROBLEM' },
    { num: 2, label: 'PRODUCT SHOWCASE' },
    { num: 3, label: 'AGENTIC EXECUTION' },
    { num: 4, label: 'HUMAN CONTROL' },
    { num: 5, label: 'ADAPTABLE MATRIX' },
  ];

  return (
    <div style={{ paddingBottom: 60, width: '100%', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      {/* 1. HERO SECTION */}
      <section style={{ padding: '80px 48px 100px 48px', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: 64, alignItems: 'center' }}>
        {/* Left Column: Asymmetric Typography */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, textAlign: 'left' }}>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)' }}>
            INTELLIGENT OPERATING SYSTEM
          </div>

          <h1 style={{ fontSize: 64, fontWeight: 800, color: '#fff5e6', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Your work,<br />
            <span style={{ color: '#ffcc66' }}>understood.</span>
          </h1>

          <p style={{ fontSize: 18, color: '#d99a4e', lineHeight: 1.6, maxWidth: 520, margin: 0 }}>
            Your AI should know what you’re working on, not just what you typed into a chat box. Syntrophos connects the context, communication, and execution behind your work.
          </p>

          <div style={{ display: 'flex', gap: 16, paddingTop: 12 }}>
            <Button
              variant="primary"
              size="md"
              className="public-btn-tactile"
              onClick={() => navigate('/sign-up')}
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', padding: '14px 32px', fontSize: 13 }}
            >
              [ GET STARTED ]
            </Button>
            <a
              href="#story-section-1"
              className="public-btn-tactile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 28px',
                border: '1px solid rgba(255, 170, 48, 0.3)',
                borderRadius: 4,
                color: '#fff5e6',
                textDecoration: 'none',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            >
              Explore the OS
            </a>
          </div>
        </div>

        {/* Right Column: Hero Product Preview Frame */}
        <div style={{ background: '#090502', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 12, padding: '24px', boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 170, 48, 0.15)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
              <span style={{ fontSize: 11, color: '#ffcc66', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>SYNTHROPHOS OS // OPERATIONAL ENGINE</span>
            </div>
            <span style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>LIVE CONTEXT MATRIX</span>
          </div>

          <div style={{ background: 'rgba(18, 9, 2, 0.9)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 8, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>ACTIVE OPERATIONAL STREAM</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff5e6' }}>Syntrophos V1 Release Workspace</div>
            <div style={{ fontSize: 12, color: '#885522', fontFamily: 'var(--font-mono)' }}>12 Tasks · 4 Notes · 3 Meetings · 2 Active Agents</div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: '#ffaa30' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SCROLL-DRIVEN 01 → 05 STORYTELLING CONTAINER */}
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48, position: 'relative' }}>
        {/* Sticky Desktop Progression Sidebar */}
        <aside
          style={{
            position: 'sticky',
            top: 100,
            height: 'fit-content',
            padding: '24px 16px',
            background: 'rgba(7, 3, 1, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 170, 48, 0.2)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            zIndex: 40,
          }}
        >
          <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', fontWeight: 'bold', marginBottom: 4 }}>
            PRODUCT STORY
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
            {storySteps.map((step) => {
              const isActive = activeStoryStep === step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => scrollToStep(step.num)}
                  style={{
                    background: isActive ? 'rgba(255, 170, 48, 0.12)' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #ffaa30' : '3px solid transparent',
                    padding: '8px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '0 4px 4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: isActive ? 1 : 0.45,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: isActive ? '#ffaa30' : '#885522' }}>
                    0{step.num}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#ffcc66' : '#d99a4e' }}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Story Content Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 90 }}>
          {/* SECTION 01: THE PROBLEM */}
          <div
            ref={section1Ref}
            id="story-section-1"
            data-story-step="1"
            style={{
              scrollMarginTop: 120,
              opacity: activeStoryStep === 1 ? 1 : 0.7,
              transform: activeStoryStep === 1 ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              borderTop: '1px solid rgba(255, 170, 48, 0.15)',
              paddingTop: 60,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)' }}>
                01 // THE PROBLEM
              </div>

              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#fff5e6', lineHeight: 1.2, maxWidth: 840 }}>
                Your work is scattered. Messages live in one app, tasks in another, meetings somewhere else, and AI in an isolated chat window.
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, paddingTop: 12 }}>
                <div style={{ borderLeft: '2px solid rgba(255, 85, 51, 0.4)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ff5533', fontFamily: 'var(--font-mono)' }}>SCATTERED CONTEXT</div>
                  <div style={{ fontSize: 13, color: '#885522', lineHeight: 1.6 }}>
                    AI assistants ask "How can I help today?" without any idea what projects, tasks, or deadlines you are working towards.
                  </div>
                </div>

                <div style={{ borderLeft: '2px solid rgba(52, 211, 153, 0.4)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#34d399', fontFamily: 'var(--font-mono)' }}>SYNTHROPHOS CONNECTED WORK</div>
                  <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>
                    Syntrophos maintains a connected workspace graph—giving AI the structural context required to actually execute tasks.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 02: PRODUCT SHOWCASE */}
          <div
            ref={section2Ref}
            id="story-section-2"
            data-story-step="2"
            style={{
              scrollMarginTop: 120,
              opacity: activeStoryStep === 2 ? 1 : 0.7,
              transform: activeStoryStep === 2 ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              borderTop: '1px solid rgba(255, 170, 48, 0.15)',
              paddingTop: 60,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                  02 // PRODUCT SHOWCASE
                </div>
                <h2 style={{ fontSize: 38, fontWeight: 800, color: '#fff5e6', letterSpacing: '-0.02em' }}>
                  ONE ENVIRONMENT. NOT ANOTHER AI TAB.
                </h2>
              </div>

              {/* Showcase Tab Navigation */}
              <div style={{ display: 'flex', gap: 10 }}>
                {(['dashboard', 'intelligence', 'knowledge', 'inbox'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveShowcaseTab(t)}
                    style={{
                      background: activeShowcaseTab === t ? 'rgba(120, 60, 0, 0.6)' : 'transparent',
                      border: activeShowcaseTab === t ? '1px solid rgba(255, 170, 48, 0.6)' : '1px solid rgba(255, 170, 48, 0.2)',
                      color: activeShowcaseTab === t ? '#ffcc66' : '#885522',
                      borderRadius: 4,
                      padding: '8px 18px',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Dynamic Interactive Frame */}
              <div style={{ background: '#070401', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 10, padding: '28px', boxShadow: '0 20px 80px rgba(0, 0, 0, 0.9)' }}>
                {activeShowcaseTab === 'dashboard' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>DASHBOARD &amp; CORE // SPATIAL OPERATIONAL MATRIX</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff5e6' }}>Unified Operational Overview</div>
                    <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6, maxWidth: 640 }}>
                      Real-time dashboard integrating active agent runs, urgent inbox notifications, task deadlines, and spatial 3D memory orb telemetry.
                    </div>
                  </div>
                )}

                {activeShowcaseTab === 'intelligence' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>INTELLIGENCE CONTROL CENTER // AGENTS &amp; WORKFLOWS</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff5e6' }}>Planner &amp; Researcher Autonomous Agents</div>
                    <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6, maxWidth: 640 }}>
                      Automate recurring work with natural language workflow pipelines and specialized autonomous operators.
                    </div>
                  </div>
                )}

                {activeShowcaseTab === 'knowledge' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>KNOWLEDGE MATRIX // PROVENANCE &amp; TELEMETRY</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff5e6' }}>Connected Source Intelligence</div>
                    <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6, maxWidth: 640 }}>
                      Understand where information comes from, which documents agents depend on most, and how knowledge flows into execution.
                    </div>
                  </div>
                )}

                {activeShowcaseTab === 'inbox' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>INBOX // UNIFIED COMMUNICATIONS &amp; ATTENTION</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff5e6' }}>Human &amp; Agent Attention Center</div>
                    <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6, maxWidth: 640 }}>
                      Human messages, agent approval requests, and system alerts unified into one prioritize attention layer.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 03: AGENTIC EXECUTION */}
          <div
            ref={section3Ref}
            id="story-section-3"
            data-story-step="3"
            style={{
              scrollMarginTop: 120,
              opacity: activeStoryStep === 3 ? 1 : 0.7,
              transform: activeStoryStep === 3 ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              borderTop: '1px solid rgba(255, 170, 48, 0.15)',
              paddingTop: 60,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                  03 // AGENTIC EXECUTION
                </div>
                <h2 style={{ fontSize: 38, fontWeight: 700, color: '#fff5e6', lineHeight: 1.2 }}>
                  From context to execution.
                </h2>
              </div>

              {/* Interactive Workflow Progressive Reveal Steps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {[
                  { num: 1, title: 'CLIENT MESSAGE', desc: 'Incoming request received' },
                  { num: 2, title: 'RESEARCHER', desc: 'Retrieves knowledge context' },
                  { num: 3, title: 'PLANNER', desc: 'Creates proposed milestone plan' },
                  { num: 4, title: 'APPROVAL', desc: 'Human reviews & approves' },
                  { num: 5, title: 'TASKS & CALENDAR', desc: 'Work organized automatically' },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="public-interactive-card"
                    onClick={() => setActiveWorkflowStep(step.num)}
                    style={{
                      background: activeWorkflowStep === step.num ? 'rgba(20, 10, 2, 0.95)' : 'rgba(12, 6, 1, 0.6)',
                      border: activeWorkflowStep === step.num ? '1px solid #ffaa30' : '1px solid rgba(255, 170, 48, 0.2)',
                      borderRadius: 6,
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>STEP 0{step.num}</div>
                    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff5e6' }}>{step.title}</div>
                    <div style={{ fontSize: 10, color: '#885522' }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 04: HUMAN CONTROL */}
          <div
            ref={section4Ref}
            id="story-section-4"
            data-story-step="4"
            style={{
              scrollMarginTop: 120,
              opacity: activeStoryStep === 4 ? 1 : 0.7,
              transform: activeStoryStep === 4 ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              borderTop: '1px solid rgba(255, 170, 48, 0.15)',
              paddingTop: 60,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                  04 // HUMAN CONTROL
                </div>
                <h2 style={{ fontSize: 34, fontWeight: 700, color: '#fff5e6', lineHeight: 1.2, marginBottom: 14 }}>
                  Autonomous execution. Consequential decisions stay yours.
                </h2>
                <p style={{ fontSize: 14, color: '#d99a4e', lineHeight: 1.6 }}>
                  Syntrophos handles the heavy lifting while giving you explicit human-in-the-loop approval checkpoints before key actions take effect.
                </p>
              </div>

              <div style={{ background: 'rgba(14, 7, 1, 0.95)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>AGENT PROPOSED ACTION // APPROVAL CHECKPOINT</div>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff5e6' }}>Planner Agent requested 6 task creations &amp; calendar invite</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button type="button" className="public-btn-tactile" style={{ background: '#ffaa30', border: 'none', borderRadius: 4, color: '#000000', padding: '8px 16px', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}>[ APPROVE ]</button>
                  <button type="button" className="public-btn-tactile" style={{ background: 'transparent', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, color: '#ffcc66', padding: '8px 16px', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Review Details</button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 05: ADAPTABLE MATRIX */}
          <div
            ref={section5Ref}
            id="story-section-5"
            data-story-step="5"
            style={{
              scrollMarginTop: 120,
              opacity: activeStoryStep === 5 ? 1 : 0.7,
              transform: activeStoryStep === 5 ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              borderTop: '1px solid rgba(255, 170, 48, 0.15)',
              paddingTop: 60,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, textAlign: 'left' }}>
              <div>
                <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                  05 // ADAPTABLE MATRIX
                </div>
                <h2 style={{ fontSize: 34, fontWeight: 700, color: '#fff5e6' }}>PERSONAL + BUSINESS</h2>
              </div>

              <div style={{ display: 'flex', gap: 8, background: 'rgba(16, 8, 2, 0.8)', padding: 6, borderRadius: 6, border: '1px solid rgba(255, 170, 48, 0.25)', width: 'fit-content' }}>
                <button
                  type="button"
                  onClick={() => setDualMode('personal')}
                  style={{
                    background: dualMode === 'personal' ? '#ffaa30' : 'transparent',
                    color: dualMode === 'personal' ? '#000000' : '#d99a4e',
                    border: 'none',
                    borderRadius: 4,
                    padding: '8px 24px',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  [ PERSONAL WORKSPACE ]
                </button>
                <button
                  type="button"
                  onClick={() => setDualMode('business')}
                  style={{
                    background: dualMode === 'business' ? '#ffaa30' : 'transparent',
                    color: dualMode === 'business' ? '#000000' : '#d99a4e',
                    border: 'none',
                    borderRadius: 4,
                    padding: '8px 24px',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  [ BUSINESS WORKSPACE ]
                </button>
              </div>

              <div style={{ background: 'rgba(14, 7, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 8, padding: '32px', width: '100%' }}>
                {dualMode === 'personal' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>Personal Life, Schedule &amp; Knowledge</div>
                    <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>
                      Organize your daily tasks, personal schedule, notes, thoughts, and personal document vault in one serene workspace.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>Team Operations &amp; Agent Workflows</div>
                    <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>
                      Coordinate business projects, team communication, agent workflows, and operational knowledge matrices across your organization.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EDITORIAL FINAL CTA */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.2)', background: 'rgba(10, 5, 1, 0.95)', padding: '120px 48px', marginTop: 100, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <h2 style={{ fontSize: 44, fontWeight: 800, color: '#fff5e6', letterSpacing: '-0.02em', maxWidth: 800, lineHeight: 1.15 }}>
          YOUR WORK IS ALREADY CONNECTED. SYNTHROPHOS MAKES IT ACTIONABLE.
        </h2>
        <Button
          variant="primary"
          size="md"
          className="public-btn-tactile"
          onClick={() => navigate('/sign-up')}
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', padding: '16px 40px', fontSize: 14, marginTop: 12 }}
        >
          [ GET STARTED NOW ]
        </Button>
      </section>
    </div>
  );
}
