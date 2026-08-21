import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell.js';
import { SyntrophosLoading } from '@/components/ui/SyntrophosLoading.js';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute.js';

// Critical initial shell routes (static imports for instant boot)
import LandingPage from '@/pages/LandingPage.js';
import DashboardPage from '@/pages/DashboardPage.js';
import SignInPage from '@/pages/auth/SignInPage.js';
import SignUpPage from '@/pages/auth/SignUpPage.js';
import NotFoundPage from '@/pages/NotFoundPage.js';

// Lazy-loaded heavy modules & secondary destinations
const CorePage = lazy(() => import('@/pages/CorePage.js'));
const InboxPage = lazy(() => import('@/pages/InboxPage.js'));
const ChatListPage = lazy(() => import('@/pages/chat/ChatListPage.js'));
const ChatThreadPage = lazy(() => import('@/pages/chat/ChatThreadPage.js'));
const NotesListPage = lazy(() => import('@/pages/notes/NotesListPage.js'));
const NoteReaderPage = lazy(() => import('@/pages/notes/NoteReaderPage.js'));
const TasksPage = lazy(() => import('@/pages/TasksPage.js'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage.js'));
const PeopleSchedulePage = lazy(() => import('@/pages/PeopleSchedulePage.js'));
const IntelligencePage = lazy(() => import('@/pages/IntelligencePage.js'));
const KnowledgePage = lazy(() => import('@/pages/KnowledgePage.js'));
const AgentDetailPage = lazy(() => import('@/pages/AgentDetailPage.js'));
const VoicePage = lazy(() => import('@/pages/VoicePage.js'));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage.js'));
const PluginsPage = lazy(() => import('@/pages/PluginsPage.js'));
const WorkspacesPage = lazy(() => import('@/pages/WorkspacesPage.js'));
const StarredPage = lazy(() => import('@/pages/StarredPage.js'));
const HelpPage = lazy(() => import('@/pages/HelpPage.js'));

const SettingsRootPage = lazy(() => import('@/pages/settings/SettingsRootPage.js'));
const SettingsAccountPage = lazy(() => import('@/pages/settings/SettingsAccountPage.js'));
const SettingsProvidersPage = lazy(() => import('@/pages/settings/SettingsProvidersPage.js'));
const SettingsWorkspacePage = lazy(() => import('@/pages/settings/SettingsWorkspacePage.js'));
const SettingsIntegrationsPage = lazy(() => import('@/pages/settings/SettingsIntegrationsPage.js'));
const SettingsPluginsPage = lazy(() => import('@/pages/settings/SettingsPluginsPage.js'));
const SettingsSyncPage = lazy(() => import('@/pages/settings/SettingsSyncPage.js'));
const SettingsNotificationsPage = lazy(() => import('@/pages/settings/SettingsNotificationsPage.js'));
const SettingsVoicePage = lazy(() => import('@/pages/settings/SettingsVoicePage.js'));
const SettingsAiPage = lazy(() => import('@/pages/settings/SettingsAiPage.js'));
const SettingsAppearancePage = lazy(() => import('@/pages/settings/SettingsAppearancePage.js'));

const PublicLayout = lazy(() => import('@/layouts/PublicLayout.js'));
const AboutPage = lazy(() => import('@/pages/AboutPage.js'));
const FaqPage = lazy(() => import('@/pages/FaqPage.js'));

const SuspenseFallback = <SyntrophosLoading variant="workspace" label="INITIALIZING" />;


const shellRoutes: RouteObject = {
  element: (
    <ProtectedRoute>
      <AppShell>
        <Suspense fallback={SuspenseFallback}>
          <Outlet />
        </Suspense>
      </AppShell>
    </ProtectedRoute>
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
      <ProtectedRoute>
        <Suspense fallback={<SyntrophosLoading variant="global" label="INITIALIZING CORE" />}>
          <CorePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  shellRoutes,
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
