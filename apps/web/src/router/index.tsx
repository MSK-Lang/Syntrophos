import { Outlet, createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import CorePage from '@/pages/CorePage';
import DashboardPage from '@/pages/DashboardPage';
import ChatListPage from '@/pages/chat/ChatListPage';
import ChatThreadPage from '@/pages/chat/ChatThreadPage';
import NotesListPage from '@/pages/notes/NotesListPage';
import NoteReaderPage from '@/pages/notes/NoteReaderPage';
import TasksPage from '@/pages/TasksPage';
import CalendarPage from '@/pages/CalendarPage';
import AgentsPage from '@/pages/AgentsPage';
import AgentDetailPage from '@/pages/AgentDetailPage';
import VoicePage from '@/pages/VoicePage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import PluginsPage from '@/pages/PluginsPage';
import WorkspacesPage from '@/pages/WorkspacesPage';
import StarredPage from '@/pages/StarredPage';
import SettingsRootPage from '@/pages/settings/SettingsRootPage';
import SettingsAccountPage from '@/pages/settings/SettingsAccountPage';
import SettingsProvidersPage from '@/pages/settings/SettingsProvidersPage';
import SettingsWorkspacePage from '@/pages/settings/SettingsWorkspacePage';
import SettingsIntegrationsPage from '@/pages/settings/SettingsIntegrationsPage';
import SettingsPluginsPage from '@/pages/settings/SettingsPluginsPage';
import SettingsSyncPage from '@/pages/settings/SettingsSyncPage';
import SettingsNotificationsPage from '@/pages/settings/SettingsNotificationsPage';
import SettingsVoicePage from '@/pages/settings/SettingsVoicePage';
import SettingsAiPage from '@/pages/settings/SettingsAiPage';
import SettingsAppearancePage from '@/pages/settings/SettingsAppearancePage';
import NotFoundPage from '@/pages/NotFoundPage';
import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';

const shellRoutes: RouteObject = {
  element: (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
  children: [
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/starred', element: <StarredPage /> },
    { path: '/chat', element: <ChatListPage /> },
    { path: '/chat/new', element: <ChatThreadPage /> },
    { path: '/chat/:conversationId', element: <ChatThreadPage /> },
    { path: '/notes', element: <NotesListPage /> },
    { path: '/notes/new', element: <NoteReaderPage /> },
    { path: '/notes/*', element: <NoteReaderPage /> },
    { path: '/tasks', element: <TasksPage /> },
    { path: '/calendar', element: <CalendarPage /> },
    { path: '/agents', element: <AgentsPage /> },
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
        { path: 'sync', element: <SettingsSyncPage /> },
        { path: 'notifications', element: <SettingsNotificationsPage /> },
        { path: 'integrations', element: <SettingsIntegrationsPage /> },
        { path: 'plugins', element: <SettingsPluginsPage /> },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ],
};

const authRoutes: RouteObject[] = [
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
];

const router = createBrowserRouter([
  ...authRoutes,
  { path: '/', element: <CorePage /> },
  { path: '/core', element: <CorePage /> },
  shellRoutes,
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
