import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/primitives.js';
import { SyntrophosLoading } from '@/components/ui/SyntrophosLoading.js';

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: scrolled ? '14px 40px' : '22px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(5, 3, 1, 0.94)' : 'rgba(4, 2, 1, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 170, 48, 0.15)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* LEFT CLUSTER: LOGO + NAV LINKS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link to="/" className="public-nav-link" style={{ gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffaa30', boxShadow: '0 0 10px rgba(255, 170, 48, 0.8)' }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.12em', color: '#fff5e6', fontFamily: 'var(--font-mono)' }}>
            SYNTHROPHOS
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            to="/about"
            className="public-nav-link"
            style={{
              color: location.pathname === '/about' ? '#ffcc66' : '#d99a4e',
            }}
          >
            About
          </Link>
          <Link
            to="/faq"
            className="public-nav-link"
            style={{
              color: location.pathname === '/faq' ? '#ffcc66' : '#d99a4e',
            }}
          >
            FAQ
          </Link>
        </nav>
      </div>

      {/* RIGHT CLUSTER: AUTH ACTION BUTTONS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/sign-in" className="public-nav-link" style={{ color: '#fff5e6' }}>
          Log in
        </Link>
        <Button
          variant="primary"
          size="sm"
          className="public-btn-tactile"
          onClick={() => navigate('/sign-up')}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold', padding: '9px 18px', borderRadius: 4 }}
        >
          [ GET STARTED ]
        </Button>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255, 170, 48, 0.15)', background: '#020100', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, fontSize: 12, color: '#885522', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#fff5e6', fontWeight: 'bold' }}>SYNTHROPHOS</span>
        <span>© 2026 Syntrophos Systems. All rights reserved.</span>
      </div>

      <div style={{ display: 'flex', gap: 24, color: '#d99a4e' }}>
        <Link to="/about" className="public-nav-link">About</Link>
        <Link to="/faq" className="public-nav-link">FAQ</Link>
        <span style={{ color: '#885522' }}>Privacy</span>
        <span style={{ color: '#885522' }}>Terms</span>
        <span style={{ color: '#885522' }}>Contact</span>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 140);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div style={{ background: '#040201', color: '#fff5e6', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <main style={{ flex: '1 0 auto', width: '100%', position: 'relative' }}>
        {loading ? (
          <div style={{ padding: '60px 40px', display: 'flex', justifyContent: 'center' }}>
            <SyntrophosLoading variant="workspace" label="LOADING SECTION" statusMessage="SYNCHRONIZING PUBLIC MATRIX" />
          </div>
        ) : (
          <div key={location.pathname} className="public-page-fade">
            <Outlet />
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
