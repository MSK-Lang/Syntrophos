import { useState, useMemo } from 'react';
import { useBusiness } from '@/lib/services/business/useBusiness.js';
import type { WorkflowNode, AutonomyPolicy } from '@/lib/services/business/business.contract.js';
import {
  IconCheckCircle,
  IconBot,
  IconTasks,
  IconPlay,
  IconPause,
} from '@/lib/icons.js';

type NodeFilter = 'ALL' | 'ACTIVE' | 'BLOCKED' | 'AWAITING APPROVAL' | 'AGENTS' | 'HUMANS' | 'COMPLETED';

export default function BusinessFulfillmentPage() {
  const {
    workflows,
    objectives,
    agents,
    team,
    activities,
    approveNode,
    resolveBlocker,
    retryNode,
    reassignNode,
    pauseWorkflow,
    resumeWorkflow,
    retryFailedNodes,
    rejectNode,
    snoozeNode,
  } = useBusiness();

  // Selected workflow
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    workflows[0]?.id ?? 'wf-1'
  );

  // Layer 3: Inspection drawer is HIDDEN by default (selectedNodeId: null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Filter for nodes in graph
  const [activeFilter, setActiveFilter] = useState<NodeFilter>('ALL');

  // Live activity section is COLLAPSIBLE and collapsed by default
  const [liveActivityExpanded, setLiveActivityExpanded] = useState<boolean>(false);

  // Reassignment modal
  const [reassignModalOpen, setReassignModalOpen] = useState<boolean>(false);

  // Temporary feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentWorkflow =
    workflows.find((w) => w.id === selectedWorkflowId) ?? workflows[0];

  const currentObjective = useMemo(() => {
    if (!currentWorkflow) return objectives[0];
    return objectives.find((o) => o.id === currentWorkflow.objectiveId) ?? objectives[0];
  }, [currentWorkflow, objectives]);

  const selectedNode = useMemo(() => {
    if (!currentWorkflow || !selectedNodeId) return null;
    return currentWorkflow.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [currentWorkflow, selectedNodeId]);

  // Derived operational stats for Layer 1 compact status bar
  const stats = useMemo(() => {
    if (!currentWorkflow) {
      return {
        fulfillmentRate: 68,
        completed: 4,
        inProgress: 0,
        awaitingApproval: 1,
        blocked: 0,
        failed: 0,
        activeWorkers: 8,
        agentCount: 4,
        humanCount: 4,
      };
    }

    const nodes = currentWorkflow.nodes;
    const completed = nodes.filter((n) => n.autonomyState === 'completed' || n.autonomyState === 'verified').length;
    const inProgress = nodes.filter((n) => n.autonomyState === 'executing').length;
    const awaitingApproval = nodes.filter((n) => n.autonomyState === 'awaiting_approval').length;
    const blocked = nodes.filter((n) => n.autonomyState === 'blocked').length;
    const failed = nodes.filter((n) => n.autonomyState === 'failed').length;

    const activeAgents = agents.filter((a) => a.status === 'active' || a.status === 'executing').length;
    const activeHumans = 4;

    return {
      fulfillmentRate: currentWorkflow.progress,
      completed,
      inProgress,
      awaitingApproval,
      blocked,
      failed,
      activeWorkers: activeAgents + activeHumans,
      agentCount: activeAgents,
      humanCount: activeHumans,
    };
  }, [currentWorkflow, agents]);

  // Current phase name
  const currentPhase = useMemo(() => {
    if (!currentWorkflow) return 'Execution';
    const active = currentWorkflow.nodes.find((n) => n.autonomyState === 'executing' || n.autonomyState === 'awaiting_approval');
    if (active) return active.stage.toUpperCase();
    if (currentWorkflow.nodes.every((n) => n.autonomyState === 'completed')) return 'VERIFIED OUTCOME';
    return 'EXECUTION';
  }, [currentWorkflow]);

  // Node dependencies for inspection drawer
  const nodeDependencies = useMemo(() => {
    if (!selectedNode || !currentWorkflow) return { upstream: [], downstream: [] };
    const upstream = currentWorkflow.nodes.filter((n) => selectedNode.dependencies.includes(n.id));
    const downstream = currentWorkflow.nodes.filter((n) => n.dependencies.includes(selectedNode.id));
    return { upstream, downstream };
  }, [selectedNode, currentWorkflow]);

  // Filtered nodes logic
  const filteredNodes = useMemo(() => {
    if (!currentWorkflow) return [];
    const nodes = currentWorkflow.nodes;
    switch (activeFilter) {
      case 'ACTIVE':
        return nodes.filter((n) => n.autonomyState === 'executing');
      case 'BLOCKED':
        return nodes.filter((n) => n.autonomyState === 'blocked');
      case 'AWAITING APPROVAL':
        return nodes.filter((n) => n.autonomyState === 'awaiting_approval');
      case 'AGENTS':
        return nodes.filter((n) => n.executorType === 'agent');
      case 'HUMANS':
        return nodes.filter((n) => n.executorType === 'human');
      case 'COMPLETED':
        return nodes.filter((n) => n.autonomyState === 'completed' || n.autonomyState === 'verified');
      case 'ALL':
      default:
        return nodes;
    }
  }, [currentWorkflow, activeFilter]);

  // Group nodes into DAG graph tiers for Level 2 visualization
  const graphTiers = useMemo(() => {
    if (!currentWorkflow) return [];
    const nodes = currentWorkflow.nodes;

    // Stage 1: Intake / Ingestion (no dependencies)
    const tier1 = nodes.filter((n) => n.dependencies.length === 0);
    const tier1Ids = new Set(tier1.map((n) => n.id));

    // Stage 2: Parallel execution streams (depend on Stage 1)
    const tier2 = nodes.filter((n) => !tier1Ids.has(n.id) && n.dependencies.every((d) => tier1Ids.has(d)));
    const tier2Ids = new Set([...tier1Ids, ...tier2.map((n) => n.id)]);

    // Stage 3: Human Verification Gates / Convergence (depend on Stage 2)
    const tier3 = nodes.filter((n) => !tier2Ids.has(n.id) && n.dependencies.some((d) => tier2.some((t2) => t2.id === d)));
    const tier3Ids = new Set([...tier2Ids, ...tier3.map((n) => n.id)]);

    // Stage 4: Deliverables, Verification & Outcome
    const tier4 = nodes.filter((n) => !tier3Ids.has(n.id));

    return [
      { id: 'tier-1', title: 'INTAKE & INGESTION', nodes: tier1 },
      { id: 'tier-2', title: 'PARALLEL EXECUTION', nodes: tier2 },
      { id: 'tier-3', title: 'HUMAN GATE', nodes: tier3 },
      { id: 'tier-4', title: 'DELIVERY & OUTCOME', nodes: tier4 },
    ].filter((t) => t.nodes.length > 0);
  }, [currentWorkflow]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getStatusBadge = (state: WorkflowNode['autonomyState']) => {
    switch (state) {
      case 'completed':
        return { icon: '✓', label: 'COMPLETED', bg: 'rgba(0, 200, 100, 0.15)', border: 'rgba(0, 220, 120, 0.4)', text: '#66ffaa' };
      case 'verified':
        return { icon: '✓', label: 'VERIFIED', bg: 'rgba(0, 180, 255, 0.15)', border: 'rgba(0, 200, 255, 0.4)', text: '#88ddff' };
      case 'executing':
        return { icon: '●', label: 'EXECUTING', bg: 'rgba(255, 170, 48, 0.2)', border: 'rgba(255, 170, 48, 0.6)', text: '#ffcc66' };
      case 'awaiting_approval':
        return { icon: '⚠', label: 'APPROVAL', bg: 'rgba(255, 140, 0, 0.25)', border: 'rgba(255, 170, 48, 0.7)', text: '#ffaa30' };
      case 'blocked':
        return { icon: '!', label: 'BLOCKED', bg: 'rgba(255, 60, 40, 0.25)', border: 'rgba(255, 80, 50, 0.7)', text: '#ff8877' };
      case 'failed':
        return { icon: '✗', label: 'FAILED', bg: 'rgba(255, 40, 40, 0.3)', border: 'rgba(255, 60, 60, 0.7)', text: '#ff6666' };
      default:
        return { icon: '○', label: 'SUGGESTED', bg: 'rgba(100, 100, 100, 0.12)', border: 'rgba(150, 150, 150, 0.3)', text: '#aaaaaa' };
    }
  };

  const getPolicyBadge = (policy: AutonomyPolicy) => {
    switch (policy) {
      case 'fully_autonomous':
        return { label: 'Fully Autonomous', color: '#66ffaa' };
      case 'low_risk_auto':
        return { label: 'Low Risk Auto', color: '#ffcc66' };
      case 'high_risk_auto':
        return { label: 'High Risk Auto', color: '#ffaa30' };
      case 'approval_required':
        return { label: 'Approval Required', color: '#ff9944' };
      case 'manual':
        return { label: 'Manual Operator', color: '#88ddff' };
    }
  };

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#000000',
        color: '#ffcc66',
        fontFamily: 'var(--font-sans)',
        padding: '20px 28px 60px 28px',
        position: 'relative',
      }}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 28,
            zIndex: 9999,
            background: 'rgba(15, 8, 2, 0.96)',
            border: '1px solid #ffaa30',
            boxShadow: '0 0 20px rgba(255, 170, 48, 0.4)',
            color: '#ffcc66',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: '#66ffaa' }}>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. PAGE HEADER (Compact, non-intrusive)                      */}
      {/* ============================================================ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#ffaa30',
              letterSpacing: '0.14em',
              marginBottom: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#ffaa30', boxShadow: '0 0 5px #ffaa30' }} />
            FULFILLMENT ENGINE // AUTONOMOUS EXECUTION
          </div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffcc66',
              margin: 0,
              letterSpacing: '0.01em',
              lineHeight: 1.2,
            }}
          >
            Fulfillment Control Center
          </h1>
          <p
            style={{
              fontSize: '11px',
              color: '#d99a4e',
              margin: '2px 0 0 0',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Coordinate humans, agents, and workflows toward verified business outcomes.
          </p>
        </div>

        {/* 6. SIMPLIFIED WORKFLOW SELECTOR (Compact tabs) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: 'rgba(20, 10, 2, 0.85)',
              padding: 3,
              borderRadius: 6,
              border: '1px solid rgba(255, 170, 48, 0.25)',
            }}
          >
            {workflows.map((wf) => {
              const isSelected = wf.id === currentWorkflow?.id;
              return (
                <button
                  key={wf.id}
                  type="button"
                  onClick={() => {
                    setSelectedWorkflowId(wf.id);
                    setSelectedNodeId(null); // Return to default Overview + Graph view
                  }}
                  style={{
                    background: isSelected ? 'rgba(255, 170, 48, 0.25)' : 'transparent',
                    color: isSelected ? '#ffcc66' : '#885522',
                    border: isSelected ? '1px solid rgba(255, 170, 48, 0.5)' : '1px solid transparent',
                    borderRadius: 4,
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  {wf.name.split(' ')[0]} {wf.name.split(' ')[1] ?? ''} · {wf.progress}%
                </button>
              );
            })}
          </div>

          {/* Small secondary line */}
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522' }}>
            Phase: <span style={{ color: '#ffaa30' }}>{currentPhase}</span> · Status:{' '}
            <span style={{ color: currentWorkflow?.status === 'blocked' ? '#ff8877' : '#66ffaa' }}>
              {currentWorkflow?.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. COMPACT FULFILLMENT STATUS BAR (Single horizontal strip)  */}
      {/* ============================================================ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: 'rgba(15, 8, 2, 0.75)',
          border: '1px solid rgba(255, 170, 48, 0.25)',
          borderRadius: 6,
          padding: '8px 16px',
          marginBottom: 12,
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: '#885522' }}>OVERALL FULFILLMENT: </span>
            <strong style={{ color: '#ffcc66', fontWeight: 700 }}>{stats.fulfillmentRate}%</strong>
          </div>
          <span style={{ color: '#885522' }}>·</span>
          <div>
            <span style={{ color: '#885522' }}>COMPLETED: </span>
            <strong style={{ color: '#66ffaa' }}>{stats.completed}</strong>
          </div>
          <span style={{ color: '#885522' }}>·</span>
          <div>
            <span style={{ color: '#885522' }}>IN PROGRESS: </span>
            <strong style={{ color: '#ffcc66' }}>{stats.inProgress}</strong>
          </div>
          <span style={{ color: '#885522' }}>·</span>
          <div>
            <span style={{ color: '#885522' }}>APPROVAL: </span>
            <strong style={{ color: '#ffaa30' }}>{stats.awaitingApproval}</strong>
          </div>
          <span style={{ color: '#885522' }}>·</span>
          <div>
            <span style={{ color: '#885522' }}>BLOCKED: </span>
            <strong style={{ color: stats.blocked > 0 ? '#ff8877' : '#885522' }}>{stats.blocked}</strong>
          </div>
          <span style={{ color: '#885522' }}>·</span>
          <div>
            <span style={{ color: '#885522' }}>FAILED: </span>
            <strong style={{ color: stats.failed > 0 ? '#ff6666' : '#885522' }}>{stats.failed}</strong>
          </div>
        </div>

        {/* Active workers breakdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#885522' }}>
          <span>ACTIVE:</span>
          <strong style={{ color: '#ffcc66' }}>{stats.activeWorkers}</strong>
          <span>({stats.agentCount} agents · {stats.humanCount} humans)</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. OBJECTIVE HEADER & CONTEXT (Concise block before graph)   */}
      {/* ============================================================ */}
      <div
        style={{
          background: 'rgba(12, 6, 2, 0.8)',
          border: '1px solid rgba(255, 170, 48, 0.25)',
          borderRadius: 6,
          padding: '10px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em' }}>
              OBJECTIVE:{' '}
            </span>
            <strong style={{ fontSize: '12px', color: '#ffcc66', fontWeight: 600 }}>
              {currentObjective?.title ?? 'Accelerate Enterprise Client Acquisition'}
            </strong>
          </div>
          <span style={{ color: '#885522' }}>·</span>
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#885522' }}>TARGET OUTCOME: </span>
            <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 500 }}>
              {currentObjective?.targetOutcome ?? 'Signed enterprise client + fully provisioned production environment'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: 3,
              background: currentObjective?.status === 'on_track' ? 'rgba(0, 200, 100, 0.15)' : 'rgba(255, 170, 48, 0.15)',
              border: currentObjective?.status === 'on_track' ? '1px solid rgba(0, 200, 100, 0.3)' : '1px solid rgba(255, 170, 48, 0.3)',
              color: currentObjective?.status === 'on_track' ? '#66ffaa' : '#ffcc66',
              fontSize: '9px',
              fontWeight: 700,
            }}
          >
            STATUS: {currentObjective?.status === 'on_track' ? 'ON TRACK' : 'AT RISK'}
          </span>

          <span style={{ color: '#ffaa30' }}>
            FULFILLMENT: <strong>{currentObjective?.progress ?? 82}%</strong>
          </span>

          {/* 17. Workflow Contextual Controls */}
          {currentWorkflow?.status === 'paused' ? (
            <button
              type="button"
              onClick={() => {
                resumeWorkflow(currentWorkflow.id);
                showToast('Workflow resumed autonomous dispatch.');
              }}
              style={{
                background: 'rgba(0, 200, 100, 0.15)',
                border: '1px solid rgba(0, 200, 100, 0.4)',
                color: '#66ffaa',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <IconPlay width={10} height={10} />
              RESUME
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (currentWorkflow) {
                  pauseWorkflow(currentWorkflow.id);
                  showToast('Workflow paused. Tasks suspended.');
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 170, 48, 0.25)',
                color: '#ffcc66',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <IconPause width={10} height={10} />
              PAUSE
            </button>
          )}

          {(stats.blocked > 0 || stats.failed > 0) && (
            <button
              type="button"
              onClick={() => {
                if (currentWorkflow) {
                  retryFailedNodes(currentWorkflow.id);
                  showToast('Retrying blocked and failed nodes.');
                }
              }}
              style={{
                background: 'rgba(255, 170, 48, 0.2)',
                border: '1px solid rgba(255, 170, 48, 0.5)',
                color: '#ffcc66',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              RETRY FAILED
            </button>
          )}
        </div>
      </div>

      {/* 9. Lightweight Breadcrumb / Hierarchy Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: '#885522',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#ffaa30' }}>OBJECTIVE</span>
          <span>→</span>
          <span style={{ color: '#ffcc66' }}>WORKFLOW</span>
          <span>→</span>
          <span style={{ color: '#66ffaa' }}>EXECUTION</span>
          <span>→</span>
          <span style={{ color: '#88ddff' }}>OUTCOME</span>
        </div>

        {/* 20. Filter bar for the graph */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(['ALL', 'ACTIVE', 'BLOCKED', 'AWAITING APPROVAL', 'AGENTS', 'HUMANS', 'COMPLETED'] as NodeFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              style={{
                background: activeFilter === f ? 'rgba(255, 170, 48, 0.2)' : 'transparent',
                border: activeFilter === f ? '1px solid rgba(255, 170, 48, 0.5)' : '1px solid rgba(255, 170, 48, 0.1)',
                color: activeFilter === f ? '#ffcc66' : '#885522',
                borderRadius: 3,
                padding: '2px 7px',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 10. LAYER 2 — FULFILLMENT GRAPH IS THE HERO                 */}
      {/* Side-by-side with Layer 3 Inspection Drawer when open        */}
      {/* ============================================================ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedNode ? '1fr 380px' : '1fr',
          gap: 16,
          alignItems: 'start',
          transition: 'all 150ms ease',
        }}
      >
        {/* Main Graph Surface */}
        <div
          style={{
            background: 'rgba(10, 5, 2, 0.65)',
            border: '1px solid rgba(255, 170, 48, 0.2)',
            borderRadius: 6,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Top Anchor: Workflow Root Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#885522',
            }}
          >
            <span>▼</span>
            <span style={{ color: '#ffaa30', fontWeight: 600 }}>
              {currentWorkflow?.name}
            </span>
            <span>▼</span>
          </div>

          {/* 21. STAGE GROUPINGS WITH COMPACT NODES */}
          {graphTiers.map((tier, tierIdx) => {
            // Apply filter: show all nodes or dim non-matching
            const visibleNodes = tier.nodes.filter((n) => {
              if (activeFilter === 'ALL') return true;
              return filteredNodes.some((fn) => fn.id === n.id);
            });

            return (
              <div key={tier.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Lightweight Stage Label */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 170, 48, 0.1)',
                    paddingBottom: 3,
                  }}
                >
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.12em' }}>
                    {tier.title}
                  </span>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#ffaa30' }}>
                    {tier.nodes.length} {tier.nodes.length === 1 ? 'NODE' : 'PARALLEL NODES'}
                  </span>
                </div>

                {/* Nodes Grid */}
                {visibleNodes.length > 0 ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(auto-fit, minmax(${tier.nodes.length > 1 ? '200px' : '240px'}, 1fr))`,
                      gap: 10,
                    }}
                  >
                    {visibleNodes.map((node) => {
                      const badge = getStatusBadge(node.autonomyState);
                      const isSelected = selectedNode?.id === node.id;
                      const isAgent = node.executorType === 'agent';
                      const isAwaiting = node.autonomyState === 'awaiting_approval';
                      const isBlocked = node.autonomyState === 'blocked';

                      return (
                        /* 11. COMPACT NODE (Status, Name, Executor only) */
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                          style={{
                            background: isSelected
                              ? 'rgba(30, 16, 4, 0.95)'
                              : isAwaiting
                              ? 'rgba(25, 12, 2, 0.85)'
                              : 'rgba(12, 6, 2, 0.75)',
                            border: isSelected
                              ? '1px solid #ffaa30'
                              : isAwaiting
                              ? '1px solid rgba(255, 170, 48, 0.6)'
                              : isBlocked
                              ? '1px solid rgba(255, 80, 50, 0.5)'
                              : '1px solid rgba(255, 170, 48, 0.2)',
                            boxShadow: isSelected
                              ? '0 0 12px rgba(255, 170, 48, 0.3) inset, 0 0 10px rgba(255, 170, 48, 0.2)'
                              : isAwaiting
                              ? '0 0 8px rgba(255, 170, 48, 0.15)'
                              : 'none',
                            borderRadius: 5,
                            padding: '8px 12px',
                            cursor: 'pointer',
                            transition: 'all 120ms ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          {/* Node Status Row */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <span
                              style={{
                                fontSize: '9px',
                                fontFamily: 'var(--font-mono)',
                                padding: '1px 5px',
                                borderRadius: 3,
                                background: badge.bg,
                                border: `1px solid ${badge.border}`,
                                color: badge.text,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              <span>{badge.icon}</span>
                              <span>{badge.label}</span>
                            </span>

                            {/* Executor Badge (AGENT vs HUMAN) */}
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: '9px',
                                fontFamily: 'var(--font-mono)',
                                color: isAgent ? '#88ddff' : '#ffcc66',
                                background: isAgent ? 'rgba(0, 150, 255, 0.1)' : 'rgba(255, 170, 48, 0.1)',
                                padding: '1px 5px',
                                borderRadius: 3,
                                border: `1px solid ${isAgent ? 'rgba(0, 150, 255, 0.25)' : 'rgba(255, 170, 48, 0.25)'}`,
                              }}
                            >
                              {isAgent ? <IconBot width={10} height={10} /> : <IconTasks width={10} height={10} />}
                              {node.executorName.split(' ')[0]} · {node.executorType.toUpperCase()}
                            </span>
                          </div>

                          {/* Node Name */}
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffcc66', lineHeight: 1.25 }}>
                            {node.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)', padding: '6px 0' }}>
                    No nodes match the active filter in this stage.
                  </div>
                )}

                {/* Connector down to next tier */}
                {tierIdx < graphTiers.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      color: '#885522',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      margin: '2px 0',
                    }}
                  >
                    <span>│</span>
                    <span>↓</span>
                    <span>│</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* 19. OUTCOME-FIRST DESIGN FOOTER */}
          <div
            style={{
              marginTop: 6,
              background: 'rgba(5, 3, 1, 0.6)',
              border: '1px dashed rgba(255, 170, 48, 0.2)',
              borderRadius: 5,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <span style={{ color: '#885522' }}>TARGET OUTCOME: </span>
              <strong style={{ color: '#ffffff' }}>Signed + provisioned enterprise client</strong>
            </div>
            <div>
              <span style={{ color: '#885522' }}>VERIFICATION: </span>
              <span style={{ color: '#ffaa30' }}>Awaiting security approval</span>
            </div>
            <div>
              <span style={{ color: '#885522' }}>OUTCOME STATUS: </span>
              <span style={{ color: '#ffcc66' }}>In Progress (82%)</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 14. LAYER 3 — INSPECTION DRAWER                             */}
        {/* Shown ONLY when selectedNodeId is non-null                   */}
        {/* ============================================================ */}
        {selectedNode && (
          <div
            style={{
              background: 'rgba(15, 8, 2, 0.96)',
              border: '1px solid rgba(255, 170, 48, 0.4)',
              borderRadius: 6,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 170, 48, 0.1)',
              position: 'sticky',
              top: 16,
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header & Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 170, 48, 0.2)', paddingBottom: 8 }}>
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.1em' }}>
                  NODE INSPECTION // {selectedNode.id}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffcc66', marginTop: 2 }}>
                  {selectedNode.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                title="Close drawer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#885522',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px 6px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Status & Policy Strip */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: getStatusBadge(selectedNode.autonomyState).bg,
                  border: `1px solid ${getStatusBadge(selectedNode.autonomyState).border}`,
                  color: getStatusBadge(selectedNode.autonomyState).text,
                  fontWeight: 700,
                }}
              >
                STATUS: {getStatusBadge(selectedNode.autonomyState).label}
              </span>

              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: 'rgba(255, 170, 48, 0.12)',
                  border: '1px solid rgba(255, 170, 48, 0.25)',
                  color: '#ffcc66',
                }}
              >
                STAGE: {selectedNode.stage.toUpperCase()}
              </span>

              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: 'rgba(100, 100, 100, 0.12)',
                  border: '1px solid rgba(150, 150, 150, 0.25)',
                  color: getPolicyBadge(selectedNode.autonomyPolicy).color,
                }}
              >
                POLICY: {getPolicyBadge(selectedNode.autonomyPolicy).label}
              </span>
            </div>

            {/* Executor Block */}
            <div
              style={{
                background: 'rgba(5, 3, 1, 0.7)',
                border: '1px solid rgba(255, 170, 48, 0.2)',
                borderRadius: 4,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#885522' }}>
                  EXECUTOR
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: selectedNode.executorType === 'agent' ? '#88ddff' : '#ffcc66', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {selectedNode.executorType === 'agent' ? <IconBot width={12} height={12} /> : <IconTasks width={12} height={12} />}
                  {selectedNode.executorName} ({selectedNode.executorType.toUpperCase()})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReassignModalOpen(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 170, 48, 0.25)',
                  color: '#ffaa30',
                  borderRadius: 3,
                  padding: '2px 6px',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                REASSIGN
              </button>
            </div>

            {/* 16. HUMAN INTERVENTION (When Awaiting Approval or Blocked) */}
            {(selectedNode.autonomyState === 'awaiting_approval' || selectedNode.autonomyState === 'blocked') && (
              <div
                style={{
                  background: 'rgba(35, 14, 2, 0.9)',
                  border: '1px solid #ffaa30',
                  boxShadow: '0 0 12px rgba(255, 170, 48, 0.2) inset',
                  borderRadius: 5,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#ffaa30', fontWeight: 700 }}>
                    HUMAN INTERVENTION REQUIRED
                  </span>
                  <span style={{ fontSize: '9px', color: '#ffcc66', background: 'rgba(255, 170, 48, 0.2)', padding: '1px 5px', borderRadius: 3 }}>
                    POLICY GATE
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#d99a4e', fontFamily: 'var(--font-mono)' }}>
                  <strong>Reason:</strong> {selectedNode.blockerReason ?? 'Security policy requires human sign-off before opening public routing.'}
                </div>

                <div style={{ fontSize: '10px', color: '#885522', fontFamily: 'var(--font-mono)' }}>
                  <div>Required operator: <strong style={{ color: '#ffcc66' }}>{selectedNode.executorName}</strong></div>
                  <div>After approval: <span style={{ color: '#66ffaa' }}>Resume provisioning workflow.</span></div>
                </div>

                {/* Intervention Action Buttons */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentWorkflow) {
                        approveNode(currentWorkflow.id, selectedNode.id);
                        showToast(`Approved ${selectedNode.title}. Execution resumed.`);
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 170, 48, 0.25)',
                      border: '1px solid #ffaa30',
                      color: '#ffffff',
                      borderRadius: 4,
                      padding: '6px 10px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <IconCheckCircle width={11} height={11} />
                    APPROVE
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentWorkflow) {
                        rejectNode(currentWorkflow.id, selectedNode.id, 'Operator rejected deliverable.');
                        showToast(`Rejected ${selectedNode.title}. Node flagged blocked.`);
                      }
                    }}
                    style={{
                      background: 'rgba(255, 60, 40, 0.2)',
                      border: '1px solid rgba(255, 80, 50, 0.4)',
                      color: '#ff8877',
                      borderRadius: 4,
                      padding: '6px 10px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    REJECT
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentWorkflow) {
                        snoozeNode(currentWorkflow.id, selectedNode.id);
                        showToast('Snoozed approval reminder for 2 hours.');
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 170, 48, 0.25)',
                      color: '#d99a4e',
                      borderRadius: 4,
                      padding: '6px 8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    SNOOZE
                  </button>
                </div>
              </div>
            )}

            {/* Input Data */}
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 3 }}>
                INPUT
              </div>
              <div style={{ background: 'rgba(5, 3, 1, 0.7)', padding: '6px 8px', borderRadius: 4, fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#ffcc66', border: '1px solid rgba(255, 170, 48, 0.12)' }}>
                {selectedNode.inputData ?? selectedNode.executionTrace?.input ?? 'Validated contract specifications and tenancy schema'}
              </div>
            </div>

            {/* 15. OPERATIONAL EXECUTION TRACE (Observable operational events only) */}
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 4 }}>
                EXECUTION TRACE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {selectedNode.executionTrace ? (
                  selectedNode.executionTrace.actions.map((act, i) => (
                    <div
                      key={act.id ?? i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: act.status === 'completed' ? '#66ffaa' : '#ffaa30',
                        background: 'rgba(5, 3, 1, 0.5)',
                        padding: '4px 6px',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 170, 48, 0.08)',
                      }}
                    >
                      <span>{act.status === 'completed' ? '✓' : '●'}</span>
                      <span style={{ color: '#ffcc66', flex: 1 }}>{act.description}</span>
                      <span style={{ color: '#885522', fontSize: '9px' }}>{act.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#66ffaa', background: 'rgba(5, 3, 1, 0.5)', padding: '4px 6px', borderRadius: 3, border: '1px solid rgba(255, 170, 48, 0.08)' }}>
                      <span>✓</span>
                      <span style={{ color: '#ffcc66', flex: 1 }}>Input parameters validated against security spec</span>
                      <span style={{ color: '#885522', fontSize: '9px' }}>09:30</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#66ffaa', background: 'rgba(5, 3, 1, 0.5)', padding: '4px 6px', borderRadius: 3, border: '1px solid rgba(255, 170, 48, 0.08)' }}>
                      <span>✓</span>
                      <span style={{ color: '#ffcc66', flex: 1 }}>Infrastructure deployment executed</span>
                      <span style={{ color: '#885522', fontSize: '9px' }}>09:34</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#ffaa30', background: 'rgba(5, 3, 1, 0.5)', padding: '4px 6px', borderRadius: 3, border: '1px solid rgba(255, 170, 48, 0.08)' }}>
                      <span>●</span>
                      <span style={{ color: '#ffcc66', flex: 1 }}>Awaiting human SecOps sign-off token</span>
                      <span style={{ color: '#885522', fontSize: '9px' }}>09:35</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Output Deliverable */}
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#885522', letterSpacing: '0.08em', marginBottom: 3 }}>
                OUTPUT DELIVERABLE
              </div>
              <div style={{ background: 'rgba(5, 3, 1, 0.7)', padding: '6px 8px', borderRadius: 4, fontSize: '10px', color: '#ffcc66', border: '1px solid rgba(255, 170, 48, 0.12)' }}>
                {selectedNode.deliverableTitle ?? selectedNode.executionTrace?.output ?? 'Signed Ingress/Egress Security Certificate'}
              </div>
            </div>

            {/* Verification & Next Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: '#885522' }}>VERIFICATION: </span>
                <span style={{ color: selectedNode.executionTrace?.verificationResult === 'passed' ? '#66ffaa' : '#ffaa30' }}>
                  {selectedNode.executionTrace?.verificationResult?.toUpperCase() ?? 'PENDING HUMAN APPROVAL'}
                </span>
              </div>
              <div>
                <span style={{ color: '#885522' }}>DEPENDENCIES: </span>
                <span style={{ color: '#ffaa30' }}>
                  {nodeDependencies.upstream.length > 0 ? nodeDependencies.upstream.map((u) => u.title).join(' · ') : 'None (Root Node)'}
                </span>
              </div>
              <div>
                <span style={{ color: '#885522' }}>NEXT ACTION: </span>
                <span style={{ color: '#66ffaa' }}>
                  {selectedNode.nextAction ?? 'Deliver production credential packet to client CTO'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 18. LIVE ACTIVITY (Collapsible, collapsed by default)         */}
      {/* ============================================================ */}
      <div style={{ marginTop: 20 }}>
        <button
          type="button"
          onClick={() => setLiveActivityExpanded(!liveActivityExpanded)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffaa30',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
          }}
        >
          <span>LIVE ACTIVITY</span>
          <span>{liveActivityExpanded ? '▴' : '▾'}</span>
        </button>

        {liveActivityExpanded && (
          <div
            style={{
              marginTop: 8,
              background: 'rgba(15, 8, 2, 0.75)',
              border: '1px solid rgba(255, 170, 48, 0.2)',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {activities.slice(0, 5).map((act) => {
              const isAgent = act.actorType === 'agent';
              const isHuman = act.actorType === 'human';
              const glyph = act.severity === 'alert' ? '!' : act.severity === 'warning' ? '●' : '✓';
              const glyphColor = act.severity === 'alert' ? '#ff6666' : act.severity === 'warning' ? '#ffaa30' : '#66ffaa';

              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '4px 8px',
                    borderRadius: 3,
                    background: 'rgba(5, 3, 1, 0.4)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: '#885522' }}>{act.timestamp}</span>
                  <span
                    style={{
                      fontSize: '8px',
                      color: isAgent ? '#88ddff' : isHuman ? '#ffcc66' : '#aaaaaa',
                      background: isAgent ? 'rgba(0, 150, 255, 0.1)' : isHuman ? 'rgba(255, 170, 48, 0.1)' : 'rgba(100, 100, 100, 0.1)',
                      padding: '1px 4px',
                      borderRadius: 2,
                    }}
                  >
                    {act.actorType.toUpperCase()}
                  </span>
                  <span style={{ color: '#ffcc66', fontWeight: 600 }}>{act.actorName}</span>
                  <span style={{ color: '#d99a4e', flex: 1 }}>{act.action}</span>
                  <span style={{ color: glyphColor, fontWeight: 700 }}>{glyph}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reassignment Modal */}
      {reassignModalOpen && selectedNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#0a0502',
              border: '1px solid rgba(255, 170, 48, 0.4)',
              borderRadius: 6,
              padding: '20px',
              width: '400px',
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.95)',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffcc66', marginBottom: 2 }}>
              Reassign Node Executor
            </div>
            <div style={{ fontSize: '11px', color: '#d99a4e', marginBottom: 12 }}>
              Select an executor for: <em style={{ color: '#ffffff' }}>{selectedNode.title}</em>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '240px', overflowY: 'auto' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#885522' }}>AI AGENTS:</div>
              {agents.map((ag) => (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => {
                    if (currentWorkflow) {
                      reassignNode(currentWorkflow.id, selectedNode.id, ag.name, 'agent');
                      showToast(`Reassigned to ${ag.name} (AGENT).`);
                    }
                    setReassignModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(255, 170, 48, 0.08)',
                    border: '1px solid rgba(255, 170, 48, 0.2)',
                    borderRadius: 4,
                    color: '#ffcc66',
                    cursor: 'pointer',
                    fontSize: '11px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconBot width={11} height={11} color="#88ddff" />
                    <span>{ag.name}</span>
                  </div>
                  <span style={{ fontSize: '9px', color: '#88ddff', fontFamily: 'var(--font-mono)' }}>{ag.modelName}</span>
                </button>
              ))}

              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#885522', marginTop: 6 }}>
                HUMAN TEAM:
              </div>
              {team.map((tm) => (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() => {
                    if (currentWorkflow) {
                      reassignNode(currentWorkflow.id, selectedNode.id, tm.name, 'human');
                      showToast(`Reassigned to ${tm.name} (HUMAN).`);
                    }
                    setReassignModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(255, 170, 48, 0.08)',
                    border: '1px solid rgba(255, 170, 48, 0.2)',
                    borderRadius: 4,
                    color: '#ffcc66',
                    cursor: 'pointer',
                    fontSize: '11px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconTasks width={11} height={11} color="#ffaa30" />
                    <span>{tm.name}</span>
                  </div>
                  <span style={{ fontSize: '9px', color: '#ffaa30', fontFamily: 'var(--font-mono)' }}>{tm.role}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setReassignModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 170, 48, 0.25)',
                  color: '#d99a4e',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
