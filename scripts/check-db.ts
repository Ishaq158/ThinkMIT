import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Helper to load .env.local if present
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkDatabase() {
  console.log('--- SUPABASE DATABASE & STORAGE INTEGRITY CHECK ---');

  if (!supabaseUrl || !serviceKey) {
    console.error('FAIL: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment or .env.local');
    process.exit(1);
  }

  console.log(`Supabase URL: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  let allPass = true;

  // 1. Check table 'teams'
  try {
    const { error } = await supabase.from('teams').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error(`[FAIL] Table 'teams': ${error.message}`);
      allPass = false;
    } else {
      console.log(`[PASS] Table 'teams' exists`);
    }
  } catch (err) {
    console.error(`[FAIL] Table 'teams':`, err);
    allPass = false;
  }

  // 2. Check table 'members'
  try {
    const { error } = await supabase.from('members').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error(`[FAIL] Table 'members': ${error.message}`);
      allPass = false;
    } else {
      console.log(`[PASS] Table 'members' exists`);
    }
  } catch (err) {
    console.error(`[FAIL] Table 'members':`, err);
    allPass = false;
  }

  // 3. Check table 'site_content'
  try {
    const { error } = await supabase.from('site_content').select('section').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error(`[FAIL] Table 'site_content': ${error.message}`);
      allPass = false;
    } else {
      console.log(`[PASS] Table 'site_content' exists`);
    }
  } catch (err) {
    console.error(`[FAIL] Table 'site_content':`, err);
    allPass = false;
  }

  // 4. Check function 'register_team'
  try {
    // Calling with empty payload to test function existence (will fail on jsonb structure or return null, proving function exists)
    const { error } = await supabase.rpc('register_team', {
      payload: {},
      p_submission_key: '__db_probe__',
      p_prefix: 'TEST',
    });
    // If function does not exist: code 42883 or PGRST202
    if (error && (error.code === '42883' || error.message.includes('Could not find the function'))) {
      console.error(`[FAIL] Function 'register_team': ${error.message}`);
      allPass = false;
    } else {
      console.log(`[PASS] Function 'register_team' exists`);
    }
  } catch (err) {
    console.error(`[FAIL] Function 'register_team':`, err);
    allPass = false;
  }

  // 5. Check storage bucket 'media'
  try {
    const { data: bucket, error } = await supabase.storage.getBucket('media');
    if (error || !bucket) {
      console.error(`[FAIL] Storage bucket 'media': ${error?.message || 'Bucket not found'}`);
      allPass = false;
    } else {
      console.log(`[PASS] Storage bucket 'media' exists (public: ${bucket.public})`);
    }
  } catch (err) {
    console.error(`[FAIL] Storage bucket 'media':`, err);
    allPass = false;
  }

  console.log('----------------------------------------------------');
  if (allPass) {
    console.log('ALL DATABASE INTEGRITY CHECKS PASSED.');
    process.exit(0);
  } else {
    console.error('ONE OR MORE CHECKS FAILED.');
    process.exit(1);
  }
}

checkDatabase().catch((err) => {
  console.error('Unexpected check failure:', err);
  process.exit(1);
});
