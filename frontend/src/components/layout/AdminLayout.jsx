import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  MdDashboard, MdInventory2, MdCategory, MdShoppingBag, 
  MdWarehouse, MdSettings, MdAnalytics, MdLogout
} from 'react-icons/md';
import { adminApi } from '../../services/api';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('psh_admin_token');
    if (!token) {
      setAuthChecked(true);
      setIsAuthed(false);
      return;
    }
    // Verify the token is still valid on the backend
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

  // While checking auth, show a loading spinner
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

  // Not authenticated — redirect to login
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border-light flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradMob" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00a846"/>
                <stop offset="100%" stopColor="#004d20"/>
              </linearGradient>
            </defs>
            <rect x="1" y="1" width="42" height="42" rx="12" fill="url(#logoGradMob)" />
            <ellipse cx="22" cy="27" rx="7" ry="6" fill="white"/>
            <ellipse cx="13.5" cy="19" rx="3" ry="3.8" fill="white"/>
            <ellipse cx="19" cy="16.5" rx="3" ry="3.5" fill="white"/>
            <ellipse cx="25" cy="16.5" rx="3" ry="3.5" fill="white"/>
            <ellipse cx="30.5" cy="19" rx="3" ry="3.8" fill="white"/>
          </svg>
          <span className="font-black text-gray-900 leading-tight">
            PetStore<span className="text-[#006e2f]">Hub</span> Admin
          </span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MdMenu size={28} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-white shadow-md border-r border-border-light flex flex-col z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-border-light">
          <Link to="/" className="flex items-center gap-3 shrink-0 group mb-1">
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00a846"/>
                  <stop offset="100%" stopColor="#004d20"/>
                </linearGradient>
                <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00000033"/>
                </filter>
              </defs>
              <rect x="1" y="1" width="42" height="42" rx="12" fill="url(#logoGrad)" filter="url(#logoShadow)"/>
              <ellipse cx="22" cy="27" rx="7" ry="6" fill="white"/>
              <ellipse cx="13.5" cy="19" rx="3" ry="3.8" fill="white"/>
              <ellipse cx="19" cy="16.5" rx="3" ry="3.5" fill="white"/>
              <ellipse cx="25" cy="16.5" rx="3" ry="3.5" fill="white"/>
              <ellipse cx="30.5" cy="19" rx="3" ry="3.8" fill="white"/>
            </svg>
            <span className="leading-none">
              <span className="block text-lg font-black tracking-tight text-gray-900">PetStore</span>
              <span className="block text-[10px] font-bold tracking-[0.18em] text-[#006e2f] uppercase">Hub</span>
            </span>
          </Link>
          <span className="text-label-sm text-secondary uppercase tracking-widest mt-1 block">Management Console</span>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container font-medium' 
                    : 'text-secondary hover:bg-surface-container'
                }`}
              >
                <item.icon size={24} className={isActive ? 'text-primary' : ''} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-border-light mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-label-lg text-on-surface truncate">{adminName}</p>
              <p className="text-label-sm text-secondary">Store Manager</p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('psh_admin_token');
              navigate('/admin/login');
            }}
            className="flex items-center gap-2 text-secondary hover:text-error transition-colors w-full p-2"
          >
            <MdLogout size={20} />
            <span className="font-label-lg">Exit Admin</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-[280px] p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
