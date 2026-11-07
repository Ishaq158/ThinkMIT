'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import '@/styles/admin.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // If we're on the login page, render children directly without admin shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          router.replace('/admin/login');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          router.replace('/admin/login');
          return;
        }

        // Verify with backend admin check
        const res = await fetch('/api/admin/stats');
        if (!res.ok) {
          await supabase.auth.signOut();
          router.replace('/admin/login');
          return;
        }

        setUserEmail(session.user.email);
      } catch {
        router.replace('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.replace('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6a594d', fontSize: '14px' }}>
          <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid #dfd8ce', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Verifying admin access...
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Overview', href: '/admin', exact: true },
    { label: 'Registrations', href: '/admin/registrations', exact: false },
    { label: 'Content Editor', href: '/admin/content', exact: false },
    { label: 'Promo Video', href: '/admin/video', exact: false },
    { label: 'Media Assets', href: '/admin/media', exact: false },
    { label: 'Settings', href: '/admin/settings', exact: false },
  ];

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <svg className="admin-brand-icon" viewBox="0 0 40 40" fill="var(--ink)">
            <path d="M5 5h13v13H5zM22 22h13v13H22z" />
            <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
          </svg>
          <span className="admin-brand-text">THINK MIT</span>
          <span className="admin-brand-badge">ADMIN</span>
        </Link>

        <nav className="admin-nav">
          {navLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-user-card">
          <div className="admin-user-email" title={userEmail || ''}>
            {userEmail || 'Admin User'}
          </div>
          <button onClick={handleSignOut} className="admin-signout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Event Operations</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: '13px',
                color: '#6a594d',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--tint)',
              }}
            >
              View Public Site ↗
            </Link>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

