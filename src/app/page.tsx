import siteData from '@data';

export default function HomePage() {
  return (
    <main style={{ padding: '40px 24px', textAlign: 'center' }}>
      <h1>{siteData.site.name}</h1>
      <p style={{ marginTop: '12px', fontSize: '18px', color: 'var(--ink-2)' }}>
        {siteData.site.tagline}
      </p>
    </main>
  );
}
