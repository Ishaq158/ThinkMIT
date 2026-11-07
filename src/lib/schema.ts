import { z } from 'zod';
import type { SiteContent } from './content';

export function buildRegistrationSchema(content: SiteContent) {
  const { registration, form, roles, tracks } = content;
  const val = registration.validation;
  const limits = registration.ideaLimits;

  const trackKeys = tracks.map((t) => t.key) as [string, ...string[]];
  const roleKeys = roles.map((r) => r.key) as [string, ...string[]];

  const usnRegex = new RegExp(val.usnRegex || '^[A-Za-z0-9]{10}$');
  const phoneRegex = new RegExp(val.phoneRegex || '^[6-9][0-9]{9}$');

  // Single member schema
  const memberSchema = z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be at most 80 characters'),
    usn: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine((val) => usnRegex.test(val), {
        message: 'Invalid USN format (e.g. 4MH23CS001)',
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address')
      .refine(
        (email) => {
          const allowList = (val.emailDomainAllowList || []) as string[];
          if (allowList.length === 0) {
            return true;
          }
          const domain = email.split('@')[1];
          return allowList.includes(domain);
        },
        {
          message: `Email must belong to one of: ${((val.emailDomainAllowList || []) as string[]).join(', ')}`,
        }
      ),
    phone: z
      .string()
      .trim()
      .transform((p) => p.replace(/[\s\-\+]/g, '').replace(/^91/, '').replace(/^0/, ''))
      .refine((p) => phoneRegex.test(p), {
        message: 'Invalid 10-digit mobile number',
      }),
    role_key: z.enum(roleKeys, {
      errorMap: () => ({ message: 'Invalid training stream selected' }),
    }),
    programme: form.member.programme?.enabled
      ? z.enum(form.programmeOptions as [string, ...string[]], {
          errorMap: () => ({ message: 'Please select an eligible programme' }),
        })
      : z.string().optional(),
    year: form.member.year?.enabled
      ? z.string().trim().min(1, 'Year/Semester is required')
      : z.string().optional(),
    department: form.member.department?.enabled
      ? z.string().trim().min(1, 'Department is required')
      : z.string().optional(),
  });

  // Complete registration payload schema
  return z
    .object({
      team_name: z
        .string()
        .trim()
        .min(val.teamNameMin || 3, `Team name must be at least ${val.teamNameMin || 3} characters`)
        .max(val.teamNameMax || 40, `Team name must be at most ${val.teamNameMax || 40} characters`),
      track_key: z.enum(trackKeys, {
        errorMap: () => ({ message: 'Please select a valid track' }),
      }),
      members: z
        .array(memberSchema)
        .length(3, 'A team must have exactly 3 members')
        .superRefine((members, ctx) => {
          // Check USN uniqueness within form
          const usns = new Set<string>();
          members.forEach((m, idx) => {
            const u = m.usn.toUpperCase();
            if (usns.has(u)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Duplicate USN inside the team',
                path: [idx, 'usn'],
              });
            }
            usns.add(u);
          });

          // Check Email uniqueness within form
          const emails = new Set<string>();
          members.forEach((m, idx) => {
            const e = m.email.toLowerCase();
            if (emails.has(e)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Duplicate Email inside the team',
                path: [idx, 'email'],
              });
            }
            emails.add(e);
          });

          // Check distinct stream roles (3 different streams)
          const streams = new Set<string>();
          members.forEach((m, idx) => {
            if (streams.has(m.role_key)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'All three members must choose different streams',
                path: [idx, 'role_key'],
              });
            }
            streams.add(m.role_key);
          });
        }),
      idea_title: z
        .string()
        .trim()
        .min(3, 'Idea title must be at least 3 characters')
        .max(limits.titleMax, `Idea title max ${limits.titleMax} characters`),
      problem: z
        .string()
        .trim()
        .min(10, 'Problem statement must be at least 10 characters')
        .max(limits.problemMax, `Problem statement max ${limits.problemMax} characters`),
      solution: z
        .string()
        .trim()
        .min(10, 'Proposed solution must be at least 10 characters')
        .max(limits.solutionMax, `Proposed solution max ${limits.solutionMax} characters`),
      uniqueness: z
        .string()
        .trim()
        .min(10, 'Innovation & uniqueness must be at least 10 characters')
        .max(limits.uniquenessMax, `Innovation & uniqueness max ${limits.uniquenessMax} characters`),
      impact: z
        .string()
        .trim()
        .min(10, 'Expected impact must be at least 10 characters')
        .max(limits.impactMax, `Expected impact max ${limits.impactMax} characters`),
      reference_link: z
        .string()
        .trim()
        .optional()
        .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
          message: 'Supporting link must be a valid http(s) URL (e.g. Google Drive, Canva, Figma)',
        }),
      consent: z.literal(true, {
        errorMap: () => ({ message: 'You must confirm the consent checkbox' }),
      }),
      website: z.string().optional(), // Honeypot
    });
}
