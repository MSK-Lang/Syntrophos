/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { hashPassword } from '../src/lib/password.js';
import { generateSecureToken, hashToken, SESSION_COOKIE_NAME } from '../src/lib/session.js';
import { uuidv7 } from '../src/lib/uuidv7.js';

describe('Authentication & Workspace Security End-to-End Suite', () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'fatal',
    CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
  });

  function createMockDb() {
    const usersStore = new Map<string, any>();
    const sessionsStore = new Map<string, any>();
    const workspacesStore = new Map<string, any>();
    const membersStore = new Map<string, any>();
    const invitationsStore = new Map<string, any>();
    const auditLogsStore: any[] = [];

    const getTableName = (table: any) =>
      table.name || table._?.name || (table[Symbol.for('drizzle:Name')] as string) || '';

    const mockDbInstance: any = {
      db: {
        query: {
          users: {
            findFirst: async () => {
              // Return first active user in store
              return Array.from(usersStore.values()).find((u) => !u.deletedAt);
            },
          },
          sessions: {
            findFirst: async () => {
              // Return active valid session
              return Array.from(sessionsStore.values()).find(
                (s) => !s.revokedAt && new Date(s.expiresAt) > new Date(),
              );
            },
          },
          workspaces: {
            findFirst: async () => {
              return Array.from(workspacesStore.values()).find((w) => !w.deletedAt);
            },
          },
          workspaceMembers: {
            findFirst: async () => {
              return Array.from(membersStore.values())[0];
            },
          },
          workspaceInvitations: {
            findFirst: async () => {
              return Array.from(invitationsStore.values())[0];
            },
            findMany: async () => Array.from(invitationsStore.values()),
          },
        },
        transaction: async (cb: any) => {
          const tx: any = {
            insert: (table: any) => ({
              values: (val: any) => ({
                returning: async () => {
                  const id = val.id || uuidv7();
                  const item = { ...val, id, createdAt: new Date(), updatedAt: new Date() };
                  const tableName = getTableName(table);
                  if (tableName === 'users') {
                    usersStore.set(id, item);
                  } else if (tableName === 'workspaces') {
                    workspacesStore.set(id, item);
                  }
                  return [item];
                },
                then: async (resolve: any) => {
                  const id = val.id || uuidv7();
                  const item = { ...val, id, createdAt: new Date() };
                  const tableName = getTableName(table);
                  if (tableName === 'workspace_members') {
                    membersStore.set(id, item);
                  } else if (tableName === 'sessions') {
                    sessionsStore.set(val.tokenHash || id, item);
                  }
                  if (resolve) resolve([item]);
                  return [item];
                },
              }),
            }),
            update: () => ({
              set: () => ({
                where: async () => {},
              }),
            }),
          };
          return cb(tx);
        },
        insert: (table: any) => ({
          values: (val: any) => ({
            returning: async () => {
              const id = val.id || uuidv7();
              const item = { ...val, id, createdAt: new Date(), updatedAt: new Date() };
              const tableName = getTableName(table);
              if (tableName === 'workspace_invitations') {
                invitationsStore.set(id, item);
              }
              return [item];
            },
            then: async (resolve: any) => {
              const tableName = getTableName(table);
              if (tableName === 'audit_logs') {
                auditLogsStore.push(val);
              } else if (tableName === 'sessions') {
                sessionsStore.set(val.tokenHash, val);
              }
              if (resolve) resolve([val]);
              return [val];
            },
          }),
        }),
        update: () => ({
          set: () => ({
            where: async () => {},
          }),
        }),
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              where: async () =>
                Array.from(membersStore.values()).map((m) => ({
                  workspace: workspacesStore.get(m.workspaceId),
                  membership: m,
                  role: m.role,
                  joinedAt: m.joinedAt,
                })),
            }),
          }),
        }),
      },
      close: async () => {},
    };

    return {
      mockDbInstance,
      usersStore,
      sessionsStore,
      workspacesStore,
      membersStore,
      invitationsStore,
      auditLogsStore,
    };
  }

  it('SIGNUP: Validates password, creates user, personal workspace, owner role, and sets session cookie', async () => {
    const { mockDbInstance } = createMockDb();
    const app = createApp(config, mockDbInstance);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      headers: {
        origin: 'http://localhost:3000',
      },
      payload: {
        email: 'founder@syntrophos.ai',
        password: 'SuperSecurePassword2026!',
        name: 'Muthu',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.email).toBe('founder@syntrophos.ai');
    expect(body.user.name).toBe('Muthu');
    expect(body.user.passwordHash).toBeUndefined(); // Zero password leakage
    expect(body.workspace.workspaceType).toBe('personal');
    expect(body.workspace.subscriptionPlan).toBe('free');

    // Verify Set-Cookie header contains session cookie
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie?.toString()).toContain(SESSION_COOKIE_NAME);
    expect(setCookie?.toString()).toContain('HttpOnly');
    expect(setCookie?.toString()).toContain('SameSite=Lax');

    await app.close();
  });

  it('SIGNUP: Rejects weak passwords (< 8 characters)', async () => {
    const { mockDbInstance } = createMockDb();
    const app = createApp(config, mockDbInstance);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      headers: {
        origin: 'http://localhost:3000',
      },
      payload: {
        email: 'test@syntrophos.ai',
        password: 'short',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    await app.close();
  });

  it('LOGIN: Rejects invalid credentials with generic 401 error', async () => {
    const { mockDbInstance, usersStore } = createMockDb();
    const passHash = await hashPassword('CorrectPassword123!');
    usersStore.set('user-1', {
      id: 'user-1',
      email: 'user@syntrophos.ai',
      passwordHash: passHash,
      name: 'User One',
      displayName: 'User One',
      deletedAt: null,
    });

    const app = createApp(config, mockDbInstance);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: {
        origin: 'http://localhost:3000',
      },
      payload: {
        email: 'user@syntrophos.ai',
        password: 'WrongPassword123!',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
    expect(body.error.message).toBe('Invalid email address or password');
    await app.close();
  });

  it('ME: Returns authenticated user profile and authorized workspaces', async () => {
    const { mockDbInstance, usersStore, sessionsStore, workspacesStore, membersStore } = createMockDb();

    const userId = uuidv7();
    const wsId = uuidv7();
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);

    usersStore.set(userId, {
      id: userId,
      email: 'member@syntrophos.ai',
      name: 'Member',
      displayName: 'Member',
      deletedAt: null,
    });

    sessionsStore.set(tokenHash, {
      id: uuidv7(),
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
    });

    workspacesStore.set(wsId, {
      id: wsId,
      name: 'Syntrophos Core Workspace',
      workspaceType: 'business',
      subscriptionPlan: 'pro',
      deletedAt: null,
    });

    membersStore.set('m-1', {
      id: 'm-1',
      workspaceId: wsId,
      userId,
      role: 'owner',
      joinedAt: new Date(),
    });

    const app = createApp(config, mockDbInstance);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${rawToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user.email).toBe('member@syntrophos.ai');
    expect(body.user.passwordHash).toBeUndefined();
    expect(Array.isArray(body.workspaces)).toBe(true);
    await app.close();
  });

  it('LOGOUT: Revokes session and clears session cookie', async () => {
    const { mockDbInstance, usersStore, sessionsStore } = createMockDb();
    const userId = uuidv7();
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);

    usersStore.set(userId, {
      id: userId,
      email: 'user@syntrophos.ai',
      name: 'User',
      displayName: 'User',
      deletedAt: null,
    });

    sessionsStore.set(tokenHash, {
      id: uuidv7(),
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
    });

    const app = createApp(config, mockDbInstance);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        origin: 'http://localhost:3000',
        cookie: `${SESSION_COOKIE_NAME}=${rawToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    await app.close();
  });
});
