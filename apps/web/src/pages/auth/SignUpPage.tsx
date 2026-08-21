import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth.js';
import { Button, Input, Label } from '@/components/ui/primitives.js';
import { IconEye, IconEyeOff } from '@/lib/icons.js';
import { setFirstTimeUser } from '@/lib/services/onboarding.js';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to /core
  useEffect(() => {
    if (user) {
      navigate('/core', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!terms) {
      setErrorMsg('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password should be at least 8 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await signUp(email, password, name.trim());

      if (res.error) {
        setErrorMsg(res.error.message);
        return;
      }

      setFirstTimeUser(true);
      navigate('/core', { replace: true });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', background: '#040201', color: '#fff5e6', fontFamily: 'var(--font-sans)' }}>
      {/* LEFT COLUMN: EDITORIAL BRAND IDENTITY */}
      <div
        style={{
          padding: '60px 56px',
          background: 'linear-gradient(135deg, rgba(14, 7, 1, 0.95) 0%, rgba(6, 3, 1, 0.98) 100%)',
          borderRight: '1px solid rgba(255, 170, 48, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo Header */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', width: 'fit-content' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffaa30', boxShadow: '0 0 10px rgba(255, 170, 48, 0.8)' }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.12em', color: '#fff5e6', fontFamily: 'var(--font-mono)' }}>
            SYNTHROPHOS
          </span>
        </Link>

        {/* Narrative & Visual Concept */}
        <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)' }}>
            INTELLIGENT WORKSPACE
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#fff5e6', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            THE AI OPERATING SYSTEM FOR YOUR WORK.
          </h1>

          <p style={{ fontSize: 16, color: '#d99a4e', lineHeight: 1.6, margin: 0 }}>
            Bring your conversations, tasks, projects, schedule, knowledge, agents, and workflows into one connected environment.
          </p>

          <div style={{ display: 'flex', gap: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 170, 48, 0.15)', fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>
            <span>CONTEXT</span>
            <span style={{ color: '#ffaa30' }}>·</span>
            <span>INTELLIGENCE</span>
            <span style={{ color: '#ffaa30' }}>·</span>
            <span>ACTION</span>
          </div>
        </div>

        {/* System Telemetry Metadata */}
        <div style={{ fontSize: 11, color: '#885522', fontFamily: 'var(--font-mono)' }}>
          SYNTHROPHOS OS // v0.1.0 · CUSTOM AUTH
        </div>
      </div>

      {/* RIGHT COLUMN: AUTHENTICATION FORM */}
      <div style={{ padding: '60px 64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: '#ffaa30', fontWeight: 'bold', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)' }}>
              CREATE YOUR SYNTHROPHOS
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff5e6', letterSpacing: '-0.01em', margin: 0 }}>
              Build your workspace.
            </h2>
            <p style={{ fontSize: 14, color: '#d99a4e', margin: 0 }}>
              Start with your own intelligent workspace.
            </p>
          </div>

          {/* Status Messages */}
          {errorMsg && (
            <div style={{ padding: '12px 16px', background: 'rgba(255, 60, 60, 0.12)', border: '1px solid rgba(255, 80, 80, 0.35)', borderRadius: 6, color: '#ff9999', fontSize: 13, lineHeight: 1.5 }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="name" style={{ fontSize: 12, color: '#ffcc66', fontWeight: 600 }}>Full Name</Label>
              <Input
                id="name"
                required
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ background: 'rgba(16, 8, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.25)', color: '#fff5e6', padding: '10px 14px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="email" style={{ fontSize: 12, color: '#ffcc66', fontWeight: 600 }}>Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: 'rgba(16, 8, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.25)', color: '#fff5e6', padding: '10px 14px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="password" style={{ fontSize: 12, color: '#ffcc66', fontWeight: 600 }}>Password</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ background: 'rgba(16, 8, 2, 0.8)', borderColor: 'rgba(255, 170, 48, 0.25)', color: '#fff5e6', padding: '10px 40px 10px 14px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer', padding: 4 }}
                >
                  {showPassword ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#d99a4e', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                style={{ accentColor: '#ffaa30', width: 15, height: 15 }}
              />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>

            {/* Submit CTA */}
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="public-btn-tactile"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 'bold', padding: '12px 20px', borderRadius: 4, marginTop: 6 }}
            >
              {isLoading ? '[ CREATING ACCOUNT... ]' : '[ CREATE ACCOUNT ]'}
            </Button>
          </form>

          {/* Navigation Footer */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#d99a4e' }}>
            Already have an account?&nbsp;
            <Link to="/sign-in" style={{ color: '#ffcc66', textDecoration: 'none', fontWeight: 'bold' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

