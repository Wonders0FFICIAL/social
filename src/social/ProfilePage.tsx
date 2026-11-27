import { useEffect, useState } from 'react';
import { LuCheck, LuFlag, LuShare2, LuX } from 'react-icons/lu';
import { Link, useParams } from 'react-router-dom';
import { api } from './api';
import Logo from './Logo';
import PhoneFrame, { PHONE_H } from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import type { SocialProfile } from './types';
import { useViewport } from './useViewport';

const BAR_H = 56;

const REASONS: [string, string][] = [
  ['spam', 'Spam or scam'],
  ['impersonation', 'Pretending to be someone else'],
  ['harmful', 'Harmful or illegal content'],
  ['adult', 'Adult content'],
  ['copyright', 'Copyright'],
  ['other', 'Something else'],
];

function ReportDialog({ username, onClose }: { username: string; onClose: () => void }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setErr('');
    try {
      await api.report({ username, reason, details });
      setState('done');
    } catch (er) {
      setErr((er as Error).message);
      setState('idle');
    }
  }

  return (
    <div className="dlg-back" onClick={onClose}>
      <div className="dlg" role="dialog" aria-modal="true" aria-label="Report this page" onClick={(e) => e.stopPropagation()}>
        <button className="dlg-x" onClick={onClose} aria-label="Close">
          <LuX size={18} />
        </button>
        {state === 'done' ? (
          <div className="dlg-done">
            <span className="dlg-check"><LuCheck size={22} /></span>
            <h3>Thanks, we got it</h3>
            <p>Our team will take a look at this page.</p>
            <button className="ed-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3>Report @{username}</h3>
            <p className="dlg-sub">What's wrong with this page?</p>
            <div className="dlg-reasons">
              {REASONS.map(([v, label]) => (
                <label key={v} className={reason === v ? 'on' : ''}>
                  <input type="radio" name="reason" checked={reason === v} onChange={() => setReason(v)} />
                  {label}
                </label>
              ))}
            </div>
            <textarea
              className="ed-input"
              rows={3}
              maxLength={500}
              placeholder="Anything else we should know? (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            {err && <div className="ed-err-sm">{err}</div>}
            <div className="dlg-actions">
              <button type="button" className="ed-btn" onClick={onClose}>Cancel</button>
              <button className="ed-btn primary" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Public page: /:username
export default function ProfilePage() {
  const { username = '' } = useParams();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const { w, h } = useViewport();

  useEffect(() => {
    let alive = true;
    setState('loading');
    api
      .get(username)
      .then((r) => {
        if (!alive) return;
        setProfile(r.profile);
        setState('ok');
        document.title = `${r.profile.displayName} (@${r.profile.username})`;
      })
      .catch(() => alive && setState('missing'));
    return () => {
      alive = false;
    };
  }, [username]);

  async function share() {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled */
    }
  }

  const bare = w <= 520;
  const scale = Math.min(1, (h - BAR_H - 32) / PHONE_H);

  if (state === 'ok' && profile) {
    return (
      <div className={`sl-root sl-public${bare ? ' is-bare' : ''}`}>
        <header className="sl-pubbar">
          <Link to="/" aria-label="Home">
            <Logo size={28} />
          </Link>
          <div className="sl-pubbar-actions">
            <button className="ed-btn sm icon" onClick={share}>
              {copied ? <LuCheck size={15} /> : <LuShare2 size={15} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button className="ed-btn sm icon ghost" onClick={() => setReporting(true)} aria-label="Report this page" title="Report this page">
              <LuFlag size={15} />
              {!bare && <span>Report</span>}
            </button>
            <Link className="ed-btn sm primary" to="/signup">
              {bare ? 'Create yours' : 'Create your own page'}
            </Link>
          </div>
        </header>
        <main className="sl-pubmain">
          <PhoneFrame scale={scale} bare={bare}>
            <ProfileScreen profile={profile} />
          </PhoneFrame>
        </main>
        {reporting && <ReportDialog username={profile.username} onClose={() => setReporting(false)} />}
      </div>
    );
  }

  return (
    <div className="sl-root">
      {state === 'loading' ? (
        <div className="sl-status">Loading…</div>
      ) : (
        <div className="sl-card sl-signin">
          <Link to="/" aria-label="Home">
            <Logo size={36} />
          </Link>
          <h2>No one here yet</h2>
          <p>
            <b>@{username}</b> isn't taken. Want it?
          </p>
          <Link className="sl-btn" to="/signup">
            Claim your page
          </Link>
        </div>
      )}
    </div>
  );
}
