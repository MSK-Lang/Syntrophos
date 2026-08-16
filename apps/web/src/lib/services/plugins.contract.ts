import type { AuditInfo, ID, PageResult, QueryParams } from './types.js';

export type PluginRuntime = 'browser' | 'server' | 'hybrid';

export type PluginStatus = 'installed' | 'enabled' | 'disabled' | 'error' | 'update-available';

export type PluginPermission =
  | 'read:notes'
  | 'write:notes'
  | 'read:tasks'
  | 'write:tasks'
  | 'read:chat'
  | 'write:chat'
  | 'read:user'
  | 'write:user'
  | 'read:search'
  | 'network:request'
  | 'ui:register-command'
  | 'ui:sidebar'
  | 'ui:chat-tool'
  | 'storage:local'
  | 'storage:cloud';

export type PluginManifest = {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author?: string;
  readonly icon?: string;
  readonly websiteUrl?: string;
  readonly repositoryUrl?: string;
  readonly runtime: PluginRuntime;
  readonly permissions: readonly PluginPermission[];
  readonly entryPoints: {
    readonly main: string;
    readonly ui?: string;
    readonly styles?: string;
  };
  readonly minAppVersion?: string;
  readonly dependencies?: readonly { readonly id: string; readonly versionRange: string }[];
};

export type Plugin = {
  readonly id: ID;
  readonly manifest: PluginManifest;
  readonly workspaceId: ID;
  readonly installedAt: string;
  readonly updatedAt: string;
  readonly installedBy?: ID;
  readonly status: PluginStatus;
  readonly settings?: Readonly<Record<string, unknown>>;
  readonly audit: AuditInfo;
};

export type RegistryPlugin = {
  readonly manifestId: string;
  readonly manifest: PluginManifest;
  readonly isInstalled: boolean;
  readonly installable: boolean;
  readonly reasonNotInstallable?: string;
};

export interface PluginService {
  readonly listInstalled: (params?: QueryParams) => Promise<PageResult<Plugin>>;
  readonly getInstalled: (id: ID) => Promise<Plugin>;
  readonly listRegistry: (params?: QueryParams & { readonly category?: string }) => Promise<PageResult<RegistryPlugin>>;
  readonly install: (manifestId: string, acceptPermissions: readonly PluginPermission[]) => Promise<Plugin>;
  readonly update: (id: ID) => Promise<Plugin>;
  readonly uninstall: (id: ID) => Promise<void>;
  readonly enable: (id: ID) => Promise<Plugin>;
  readonly disable: (id: ID) => Promise<Plugin>;
  readonly getSettings: (id: ID) => Promise<Readonly<Record<string, unknown>>>;
  readonly updateSettings: (id: ID, settings: Readonly<Record<string, unknown>>) => Promise<void>;
  readonly checkForUpdates: () => Promise<readonly Plugin[]>;
}
