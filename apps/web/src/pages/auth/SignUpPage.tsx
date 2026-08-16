import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Input, Label, Toggle } from '@/components/ui/primitives.js';
import { ErrorState } from '@/components/ui/states.js';
import { IconLogo } from '@/lib/icons.jsx';
import { useAuth } from '@/lib/services/index.js';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) {
      setError('Please accept the terms of service');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 'var(--space-8)', background: 'var(--color-background)' }}>
      <Card tone="default" style={{ width: '100%', maxWidth: 440 }}>
        <CardBody style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-violet))', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
              <IconLogo width={22} height={22} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>Create an account</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Start your first workspace in seconds</div>
            </div>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {error && <ErrorState title="Sign up failed" error={error} size="sm" />}
            <div>
              <Label htmlFor="name" required>Full name</Label>
              <Input id="name" autoComplete="name" required placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email" required>Email</Label>
              <Input id="email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password" required>Password</Label>
              <Input id="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Toggle checked={terms} onChange={(e) => setTerms(e.target.checked)} label="I agree to the Terms of Service and Privacy Policy" />
            <Button variant="primary" type="submit" loading={loading}>Create account</Button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
            Already have an account?&nbsp;
            <Link to="/sign-in" style={{ textDecoration: 'none' }}>Sign in</Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
