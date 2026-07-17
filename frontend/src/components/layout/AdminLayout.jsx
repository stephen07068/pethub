import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  MdDashboard, MdInventory2, MdCategory, MdShoppingBag, 
  MdWarehouse, MdSettings, MdAnalytics, MdLogout, MdMenu, MdClose
} from 'react-icons/md';
import { adminApi } from '../../services/api';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');

  useEffect(() => {
    const token = localStorage.getItem('psh_admin_token');
    if (!token) {
      setAuthChecked(true);
      setIsAuthed(false);
      return;
    }
    adminApi.me()
      .then(res => {
        const data = res?.data || res;
        setAdminName(data?.full_name || data?.name || 'Admin User');
        setIsAuthed(true);
        setAuthChecked(true);
      })
      .catch(() => {
        localStorage.removeItem('psh_admin_token');
        setIsAuthed(false);
        setAuthChecked(true);
      });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #006e2f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#5d5f5f', fontSize: '14px' }}>Verifying session...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: MdDashboard },
    { name: 'Products', path: '/admin/products', icon: MdInventory2 },
    { name: 'Categories', path: '/admin/categories', icon: MdCategory },
    { name: 'Orders', path: '/admin/orders', icon: MdShoppingBag },
    { name: 'Inventory', path: '/admin/inventory', icon: MdWarehouse },
    { name: 'Settings', path: '/admin/settings', icon: MdSettings },
    { name: 'Analytics', path: '/admin/analytics', icon: MdAnalytics },
  ];

  const Logo = () => (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lgAdmin" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00a846"/>
          <stop offset="100%" stopColor="#004d20"/>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="42" height="42" rx="12" fill="url(#lgAdmin)" />
      <ellipse cx="22" cy="27" rx="7" ry="6" fill="white"/>
      <ellipse cx="13.5" cy="19" rx="3" ry="3.8" fill="white"/>
      <ellipse cx="19" cy="16.5" rx="3" ry="3.5" fill="white"/>
      <ellipse cx="25" cy="16.5" rx="3" ry="3.5" fill="white"/>
      <ellipse cx="30.5" cy="19" rx="3" ry="3.8" fill="white"/>
    </svg>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* ── Mobile Top Bar ── */}
      <div style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
        backgroundColor: 'white', borderBottom: '1px solid #e2e8f0',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 30,
      }} className="admin-mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Logo />
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#121c2a' }}>
            PetStore<span style={{ color: '#006e2f' }}>Hub</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <MdMenu size={24} color="#5d5f5f" />
        </button>
      </div>

      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          className="admin-overlay"
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, height: '100%', width: '260px',
        backgroundColor: 'white', borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', zIndex: 50,
        transition: 'transform 0.3s ease',
        boxShadow: isMobileMenuOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none',
      }} className={`admin-sidebar ${isMobileMenuOpen ? 'admin-sidebar-open' : ''}`}>
        {/* Sidebar Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Logo />
            <div>
              <p style={{ fontWeight: 800, fontSize: '15px', color: '#121c2a', lineHeight: 1.2 }}>PetStore<span style={{ color: '#006e2f' }}>Hub</span></p>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#006e2f', textTransform: 'uppercase' }}>Admin</p>
            </div>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex' }}
            className="admin-close-btn"
          >
            <MdClose size={20} color="#5d5f5f" />
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '10px', textDecoration: 'none',
                  fontWeight: isActive ? 600 : 500, fontSize: '14px',
                  backgroundColor: isActive ? '#e8f5ee' : 'transparent',
                  color: isActive ? '#006e2f' : '#5d5f5f',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — user info + logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e8f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006e2f', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#121c2a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminName}</p>
              <p style={{ fontSize: '11px', color: '#5d5f5f' }}>Store Manager</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('psh_admin_token'); navigate('/admin/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5d5f5f', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 14px', cursor: 'pointer', fontWeight: 500, fontSize: '13px', width: '100%', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ba1a1a'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.backgroundColor = '#fff5f5'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5d5f5f'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <MdLogout size={18} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '32px', overflowX: 'hidden', minWidth: 0 }} className="admin-main">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-mobile-bar { display: flex !important; }
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.admin-sidebar-open { transform: translateX(0); }
          .admin-main { margin-left: 0 !important; padding: 80px 16px 24px !important; }
          .admin-overlay { display: block; }
        }
        @media (min-width: 769px) {
          .admin-mobile-bar { display: none !important; }
          .admin-sidebar { transform: translateX(0) !important; }
          .admin-close-btn { display: none !important; }
          .admin-overlay { display: none !important; }
        }
      `}</style>
    </div>
  );
}
