import { getContent } from '@/lib/content';

export default async function HomePage() {
  const content = await getContent();

  return (
    <main style={{ padding: '40px 24px', textAlign: 'center' }}>
      <h1>{content.site.name}</h1>
      <p style={{ marginTop: '12px', fontSize: '18px', color: 'var(--ink-2)' }}>
        {content.site.tagline}
      </p>
    </main>
  );
}
