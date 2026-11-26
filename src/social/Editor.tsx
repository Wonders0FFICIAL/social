import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import GoogleSignIn from './GoogleSignIn';
import PhoneFrame from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import type { Me, SocialLink, SocialProfile } from './types';

const EMPTY: SocialProfile = {
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
  accent: '#a855f7',
  links: [],
};

const ACCENTS = ['#a855f7', '#22c55e', '#3b82f6', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899'];

export default function Editor() {
  const [phase, setPhase] = useState<'loading' | 'out' | 'in'>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [draft, setDraft] = useState<SocialProfile>(EMPTY);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await api.me();
      setMe(r);
      if (!r.signedIn) return setPhase('out');
      if (r.profile) {
        setDraft(r.profile);
        setSavedName(r.profile.username);
      } else {
        setDraft((d) => ({ ...d, displayName: r.name ?? '', avatarUrl: r.picture ?? '' }));
      }
      setPhase('in');
    } catch {
      setPhase('out');
    }
  }

  useEffect(() => {
    document.title = 'Edit your page · JR.';
    load();
  }, []);

  async function onGoogle(credential: string) {
    try {
      await api.login(credential);
      await load();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  }

  async function signOut() {
    await api.logout().catch(() => {});
    setMe(null);
    setDraft(EMPTY);
    setSavedName(null);
    setPhase('out');
  }

  const set = (patch: Partial<SocialProfile>) => setDraft((d) => ({ ...d, ...patch }));
  const setLink = (i: number, patch: Partial<SocialLink>) =>
    set({ links: draft.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.links.length) return;
    const links = [...draft.links];
    [links[i], links[j]] = [links[j], links[i]];
    set({ links });
  };
  const remove = (i: number) => set({ links: draft.links.filter((_, j) => j !== i) });
  const add = () =>
    set({ links: [...draft.links, { id: crypto.randomUUID(), title: '', url: '' }] });

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.save({ ...draft, username: draft.username.trim().toLowerCase() });
      setDraft(r.profile);
      setSavedName(r.profile.username);
      setMsg({ ok: true, text: 'Saved!' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (phase === 'loading') {
    return (
      <div className="sl-root">
        <div className="sl-status">Loading…</div>
      </div>
    );
  }

  if (phase === 'out') {
    return (
      <div className="sl-root">
        <div className="sl-card sl-signin">
          <h2>Your JR. link page</h2>
          <p>One page for all your important links. Sign in to make yours.</p>
          <GoogleSignIn onCredential={onGoogle} />
          {msg && <div className="sl-msg sl-err">{msg.text}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="sl-root">
      <div className="sl-editor">
        <div className="sl-form">
          <div className="sl-topbar">
            <h2>Edit your page</h2>
            <button className="sl-ghost" onClick={signOut}>
              Sign out
            </button>
          </div>

          <label className="sl-field">
            <span>Username</span>
            <div className="sl-prefix">
              <i>{location.host}/</i>
              <input
                value={draft.username}
                maxLength={20}
                placeholder="ryan"
                onChange={(e) =>
                  set({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })
                }
              />
            </div>
          </label>

          <label className="sl-field">
            <span>Display name</span>
            <input
              value={draft.displayName}
              maxLength={40}
              onChange={(e) => set({ displayName: e.target.value })}
            />
          </label>

          <label className="sl-field">
            <span>Bio</span>
            <textarea
              value={draft.bio}
              maxLength={160}
              rows={2}
              onChange={(e) => set({ bio: e.target.value })}
            />
          </label>

          <label className="sl-field">
            <span>
              Avatar image URL
              {me?.picture && (
                <button
                  type="button"
                  className="sl-mini"
                  onClick={() => set({ avatarUrl: me.picture! })}
                >
                  use Google photo
                </button>
              )}
            </span>
            <input
              value={draft.avatarUrl}
              placeholder="https://…"
              onChange={(e) => set({ avatarUrl: e.target.value })}
            />
          </label>

          <div className="sl-field">
            <span>Accent colour</span>
            <div className="sl-swatches">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  className={`sl-swatch${draft.accent === c ? ' on' : ''}`}
                  style={{ background: c }}
                  onClick={() => set({ accent: c })}
                />
              ))}
              <input
                type="color"
                value={draft.accent}
                onChange={(e) => set({ accent: e.target.value })}
              />
            </div>
          </div>

          <div className="sl-field">
            <span>Links ({draft.links.length}/30)</span>
            {draft.links.map((l, i) => (
              <div className="sl-linkrow" key={l.id}>
                <div className="sl-linkinputs">
                  <input
                    value={l.title}
                    maxLength={40}
                    placeholder="Title (GitHub)"
                    onChange={(e) => setLink(i, { title: e.target.value })}
                  />
                  <input
                    value={l.url}
                    placeholder="https://github.com/you"
                    onChange={(e) => setLink(i, { url: e.target.value })}
                  />
                </div>
                <div className="sl-linkbtns">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === draft.links.length - 1}
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => remove(i)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="sl-ghost"
              onClick={add}
              disabled={draft.links.length >= 30}
            >
              + Add link
            </button>
          </div>

          <div className="sl-actions">
            <button className="sl-btn" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            {savedName && (
              <Link className="sl-ghost" to={`/${savedName}`}>
                View my page →
              </Link>
            )}
          </div>
          {msg && <div className={`sl-msg ${msg.ok ? 'sl-ok' : 'sl-err'}`}>{msg.text}</div>}
        </div>

        <div className="sl-previewcol">
          <PhoneFrame>
            <ProfileScreen profile={draft} preview />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
