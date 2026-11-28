import { useEffect, useState } from 'react';
import {
  LuArrowRight, LuBrush, LuChevronDown, LuClapperboard, LuInbox, LuLayers, LuLink, LuMousePointerClick,
  LuShare2, LuUndo2,
} from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api';
import { DEMO_PROFILE } from './demo';
import { Icon } from './icons';
import Logo from './Logo';
import PhoneFrame, { PHONE_W } from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import { PRESETS } from './themes';
import type { SocialProfile } from './types';
import { useViewport } from './useViewport';
import './home.css';

const LOOKS = ['Sunset', 'Midnight', 'Cream', 'Neo', 'Mint', 'Terminal', 'Lavender', 'Noir'];

const withLook = (name: string): SocialProfile => {
  const p = PRESETS.find((x) => x.name === name);
  if (!p || name === 'Sunset') return DEMO_PROFILE;
  // keep the demo's layout choices, swap colours / buttons / font, and drop the per-page looks so the preset shows everywhere
  return {
    ...DEMO_PROFILE,
    theme: { ...DEMO_PROFILE.theme, ...p.theme, btnShadow: p.theme.btnShadow ?? 'none' },
    pages: DEMO_PROFILE.pages.map((pg, i) => (i === 0 ? pg : { ...pg, theme: undefined })),
  };
};

const SHOWCASE = ['Midnight', 'Cream', 'Neo', 'Mint'];

const FEATURES = [
  { Icon: LuLink, title: 'Links, your way', text: 'Buttons, cards or full-width banners. Give every single link its own colour, shape, size and shadow.' },
  { Icon: LuLayers, title: 'Pages inside your page', text: 'Add tabs for photos, projects or a shop. Each page can have its own background and colours.' },
  { Icon: LuClapperboard, title: 'Photos and videos', text: 'Galleries in four layouts, plus YouTube, Shorts, Instagram, Spotify, TikTok and Vimeo embeds.' },
  { Icon: LuInbox, title: 'Collect emails and messages', text: 'Drop in a contact form and read everything in your inbox. Export it as a spreadsheet any time.' },
  { Icon: LuShare2, title: 'Looks great when shared', text: 'Your link unfurls into a clean preview card on Discord, X, iMessage and Slack.' },
  { Icon: LuUndo2, title: 'Edit without fear', text: 'Live preview while you type, plus undo and redo for every change.' },
];

const STEPS = [
  ['Claim your name', 'Sign in with Google and pick a username. It takes about ten seconds.'],
  ['Build your page', 'Add blocks, drop in your links and watch the phone update as you go.'],
  ['Share one link', 'Put it in your bio, your videos, your email signature, wherever people find you.'],
];

const FAQ = [
  ['Is it really free?', 'Yes. No trials, no card, no watermark on your page.'],
  ['How many links can I add?', 'As many as you like, across up to 25 pages. The limits only exist to stop abuse.'],
  ['Can I use my own pictures?', 'Upload a profile photo, a background and as many gallery photos as you want. We resize them for you.'],
  ['Who can see my page?', 'Anyone with the link. You can hide individual pages or blocks any time, and anyone can report a page that breaks the rules.'],
  ['Do I need to know design?', 'No. Pick one of the 30 themes and tweak from there, or ignore the settings entirely.'],
];

const NETWORKS = ['instagram', 'youtube', 'tiktok', 'x', 'spotify', 'twitch', 'discord', 'github', 'linkedin', 'patreon', 'etsy', 'telegram'];

