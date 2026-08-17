import { useEffect, useState } from 'react';
import { Button, Input, Separator, Avatar, Field } from '@/components/ui/primitives.js';
import { PageLoader } from '@/components/ui/states.js';
import { useAuth } from '@/lib/services/index.js';

export default function SettingsAccountPage() {
  const { user, updateCurrentUser, changePassword } = useAuth();
  const [loading, setLoading] = useState(!user);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setDisplayName(user.displayName ?? '');
      setEmail(user.email ?? '');
      setLoading(false);
    }
  }, [user]);

  const save = async () => {
    setSaveState('saving');
    try {
      await updateCurrentUser?.({ name, displayName });
      if (oldPassword && newPassword) {
        await changePassword?.(oldPassword, newPassword);
      }
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1800);
    } catch {
      setSaveState('idle');
    }
  };

  if (loading) return <PageLoader label="Loading account settings…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* --- PROFILE SECTION --- */}
      <div>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.14em', color: '#ffaa30', marginBottom: 16 }}>
          PROFILE
        </div>

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Profile photo</div>
            <div className="settings-form-row__desc">Shown across workspace channels and activity logs.</div>
          </div>
          <div className="settings-form-row__control" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ padding: 3, border: '1px solid rgba(255, 170, 48, 0.4)', borderRadius: '50%', background: 'rgba(255, 170, 48, 0.05)' }}>
              <Avatar size="lg" name={displayName || name || email || 'Operator'} tone="primary" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Button variant="secondary" size="sm">Upload image</Button>
              <Button variant="ghost" size="sm">Remove</Button>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.12)', margin: '14px 0' }} />

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Display name</div>
            <div className="settings-form-row__desc">The name visible to teammates and agents.</div>
          </div>
          <div className="settings-form-row__control">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex"
              style={{ maxWidth: 360 }}
            />
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.12)', margin: '14px 0' }} />

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Full legal name</div>
            <div className="settings-form-row__desc">Used for billing, invoices, and system audit logs.</div>
          </div>
          <div className="settings-form-row__control">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              style={{ maxWidth: 360 }}
            />
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255, 170, 48, 0.12)', margin: '14px 0' }} />

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title">Email address</div>
            <div className="settings-form-row__desc">Primary account email used for authentication and notifications.</div>
          </div>
          <div className="settings-form-row__control">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ maxWidth: 360 }}
            />
          </div>
        </div>
      </div>

      {/* --- SECURITY SECTION --- */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.14em', color: '#ffaa30', marginBottom: 16 }}>
          SECURITY &amp; CREDENTIALS
        </div>

        <div
          style={{
            background: 'rgba(22, 12, 3, 0.45)',
            border: '1px solid rgba(255, 170, 48, 0.18)',
            borderRadius: 8,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffcc66' }}>Change access password</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Current password" hint="Required for verification">
              <Input
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Field>
            <Field label="New password" hint="Minimum 12 characters recommended">
              <Input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* --- DANGER ZONE SECTION --- */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.14em', color: '#ff5533', marginBottom: 16 }}>
          DANGER ZONE
        </div>

        <div className="settings-form-row">
          <div className="settings-form-row__label">
            <div className="settings-form-row__title" style={{ color: '#ff5533' }}>Delete account</div>
            <div className="settings-form-row__desc">Permanently erase your account, active agent sessions, and local vault sync.</div>
          </div>
          <div className="settings-form-row__control">
            <Button variant="danger" size="sm">Delete account…</Button>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ACTION BAR --- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          borderTop: '1px solid rgba(255, 170, 48, 0.18)',
          paddingTop: 20,
          marginTop: 12,
        }}
      >
        <Button variant="ghost" size="md">Discard</Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => void save()}
          loading={saveState === 'saving'}
        >
          {saveState === 'saved' ? 'Changes saved' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
