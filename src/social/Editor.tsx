import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import GoogleSignIn from './GoogleSignIn';
import { processImage } from './image';
import PhoneFrame, { PHONE_H, PHONE_W } from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import { bgCss, DEFAULT_THEME, PRESETS, SWATCHES } from './themes';
import type { Me, SocialLink, SocialProfile, Theme } from './types';
import { useViewport } from './useViewport';

const EMPTY: SocialProfile = {
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
  theme: DEFAULT_THEME,
  links: [],
};

const QUICK: [string, string][] = [
  ['GitHub', 'https://github.com/'],
  ['Instagram', 'https://instagram.com/'],
  ['YouTube', 'https://youtube.com/@'],
  ['X', 'https://x.com/'],
  ['Discord', 'https://discord.gg/'],
  ['TikTok', 'https://tiktok.com/@'],
  ['LinkedIn', 'https://linkedin.com/in/'],
  ['Twitch', 'https://twitch.tv/'],
  ['Website', 'https://'],
];

function validUrl(u: string): boolean {
  try {
    const x = new URL(/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`);
    return x.protocol === 'https:' && x.hostname.includes('.');
  } catch {
    return false;
  }
}

/* ---------------- small controls ---------------- */

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="ed-seg">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          className={o.v === value ? 'on' : ''}
          onClick={() => onChange(o.v)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Color({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <div className="ed-color">
      <span>{label}</span>
      <div className="ed-color-row">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input
          className="ed-hex"
          value={text}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
            setText(v);
            if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase());
          }}
          onBlur={() => setText(value)}
        />
        <div className="ed-swatches">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              className={c === value ? 'on' : ''}
              style={{ background: c }}
              onClick={() => onChange(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImagePicker({
  value,
  kind,
  onChange,
  extra,
}: {
  value: string;
  kind: 'avatar' | 'bg';
  onChange: (v: string) => void;
  extra?: React.ReactNode;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    setErr('');
    try {
      onChange(await processImage(f, kind));
    } catch (er) {
      setErr((er as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ed-img">
      <div className="ed-img-row">
        <div
          className={`ed-thumb ${kind}`}
          style={value ? { backgroundImage: `url(${JSON.stringify(value)})` } : undefined}
        />
        <div className="ed-img-actions">
          <button type="button" className="ed-btn sm" onClick={() => file.current?.click()} disabled={busy}>
            {busy ? 'Processing…' : 'Upload image'}
          </button>
          {extra}
          {value && (
            <button type="button" className="ed-link-btn" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        className="ed-input"
        placeholder="…or paste an image URL (https://)"
        value={value.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
      {err && <div className="ed-err-sm">{err}</div>}
    </div>
  );
}

/* ---------------- editor ---------------- */

type Tab = 'profile' | 'links' | 'look';

export default function Editor() {
  const [phase, setPhase] = useState<'loading' | 'out' | 'in'>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [draft, setDraft] = useState<SocialProfile>(EMPTY);
  const [saved, setSaved] = useState(''); // JSON of last saved profile ('' = never saved)
  const [savedName, setSavedName] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('profile');
  const [pane, setPane] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);
  const { w, h } = useViewport();

  const dirty = JSON.stringify(draft) !== saved;
  const wide = w >= 960;

  async function load() {
    try {
      const r = await api.me();
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
    } catch {
      setPhase('out');
    }
  }

  useEffect(() => {
    document.title = 'Edit your page';
    load();
  }, []);

  // warn before closing with unsaved changes
  useEffect(() => {
    if (!dirty || phase !== 'in') return;
    const f = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [dirty, phase]);

  // auto-hide "Saved" message
  useEffect(() => {
    if (!msg?.ok) return;
    const t = setTimeout(() => setMsg(null), 2500);
    return () => clearTimeout(t);
  }, [msg]);

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
    setSaved('');
    setSavedName(null);
    setPhase('out');
  }

  const set = (patch: Partial<SocialProfile>) => setDraft((d) => ({ ...d, ...patch }));
  const setTheme = (patch: Partial<Theme>) =>
    setDraft((d) => ({ ...d, theme: { ...d.theme, ...patch } }));
  const setLink = (i: number, patch: Partial<SocialLink>) =>
    setDraft((d) => ({ ...d, links: d.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const move = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.links.length) return d;
      const links = [...d.links];
      [links[i], links[j]] = [links[j], links[i]];
      return { ...d, links };
    });
  const remove = (i: number) => set({ links: draft.links.filter((_, j) => j !== i) });
  const add = (title = '', url = '') =>
    set({ links: [...draft.links, { id: crypto.randomUUID(), title, url }] });

  async function save() {
    if (busy) return;
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

  // Ctrl/Cmd+S
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
          <h2>Create your link page</h2>
          <p>One page for all your important links. Sign in to make yours.</p>
          <GoogleSignIn onCredential={onGoogle} />
          {msg && <div className="ed-err-sm">{msg.text}</div>}
        </div>
      </div>
    );
  }

  const t = draft.theme;
  const scale = wide
    ? Math.min(0.82, (h - 48) / PHONE_H)
    : Math.min(1, (w - 32) / PHONE_W);

  const showForm = wide || pane === 'edit';
  const showPreview = wide || pane === 'preview';

  return (
    <div className="sl-root sl-editor-root">
      <header className="ed-top">
        <div className="ed-top-left">
          <b>Your page</b>
          {savedName && (
            <Link className="ed-url" to={`/${savedName}`} target="_blank">
              {location.host}/{savedName}
            </Link>
          )}
          {savedName && (
            <button className="ed-link-btn" onClick={copyLink}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          )}
        </div>
        <div className="ed-top-right">
          {dirty && <span className="ed-dirty">Unsaved changes</span>}
          {msg && <span className={msg.ok ? 'ed-ok' : 'ed-err'}>{msg.text}</span>}
          <button className="ed-btn primary" onClick={save} disabled={busy || !dirty}>
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button className="ed-link-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      {!wide && (
        <div className="ed-pane-switch">
          <Seg
            value={pane}
            onChange={setPane}
            options={[
              { v: 'edit', label: 'Edit' },
              { v: 'preview', label: 'Preview' },
            ]}
          />
        </div>
      )}

      <div className="ed-wrap">
        {showForm && (
          <div className="ed-panel">
            <div className="ed-tabs">
              {(
                [
                  ['profile', 'Profile'],
                  ['links', 'Links'],
                  ['look', 'Appearance'],
                ] as [Tab, string][]
              ).map(([k, label]) => (
                <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                  {label}
                </button>
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
                      onChange={(e) =>
                        set({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })
                      }
                    />
                  </div>
                  <small>3-20 characters: letters, numbers, underscore.</small>
                </label>

                <label className="ed-field">
                  <span>Display name</span>
                  <input
                    className="ed-input"
                    value={draft.displayName}
                    maxLength={40}
                    onChange={(e) => set({ displayName: e.target.value })}
                  />
                </label>

                <label className="ed-field">
                  <span>
                    Bio <em>{draft.bio.length}/160</em>
                  </span>
                  <textarea
                    className="ed-input"
                    value={draft.bio}
                    maxLength={160}
                    rows={3}
                    onChange={(e) => set({ bio: e.target.value })}
                  />
                </label>

                <div className="ed-field">
                  <span>Profile picture</span>
                  <ImagePicker
                    kind="avatar"
                    value={draft.avatarUrl}
                    onChange={(v) => set({ avatarUrl: v })}
                    extra={
                      me?.picture && draft.avatarUrl !== me.picture ? (
                        <button
                          type="button"
                          className="ed-link-btn"
                          onClick={() => set({ avatarUrl: me.picture! })}
                        >
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
                    options={[
                      { v: 'circle', label: 'Circle' },
                      { v: 'rounded', label: 'Rounded' },
                      { v: 'square', label: 'Square' },
                    ]}
                  />
                </div>
              </div>
            )}

            {tab === 'links' && (
              <div className="ed-section">
                <div className="ed-field">
                  <span>Quick add</span>
                  <div className="ed-chips">
                    {QUICK.map(([title, url]) => (
                      <button
                        key={title}
                        type="button"
                        disabled={draft.links.length >= 30}
                        onClick={() => add(title, url)}
                      >
                        + {title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ed-field">
                  <span>
                    Your links <em>{draft.links.length}/30</em>
                  </span>
                  {draft.links.length === 0 && (
                    <div className="ed-hint">No links yet. Use quick add or the button below.</div>
                  )}
                  {draft.links.map((l, i) => (
                    <div className={`ed-linkrow${l.hidden ? ' off' : ''}`} key={l.id}>
                      <div className="ed-linkinputs">
                        <input
                          className="ed-input"
                          value={l.title}
                          maxLength={40}
                          placeholder="Title"
                          onChange={(e) => setLink(i, { title: e.target.value })}
                        />
                        <input
                          className={`ed-input${l.url && !validUrl(l.url) ? ' bad' : ''}`}
                          value={l.url}
                          placeholder="https://"
                          onChange={(e) => setLink(i, { url: e.target.value })}
                        />
                      </div>
                      <div className="ed-linkbtns">
                        <button type="button" title="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                          ↑
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          onClick={() => move(i, 1)}
                          disabled={i === draft.links.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          title={l.hidden ? 'Show link' : 'Hide link'}
                          onClick={() => setLink(i, { hidden: !l.hidden })}
                        >
                          {l.hidden ? '◌' : '●'}
                        </button>
                        <button type="button" title="Delete" onClick={() => remove(i)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="ed-btn"
                    onClick={() => add()}
                    disabled={draft.links.length >= 30}
                  >
                    + Add link
                  </button>
                </div>
              </div>
            )}

            {tab === 'look' && (
              <div className="ed-section">
                <div className="ed-field">
                  <span>Themes</span>
                  <div className="ed-presets">
                    {PRESETS.map((p) => {
                      const pt = { ...DEFAULT_THEME, ...p.theme } as Theme;
                      return (
                        <button
                          key={p.name}
                          type="button"
                          className="ed-preset"
                          onClick={() => setTheme(pt)}
                        >
                          <div className="ed-preset-box" style={{ background: bgCss(pt) }}>
                            <i
                              style={{
                                background: pt.btnStyle === 'fill' ? pt.btnColor : 'transparent',
                                border: `2px solid ${pt.btnColor}`,
                                borderRadius: pt.btnShape === 'pill' ? 99 : pt.btnShape === 'square' ? 2 : 6,
                              }}
                            />
                            <i
                              style={{
                                background: pt.btnStyle === 'fill' ? pt.btnColor : 'transparent',
                                border: `2px solid ${pt.btnColor}`,
                                borderRadius: pt.btnShape === 'pill' ? 99 : pt.btnShape === 'square' ? 2 : 6,
                              }}
                            />
                          </div>
                          <small>{p.name}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="ed-group">
                  <h4>Background</h4>
                  <Seg
                    value={t.bgType}
                    onChange={(v) => setTheme({ bgType: v })}
                    options={[
                      { v: 'solid', label: 'Solid' },
                      { v: 'gradient', label: 'Gradient' },
                      { v: 'image', label: 'Image' },
                    ]}
                  />
                  {t.bgType !== 'image' && (
                    <Color
                      label={t.bgType === 'gradient' ? 'Start colour' : 'Colour'}
                      value={t.bg1}
                      onChange={(v) => setTheme({ bg1: v })}
                    />
                  )}
                  {t.bgType === 'gradient' && (
                    <>
                      <Color label="End colour" value={t.bg2} onChange={(v) => setTheme({ bg2: v })} />
                      <label className="ed-range">
                        <span>
                          Angle <em>{t.bgAngle}°</em>
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={t.bgAngle}
                          onChange={(e) => setTheme({ bgAngle: Number(e.target.value) })}
                        />
                      </label>
                    </>
                  )}
                  {t.bgType === 'image' && (
                    <>
                      <ImagePicker kind="bg" value={t.bgImage} onChange={(v) => setTheme({ bgImage: v })} />
                      <label className="ed-range">
                        <span>
                          Darken image <em>{t.bgDim}%</em>
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          value={t.bgDim}
                          onChange={(e) => setTheme({ bgDim: Number(e.target.value) })}
                        />
                      </label>
                      <Color label="Fallback colour" value={t.bg1} onChange={(v) => setTheme({ bg1: v })} />
                    </>
                  )}
                </div>

                <div className="ed-group">
                  <h4>Text</h4>
                  <Color label="Text colour" value={t.textColor} onChange={(v) => setTheme({ textColor: v })} />
                  <div className="ed-field">
                    <span>Font</span>
                    <Seg
                      value={t.font}
                      onChange={(v) => setTheme({ font: v })}
                      options={[
                        { v: 'sans', label: 'Sans' },
                        { v: 'serif', label: 'Serif' },
                        { v: 'rounded', label: 'Rounded' },
                        { v: 'mono', label: 'Mono' },
                      ]}
                    />
                  </div>
                </div>

                <div className="ed-group">
                  <h4>Buttons</h4>
                  <div className="ed-field">
                    <span>Style</span>
                    <Seg
                      value={t.btnStyle}
                      onChange={(v) => setTheme({ btnStyle: v })}
                      options={[
                        { v: 'fill', label: 'Filled' },
                        { v: 'outline', label: 'Outline' },
                        { v: 'soft', label: 'Soft' },
                      ]}
                    />
                  </div>
                  <div className="ed-field">
                    <span>Shape</span>
                    <Seg
                      value={t.btnShape}
                      onChange={(v) => setTheme({ btnShape: v })}
                      options={[
                        { v: 'square', label: 'Square' },
                        { v: 'rounded', label: 'Rounded' },
                        { v: 'pill', label: 'Pill' },
                      ]}
                    />
                  </div>
                  <Color label="Button colour" value={t.btnColor} onChange={(v) => setTheme({ btnColor: v })} />
                  {t.btnStyle === 'fill' && (
                    <Color
                      label="Button text colour"
                      value={t.btnTextColor}
                      onChange={(v) => setTheme({ btnTextColor: v })}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showPreview && (
          <div className="ed-preview">
            <PhoneFrame scale={scale}>
              <ProfileScreen profile={draft} preview />
            </PhoneFrame>
          </div>
        )}
      </div>
    </div>
  );
}
