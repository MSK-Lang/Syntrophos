import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { SyntrophosLoading } from '@/components/ui/SyntrophosLoading';

// Critical initial shell routes (static imports for instant boot)
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Lazy-loaded heavy modules & secondary destinations
const CorePage = lazy(() => import('@/pages/CorePage'));
const InboxPage = lazy(() => import('@/pages/InboxPage'));
const ChatListPage = lazy(() => import('@/pages/chat/ChatListPage'));
const ChatThreadPage = lazy(() => import('@/pages/chat/ChatThreadPage'));
const NotesListPage = lazy(() => import('@/pages/notes/NotesListPage'));
const NoteReaderPage = lazy(() => import('@/pages/notes/NoteReaderPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const PeopleSchedulePage = lazy(() => import('@/pages/PeopleSchedulePage'));
const IntelligencePage = lazy(() => import('@/pages/IntelligencePage'));
const KnowledgePage = lazy(() => import('@/pages/KnowledgePage'));
const AgentDetailPage = lazy(() => import('@/pages/AgentDetailPage'));
const VoicePage = lazy(() => import('@/pages/VoicePage'));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage'));
const PluginsPage = lazy(() => import('@/pages/PluginsPage'));
const WorkspacesPage = lazy(() => import('@/pages/WorkspacesPage'));
const StarredPage = lazy(() => import('@/pages/StarredPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));

const SettingsRootPage = lazy(() => import('@/pages/settings/SettingsRootPage'));
const SettingsAccountPage = lazy(() => import('@/pages/settings/SettingsAccountPage'));
const SettingsProvidersPage = lazy(() => import('@/pages/settings/SettingsProvidersPage'));
const SettingsWorkspacePage = lazy(() => import('@/pages/settings/SettingsWorkspacePage'));
const SettingsIntegrationsPage = lazy(() => import('@/pages/settings/SettingsIntegrationsPage'));
const SettingsPluginsPage = lazy(() => import('@/pages/settings/SettingsPluginsPage'));
const SettingsSyncPage = lazy(() => import('@/pages/settings/SettingsSyncPage'));
const SettingsNotificationsPage = lazy(() => import('@/pages/settings/SettingsNotificationsPage'));
const SettingsVoicePage = lazy(() => import('@/pages/settings/SettingsVoicePage'));
const SettingsAiPage = lazy(() => import('@/pages/settings/SettingsAiPage'));
const SettingsAppearancePage = lazy(() => import('@/pages/settings/SettingsAppearancePage'));

const PublicLayout = lazy(() => import('@/layouts/PublicLayout'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));

const SuspenseFallback = <SyntrophosLoading variant="workspace" label="INITIALIZING" />;

const shellRoutes: RouteObject = {
  element: (
    <AppShell>
      <Suspense fallback={SuspenseFallback}>
        <Outlet />
      </Suspense>
    </AppShell>
  ),
  children: [
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/help', element: <HelpPage /> },
    { path: '/inbox', element: <InboxPage /> },
    { path: '/starred', element: <StarredPage /> },
    { path: '/chat', element: <ChatListPage /> },
    { path: '/chat/new', element: <ChatThreadPage /> },
    { path: '/chat/:conversationId', element: <ChatThreadPage /> },
    { path: '/notes', element: <NotesListPage /> },
    { path: '/notes/new', element: <NoteReaderPage /> },
    { path: '/notes/*', element: <NoteReaderPage /> },
    { path: '/tasks', element: <TasksPage /> },
    { path: '/projects', element: <ProjectsPage /> },
    { path: '/calendar', element: <PeopleSchedulePage /> },
    { path: '/people-schedule', element: <PeopleSchedulePage /> },
    { path: '/intelligence', element: <IntelligencePage /> },
    { path: '/agents', element: <IntelligencePage /> },
    { path: '/workflows', element: <IntelligencePage /> },
    { path: '/knowledge', element: <KnowledgePage /> },
    { path: '/agents/:agentId', element: <AgentDetailPage /> },
    { path: '/agents/runs', element: <AgentDetailPage /> },
    { path: '/voice', element: <VoicePage /> },
    { path: '/integrations', element: <IntegrationsPage /> },
    { path: '/plugins', element: <PluginsPage /> },
    { path: '/workspaces', element: <WorkspacesPage /> },
    {
      path: '/settings',
      element: <SettingsRootPage />,
      children: [
        { index: true, element: <Navigate to="/settings/account" replace /> },
        { path: 'account', element: <SettingsAccountPage /> },
        { path: 'appearance', element: <SettingsAppearancePage /> },
        { path: 'providers', element: <SettingsProvidersPage /> },
        { path: 'ai', element: <SettingsAiPage /> },
        { path: 'voice', element: <SettingsVoicePage /> },
        { path: 'workspace', element: <SettingsWorkspacePage /> },
        { path: 'integrations', element: <SettingsIntegrationsPage /> },
        { path: 'plugins', element: <SettingsPluginsPage /> },
        { path: 'sync', element: <SettingsSyncPage /> },
        { path: 'notifications', element: <SettingsNotificationsPage /> },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ],
};

const publicRoutes: RouteObject = {
  element: (
    <Suspense fallback={SuspenseFallback}>
      <PublicLayout />
    </Suspense>
  ),
  children: [
    { path: '/', element: <LandingPage /> },
    { path: '/landing', element: <LandingPage /> },
    { path: '/about', element: <AboutPage /> },
    { path: '/faq', element: <FaqPage /> },
  ],
};

const authRoutes: RouteObject[] = [
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
];

const router = createBrowserRouter([
  publicRoutes,
  ...authRoutes,
  {
    path: '/core',
    element: (
      <Suspense fallback={<SyntrophosLoading variant="global" label="INITIALIZING CORE" />}>
        <CorePage />
      </Suspense>
    ),
  },
  shellRoutes,
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
