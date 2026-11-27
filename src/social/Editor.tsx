import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuCopy, LuExternalLink, LuLogOut, LuShield } from 'react-icons/lu';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from './api';
import { EMPTY_PROFILE } from './blocks';
import AppearanceTab from './editor/AppearanceTab';
import { ImagePicker, MAX_BYTES, Seg } from './editor/controls';
import InboxTab from './editor/InboxTab';
import PagesTab from './editor/PagesTab';
import Logo from './Logo';
import PhoneFrame, { PHONE_H, PHONE_W } from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import { DEFAULT_THEME } from './themes';
import type { Me, SocialProfile, Theme } from './types';
import { useViewport } from './useViewport';

type Tab = 'profile' | 'pages' | 'look' | 'inbox';

export default function Editor() {
  const nav = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'out' | 'in'>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [draft, setDraft] = useState<SocialProfile>(EMPTY_PROFILE(DEFAULT_THEME));
  const [saved, setSaved] = useState('');
  const [savedName, setSavedName] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('profile');
  const [pageSel, setPageSel] = useState(0);
  const [pane, setPane] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);
  const { w, h } = useViewport();

  const dirty = JSON.stringify(draft) !== saved;
  const wide = w >= 960;

  useEffect(() => {
    document.title = 'Edit your page · social';
    api
      .me()
      .then((r) => {
        setMe(r);
        if (!r.signedIn) return setPhase('out');
        if (r.profile) {
          setDraft(r.profile);
          setSaved(JSON.stringify(r.profile));
          setSavedName(r.profile.username);
        } else {
          setDraft((d) => ({ ...d, displayName: r.name ?? '', avatarUrl: r.picture ?? '' }));
        }
        setPhase('in');
      })
      .catch(() => setPhase('out'));
  }, []);

  useEffect(() => {
    if (!dirty || phase !== 'in') return;
    const f = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [dirty, phase]);

  useEffect(() => {
    if (!msg?.ok) return;
    const t = setTimeout(() => setMsg(null), 2500);
    return () => clearTimeout(t);
  }, [msg]);

  const set = (patch: Partial<SocialProfile>) => setDraft((d) => ({ ...d, ...patch }));
  const setTheme = (patch: Partial<Theme>) => setDraft((d) => ({ ...d, theme: { ...d.theme, ...patch } }));

  async function save() {
    if (busy) return;
    if (JSON.stringify(draft).length > MAX_BYTES) {
      return setMsg({ ok: false, text: 'This page has too much content. Remove a few blocks.' });
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.save({ ...draft, username: draft.username.trim().toLowerCase() });
      setDraft(r.profile);
      setSaved(JSON.stringify(r.profile));
      setSavedName(r.profile.username);
      setMsg({ ok: true, text: 'Saved' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);

  async function copyLink() {
    if (!savedName) return;
    try {
      await navigator.clipboard.writeText(`${location.origin}/${savedName}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function signOut() {
    await api.logout().catch(() => {});
    nav('/', { replace: true });
  }

  if (phase === 'loading') {
    return (
      <div className="sl-root">
        <div className="sl-status">Loading…</div>
      </div>
    );
  }
  if (phase === 'out') return <Navigate to="/login" replace />;
  if (me?.disabled) {
    return (
      <div className="sl-root">
        <div className="sl-card sl-signin">
          <Logo size={36} />
          <h2>Your page is disabled</h2>
          <p>It was taken down after a report. You can't edit it right now.</p>
          <button className="sl-btn" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }

  const t = draft.theme;
  const sel = Math.min(pageSel, draft.pages.length - 1);
  const scale = wide ? Math.min(0.82, (h - 100) / PHONE_H) : Math.min(1, (w - 32) / PHONE_W);
  const showForm = wide || pane === 'edit';
  const showPreview = wide || pane === 'preview';
  const tabs: [Tab, string][] = [['profile', 'Profile'], ['pages', 'Pages'], ['look', 'Appearance']];
  if (savedName) tabs.push(['inbox', 'Inbox']);

  return (
    <div className="sl-root sl-editor-root">
      <header className="ed-top">
        <div className="ed-top-left">
          <Link className="sl-logo-link" to="/" aria-label="Home"><Logo size={28} /></Link>
          {savedName && (
            <>
              <a className="ed-btn sm icon" href={`/${savedName}`} target="_blank" rel="noopener">
                <LuExternalLink size={14} /><span>View my site</span>
              </a>
              <button className="ed-btn sm icon ghost" onClick={copyLink}>
                {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}<span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>
            </>
          )}
        </div>
        <div className="ed-top-right">
          {dirty && <span className="ed-dirty">Unsaved changes</span>}
          {msg && <span className={msg.ok ? 'ed-ok' : 'ed-err'}>{msg.text}</span>}
          <button className="ed-btn primary" onClick={save} disabled={busy || !dirty}>
            {busy ? 'Saving…' : 'Save'}
          </button>
          {me?.admin && (
            <Link className="ed-btn sm icon ghost" to="/admin" title="Moderation"><LuShield size={14} /></Link>
          )}
          <button className="ed-btn sm icon ghost" onClick={signOut} title="Sign out"><LuLogOut size={14} /><span>Sign out</span></button>
        </div>
      </header>

      {!wide && (
        <div className="ed-pane-switch">
          <Seg value={pane} onChange={setPane} options={[{ v: 'edit', label: 'Edit' }, { v: 'preview', label: 'Preview' }]} />
        </div>
      )}

      <div className="ed-wrap">
        {showForm && (
          <div className="ed-panel">
            <div className="ed-tabs">
              {tabs.map(([k, label]) => (
                <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
              ))}
            </div>

            {tab === 'profile' && (
              <div className="ed-section">
                <label className="ed-field">
                  <span>Username</span>
                  <div className="ed-prefix">
                    <i>{location.host}/</i>
                    <input
                      value={draft.username}
                      maxLength={20}
                      placeholder="yourname"
                      onChange={(e) => set({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    />
                  </div>
                  <small>3-20 characters: letters, numbers, underscore.</small>
                </label>
                <label className="ed-field">
                  <span>Display name</span>
                  <input className="ed-input" value={draft.displayName} maxLength={40} onChange={(e) => set({ displayName: e.target.value })} />
                </label>
                <label className="ed-field">
                  <span>Bio <em>{draft.bio.length}/160</em></span>
                  <textarea className="ed-input" value={draft.bio} maxLength={160} rows={3} onChange={(e) => set({ bio: e.target.value })} />
                </label>
                <div className="ed-field">
                  <span>Profile picture</span>
                  <ImagePicker
                    kind="avatar"
                    value={draft.avatarUrl}
                    onChange={(v) => set({ avatarUrl: v })}
                    extra={
                      me?.picture && draft.avatarUrl !== me.picture ? (
                        <button type="button" className="ed-link-btn" onClick={() => set({ avatarUrl: me.picture! })}>
                          Use Google photo
                        </button>
                      ) : null
                    }
                  />
                </div>
                <div className="ed-field">
                  <span>Picture shape</span>
                  <Seg
                    value={t.avatarShape}
                    onChange={(v) => setTheme({ avatarShape: v })}
                    options={[{ v: 'circle', label: 'Circle' }, { v: 'rounded', label: 'Rounded' }, { v: 'square', label: 'Square' }]}
                  />
                </div>
              </div>
            )}

            {tab === 'pages' && <PagesTab draft={draft} set={set} sel={sel} setSel={setPageSel} />}
            {tab === 'look' && <AppearanceTab t={t} setTheme={setTheme} />}
            {tab === 'inbox' && <InboxTab />}
          </div>
        )}

        {showPreview && (
          <div className="ed-preview">
            <PhoneFrame scale={scale}>
              <ProfileScreen profile={draft} preview activePage={sel} onPageChange={setPageSel} />
            </PhoneFrame>
          </div>
        )}
      </div>
    </div>
  );
}
