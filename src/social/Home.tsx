import { useEffect, useState } from 'react';
import { LuClapperboard, LuLayers, LuLink, LuMail, LuPalette, LuShare2 } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { api } from './api';
import { DEMO_PROFILE } from './demo';
import Logo from './Logo';
import PhoneFrame, { PHONE_W } from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import { useViewport } from './useViewport';

const FEATURES = [
  { Icon: LuLink, title: 'All your links, one page', text: 'Add as many links as you like as buttons, cards or big banners, each with its own icon or thumbnail.' },
  { Icon: LuLayers, title: 'Pages inside your phone', text: 'Split your page into tabs. Every page is built from blocks you can mix and reorder freely.' },
  { Icon: LuClapperboard, title: 'Show your work', text: 'Photo galleries, YouTube, Instagram, Spotify, TikTok and Vimeo embeds.' },
  { Icon: LuPalette, title: 'Make it yours', text: 'Themes, gradients, background photos, fonts, shadows and three navigation styles.' },
  { Icon: LuMail, title: 'Collect emails and messages', text: 'Add a contact form and read everything in your inbox. Export it any time.' },
  { Icon: LuShare2, title: 'Looks great when shared', text: 'Your link shows a clean preview card on Discord, X, iMessage and more. Free, always.' },
];

const STEPS = [
  ['Sign up', 'Continue with Google. It takes about ten seconds.'],
  ['Build your page', 'Add links, pick a theme and watch the live preview update.'],
  ['Share it', 'Put one link in your bio, your videos, your email signature.'],
];

export default function Home() {
  const { w } = useViewport();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    document.title = 'social: one page for all your links';
    api
      .me()
      .then((r) => setSignedIn(r.signedIn))
      .catch(() => {});
  }, []);

  const scale = w >= 900 ? 0.72 : Math.min(0.85, (w - 32) / PHONE_W);

  return (
    <div className="hm">
      <header className="hm-nav">
        <Link to="/" aria-label="social home" className="hm-logo">
          <Logo size={34} />
        </Link>
        <nav>
          {signedIn ? (
            <Link className="ed-btn primary" to="/edit">
              Edit my page
            </Link>
          ) : (
            <>
              <Link className="hm-login" to="/login">
                Log in
              </Link>
              <Link className="ed-btn primary" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="hm-hero">
        <div className="hm-hero-text">
          <span className="hm-pill">Free link pages</span>
          <h1>
            Everything you share,
            <br />
            <span className="hm-grad">in one place.</span>
          </h1>
          <p>
            Build a beautiful page for your links, photos and videos, and share it with a single
            URL. Put it in your bio and let people find everything you do.
          </p>
          <div className="hm-cta">
            <Link className="hm-big primary" to={signedIn ? '/edit' : '/signup'}>
              {signedIn ? 'Go to my page' : 'Create your page'}
            </Link>
            {!signedIn && (
              <Link className="hm-big" to="/login">
                Log in
              </Link>
            )}
          </div>
          <div className="hm-url">
            social.jrofficial.org/<b>yourname</b>
          </div>
        </div>

        <div className="hm-hero-phone">
          <PhoneFrame scale={scale}>
            <ProfileScreen profile={DEMO_PROFILE} />
          </PhoneFrame>
          <div className="hm-hint">This one is interactive. Try the tabs.</div>
        </div>
      </section>

      <section className="hm-section">
        <h2>Everything you need, nothing you don't</h2>
        <div className="hm-grid">
          {FEATURES.map((f) => (
            <div className="hm-card" key={f.title}>
              <div className="hm-card-icon"><f.Icon size={20} /></div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hm-section alt">
        <h2>Up and running in a minute</h2>
        <div className="hm-steps">
          {STEPS.map(([title, text], i) => (
            <div className="hm-step" key={title}>
              <span>{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hm-final">
        <h2>Ready to make yours?</h2>
        <Link className="hm-big primary" to={signedIn ? '/edit' : '/signup'}>
          {signedIn ? 'Go to my page' : 'Create your page'}
        </Link>
      </section>

      <footer className="hm-foot">
        <Logo size={22} />
        <span>
          A <a href="https://jrofficial.org">JR.</a> project
        </span>
      </footer>
    </div>
  );
}
