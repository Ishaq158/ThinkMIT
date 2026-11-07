import Link from 'next/link';
import { getContent } from '@/lib/content';

export default async function PrivacyPage() {
  const content = await getContent();

  return (
    <div style={{ maxWidth: '800px', margin: '80px auto', padding: '0 24px' }}>
      <Link href="/" className="pill" style={{ marginBottom: '24px', display: 'inline-block' }}>
        ← Back to Home
      </Link>
      <h1 className="h2" style={{ marginTop: '16px' }}>Privacy Notice</h1>
      <div className="card" style={{ padding: '32px', marginTop: '24px' }}>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--ink-2)' }}>
          {content.site.name} is organized by {content.site.inAssociationWith} in collaboration with {content.site.organisedBy.join(' and ')}.
        </p>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--ink-2)', marginTop: '16px' }}>
          <strong>Data Usage:</strong> All registration details submitted—including student names, USNs, email addresses, contact numbers, and idea submissions—are collected solely for event administration, verification, training coordination, and evaluation purposes.
        </p>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--ink-2)', marginTop: '16px' }}>
          <strong>Privacy Guarantee:</strong> Personal contact information (USN, phone number, email) is kept confidential and is never shared publicly or disclosed on any public-facing leaderboard or page. Only shortlisted team names and track categories are announced publicly.
        </p>
      </div>
    </div>
  );
}

