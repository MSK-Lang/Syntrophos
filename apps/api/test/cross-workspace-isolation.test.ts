/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { generateSecureToken, hashToken, SESSION_COOKIE_NAME } from '../src/lib/session.js';
import { uuidv7 } from '../src/lib/uuidv7.js';

describe('Cross-Workspace Multi-Tenancy Isolation & Invitation Security', () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'fatal',
    CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
  });

  function setupMultiTenantScenario() {
    const userA = { id: uuidv7(), email: 'user-a@company.com', name: 'User A', displayName: 'User A', deletedAt: null };
    const userB = { id: uuidv7(), email: 'user-b@company.com', name: 'User B', displayName: 'User B', deletedAt: null };
    const userC = { id: uuidv7(), email: 'user-c@external.com', name: 'User C', displayName: 'User C', deletedAt: null };

    const workspaceA = { id: uuidv7(), name: 'Workspace Alpha', workspaceType: 'business', deletedAt: null };
    const workspaceB = { id: uuidv7(), name: 'Workspace Beta', workspaceType: 'business', deletedAt: null };

    // User A is owner of Workspace A ONLY
    // User B is viewer of Workspace B ONLY
    const members = [
      { id: uuidv7(), workspaceId: workspaceA.id, userId: userA.id, role: 'owner', joinedAt: new Date() },
      { id: uuidv7(), workspaceId: workspaceB.id, userId: userB.id, role: 'viewer', joinedAt: new Date() },
    ];

    const tokenA = generateSecureToken();
    const tokenB = generateSecureToken();
    const tokenC = generateSecureToken();

    const sessions = [
      { id: uuidv7(), userId: userA.id, tokenHash: hashToken(tokenA), expiresAt: new Date(Date.now() + 100000), revokedAt: null },
      { id: uuidv7(), userId: userB.id, tokenHash: hashToken(tokenB), expiresAt: new Date(Date.now() + 100000), revokedAt: null },
      { id: uuidv7(), userId: userC.id, tokenHash: hashToken(tokenC), expiresAt: new Date(Date.now() + 100000), revokedAt: null },
    ];

    const invitations: any[] = [];
    const auditLogs: any[] = [];

    let currentCallingUser: any = userA;

    const mockDbInstance: any = {
      db: {
        query: {
          users: {
            findFirst: async () => currentCallingUser,
          },
          sessions: {
            findFirst: async () => {
              const session = sessions.find((s) => s.userId === currentCallingUser.id);
              return session;
            },
          },
          workspaces: {
            findFirst: async () => {
              return workspaceB; // target workspace
            },
          },
          workspaceMembers: {
            findFirst: async () => {
              return members.find(
                (m) => m.workspaceId === workspaceB.id && m.userId === currentCallingUser.id,
              );
            },
          },
          workspaceInvitations: {
            findFirst: async () => invitations[0],
            findMany: async () => invitations,
          },
        },
        transaction: async (cb: any) => {
          const tx: any = {
            insert: () => ({
              values: (val: any) => ({
                then: async (resolve: any) => {
                  members.push({ ...val, id: uuidv7(), joinedAt: new Date() });
                  if (resolve) resolve([val]);
                },
              }),
            }),
            update: () => ({
              set: (val: any) => ({
                where: async () => {
                  if (invitations[0]) Object.assign(invitations[0], val);
                },
              }),
            }),
          };
          return cb(tx);
        },
        insert: () => ({
          values: (val: any) => ({
            returning: async () => {
              const id = uuidv7();
              const item = { ...val, id, createdAt: new Date() };
              invitations.push(item);
              return [item];
            },
            then: async (resolve: any) => {
              auditLogs.push(val);
              if (resolve) resolve([val]);
            },
          }),
        }),
        update: () => ({
          set: (val: any) => ({
            where: async () => {
              if (invitations[0]) Object.assign(invitations[0], val);
            },
          }),
        }),
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              where: async () => [],
            }),
          }),
        }),
      },
      close: async () => {},
    };

    return {
      userA,
      userB,
      userC,
      workspaceA,
      workspaceB,
      tokenA,
      tokenB,
      tokenC,
      invitations,
      mockDbInstance,
      setCaller(user: any) {
        currentCallingUser = user;
      },
    };
  }

  it('CROSS-WORKSPACE ISOLATION: Rejects User A attempting to access Workspace B with 403 WORKSPACE_ACCESS_DENIED', async () => {
    const scenario = setupMultiTenantScenario();
    scenario.setCaller(scenario.userA);
    const app = createApp(config, scenario.mockDbInstance);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/workspaces/${scenario.workspaceB.id}`,
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${scenario.tokenA}`,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.error.code).toBe('WORKSPACE_ACCESS_DENIED');
    expect(body.error.message).toBe('You do not have permission to access this workspace.');
    await app.close();
  });

  it('ROLE AUTHORIZATION: Rejects viewer role attempting to create invitations with 403 FORBIDDEN_ROLE', async () => {
    const scenario = setupMultiTenantScenario();
    scenario.setCaller(scenario.userB); // User B is viewer in Workspace B
    const app = createApp(config, scenario.mockDbInstance);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/workspaces/${scenario.workspaceB.id}/invitations`,
      headers: {
        origin: 'http://localhost:3000',
        cookie: `${SESSION_COOKIE_NAME}=${scenario.tokenB}`,
      },
      payload: {
        email: 'new-collaborator@company.com',
        role: 'member',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.error.code).toBe('FORBIDDEN_ROLE');
    await app.close();
  });
});
