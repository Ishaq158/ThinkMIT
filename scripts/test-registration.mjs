import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function postRegister(payload, headers = {}) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-test-suite': 'true',
      ...headers,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runRegistrationTests() {
  console.log('\n======================================================');
  console.log('   MILESTONE 5: REGISTRATION ACCEPTANCE TEST SUITE    ');
  console.log('======================================================\n');

  const testSuffix = Math.floor(Math.random() * 90000 + 10000);

  const team1Name = `Campus Pioneers ${testSuffix}`;
  const team1LeaderUsn = `4MH23CS${String(testSuffix).slice(0, 3)}`;
  const team1LeaderEmail = `leader.${testSuffix}@campus.in`;
  const team1Key = `key_team1_${testSuffix}`;

  const team1Payload = {
    team_name: team1Name,
    track_key: 'track-1',
    members: [
      {
        name: 'Rahul Sharma',
        usn: team1LeaderUsn,
        email: team1LeaderEmail,
        phone: '9876543210',
        role_key: 'business',
        programme: 'UG – 3rd Year',
        year: '3rd Year',
        department: 'CSE-AI',
      },
      {
        name: 'Priya Patel',
        usn: `4MH23EC${String(testSuffix).slice(0, 3)}`,
        email: `priya.${testSuffix}@campus.in`,
        phone: '9876543211',
        role_key: 'innovation',
        programme: 'UG – 3rd Year',
        year: '3rd Year',
        department: 'ECE',
      },
      {
        name: 'Amit Kumar',
        usn: `4MH23IS${String(testSuffix).slice(0, 3)}`,
        email: `amit.${testSuffix}@campus.in`,
        phone: '9876543212',
        role_key: 'technical',
        programme: 'UG – 3rd Year',
        year: '3rd Year',
        department: 'ISE',
      },
    ],
    idea_title: 'Smart Campus Waste Segregation',
    problem: 'Waste segregation is inconsistent across student hostels and campus cafeterias.',
    solution: 'Automated optical and weight sensors with edge AI for real-time sorting.',
    uniqueness: 'Low-cost retrofit module designed for existing campus dustbins.',
    impact: 'Reduces landfill contamination by 70% and generates recycling telemetry.',
    reference_link: 'https://drive.google.com/file/d/sample-pitch-deck-presentation/view',
    consent: true,
  };

  // TEST 1: Submit valid Team 1
  console.log('TEST 1: Submitting Valid Team 1 (with PPT pitch deck link)...');
  const res1 = await postRegister(team1Payload, { 'x-idempotency-key': team1Key });
  console.log(` Status: ${res1.status}, Response:`, res1.data);
  assert.strictEqual(res1.status, 201, 'Valid registration 1 should return 201');
  assert.ok(res1.data.regCode, 'regCode must be returned');
  const code1 = res1.data.regCode;
  console.log(` [PASS] Team 1 created successfully with Registration ID: ${code1}\n`);

  // TEST 2: Double Submit / Idempotent retry with same key
  console.log('TEST 2: Double-Click / Network Retry with same Idempotency Key...');
  const resRetry = await postRegister(team1Payload, { 'x-idempotency-key': team1Key });
  console.log(` Status: ${resRetry.status}, Response:`, resRetry.data);
  assert.strictEqual(resRetry.status, 201, 'Retry should return 201');
  assert.strictEqual(resRetry.data.regCode, code1, 'Retry must return identical regCode without creating second team');
  console.log(` [PASS] Idempotency verified: exactly one team created, returned identical code: ${resRetry.data.regCode}\n`);

  // TEST 3: Submit valid Team 2
  console.log('TEST 3: Submitting Valid Team 2...');
  const team2Payload = {
    ...team1Payload,
    team_name: `Green Energy Innovators ${testSuffix}`,
    members: [
      {
        name: 'Sunita Rao',
        usn: `4MH23EE${String(testSuffix).slice(0, 3)}`,
        email: `sunita.${testSuffix}@campus.in`,
        phone: '9876543213',
        role_key: 'business',
        programme: 'UG – 4th Year',
        year: '4th Year',
        department: 'EEE',
      },
      {
        name: 'Vikas Gowda',
        usn: `4MH23ME${String(testSuffix).slice(0, 3)}`,
        email: `vikas.${testSuffix}@campus.in`,
        phone: '9876543214',
        role_key: 'innovation',
        programme: 'UG – 4th Year',
        year: '4th Year',
        department: 'ME',
      },
      {
        name: 'Divya Nair',
        usn: `4MH23CV${String(testSuffix).slice(0, 3)}`,
        email: `divya.${testSuffix}@campus.in`,
        phone: '9876543215',
        role_key: 'technical',
        programme: 'UG – 4th Year',
        year: '4th Year',
        department: 'Civil',
      },
    ],
    idea_title: 'Rooftop Solar Monitoring',
    reference_link: 'https://canva.com/design/sample-pitch-deck',
  };
  const res2 = await postRegister(team2Payload);
  console.log(` Status: ${res2.status}, Response:`, res2.data);
  assert.strictEqual(res2.status, 201, 'Valid registration 2 should return 201');
  const code2 = res2.data.regCode;
  console.log(` [PASS] Team 2 created successfully with Registration ID: ${code2}\n`);

  // TEST 4: Duplicate Team Name (case-insensitive)
  console.log('TEST 4: Attempting Duplicate Team Name (case-insensitive)...');
  const dupNamePayload = {
    ...team2Payload,
    team_name: team1Name.toLowerCase(), // lower case of team 1
    members: [
      { ...team2Payload.members[0], usn: '4MH23XX991', email: 'xx991@campus.in' },
      { ...team2Payload.members[1], usn: '4MH23XX992', email: 'xx992@campus.in' },
      { ...team2Payload.members[2], usn: '4MH23XX993', email: 'xx993@campus.in' },
    ],
  };
  const resDupName = await postRegister(dupNamePayload);
  console.log(` Status: ${resDupName.status}, Response:`, resDupName.data);
  assert.strictEqual(resDupName.status, 409, 'Duplicate team name should return 409');
  console.log(' [PASS] Duplicate team name was correctly rejected with 409 Conflict\n');

  // TEST 5: Duplicate USN (Member 1 using Team 1 Leader USN)
  console.log('TEST 5: Attempting Duplicate USN from another team...');
  const dupUsnPayload = {
    ...team2Payload,
    team_name: `Unique Team Alpha ${testSuffix}`,
    members: [
      { ...team2Payload.members[0], usn: team1LeaderUsn.toLowerCase() }, // same USN in lowercase
      { ...team2Payload.members[1], usn: '4MH23XX982', email: 'xx982@campus.in' },
      { ...team2Payload.members[2], usn: '4MH23XX983', email: 'xx983@campus.in' },
    ],
  };
  const resDupUsn = await postRegister(dupUsnPayload);
  console.log(` Status: ${resDupUsn.status}, Response:`, resDupUsn.data);
  assert.strictEqual(resDupUsn.status, 409, 'Duplicate USN should return 409');
  assert.ok(resDupUsn.data.field.includes('usn'), 'Error field must target usn');
  console.log(' [PASS] Duplicate USN was correctly rejected with 409 Conflict targeting exact field\n');

  // TEST 6: Duplicate Email (different case)
  console.log('TEST 6: Attempting Duplicate Email (different case)...');
  const dupEmailPayload = {
    ...team2Payload,
    team_name: `Unique Team Beta ${testSuffix}`,
    members: [
      { ...team2Payload.members[0], usn: '4MH23XX971', email: team1LeaderEmail.toUpperCase() }, // same email in uppercase
      { ...team2Payload.members[1], usn: '4MH23XX972', email: 'xx972@campus.in' },
      { ...team2Payload.members[2], usn: '4MH23XX973', email: 'xx973@campus.in' },
    ],
  };
  const resDupEmail = await postRegister(dupEmailPayload);
  console.log(` Status: ${resDupEmail.status}, Response:`, resDupEmail.data);
  assert.strictEqual(resDupEmail.status, 409, 'Duplicate email should return 409');
  assert.ok(resDupEmail.data.field.includes('email'), 'Error field must target email');
  console.log(' [PASS] Duplicate email was correctly rejected with 409 Conflict targeting exact field\n');

  // TEST 7: Invalid phone number bypassing UI (curl test)
  console.log('TEST 7: Invalid Phone Number via raw API call (bypassing UI)...');
  const invalidPhonePayload = {
    ...team2Payload,
    team_name: `Unique Team Gamma ${testSuffix}`,
    members: [
      { ...team2Payload.members[0], phone: '12345' }, // invalid phone
      { ...team2Payload.members[1], usn: '4MH23XX962', email: 'xx962@campus.in' },
      { ...team2Payload.members[2], usn: '4MH23XX963', email: 'xx963@campus.in' },
    ],
  };
  const resInvalidPhone = await postRegister(invalidPhonePayload);
  console.log(` Status: ${resInvalidPhone.status}, Response:`, resInvalidPhone.data);
  assert.strictEqual(resInvalidPhone.status, 400, 'Invalid phone must return 400');
  console.log(' [PASS] Invalid phone format blocked by server API with 400\n');

  // TEST 8: Honeypot field
  console.log('TEST 8: Bot trap (Honeypot field filled)...');
  const honeypotRes = await postRegister({
    ...team1Payload,
    team_name: 'Bot Team',
    website: 'http://spambot.org',
  });
  console.log(` Status: ${honeypotRes.status}, Response:`, honeypotRes.data);
  assert.strictEqual(honeypotRes.status, 200, 'Honeypot must return 200');
  console.log(' [PASS] Bot submission caught by honeypot\n');

  console.log('======================================================');
  console.log('   ALL MILESTONE 5 ACCEPTANCE TESTS PASSED (8/8)      ');
  console.log('======================================================\n');
}

runRegistrationTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
