import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, CardBody, Input, Label, Separator, Toggle } from '@/components/ui/primitives.js';
import { ErrorState } from '@/components/ui/states.js';
import { IconChat, IconLogo, IconProviders, IconWorkspace } from '@/lib/icons.jsx';
import { useAuth } from '@/lib/services/index.js';

export default function SignInPage() {
  const { signIn, getCurrentSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const session = await getCurrentSession();
        if (session) navigate('/', { replace: true });
      } catch {
        /* ignore */
      }
    })();
  }, [getCurrentSession, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn({ email, password, rememberMe: remember });
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: '100vh', background: 'var(--color-background)' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary-500) 15%, transparent) 0%, color-mix(in srgb, var(--color-accent-violet) 12%, transparent) 60%, color-mix(in srgb, var(--color-accent-teal) 10%, transparent) 100%)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            aria-hidden="true"
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-violet))',
              color: 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <IconLogo width={22} height={22} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>Syntrophos</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Think together, remember forever</div>
          </div>
        </div>

        <div style={{ maxWidth: 420 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 var(--space-4)' }}>
            A personal AI that thinks with you.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
            Syntrophos combines multi-agent workflows, Obsidian-grade memory, and voice-first interactions into one calm, thoughtful workspace.
          </p>
          <div style={{ marginTop: 'var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <Feature icon={<IconChat width={16} height={16} />} label="Chat &amp; Reason" tone="primary" />
            <Feature icon={<IconProviders width={16} height={16} />} label="Multi-model" tone="violet" />
            <Feature icon={<IconWorkspace width={16} height={16} />} label="Workspaces" tone="teal" />
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>
          v0.1.0 · Your data stays yours, first.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <Card tone="default" style={{ width: '100%', maxWidth: 440 }}>
          <CardBody style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 var(--space-2)', letterSpacing: '-0.01em' }}>Welcome back</h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>Sign in to pick up exactly where you left off.</p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {error && <ErrorState title="Sign in failed" error={error} size="sm" />}
              <div>
                <Label htmlFor="email" required>Email</Label>
                <Input id="email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <Label htmlFor="password" required>Password</Label>
                  <Link to="/sign-in/reset" style={{ fontSize: 12, textDecoration: 'none' }}>Forgot?</Link>
                </div>
                <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="inline-stack-sm">
                <Toggle checked={remember} onChange={(e) => setRemember(e.target.checked)} label="Remember me" description="Stay signed in on this device" />
              </div>
              <Button variant="primary" type="submit" loading={loading}>Sign in</Button>
            </form>

            <Separator />

            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--color-text-subtle)', textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                Or continue with
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
                <Button variant="secondary" size="md">Google</Button>
                <Button variant="secondary" size="md">GitHub</Button>
                <Button variant="secondary" size="md">Apple</Button>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
              Don't have an account?&nbsp;
              <Link to="/sign-up" style={{ textDecoration: 'none' }}>Create one</Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Feature({ icon, label, tone }: { readonly icon: React.ReactNode; readonly label: string; readonly tone: 'primary' | 'violet' | 'teal' }) {
  const map = {
    primary: 'var(--color-primary-500)',
    violet: 'var(--color-accent-violet)',
    teal: 'var(--color-accent-teal)',
  } as const;
  return (
    <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', color: 'white', background: map[tone], display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
        {icon}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
    </div>
  );
}
