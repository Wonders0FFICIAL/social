import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LuCheck, LuCircleAlert, LuExternalLink, LuInbox, LuLayers, LuListChecks, LuLoader, LuLogOut, LuPalette,
  LuRedo2, LuShare2, LuShield, LuUndo2, LuUser,
} from 'react-icons/lu';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from './api';
import { EMPTY_PROFILE } from './blocks';
import AppearanceTab from './editor/AppearanceTab';
import { ImagePicker, MAX_BYTES, Seg } from './editor/controls';
import InboxTab from './editor/InboxTab';
import { ago, lint, type Tab } from './editor/model';
import PagesTab from './editor/PagesTab';
import ShareDialog from './editor/ShareDialog';
import StartTab, { type Target } from './editor/StartTab';
import Logo from './Logo';
import PhoneFrame, { PHONE_H, PHONE_W } from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import { DEFAULT_THEME } from './themes';
import type { Me, SocialProfile, Theme } from './types';
import { useViewport } from './useViewport';

const AUTOSAVE_MS = 1800;

export default function Editor() {
  const nav = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'out' | 'in'>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [draft, setDraft] = useState<SocialProfile>(EMPTY_PROFILE(DEFAULT_THEME));
  const [saved, setSaved] = useState('');
  const [savedName, setSavedName] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(0);
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'error'; text?: string }>({ kind: 'idle' });
  const [tab, setTab] = useState<Tab>('start');
  const [pageSel, setPageSel] = useState(0);
  const [focus, setFocus] = useState<{ block?: string; nonce: number }>({ nonce: 0 });
  const [pane, setPane] = useState<'edit' | 'preview'>('edit');
  const [share, setShare] = useState<{ fresh: boolean } | null>(null);
  const [, tick] = useState(0);
  const { w, h } = useViewport();

  const draftJson = useMemo(() => JSON.stringify(draft), [draft]);
  const dirty = draftJson !== saved;
  const wide = w >= 960;
  const issues = useMemo(() => lint(draft), [draft]);
  const errors = issues.filter((i) => i.level === 'error');
  const published = savedName !== null;

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
          setSavedAt(Date.now());
          setTab('pages');
        } else {
          let claim = '';
          try {
            claim = (sessionStorage.getItem('social:claim') ?? '').replace(/[^a-z0-9_]/g, '').slice(0, 20);
          } catch {
            /* ignore */
          }
          setDraft((d) => ({ ...d, username: claim, displayName: r.name ?? '', avatarUrl: r.picture ?? '' }));
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

  // keep "saved 2 min ago" fresh
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // ----- undo / redo: every edit goes through commit(), rapid edits (typing, dragging a slider) merge into one step
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const past = useRef<SocialProfile[]>([]);
  const future = useRef<SocialProfile[]>([]);
  const lastEdit = useRef(0);
  const [, bump] = useState(0);

  const commit = useCallback((fn: (d: SocialProfile) => SocialProfile) => {
    const cur = draftRef.current;
    const next = fn(cur);
    if (next === cur) return;
    const now = Date.now();
    if (past.current.length === 0 || now - lastEdit.current > 600) {
      past.current.push(cur);
      if (past.current.length > 100) past.current.shift();
    }
    lastEdit.current = now;
    future.current = [];
    draftRef.current = next;
    setDraft(next);
    bump((n) => n + 1);
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(draftRef.current);
    lastEdit.current = 0;
    draftRef.current = prev;
    setDraft(prev);
    bump((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(draftRef.current);
    lastEdit.current = 0;
    draftRef.current = next;
    setDraft(next);
    bump((n) => n + 1);
  }, []);

  const set = (patch: Partial<SocialProfile>) => commit((d) => ({ ...d, ...patch }));
  const setTheme = (patch: Partial<Theme>) => commit((d) => ({ ...d, theme: { ...d.theme, ...patch } }));

  const go = useCallback((t: Target) => {
    setTab(t.tab);
    if (t.page !== undefined) setPageSel(t.page);
    setFocus((f) => ({ block: t.block, nonce: f.nonce + 1 }));
    setPane('edit');
  }, []);

  // ----- saving (manual "Publish / Save" and automatic)
  const saving = useRef(false);
  const failedJson = useRef('');

  const save = useCallback(
    async (manual: boolean) => {
      if (saving.current) return;
      const cur = draftRef.current;
      const json = JSON.stringify(cur);
      const probs = lint(cur).filter((i) => i.level === 'error');
      if (probs.length) {
        if (manual) {
          setStatus({ kind: 'error', text: probs.length === 1 ? probs[0].text : `${probs.length} things to fix first` });
          go({ tab: probs[0].tab, page: probs[0].page, block: probs[0].block });
        }
        return;
      }
      if (json.length > MAX_BYTES) {
        setStatus({ kind: 'error', text: 'This page has too much content. Remove a few blocks.' });
        return;
      }
      saving.current = true;
      setStatus({ kind: 'saving' });
      const wasPublished = savedName !== null;
      try {
        const r = await api.save({ ...cur, username: cur.username.trim().toLowerCase() });
        const serverJson = JSON.stringify(r.profile);
        // only swap in the server's tidied copy if nothing changed while we were saving
        if (JSON.stringify(draftRef.current) === json) {
          draftRef.current = r.profile;
          setDraft(r.profile);
          setSaved(serverJson);
        } else {
          setSaved(serverJson);
        }
        setSavedName(r.profile.username);
        setSavedAt(Date.now());
        setStatus({ kind: 'idle' });
        failedJson.current = '';
        if (!wasPublished) setShare({ fresh: true });
      } catch (e) {
        failedJson.current = json;
        setStatus({ kind: 'error', text: (e as Error).message });
      } finally {
        saving.current = false;
        bump((n) => n + 1);
      }
    },
    [go, savedName],
  );

  const saveRef = useRef(save);
  saveRef.current = save;

  // auto-save existing pages shortly after the last change (new pages are published on purpose)
  useEffect(() => {
    if (phase !== 'in' || !published || !dirty || errors.length > 0) return;
    if (failedJson.current === draftJson) return;
    const t = setTimeout(() => saveRef.current(false), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [phase, published, dirty, errors.length, draftJson]);

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 's') {
        e.preventDefault();
        saveRef.current(true);
      } else if (k === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (k === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [undo, redo]);

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
  const saving_ = status.kind === 'saving';

  const NAV: { k: Tab; label: string; Icon: typeof LuUser; badge?: number }[] = [
    { k: 'start', label: 'Start', Icon: LuListChecks, badge: issues.length },
    { k: 'profile', label: 'Profile', Icon: LuUser },
    { k: 'pages', label: 'Pages', Icon: LuLayers },
    { k: 'look', label: 'Appearance', Icon: LuPalette },
  ];
  if (published) NAV.push({ k: 'inbox', label: 'Inbox', Icon: LuInbox });

  // one calm line that says what state the page is in
  let state: React.ReactNode;
  if (status.kind === 'error') state = <span className="ed-state err"><LuCircleAlert size={14} /> {status.text}</span>;
  else if (saving_) state = <span className="ed-state"><LuLoader size={14} className="spin" /> Saving…</span>;
  else if (dirty && errors.length) state = <span className="ed-state err"><LuCircleAlert size={14} /> {errors.length} to fix before saving</span>;
  else if (dirty) state = <span className="ed-state">{published ? 'Saving soon…' : 'Not published yet'}</span>;
  else if (published) state = <span className="ed-state ok"><LuCheck size={14} /> Saved {ago(savedAt)}</span>;
  else state = <span className="ed-state">Not published yet</span>;

  return (
    <div className="sl-root sl-editor-root">
      <header className="ed-top">
        <div className="ed-top-left">
          <Link className="sl-logo-link" to="/" aria-label="Home"><Logo size={28} /></Link>
          {state}
        </div>
        <div className="ed-top-right">
          <div className="ed-history">
            <button className="ed-btn sm icon ghost" onClick={undo} disabled={past.current.length === 0} title="Undo (Ctrl+Z)" aria-label="Undo">
              <LuUndo2 size={16} />
            </button>
            <button className="ed-btn sm icon ghost" onClick={redo} disabled={future.current.length === 0} title="Redo (Ctrl+Shift+Z)" aria-label="Redo">
              <LuRedo2 size={16} />
            </button>
          </div>
          {published && (
            <>
              <a className="ed-btn sm icon" href={`/${savedName}`} target="_blank" rel="noopener">
                <LuExternalLink size={14} /><span>View live</span>
              </a>
              <button className="ed-btn sm icon" onClick={() => setShare({ fresh: false })}>
                <LuShare2 size={14} /><span>Share</span>
              </button>
            </>
          )}
          <button
            className="ed-btn primary"
            onClick={() => save(true)}
            disabled={saving_ || (published && !dirty)}
          >
            {published ? 'Save' : 'Publish'}
          </button>
          {me?.admin && (
            <Link className="ed-btn sm icon ghost" to="/admin" title="Moderation" aria-label="Moderation"><LuShield size={14} /></Link>
          )}
          <button className="ed-btn sm icon ghost" onClick={signOut} title="Sign out" aria-label="Sign out"><LuLogOut size={14} /></button>
        </div>
      </header>

      {!wide && (
        <div className="ed-pane-switch">
          <Seg value={pane} onChange={setPane} options={[{ v: 'edit', label: 'Edit' }, { v: 'preview', label: 'Preview' }]} />
        </div>
      )}

      <div className="ed-shell">
        {showForm && (
          <nav className="ed-side" aria-label="Editor sections">
            {NAV.map(({ k, label, Icon, badge }) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)} aria-current={tab === k ? 'page' : undefined}>
                <Icon size={18} />
                <span>{label}</span>
                {!!badge && <em className={errors.length && k === 'start' ? 'err' : ''}>{badge}</em>}
              </button>
            ))}
          </nav>
        )}

        {showForm && (
          <div className="ed-panel">
            {tab === 'start' && (
              <StartTab draft={draft} publishedName={savedName} issues={issues} onGo={go} onShare={() => setShare({ fresh: false })} />
            )}

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
                  <small>3-20 characters: letters, numbers, underscore.{published && draft.username !== savedName ? ' Changing it changes your link.' : ''}</small>
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

            {tab === 'pages' && <PagesTab draft={draft} set={set} sel={sel} setSel={setPageSel} focus={focus} />}
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

      {share && savedName && (
        <ShareDialog url={`${location.origin}/${savedName}`} name={savedName} fresh={share.fresh} onClose={() => setShare(null)} />
      )}
    </div>
  );
}
