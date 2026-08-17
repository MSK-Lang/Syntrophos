import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/primitives.js';
import { IconSearch } from '@/lib/icons.js';

export type CategorizedFaq = {
  readonly category: 'GENERAL' | 'PRODUCT' | 'AI & AGENTS' | 'PRIVACY' | 'BUSINESS';
  readonly items: readonly {
    readonly question: string;
    readonly answer: string;
  }[];
};

const FAQ_CATEGORIES: readonly CategorizedFaq[] = [
  {
    category: 'GENERAL',
    items: [
      {
        question: 'What is Syntrophos?',
        answer: 'Syntrophos is an AI-native workspace designed to help you understand, organize, and execute work. Instead of treating AI as an isolated chatbot, Syntrophos connects your conversations, tasks, projects, schedule, knowledge, agents, and workflows into one unified environment.',
      },
      {
        question: 'Who is Syntrophos for?',
        answer: 'Syntrophos is designed for builders, operators, researchers, and teams who manage complex, interconnected projects and want an AI operating system that understands full workspace context.',
      },
      {
        question: 'How does Syntrophos differ from a normal AI assistant?',
        answer: 'Traditional AI assistants operate inside isolated text windows with zero context about your ongoing work. Syntrophos maintains a connected workspace graph—understanding relationships between your projects, contacts, notes, and tasks so AI agents can act with actual contextual intelligence.',
      },
    ],
  },
  {
    category: 'AI & AGENTS',
    items: [
      {
        question: 'What are agents?',
        answer: 'Agents are specialized, autonomous AI operators designed to perform specific tasks—such as research retrieval, milestone breakdown, or automated code review—using the shared context available within Syntrophos.',
      },
      {
        question: 'What are workflows?',
        answer: 'Workflows are natural language automation pipelines that coordinate agents, triggers, conditions, and human approval steps to execute recurring operational routines.',
      },
      {
        question: 'Can agents act without approval?',
        answer: 'No. Important agent actions and workflow executions support explicit human-in-the-loop approval checkpoints, keeping you in full control of critical outputs and state changes.',
      },
      {
        question: 'How does Syntrophos use context?',
        answer: 'Syntrophos maps relationships between your active tasks, notes, documents, and calendar meetings into a local context matrix, allowing agents to retrieve relevant information before executing work.',
      },
    ],
  },
  {
    category: 'PRODUCT',
    items: [
      {
        question: 'What can I use Syntrophos for?',
        answer: 'You can use Syntrophos to manage project pipelines, run agent workflows, track personal/business schedules, maintain connected knowledge vaults, and prioritize communications.',
      },
      {
        question: 'Can I use it personally?',
        answer: 'Yes. Syntrophos features dual workspace modes: Personal mode for organizing your personal schedule, notes, communications, and knowledge; and Business mode for team projects and operations.',
      },
      {
        question: 'Can businesses use it?',
        answer: 'Syntrophos is built to coordinate business projects, team communications, agent workflows, and operational knowledge matrices seamlessly.',
      },
      {
        question: 'What integrations are available?',
        answer: 'Syntrophos currently integrates with standard workspace formats (Markdown, PDF, vector repositories) and provides structured contracts for local LLM providers (OpenAI, Ollama, Anthropic) and webhooks.',
      },
    ],
  },
  {
    category: 'PRIVACY',
    items: [
      {
        question: 'What information does Syntrophos use?',
        answer: 'Syntrophos uses the information you explicitly connect to your workspace—such as notes, project tasks, calendar events, documents, and messages—to construct your local knowledge graph.',
      },
      {
        question: 'Is my data private?',
        answer: 'Yes. Syntrophos is designed around local-first data principles and explicit provider permissions, ensuring your workspace context and knowledge graph remain private to your instance.',
      },
      {
        question: 'How is connected information handled?',
        answer: 'Information connected to Syntrophos remains within your local application state and is only passed to configured AI providers when performing explicit retrieval or execution tasks.',
      },
    ],
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState<string | null>('What is Syntrophos?');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const toggleQuestion = (q: string) => {
    setOpenQuestion((prev) => (prev === q ? null : q));
  };

  return (
    <div style={{ padding: '80px 40px', maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* HERO */}
      <section style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)' }}>
          FREQUENTLY ASKED QUESTIONS
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 800, color: '#fff5e6', letterSpacing: '-0.02em' }}>
          QUESTIONS, ANSWERED.
        </h1>

        <p style={{ fontSize: 17, color: '#d99a4e', maxWidth: 640 }}>
          Everything you need to know about Syntrophos, AI agents, context graphs, and privacy.
        </p>

        {/* SEARCH BAR */}
        <div style={{ maxWidth: 540, marginTop: 12 }}>
          <Input
            placeholder="Search frequently asked questions… (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leading={<IconSearch width={16} height={16} />}
            style={{ background: 'rgba(16, 8, 2, 0.9)', borderColor: 'rgba(255, 170, 48, 0.3)', color: '#ffcc66', padding: '12px 16px', fontSize: 13 }}
          />
        </div>
      </section>

      {/* CATEGORIZED ACCORDIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {filteredCategories.map((cat) => (
          <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255, 170, 48, 0.2)', paddingBottom: 8 }}>
              {cat.category} //
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cat.items.map((item) => {
                const isOpen = openQuestion === item.question;
                return (
                  <div
                    key={item.question}
                    style={{
                      background: 'rgba(12, 6, 1, 0.9)',
                      border: isOpen ? '1px solid rgba(255, 170, 48, 0.5)' : '1px solid rgba(255, 170, 48, 0.2)',
                      borderRadius: 8,
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleQuestion(item.question)}
                      style={{
                        width: '100%',
                        padding: '18px 24px',
                        background: 'transparent',
                        border: 'none',
                        color: isOpen ? '#ffcc66' : '#fff5e6',
                        textAlign: 'left',
                        fontSize: 15,
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{item.question}</span>
                      <span style={{ fontSize: 18, color: '#ffaa30', fontFamily: 'var(--font-mono)' }}>
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 24px 20px 24px', fontSize: 14, color: '#d99a4e', lineHeight: 1.7, borderTop: '1px solid rgba(255, 170, 48, 0.15)', paddingTop: 16 }}>
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