export default function Home() {
  const { w } = useViewport();
  const nav = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [look, setLook] = useState('Sunset');
  const [claim, setClaim] = useState('');

  useEffect(() => {
    document.title = 'social: one page for all your links';
    api.me().then((r) => setSignedIn(r.signedIn)).catch(() => {});
  }, []);

  function startClaim(e: React.FormEvent) {
    e.preventDefault();
    const name = claim.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    try {
      if (name) sessionStorage.setItem('social:claim', name);
    } catch {
      /* private mode: no prefill, that's fine */
    }
    nav(signedIn ? '/edit' : '/signup');
  }

  const heroScale = w >= 900 ? 0.8 : Math.min(0.9, (w - 32) / PHONE_W);
  const miniScale = w >= 900 ? 0.52 : 0.5;
  const cta = signedIn ? '/edit' : '/signup';

  return (
    <div className="hm">
      <header className="hm-nav">
        <Link to="/" aria-label="social home" className="hm-logo"><Logo size={32} /></Link>
        <nav>
          <a className="hm-navlink" href="#looks">Looks</a>
          <a className="hm-navlink" href="#features">Features</a>
          <a className="hm-navlink" href="#faq">FAQ</a>
          {signedIn ? (
            <Link className="ed-btn primary" to="/edit">Edit my page</Link>
          ) : (
            <>
              <Link className="hm-login" to="/login">Log in</Link>
              <Link className="ed-btn primary" to="/signup">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      {/* ---------- hero ---------- */}
      <section className="hm-hero">
        <div className="hm-glow" aria-hidden />
        <div className="hm-hero-text">
          <span className="hm-pill"><span className="hm-dot" />Free forever, no card needed</span>
          <h1>
            Your whole internet,
            <br />
            <span className="hm-grad">on one page.</span>
          </h1>
          <p>
            Links, photos, videos and a contact form, styled exactly how you like. One tidy page that
            fits in any bio.
          </p>

          <form className="hm-claim" onSubmit={startClaim}>
            <span className="hm-claim-prefix">social.jrofficial.org/</span>
            <input
              value={claim}
              onChange={(e) => setClaim(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="yourname"
              maxLength={20}
              aria-label="Pick your username"
              spellCheck={false}
              autoCapitalize="off"
            />
            <button className="hm-claim-btn">
              {signedIn ? 'Open editor' : 'Claim it'} <LuArrowRight size={16} />
            </button>
          </form>
          <div className="hm-note">
            Free. Sign in with Google. {!signedIn && <>Already have a page? <Link to="/login">Log in</Link></>}
          </div>

          <ul className="hm-proof">
            <li><b>30</b> themes</li>
            <li><b>130+</b> icons</li>
            <li><b>9</b> block types</li>
          </ul>
        </div>

        <div className="hm-hero-phone">
          <PhoneFrame scale={heroScale}>
            <ProfileScreen profile={withLook(look)} demo />
          </PhoneFrame>
          <div className="hm-looks" role="group" aria-label="Try a theme">
            {LOOKS.map((n) => {
              const pt = PRESETS.find((x) => x.name === n)!.theme;
              const bg = pt.bgType === 'gradient' ? `linear-gradient(135deg, ${pt.bg1}, ${pt.bg2})` : pt.bg1;
              return (
                <button
                  key={n}
                  className={n === look ? 'on' : ''}
                  style={{ background: n === 'Sunset' ? 'linear-gradient(135deg,#fb923c,#db2777)' : bg }}
                  onClick={() => setLook(n)}
                  aria-label={`${n} theme`}
                  title={n}
                />
              );
            })}
          </div>
          <div className="hm-hint"><LuMousePointerClick size={14} /> Tap the tabs, or try a theme</div>
        </div>
      </section>

      {/* ---------- works with ---------- */}
      <section className="hm-strip" aria-label="Link to anywhere">
        <p>Link to anywhere you are</p>
        <div className="hm-nets">
          {NETWORKS.map((n) => (<span key={n}><Icon name={n} size={22} /></span>))}
        </div>
      </section>

      {/* ---------- looks ---------- */}
      <section className="hm-section" id="looks">
        <div className="hm-head">
          <span className="hm-eyebrow">Themes</span>
          <h2>Make it look like you</h2>
          <p>Thirty ready-made themes, your own colours, gradients, patterns, fonts and background photos.</p>
        </div>
        <div className="hm-minis">
          {SHOWCASE.map((n) => (
            <figure key={n} className="hm-mini">
              <PhoneFrame scale={miniScale}>
                <ProfileScreen profile={withLook(n)} demo />
              </PhoneFrame>
              <figcaption>{n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className="hm-section alt" id="features">
        <div className="hm-head">
          <span className="hm-eyebrow">Features</span>
          <h2>Everything you need, nothing you don't</h2>
        </div>
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

      {/* ---------- steps ---------- */}
      <section className="hm-section">
        <div className="hm-head">
          <span className="hm-eyebrow">How it works</span>
          <h2>Live in about a minute</h2>
        </div>
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

      {/* ---------- faq ---------- */}
      <section className="hm-section alt" id="faq">
        <div className="hm-head">
          <span className="hm-eyebrow">FAQ</span>
          <h2>Questions, answered</h2>
        </div>
        <div className="hm-faq">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<LuChevronDown size={18} /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- final cta ---------- */}
      <section className="hm-final">
        <LuBrush size={26} aria-hidden />
        <h2>Ready to make yours?</h2>
        <p>It's free and takes about a minute.</p>
        <Link className="hm-big primary" to={cta}>{signedIn ? 'Go to my page' : 'Create your page'}</Link>
      </section>

      <footer className="hm-foot">
        <Logo size={22} />
        <span>A <a href="https://jrofficial.org">JR.</a> project</span>
      </footer>
    </div>
  );
}
