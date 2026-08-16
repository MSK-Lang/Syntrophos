import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SyntrophosOrb from '@/components/SyntrophosOrb';

export default function CorePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000000' }}>
      {/* Direct link to Dashboard HUD control */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 30 }}>
        <Link
          to="/dashboard"
          className="hud-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            fontSize: '12px',
            padding: '0 14px',
            height: '38px',
          }}
        >
          <span>▦</span>
          <span>DASHBOARD</span>
        </Link>
      </div>

      <SyntrophosOrb />
    </div>
  );
}
