import { getContent } from '@/lib/content';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import AboutBento from '@/components/AboutBento';
import Journey from '@/components/Journey';
import PromoVideo from '@/components/PromoVideo';
import Guidelines from '@/components/Guidelines';
import SelectedTeams from '@/components/SelectedTeams';
import CtaBand from '@/components/CtaBand';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const revalidate = 60; // ISR cache default

export default async function HomePage() {
  const content = await getContent();

  return (
    <>
      <Nav content={content} />
      <main>
        <Hero content={content} />
        <AboutBento content={content} />
        <Journey content={content} />
        <PromoVideo content={content} />
        <Guidelines content={content} />
        <SelectedTeams content={content} />
        <section className="s-foot" id="start">
          <div className="wrap">
            <CtaBand content={content} />
            <Contact content={content} />
          </div>
        </section>
      </main>
      <Footer content={content} />
    </>
  );
}
