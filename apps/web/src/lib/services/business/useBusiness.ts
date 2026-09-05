import { useState, useEffect, useMemo, useCallback } from 'react';
import { businessService } from './businessService.js';
import type {
  BusinessObjective,
  BusinessWorkflow,
  BusinessProject,
  BusinessClient,
  BusinessAgent,
  BusinessTeamMember,
  BusinessActivity,
  DailyFulfillmentReport,
} from './business.contract.js';

export function useBusiness() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = businessService.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const objectives = useMemo(() => businessService.getObjectives(), [tick]);
  const workflows = useMemo(() => businessService.getWorkflows(), [tick]);
  const projects = useMemo(() => businessService.getProjects(), [tick]);
  const clients = useMemo(() => businessService.getClients(), [tick]);
  const agents = useMemo(() => businessService.getAgents(), [tick]);
  const team = useMemo(() => businessService.getTeam(), [tick]);
  const activities = useMemo(() => businessService.getActivities(), [tick]);

  const report = useMemo(() => businessService.generateDailyReport(), [tick]);

  const approveNode = useCallback((workflowId: string, nodeId: string) => {
    businessService.approveNode(workflowId, nodeId);
  }, []);

  const resolveBlocker = useCallback((workflowId: string, nodeId: string) => {
    businessService.resolveBlocker(workflowId, nodeId);
  }, []);

  const retryNode = useCallback((workflowId: string, nodeId: string) => {
    businessService.retryNode(workflowId, nodeId);
  }, []);

  const reassignNode = useCallback(
    (workflowId: string, nodeId: string, newExecutorName: string, newExecutorType: 'agent' | 'human') => {
      businessService.reassignNode(workflowId, nodeId, newExecutorName, newExecutorType);
    },
    []
  );

  const pauseWorkflow = useCallback((workflowId: string) => {
    businessService.pauseWorkflow(workflowId);
  }, []);

  const resumeWorkflow = useCallback((workflowId: string) => {
    businessService.resumeWorkflow(workflowId);
  }, []);

  const retryFailedNodes = useCallback((workflowId: string) => {
    businessService.retryFailedNodes(workflowId);
  }, []);

  const rejectNode = useCallback((workflowId: string, nodeId: string, reason?: string) => {
    businessService.rejectNode(workflowId, nodeId, reason);
  }, []);

  const snoozeNode = useCallback((workflowId: string, nodeId: string) => {
    businessService.snoozeNode(workflowId, nodeId);
  }, []);

  // Computed business health indicators
  const metrics = useMemo(() => {
    const allNodes = workflows.flatMap((w) => w.nodes);
    const completed = allNodes.filter((n) => n.autonomyState === 'completed').length;
    const blocked = allNodes.filter((n) => n.autonomyState === 'blocked').length;
    const awaitingApproval = allNodes.filter((n) => n.autonomyState === 'awaiting_approval').length;
    const executing = allNodes.filter((n) => n.autonomyState === 'executing').length;

    const avgFulfillment = allNodes.length > 0 ? Math.round((completed / allNodes.length) * 100) : 82;
    const activeObjectives = objectives.filter((o) => o.status !== 'completed').length;
    const atRiskProjects = projects.filter((p) => p.health !== 'healthy').length;

    return {
      avgFulfillment,
      blockedCount: blocked + 1, // includes simulated system blocker
      awaitingApprovalCount: awaitingApproval,
      executingCount: executing,
      activeObjectivesCount: activeObjectives,
      atRiskProjectsCount: atRiskProjects,
      totalAgentsCount: agents.length,
      activeAgentsCount: agents.filter((a) => a.status === 'executing' || a.status === 'active').length,
    };
  }, [workflows, objectives, projects, agents]);

  return {
    objectives,
    workflows,
    projects,
    clients,
    agents,
    team,
    activities,
    report,
    metrics,
    approveNode,
    resolveBlocker,
    retryNode,
    reassignNode,
    pauseWorkflow,
    resumeWorkflow,
    retryFailedNodes,
    rejectNode,
    snoozeNode,
  };
}
