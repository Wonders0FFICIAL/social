import { useEffect, useState } from 'react';
import { LuArrowLeft, LuCheck, LuTriangleAlert } from 'react-icons/lu';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from './api';
import { DEMO_PROFILE } from './demo';
import GoogleSignIn from './GoogleSignIn';
import Logo from './Logo';
import PhoneFrame from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import { useViewport } from './useViewport';
import './auth.css';

const PERKS = [
  'Free, with no card and no trial',
  'As many links and pages as you like',
  'Your own themes, photos and contact form',
];

function claimed(): string {
  try {
    return (sessionStorage.getItem('social:claim') ?? '').replace(/[^a-z0-9_]/g, '').slice(0, 20);
  } catch {
    return '';
  }
}

// /login and /signup: both use Google, they only differ in wording.
export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const nav = useNavigate();
  const { w } = useViewport();
  const [state, setState] = useState<'loading' | 'out' | 'in'>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const signup = mode === 'signup';
  const name = signup ? claimed() : '';

  useEffect(() => {
    document.title = signup ? 'Sign up · social' : 'Log in · social';
    api
      .me()
      .then((r) => setState(r.signedIn ? 'in' : 'out'))
      .catch(() => setState('out'));
  }, [signup]);

  async function onGoogle(credential: string) {
    setError('');
    setBusy(true);
    try {
      await api.login(credential);
      nav('/edit', { replace: true });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (state === 'in') return <Navigate to="/edit" replace />;

  return (
    <div className="au">
      <main className="au-main">
        <header className="au-top">
          <Link to="/" className="au-back"><LuArrowLeft size={16} /> Home</Link>
          <Link to="/" aria-label="Home"><Logo size={28} /></Link>
        </header>

        <div className="au-form">
          <span className="au-eyebrow">{signup ? 'Create your page' : 'Welcome back'}</span>
          <h1>
            {signup ? <>Your page is a <em>click</em> away</> : <>Good to <em>see you</em> again</>}
          </h1>
          <p className="au-sub">
            {signup
              ? 'Continue with Google to claim your link. There is no password to remember.'
              : 'Continue with Google to pick up where you left off.'}
          </p>

          {name && (
            <div className="au-claim">
              <span className="au-claim-ic"><LuCheck size={14} /></span>
              <span>
                We'll set up <b>social.jrofficial.org/{name}</b> for you
              </span>
            </div>
          )}

          <div className="au-google">
            {state === 'loading' ? (
              <div className="au-skel" />
            ) : busy ? (
              <div className="au-busy"><span className="au-spin" /> Signing you in…</div>
            ) : (
              <GoogleSignIn onCredential={onGoogle} onFail={() => setBlocked(true)} text={signup ? 'signup_with' : 'signin_with'} />
            )}
          </div>

          {error && (
            <div className="au-err" role="alert"><LuTriangleAlert size={16} /> {error}</div>
          )}
          {blocked && !error && state === 'out' && !busy && (
            <div className="au-err" role="alert">
              <LuTriangleAlert size={16} />
              <span>Google sign-in didn't load. Check your connection or turn off any ad or tracking blocker for this site, then refresh.</span>
            </div>
          )}

          {signup && (
            <ul className="au-perks">
              {PERKS.map((p) => (
                <li key={p}><LuCheck size={15} /> {p}</li>
              ))}
            </ul>
          )}

          <p className="au-alt">
            {signup ? <>Already have a page? <Link to="/login">Log in</Link></> : <>New here? <Link to="/signup">Create your page</Link></>}
          </p>
        </div>

        <footer className="au-foot">
          We only use your Google name, email and photo to create your account. Please don't post anything illegal or harmful.
        </footer>
      </main>

      {w >= 960 && (
        <aside className="au-side" aria-hidden>
          <PhoneFrame scale={0.78}>
            <ProfileScreen profile={DEMO_PROFILE} demo />
          </PhoneFrame>
          <p>Everything you share, <em>in one place.</em></p>
        </aside>
      )}
    </div>
  );
}
