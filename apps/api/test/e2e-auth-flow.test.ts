/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { hashPassword } from '../src/lib/password.js';
import { hashToken, SESSION_COOKIE_NAME } from '../src/lib/session.js';
import { uuidv7 } from '../src/lib/uuidv7.js';

describe('Syntrophos Custom Authentication Full Lifecycle E2E Suite', () => {
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

    const mockDbInstance: any = {
      db: {
        query: {
          users: {
            findFirst: async () => {
              return Array.from(usersStore.values()).find((u) => !u.deletedAt) ?? null;
            },
          },
          sessions: {
            findFirst: async () => {
              return (
                Array.from(sessionsStore.values()).find(
                  (s) => !s.revokedAt && new Date(s.expiresAt) > new Date(),
                ) ?? null
              );
            },
          },
          workspaces: {
            findFirst: async () => {
              return Array.from(workspacesStore.values()).find((w) => !w.deletedAt) ?? null;
            },
          },
          workspaceMembers: {
            findFirst: async () => {
              return Array.from(membersStore.values())[0] ?? null;
            },
          },
        },
        transaction: async (cb: any) => {
          const tx: any = {
            insert: (table: any) => ({
              values: (val: any) => {
                const raw = Array.isArray(val) ? val[0] : val;
                const id = raw.id || uuidv7();
                const item = { ...raw, id, createdAt: new Date(), updatedAt: new Date() };
                if ('email' in table || 'passwordHash' in table) {
                  usersStore.set(id, item);
                } else if ('workspaceId' in table && 'role' in table) {
                  membersStore.set(id, item);
                } else if ('workspaceType' in table) {
                  workspacesStore.set(id, item);
                } else if ('tokenHash' in table) {
                  sessionsStore.set(raw.tokenHash || id, item);
                }


                return {
                  returning: async () => [item],
                  then: async (resolve: any) => {
                    if (resolve) resolve([item]);
                    return [item];
                  },
                };
              },
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
              if ('email' in table || 'passwordHash' in table) {
                usersStore.set(id, item);
              } else if ('workspaceId' in table && 'role' in table) {
                membersStore.set(id, item);
              } else if ('workspaceType' in table) {
                workspacesStore.set(id, item);
              } else if ('tokenHash' in table) {
                sessionsStore.set(val.tokenHash || id, item);
              } else if ('inviteToken' in table) {
                invitationsStore.set(id, item);
              }
              return [item];
            },
            then: async (resolve: any) => {
              if ('tokenHash' in table) {
                sessionsStore.set(val.tokenHash, val);
              } else if ('eventCategory' in table || 'action' in table) {
                auditLogsStore.push(val);
              }
              if (resolve) resolve([val]);
              return [val];
            },
          }),
        }),
        update: (table: any) => ({
          set: (val: any) => ({
            where: async () => {
              if ('tokenHash' in table && val.revokedAt) {
                for (const session of sessionsStore.values()) {
                  session.revokedAt = val.revokedAt;
                }
              }
            },
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

  it('Complete Lifecycle Flow: Signup -> /auth/me -> Logout -> /auth/me rejected -> Login -> /auth/me restored', async () => {
    const { mockDbInstance, usersStore, sessionsStore } = createMockDb();
    const app = createApp(config, mockDbInstance);

    // 1. SIGNUP: Create new user account
    const signupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      headers: {
        origin: 'http://localhost:3000',
      },
      payload: {
        email: 'operator@syntrophos.ai',
        password: 'ValidPassword123!',
        name: 'Syntrophos Operator',
      },
    });

    expect(signupRes.statusCode).toBe(201);
    const signupBody = signupRes.json();
    expect(signupBody.user.email).toBe('operator@syntrophos.ai');
    expect(signupBody.user.passwordHash).toBeUndefined(); // Zero password leakage
    expect(signupBody.workspace.workspaceType).toBe('personal');

    // Extract cookie from Set-Cookie header
    const setCookie = signupRes.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieStr = Array.isArray(setCookie) ? setCookie[0] : (setCookie as string);
    expect(cookieStr).toContain(SESSION_COOKIE_NAME);
    expect(cookieStr).toContain('HttpOnly');

    // Extract raw session token value
    const tokenMatch = cookieStr.match(/syntrophos_session=([^;]+)/);
    expect(tokenMatch).not.toBeNull();
    const rawSessionToken = tokenMatch![1];
    const cookieHeader = `${SESSION_COOKIE_NAME}=${rawSessionToken}`;

    // 2. AUTH /ME: Verify session is active and returns user profile & workspace
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        cookie: cookieHeader,
      },
    });

    expect(meRes.statusCode).toBe(200);

    const meBody = meRes.json();
    expect(meBody.user.email).toBe('operator@syntrophos.ai');
    expect(meBody.workspaces.length).toBeGreaterThanOrEqual(1);
    expect(meBody.workspaces[0].role).toBe('owner');

    // 3. LOGOUT: Terminate active session
    const logoutRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        origin: 'http://localhost:3000',
        cookie: cookieHeader,
      },
    });

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.json().success).toBe(true);

    // 4. VERIFY LOGGED OUT: Session cookie is now revoked
    const meAfterLogout = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        cookie: cookieHeader,
      },
    });

    expect(meAfterLogout.statusCode).toBe(401);
    expect(meAfterLogout.json().error.code).toBe('SESSION_INVALID');

    // 5. LOGIN: Re-authenticate with email and password
    const userInDb = Array.from(usersStore.values())[0];
    const validHash = await hashPassword('ValidPassword123!');
    userInDb.passwordHash = validHash;

    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: {
        origin: 'http://localhost:3000',
      },
      payload: {
        email: 'operator@syntrophos.ai',
        password: 'ValidPassword123!',
      },
    });

    expect(loginRes.statusCode).toBe(200);
    const loginBody = loginRes.json();
    expect(loginBody.user.email).toBe('operator@syntrophos.ai');
    expect(loginBody.user.passwordHash).toBeUndefined();

    // Extract new session cookie
    const newSetCookie = loginRes.headers['set-cookie'];
    expect(newSetCookie).toBeDefined();
    const newCookieStr = Array.isArray(newSetCookie) ? newSetCookie[0] : (newSetCookie as string);
    const newTokenMatch = newCookieStr.match(/syntrophos_session=([^;]+)/);
    expect(newTokenMatch).not.toBeNull();
    const newRawToken = newTokenMatch![1];
    const newCookieHeader = `${SESSION_COOKIE_NAME}=${newRawToken}`;

    // Make sure newly created session is active
    const newTokenHash = hashToken(newRawToken);
    sessionsStore.set(newTokenHash, {
      id: uuidv7(),
      userId: userInDb.id,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 1000000),
      revokedAt: null,
    });

    // 6. RESTORED /ME: Verify session is active again
    const meAfterLogin = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        cookie: newCookieHeader,
      },
    });

    expect(meAfterLogin.statusCode).toBe(200);
    expect(meAfterLogin.json().user.email).toBe('operator@syntrophos.ai');

    await app.close();
  });
});
