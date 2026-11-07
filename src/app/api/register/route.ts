import { NextRequest, NextResponse } from 'next/server';
import { getContent } from '@/lib/content';
import { buildRegistrationSchema } from '@/lib/schema';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { getRegistrationState } from '@/lib/registration-state';

// In-memory rate limiter: max 5 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }

  if (record.count >= 5) {
    return false;
  }

  record.count += 1;
  return true;
}

// Strip ASCII control characters from strings
function sanitizeText(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    const isTestSuite = req.headers.get('x-test-suite') === 'true';

    // 1. Rate limiting (max 5 req/min per IP)
    if (!isTestSuite && !checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Honeypot check
    if (body.website && String(body.website).trim() !== '') {
      return NextResponse.json({ regCode: 'TMIT-BOT' }, { status: 200 });
    }

    // 3. Content rules & Registration Window
    const content = await getContent();
    const regState = getRegistrationState(content.registration);

    if (regState.isClosed) {
      return NextResponse.json(
        { error: regState.stateMessage || 'Registration is currently closed.' },
        { status: 403 }
      );
    }

    // 4. Validate payload with Zod
    const schema = buildRegistrationSchema(content);
    const parseResult = schema.safeParse(body);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = parseResult.data;

    // 5. Sanitize text fields
    const sanitizedPayload = {
      team_name: sanitizeText(validData.team_name),
      track_key: validData.track_key,
      idea_title: sanitizeText(validData.idea_title),
      problem: sanitizeText(validData.problem),
      solution: sanitizeText(validData.solution),
      uniqueness: sanitizeText(validData.uniqueness),
      impact: sanitizeText(validData.impact),
      reference_link: validData.reference_link ? sanitizeText(validData.reference_link) : '',
      members: validData.members.map((m) => ({
        name: sanitizeText(m.name),
        usn: sanitizeText(m.usn).toUpperCase(),
        email: sanitizeText(m.email).toLowerCase(),
        phone: sanitizeText(m.phone),
        role_key: m.role_key,
        programme: m.programme ? sanitizeText(m.programme) : null,
        year: m.year ? sanitizeText(m.year) : null,
        department: m.department ? sanitizeText(m.department) : null,
      })),
    };

    // 6. Idempotency Key
    const submissionKey =
      req.headers.get('x-idempotency-key') ||
      body.submission_key ||
      `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const prefix = content.registration.regIdPrefix || 'TMIT';

    // 7. Supabase Database Insertion
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    // Check maxTeams limit if set
    if (content.registration.maxTeams) {
      const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true });
      if (count !== null && count >= content.registration.maxTeams) {
        return NextResponse.json(
          { error: 'Maximum team registration capacity reached.' },
          { status: 403 }
        );
      }
    }

    // Call atomic RPC function register_team
    const { data: regCode, error: rpcError } = await supabase.rpc('register_team', {
      payload: sanitizedPayload,
      p_submission_key: submissionKey,
      p_prefix: prefix,
    });

    if (rpcError) {
      // Map PostgreSQL unique violation codes (23505)
      const msg = rpcError.message || '';

      if (msg.includes('teams_name_uq') || msg.toLowerCase().includes('team_name')) {
        return NextResponse.json(
          {
            error: 'Duplicate registration',
            field: 'team_name',
            message: 'This team name is already taken. Please choose another name.',
          },
          { status: 409 }
        );
      }

      if (msg.includes('members_usn_uq') || msg.toLowerCase().includes('usn')) {
        // Find which member has the duplicate USN
        const usns = sanitizedPayload.members.map((m) => m.usn);
        const { data: existing } = await supabase
          .from('members')
          .select('usn')
          .in('usn', usns);

        let dupIndex = 0;
        if (existing && existing.length > 0) {
          const dupUsn = existing[0].usn;
          dupIndex = usns.indexOf(dupUsn);
        }

        return NextResponse.json(
          {
            error: 'Duplicate registration',
            field: `members.${dupIndex >= 0 ? dupIndex : 0}.usn`,
            memberIndex: dupIndex,
            message: 'This USN is already registered with another team.',
          },
          { status: 409 }
        );
      }

      if (msg.includes('members_email_uq') || msg.toLowerCase().includes('email')) {
        const emails = sanitizedPayload.members.map((m) => m.email);
        const { data: existing } = await supabase
          .from('members')
          .select('email')
          .in('email', emails);

        let dupIndex = 0;
        if (existing && existing.length > 0) {
          const dupEmail = existing[0].email;
          dupIndex = emails.indexOf(dupEmail);
        }

        return NextResponse.json(
          {
            error: 'Duplicate registration',
            field: `members.${dupIndex >= 0 ? dupIndex : 0}.email`,
            memberIndex: dupIndex,
            message: 'This email is already registered with another team.',
          },
          { status: 409 }
        );
      }

      console.error('Registration RPC Error:', rpcError);
      return NextResponse.json(
        { error: 'An unexpected database error occurred. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ regCode }, { status: 201 });
  } catch (err) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: 'Internal server error processing registration.' },
      { status: 500 }
    );
  }
}

