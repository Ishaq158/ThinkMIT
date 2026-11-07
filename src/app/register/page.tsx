import React from 'react';
import { getContent } from '@/lib/content';
import { getRegistrationState } from '@/lib/registration-state';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RegisterForm from '@/components/RegisterForm';

export const metadata = {
  title: 'Register Team — THINK MIT',
  description: 'Online registration for THINK MIT Innovation Pitchfest.',
};

export default async function RegisterPage() {
  const content = await getContent();
  const regState = getRegistrationState(content.registration);

  return (
    <>
      <Nav content={content} />
      <main className="reg-page">
        <div className="wrap">
          <div className="sec-head" style={{ textAlign: 'center' }}>
            <span className="eyebrow rv">Registration</span>
            <h1 className="h2 split" data-split style={{ marginTop: '12px' }}>
              Register Your Team
            </h1>
            <p className="lead rv" style={{ '--d': 2 } as React.CSSProperties}>
              {regState.deadlineLabel
                ? `Submission deadline: ${regState.deadlineLabel}. Form a team of three and submit your idea.`
                : 'Form a team of exactly three members and pitch your campus solution.'}
            </p>
          </div>

          <RegisterForm content={content} />
        </div>
      </main>
      <Footer content={content} />
    </>
  );
}

