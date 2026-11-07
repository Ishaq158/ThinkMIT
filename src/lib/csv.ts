/**
 * CSV Generation for THINK MIT Admin
 * RFC-4180 compliant, UTF-8 BOM, CRLF line endings, Formula Injection Guard
 */

export function formatIST(dateStr?: string | Date | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  // Format to YYYY-MM-DD HH:mm in Asia/Kolkata
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const findPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const day = findPart('day');
  const month = findPart('month');
  const year = findPart('year');
  const hour = findPart('hour');
  const minute = findPart('minute');

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * Sanitizes cell for formula injection and RFC-4180 quoting
 */
export function sanitizeCell(val: any, isPhone: boolean = false): string {
  if (val === null || val === undefined) return '';

  let str = String(val);

  // Phone numbers: prefix with ' to prevent Excel from converting to scientific notation
  if (isPhone && str.length > 0) {
    if (!str.startsWith("'")) {
      str = `'${str}`;
    }
  } else if (/^[=+\-@\t\r]/.test(str)) {
    // Formula-injection guard: prefix with '
    str = `'${str}`;
  }

  // RFC-4180 quoting: if cell contains comma, double-quote, or newline, enclose in quotes and double internal quotes
  if (/[",\r\n]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function generateTeamCSV(
  teams: any[],
  content: any,
  includeInternal: boolean = false
): string {
  const roleMap: Record<string, string> = {};
  (content.roles || []).forEach((r: any) => {
    roleMap[r.key] = r.label;
  });

  const trackMap: Record<string, string> = {};
  (content.tracks || []).forEach((t: any) => {
    trackMap[t.key] = t.title;
  });

  const headers = [
    'Registration ID',
    'Submitted At',
    'Team Name',
    'Track',
    'Status',
    'Idea Title',
    'Problem Statement',
    'Proposed Solution',
    'Innovation & Uniqueness',
    'Expected Impact & Implementation',
    'Supporting Link',
    'Member 1 Name',
    'Member 1 USN',
    'Member 1 Email',
    'Member 1 Contact',
    'Member 1 Stream',
    'Member 1 Programme',
    'Member 1 Year',
    'Member 1 Department',
    'Member 2 Name',
    'Member 2 USN',
    'Member 2 Email',
    'Member 2 Contact',
    'Member 2 Stream',
    'Member 2 Programme',
    'Member 2 Year',
    'Member 2 Department',
    'Member 3 Name',
    'Member 3 USN',
    'Member 3 Email',
    'Member 3 Contact',
    'Member 3 Stream',
    'Member 3 Programme',
    'Member 3 Year',
    'Member 3 Department',
  ];

  if (includeInternal) {
    headers.push('Score', 'Admin Notes');
  }

  const rows: string[] = [headers.join(',')];

  teams.forEach((team) => {
    // Sort members by position (1, 2, 3)
    const members = [...(team.members || [])].sort((a, b) => (a.position || 0) - (b.position || 0));

    const m1 = members[0] || {};
    const m2 = members[1] || {};
    const m3 = members[2] || {};

    const trackDisplay = trackMap[team.track_key] || team.track_key;
    const m1Stream = roleMap[m1.role_key] || m1.role_key || '';
    const m2Stream = roleMap[m2.role_key] || m2.role_key || '';
    const m3Stream = roleMap[m3.role_key] || m3.role_key || '';

    const row = [
      sanitizeCell(team.reg_code),
      sanitizeCell(formatIST(team.created_at)),
      sanitizeCell(team.team_name),
      sanitizeCell(trackDisplay),
      sanitizeCell(team.status),
      sanitizeCell(team.idea_title),
      sanitizeCell(team.problem || team.idea_abstract || ''),
      sanitizeCell(team.solution || ''),
      sanitizeCell(team.uniqueness || ''),
      sanitizeCell(team.impact || ''),
      sanitizeCell(team.reference_link || team.ppt_url || ''),
      // Member 1 (Team Leader)
      sanitizeCell(m1.name),
      sanitizeCell(m1.usn),
      sanitizeCell(m1.email),
      sanitizeCell(m1.phone, true),
      sanitizeCell(m1Stream),
      sanitizeCell(m1.programme),
      sanitizeCell(m1.year),
      sanitizeCell(m1.department || m1.branch),
      // Member 2
      sanitizeCell(m2.name),
      sanitizeCell(m2.usn),
      sanitizeCell(m2.email),
      sanitizeCell(m2.phone, true),
      sanitizeCell(m2Stream),
      sanitizeCell(m2.programme),
      sanitizeCell(m2.year),
      sanitizeCell(m2.department || m2.branch),
      // Member 3
      sanitizeCell(m3.name),
      sanitizeCell(m3.usn),
      sanitizeCell(m3.email),
      sanitizeCell(m3.phone, true),
      sanitizeCell(m3Stream),
      sanitizeCell(m3.programme),
      sanitizeCell(m3.year),
      sanitizeCell(m3.department || m3.branch),
    ];

    if (includeInternal) {
      row.push(
        sanitizeCell(team.score !== null && team.score !== undefined ? team.score : ''),
        sanitizeCell(team.admin_notes || team.internal_notes || '')
      );
    }

    rows.push(row.join(','));
  });

  // UTF-8 BOM + CRLF joined rows
  return '\uFEFF' + rows.join('\r\n');
}

export function generateMemberCSV(teams: any[], content: any): string {
  const roleMap: Record<string, string> = {};
  (content.roles || []).forEach((r: any) => {
    roleMap[r.key] = r.label;
  });

  const trackMap: Record<string, string> = {};
  (content.tracks || []).forEach((t: any) => {
    trackMap[t.key] = t.title;
  });

  const headers = [
    'Registration ID',
    'Team Name',
    'Track',
    'Status',
    'Idea Title',
    'Member Position',
    'Is Team Leader',
    'Name',
    'USN',
    'Email',
    'Contact',
    'Stream',
    'Programme',
    'Year',
    'Department',
  ];

  const rows: string[] = [headers.join(',')];

  teams.forEach((team) => {
    const trackDisplay = trackMap[team.track_key] || team.track_key;
    const members = [...(team.members || [])].sort((a, b) => (a.position || 0) - (b.position || 0));

    members.forEach((m) => {
      const isLeader = m.position === 1 || m.is_leader ? 'Yes' : 'No';
      const streamDisplay = roleMap[m.role_key] || m.role_key || '';

      const row = [
        sanitizeCell(team.reg_code),
        sanitizeCell(team.team_name),
        sanitizeCell(trackDisplay),
        sanitizeCell(team.status),
        sanitizeCell(team.idea_title),
        sanitizeCell(m.position || ''),
        sanitizeCell(isLeader),
        sanitizeCell(m.name),
        sanitizeCell(m.usn),
        sanitizeCell(m.email),
        sanitizeCell(m.phone, true),
        sanitizeCell(streamDisplay),
        sanitizeCell(m.programme),
        sanitizeCell(m.year),
        sanitizeCell(m.department || m.branch),
      ];

      rows.push(row.join(','));
    });
  });

  // UTF-8 BOM + CRLF joined rows
  return '\uFEFF' + rows.join('\r\n');
}

