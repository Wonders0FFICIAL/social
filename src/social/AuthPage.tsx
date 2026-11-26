import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from './api';
import GoogleSignIn from './GoogleSignIn';
import Logo from './Logo';

// /login and /signup: both use Google, they only differ in wording.
export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const nav = useNavigate();
  const [state, setState] = useState<'loading' | 'out' | 'in'>('loading');
  const [error, setError] = useState('');
  const signup = mode === 'signup';

  useEffect(() => {
    document.title = signup ? 'Sign up · social' : 'Log in · social';
    api
      .me()
      .then((r) => setState(r.signedIn ? 'in' : 'out'))
      .catch(() => setState('out'));
  }, [signup]);

  async function onGoogle(credential: string) {
    setError('');
    try {
      await api.login(credential);
      nav('/edit', { replace: true });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (state === 'in') return <Navigate to="/edit" replace />;

  return (
    <div className="sl-root">
      <div className="sl-card sl-signin">
        <Link to="/" aria-label="Home">
          <Logo size={40} />
        </Link>
        <h2>{signup ? 'Create your page' : 'Welcome back'}</h2>
        <p>
          {signup
            ? 'Sign up with Google to claim your link page. It only takes a few seconds.'
            : 'Log in with Google to edit your page.'}
        </p>
        {state === 'out' ? <GoogleSignIn onCredential={onGoogle} /> : <p>Loading…</p>}
        {error && <div className="ed-err-sm">{error}</div>}
        <div className="auth-alt">
          {signup ? (
            <>
              Already have a page? <Link to="/login">Log in</Link>
            </>
          ) : (
            <>
              New here? <Link to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
