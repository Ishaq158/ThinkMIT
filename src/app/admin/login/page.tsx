'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError('Supabase client is not configured.');
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !data.user) {
        setError(authError?.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // Check if user email is authorized via backend check
      const checkRes = await fetch('/api/admin/stats');
      if (checkRes.status === 403) {
        await supabase.auth.signOut();
        setError('Access denied: Your email is not authorized in ADMIN_EMAILS.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'var(--bg)' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '44px', height: '44px', margin: '0 auto 12px', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 40 40" fill="#2a1a12">
              <path d="M5 5h13v13H5zM22 22h13v13H22z" />
              <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--ink)' }}>THINK MIT Admin</h1>
          <p style={{ fontSize: '13px', color: '#6a594d', marginTop: '6px' }}>Sign in to manage the event</p>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '12px', background: '#fdedec', border: '1px solid #c8553d', color: '#b0412c', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahulshree.1025@gmail.com"
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn-dark"
            disabled={loading}
            style={{ width: '100%', marginTop: '24px', height: '44px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

