import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/primitives.js';
import {
  IconChevronRight,
  IconPlus,
  IconCheckCircle,
  IconDashboard,
  IconMail,
  IconTasks,
  IconFolder,
  IconCalendar,
  IconBot,
  IconGraph,
} from '@/lib/icons.js';

export type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'WHAT IS SYNTHROPHOS?',
    answer: 'Syntrophos is an AI-native workspace designed to help you understand, organize, and execute work. Instead of treating AI as an isolated chatbot, Syntrophos connects your conversations, tasks, projects, schedule, knowledge, agents, and workflows into one unified environment.',
  },
  {
    question: 'HOW IS SYNTHROPHOS DIFFERENT FROM A NORMAL AI ASSISTANT?',
    answer: 'Traditional AI assistants operate inside isolated text windows with zero context about your ongoing work. Syntrophos maintains a connected workspace graph—understanding relationships between your projects, contacts, notes, and tasks so AI agents can act with actual contextual intelligence.',
  },
  {
    question: 'WHAT ARE AGENTS?',
    answer: 'Agents are specialized, autonomous AI operators designed to perform specific tasks—such as research retrieval, milestone breakdown, or automated code review—using the shared context available within Syntrophos.',
  },
  {
    question: 'WHAT ARE WORKFLOWS?',
    answer: 'Workflows are natural language automation pipelines that coordinate agents, triggers, conditions, and human approval steps to execute recurring operational routines.',
  },
  {
    question: 'CAN I USE SYNTHROPHOS PERSONALLY?',
    answer: 'Yes. Syntrophos features dual workspace modes: Personal mode for organizing your personal schedule, notes, communications, and knowledge; and Business mode for team projects, workflows, and operations.',
  },
  {
    question: 'CAN BUSINESSES USE SYNTHROPHOS?',
    answer: 'Syntrophos is built to coordinate business projects, team communications, agent workflows, and operational knowledge matrices seamlessly.',
  },
  {
    question: 'WHAT INFORMATION DOES SYNTHROPHOS USE?',
    answer: 'Syntrophos uses the information you explicitly connect to your workspace—such as notes, project tasks, calendar events, documents, and messages—to construct your local knowledge graph.',
  },
  {
    question: 'DO AGENTS ACT WITHOUT MY APPROVAL?',
    answer: 'No. Important agent actions and workflow executions support explicit human approval checkpoints, keeping you in full control of critical outputs and state changes.',
  },
  {
    question: 'WHAT INTEGRATIONS ARE SUPPORTED?',
    answer: 'Syntrophos currently integrates with standard workspace formats (Markdown, PDF, vector repositories) and provides structured contracts for local LLM providers (OpenAI, Ollama, Anthropic) and webhooks.',
  },
  {
    question: 'IS MY DATA PRIVATE?',
    answer: 'Yes. Syntrophos is designed around local-first data principles and explicit provider permissions, ensuring your workspace context and knowledge graph remain private to your instance.',
  },
  {
    question: 'CAN I CONNECT MY OWN SERVICES?',
    answer: 'Yes. Syntrophos supports custom AI provider configurations, custom API keys, and local model endpoints like Ollama for completely private local execution.',
  },
  {
    question: 'IS SYNTHROPHOS FREE?',
    answer: 'Syntrophos is available as an open-architecture workspace with local execution capabilities. Future cloud sync and team collaboration features will offer dedicated tiering.',
  },
];

