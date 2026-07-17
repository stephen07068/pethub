import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { MdArrowBack } from 'react-icons/md';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go to dashboard
    if (localStorage.getItem('psh_admin_token')) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await adminApi.login(email, password);
      // Backend returns { success, data: { token, admin: {...} } }
      const body = res?.data || res;
      const data = body?.data || body;
      
      if (data?.token) {
        localStorage.setItem('psh_admin_token', data.token);
        navigate('/admin');
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-12 shadow-card border border-border-light text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <svg width="48" height="48" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="loginLogoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00a846"/>
                <stop offset="100%" stopColor="#004d20"/>
              </linearGradient>
              <filter id="loginLogoShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00000033"/>
              </filter>
            </defs>
            <rect x="1" y="1" width="42" height="42" rx="12" fill="url(#loginLogoGrad)" filter="url(#loginLogoShadow)"/>
            <ellipse cx="22" cy="27" rx="7" ry="6" fill="white"/>
            <ellipse cx="13.5" cy="19" rx="3" ry="3.8" fill="white"/>
            <ellipse cx="19" cy="16.5" rx="3" ry="3.5" fill="white"/>
            <ellipse cx="25" cy="16.5" rx="3" ry="3.5" fill="white"/>
            <ellipse cx="30.5" cy="19" rx="3" ry="3.8" fill="white"/>
          </svg>
          <span className="leading-none text-left">
            <span className="block text-2xl font-black tracking-tight text-gray-900">PetStore</span>
            <span className="block text-[11px] font-bold tracking-[0.18em] text-[#006e2f] uppercase">Hub</span>
          </span>
        </div>
        <p className="text-secondary text-body-lg mb-8 uppercase tracking-widest text-[12px] font-semibold">Admin Portal</p>
        
        {error && (
          <div className="bg-error/10 text-error p-3 rounded-lg text-label-sm mb-6 text-left border border-error/20">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <Input 
            label="Email Address" 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required 
          />
          
          <div className="pt-4">
            <Button type="submit" fullWidth isLoading={isLoading}>
              Sign In
            </Button>
          </div>
        </form>

        {/* Return to Home link */}
        <div className="mt-8 pt-6 border-t border-border-light text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-medium">
            <MdArrowBack size={16} /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
