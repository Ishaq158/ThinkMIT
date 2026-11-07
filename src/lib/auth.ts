import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export interface AdminUser {
  id: string;
  email: string;
}

export function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS || '';
  return env
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const list = getAdminEmails();
  return list.includes(email.toLowerCase());
}

/**
 * Server Component / Server Action auth check
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored if called from a Server Component
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return null;
  if (!isEmailAdmin(user.email)) return null;

  return { id: user.id, email: user.email };
}

/**
 * API Route admin guard
 */
export async function requireAdminApi(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { error: NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 }) };
  }

  // 1. Check Bearer token in Authorization header
  const authHeader = req.headers.get('authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Or check cookie-based Supabase token
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  let user = null;
  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) user = data.user;
  } else {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) user = data.user;
  }

  if (!user || !user.email) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (!isEmailAdmin(user.email)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden: You do not have admin permissions' },
        { status: 403 }
      ),
    };
  }

  return { user: { id: user.id, email: user.email } };
}