export default function AboutFaqPage() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div style={{ background: '#000000', color: '#fff5e6', minHeight: '100vh', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      {/* 1. PUBLIC NAVIGATION */}
      <header style={{ borderBottom: '1px solid rgba(255, 170, 48, 0.2)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8, 4, 1, 0.95)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffaa30', boxShadow: '0 0 10px rgba(255, 170, 48, 0.8)' }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', letterSpacing: '0.12em', color: '#ffcc66', fontFamily: 'var(--font-mono)' }}>
            SYNTHROPHOS
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, fontWeight: 500 }}>
          <a href="#about" style={{ color: '#d99a4e', textDecoration: 'none' }}>About</a>
          <a href="#architecture" style={{ color: '#d99a4e', textDecoration: 'none' }}>Architecture</a>
          <a href="#capabilities" style={{ color: '#d99a4e', textDecoration: 'none' }}>Capabilities</a>
          <a href="#faq" style={{ color: '#d99a4e', textDecoration: 'none' }}>FAQ</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} style={{ color: '#ffcc66', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold' }}>
            [ GET STARTED ]
          </Button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="about" style={{ padding: '100px 40px 80px 40px', maxWidth: 1100, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', background: 'rgba(255, 170, 48, 0.1)', padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(255, 170, 48, 0.3)' }}>
          SYNTHROPHOS // AI OPERATING SYSTEM
        </div>

        <h1 style={{ fontSize: 48, fontWeight: 800, color: '#fff5e6', lineHeight: 1.15, letterSpacing: '-0.02em', maxWidth: 900 }}>
          THE INTELLIGENT OPERATING SYSTEM FOR YOUR WORK.
        </h1>

        <p style={{ fontSize: 18, color: '#d99a4e', lineHeight: 1.6, maxWidth: 720 }}>
          Syntrophos brings your conversations, tasks, projects, schedule, knowledge, agents, and workflows into one connected intelligent environment.
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard')} style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', padding: '12px 28px' }}>
            [ GET STARTED ]
          </Button>
          <a href="#capabilities" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 28px', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, color: '#ffcc66', textDecoration: 'none', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            Explore Syntrophos
          </a>
        </div>
      </section>

      {/* 3. WHAT IS SYNTHROPHOS */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', borderBottom: '1px solid rgba(255, 170, 48, 0.15)', background: 'rgba(10, 5, 1, 0.6)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
              WHAT IS SYNTHROPHOS?
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff5e6', lineHeight: 1.25, marginBottom: 16 }}>
              A connected workspace built around contextual intelligence.
            </h2>
          </div>

          <div style={{ fontSize: 15, color: '#d99a4e', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p>
              Syntrophos is an AI-native workspace designed to help you understand, organize, and operate on the work around you.
            </p>
            <p>
              Instead of treating AI as an isolated chatbot sitting beside your tools, Syntrophos connects your information graph—giving AI the structural context required to actually help execute work.
            </p>
          </div>
        </div>
      </section>

      {/* 4. THE SYNTHROPHOS MODEL */}
      <section id="architecture" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
            PRODUCT ARCHITECTURE
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>THE SYNTHROPHOS MODEL</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { step: '01', title: 'CONTEXT', desc: 'Your conversations, projects, notes, schedule, files, and knowledge graph.' },
            { step: '02', title: 'INTELLIGENCE', desc: 'Autonomous agents that understand context and workflows that coordinate them.' },
            { step: '03', title: 'ACTION', desc: 'Tasks, communications, scheduling, research, and operational execution.' },
            { step: '04', title: 'RESULT', desc: 'Work completed, information updated, and state kept perfectly in sync.' },
          ].map((m) => (
            <div key={m.step} style={{ background: 'rgba(14, 7, 1, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m.step} //</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>{m.title}</div>
              <div style={{ fontSize: 12, color: '#d99a4e', lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CORE PRODUCT CAPABILITIES */}
      <section id="capabilities" style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', background: 'rgba(6, 3, 1, 0.8)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
              UNIFIED WORKSPACE MODULES
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>CORE CAPABILITIES</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {[
              { icon: IconDashboard, title: 'COMMAND CENTER', desc: 'Your operational overview bringing together runs, tasks, and system state.' },
              { icon: IconMail, title: 'INBOX', desc: 'Human and agent communications unified in one attention layer.' },
              { icon: IconTasks, title: 'TASKS', desc: 'Turn intentions and agent outputs into structured execution.' },
              { icon: IconFolder, title: 'PROJECTS', desc: 'Connect work, notes, calendar events, agents, and progress.' },
              { icon: IconCalendar, title: 'PEOPLE & SCHEDULE', desc: 'People, meetings, and your calendar in one connected workspace.' },
              { icon: IconBot, title: 'INTELLIGENCE', desc: 'Autonomous agents and workflows that execute structured work.' },
              { icon: IconGraph, title: 'KNOWLEDGE MATRIX', desc: 'Understand where information comes from and how it is used.' },
            ].map((cap) => {
              const IconComp = cap.icon;
              return (
                <div key={cap.title} style={{ background: 'rgba(12, 6, 1, 0.9)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ color: '#ffaa30' }}>
                    <IconComp width={24} height={24} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66' }}>{cap.title}</div>
                  <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.5 }}>{cap.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. WHY SYNTHROPHOS (DIFFERENTIATION) */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
            KEY DIFFERENTIATORS
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>WHY SYNTHROPHOS?</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {[
            { title: 'CONTEXT OVER CHAT', desc: 'Syntrophos is designed around the connected context surrounding work, not just a conversation window.' },
            { title: 'AGENTS OVER ANSWERS', desc: 'Agents operate on tasks and workflows rather than only returning isolated text answers.' },
            { title: 'HUMAN CONTROL', desc: 'Important actions and state changes support explicit approval checkpoints.' },
            { title: 'ONE OPERATING ENVIRONMENT', desc: 'Information across your workspace becomes connected, structured, and actionable.' },
          ].map((item) => (
            <div key={item.title} style={{ background: 'rgba(14, 7, 1, 0.8)', border: '1px solid rgba(255, 170, 48, 0.25)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#ffcc66', fontFamily: 'var(--font-mono)' }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PERSONAL + BUSINESS */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', background: 'rgba(8, 4, 1, 0.9)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
              DUAL WORKSPACE MATRIX
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>PERSONAL + BUSINESS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div style={{ background: 'rgba(16, 8, 2, 0.9)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 8, padding: '32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>PERSONAL MODE //</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffcc66' }}>Personal Life &amp; Execution</div>
              <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>
                Organize your life, tasks, schedule, notes, communications, and personal knowledge vault.
              </div>
            </div>

            <div style={{ background: 'rgba(16, 8, 2, 0.9)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 8, padding: '32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>BUSINESS MODE //</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffcc66' }}>Team Operations &amp; Workflows</div>
              <div style={{ fontSize: 13, color: '#d99a4e', lineHeight: 1.6 }}>
                Coordinate projects, people, communications, agents, workflows, and operational knowledge matrices.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section id="faq" style={{ padding: '100px 40px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff5e6' }}>FREQUENTLY ASKED QUESTIONS</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.question}
                style={{
                  background: 'rgba(12, 6, 1, 0.9)',
                  border: isOpen ? '1px solid rgba(255, 170, 48, 0.5)' : '1px solid rgba(255, 170, 48, 0.2)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'transparent',
                    border: 'none',
                    color: isOpen ? '#ffcc66' : '#fff5e6',
                    textAlign: 'left',
                    fontSize: 14,
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{faq.question}</span>
                  <span style={{ fontSize: 18, color: '#ffaa30', fontFamily: 'var(--font-mono)' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 24px 20px 24px', fontSize: 13, color: '#d99a4e', lineHeight: 1.7, borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 16 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section style={{ borderTop: '1px solid rgba(255, 170, 48, 0.2)', background: 'rgba(14, 7, 1, 0.95)', padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff5e6', letterSpacing: '-0.01em' }}>
          READY TO BUILD YOUR OWN INTELLIGENT WORKSPACE?
        </h2>
        <p style={{ fontSize: 16, color: '#d99a4e', maxWidth: 560 }}>
          Bring your work, context, and AI into one connected operational environment.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/dashboard')} style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', padding: '12px 32px', marginTop: 12 }}>
          [ GET STARTED NOW ]
        </Button>
      </section>

      {/* 10. PUBLIC FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', background: '#030201', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, fontSize: 12, color: '#885522', fontFamily: 'var(--font-mono)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#ffcc66', fontWeight: 'bold' }}>SYNTHROPHOS</span>
          <span>© 2026 Syntrophos Systems. All rights reserved.</span>
        </div>

        <div style={{ display: 'flex', gap: 24, color: '#d99a4e' }}>
          <a href="#about" style={{ color: '#d99a4e', textDecoration: 'none' }}>About</a>
          <a href="#faq" style={{ color: '#d99a4e', textDecoration: 'none' }}>FAQ</a>
          <span style={{ color: '#885522' }}>Privacy</span>
          <span style={{ color: '#885522' }}>Terms</span>
          <span style={{ color: '#885522' }}>Contact</span>
        </div>
      </footer>
    </div>
  );
}
