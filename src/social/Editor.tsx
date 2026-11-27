import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from './api';
import { parseEmbed } from './embed';
import { processImage, type ImageKind } from './image';
import Logo from './Logo';
import PhoneFrame, { PHONE_H, PHONE_W } from './PhoneFrame';
import ProfileScreen, { isImageIcon } from './ProfileScreen';
import { bgCss, DEFAULT_THEME, PRESETS, SWATCHES } from './themes';
import type {
  GalleryImage,
  Me,
  PageKind,
  SocialLink,
  SocialPage,
  SocialProfile,
  Theme,
} from './types';
import { useViewport } from './useViewport';

const EMPTY: SocialProfile = {
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
  theme: DEFAULT_THEME,
  homeTitle: 'Links',
  links: [],
  pages: [],
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

const EMOJIS = ['🔗', '🌐', '📸', '🎬', '🎵', '💼', '🛍️', '✉️', '📝', '🎮', '💬', '⭐', '🎨', '📅'];

const MAX_LINKS = 30;
const MAX_PAGES = 4;
const MAX_GALLERY = 9;
const MAX_EMBEDS = 8;
const MAX_BYTES = 3_800_000;

const uid = () => crypto.randomUUID();

function validUrl(u: string): boolean {
  try {
    const x = new URL(/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`);
    return x.protocol === 'https:' && x.hostname.includes('.');
  } catch {
    return false;
  }
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
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
  kind: Extract<ImageKind, 'avatar' | 'bg' | 'thumb'>;
  onChange: (v: string) => void;
  extra?: React.ReactNode;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const isImg = value.startsWith('data:') || value.startsWith('https://');

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
          style={isImg ? { backgroundImage: `url(${JSON.stringify(value)})` } : undefined}
        />
        <div className="ed-img-actions">
          <button type="button" className="ed-btn sm" onClick={() => file.current?.click()} disabled={busy}>
            {busy ? 'Processing…' : 'Upload image'}
          </button>
          {extra}
          {isImg && (
            <button type="button" className="ed-link-btn" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        className="ed-input"
        placeholder="…or paste an image URL (https://)"
        value={value.startsWith('data:') ? '' : isImg ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
      <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
      {err && <div className="ed-err-sm">{err}</div>}
    </div>
  );
}

/* ---------------- link icons + list ---------------- */

type IconMode = 'auto' | 'emoji' | 'image' | 'none';

function modeOf(icon: string): IconMode {
  if (icon === 'none') return 'none';
  if (!icon) return 'auto';
  return isImageIcon(icon) ? 'image' : 'emoji';
}

function IconEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [mode, setMode] = useState<IconMode>(modeOf(value));

  function switchMode(m: IconMode) {
    setMode(m);
    if (m === 'auto') onChange('');
    else if (m === 'none') onChange('none');
    else if (m === 'emoji') onChange(modeOf(value) === 'emoji' ? value : '🔗');
    else onChange(modeOf(value) === 'image' ? value : '');
  }

  return (
    <div className="ed-iconpanel">
      <Seg
        value={mode}
        onChange={switchMode}
        options={[
          { v: 'auto', label: 'Auto' },
          { v: 'emoji', label: 'Emoji' },
          { v: 'image', label: 'Image' },
          { v: 'none', label: 'None' },
        ]}
      />
      {mode === 'auto' && <small className="ed-hint-sm">Uses the website's own icon.</small>}
      {mode === 'emoji' && (
        <>
          <div className="ed-emojis">
            {EMOJIS.map((e) => (
              <button key={e} type="button" className={e === value ? 'on' : ''} onClick={() => onChange(e)}>
                {e}
              </button>
            ))}
          </div>
          <input
            className="ed-input"
            maxLength={8}
            value={modeOf(value) === 'emoji' ? value : ''}
            placeholder="or type any emoji"
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      )}
      {mode === 'image' && (
        <ImagePicker kind="thumb" value={modeOf(value) === 'image' ? value : ''} onChange={onChange} />
      )}
    </div>
  );
}

function IconPreview({ icon }: { icon: string }) {
  if (icon === 'none') return <span className="ed-iconprev">–</span>;
  if (!icon) return <span className="ed-iconprev">🌐</span>;
  if (isImageIcon(icon)) {
    return (
      <span className="ed-iconprev">
        <img src={icon} alt="" />
      </span>
    );
  }
  return <span className="ed-iconprev">{icon}</span>;
}

function LinkRow({
  link,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  link: SocialLink;
  index: number;
  count: number;
  onChange: (patch: Partial<SocialLink>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const icon = link.icon ?? '';
  return (
    <div className={`ed-linkrow-wrap${link.hidden ? ' off' : ''}`}>
      <div className="ed-linkrow">
        <div className="ed-linkinputs">
          <input
            className="ed-input"
            value={link.title}
            maxLength={40}
            placeholder="Title"
            onChange={(e) => onChange({ title: e.target.value })}
          />
          <input
            className={`ed-input${link.url && !validUrl(link.url) ? ' bad' : ''}`}
            value={link.url}
            placeholder="https://"
            onChange={(e) => onChange({ url: e.target.value })}
          />
          <button type="button" className="ed-iconbtn" onClick={() => setOpen((o) => !o)}>
            <IconPreview icon={icon} /> Icon {open ? '▴' : '▾'}
          </button>
        </div>
        <div className="ed-linkbtns">
          <button type="button" title="Move up" onClick={() => onMove(-1)} disabled={index === 0}>
            ↑
          </button>
          <button type="button" title="Move down" onClick={() => onMove(1)} disabled={index === count - 1}>
            ↓
          </button>
          <button
            type="button"
            title={link.hidden ? 'Show link' : 'Hide link'}
            onClick={() => onChange({ hidden: !link.hidden })}
          >
            {link.hidden ? '◌' : '●'}
          </button>
          <button type="button" title="Delete" onClick={onRemove}>
            ✕
          </button>
        </div>
      </div>
      {open && <IconEditor value={icon} onChange={(v) => onChange({ icon: v })} />}
    </div>
  );
}

function LinkList({
  links,
  onChange,
  quick,
}: {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
  quick?: boolean;
}) {
  const add = (title = '', url = '') => onChange([...links, { id: uid(), title, url, icon: '' }]);
  return (
    <>
      {quick && (
        <div className="ed-field">
          <span>Quick add</span>
          <div className="ed-chips">
            {QUICK.map(([title, url]) => (
              <button key={title} type="button" disabled={links.length >= MAX_LINKS} onClick={() => add(title, url)}>
                + {title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="ed-field">
        <span>
          Links <em>{links.length}/{MAX_LINKS}</em>
        </span>
        {links.length === 0 && (
          <div className="ed-hint">No links yet.{quick ? ' Use quick add or the button below.' : ''}</div>
        )}
        {links.map((l, i) => (
          <LinkRow
            key={l.id}
            link={l}
            index={i}
            count={links.length}
            onChange={(patch) => onChange(links.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
            onMove={(dir) => onChange(move(links, i, dir))}
            onRemove={() => onChange(links.filter((_, j) => j !== i))}
          />
        ))}
        <button type="button" className="ed-btn" onClick={() => add()} disabled={links.length >= MAX_LINKS}>
          + Add link
        </button>
      </div>
    </>
  );
}

/* ---------------- gallery + showcase ---------------- */

function GalleryEditor({
  images,
  onChange,
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [url, setUrl] = useState('');

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setErr('');
    const added: GalleryImage[] = [];
    try {
      for (const f of files) {
        if (images.length + added.length >= MAX_GALLERY) break;
        added.push({ id: uid(), src: await processImage(f, 'gallery'), caption: '' });
      }
      onChange([...images, ...added]);
    } catch (er) {
      setErr((er as Error).message);
      if (added.length) onChange([...images, ...added]);
    } finally {
      setBusy(false);
    }
  }

  function addUrl() {
    const u = url.trim();
    if (!/^https:\/\//i.test(u)) return setErr('Image URLs must start with https://');
    setErr('');
    onChange([...images, { id: uid(), src: u, caption: '' }]);
    setUrl('');
  }

  const full = images.length >= MAX_GALLERY;
  return (
    <div className="ed-field">
      <span>
        Photos <em>{images.length}/{MAX_GALLERY}</em>
      </span>
      <div className="ed-addrow">
        <button type="button" className="ed-btn" onClick={() => file.current?.click()} disabled={busy || full}>
          {busy ? 'Processing…' : 'Upload photos'}
        </button>
        <input
          className="ed-input"
          placeholder="…or paste an image URL"
          value={url}
          disabled={full}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addUrl()}
        />
        <button type="button" className="ed-btn" onClick={addUrl} disabled={!url || full}>
          Add
        </button>
      </div>
      <input ref={file} type="file" accept="image/*" multiple hidden onChange={upload} />
      {err && <div className="ed-err-sm">{err}</div>}
      {images.length === 0 && <div className="ed-hint">No photos yet.</div>}
      <div className="ed-gallist">
        {images.map((g, i) => (
          <div className="ed-galitem" key={g.id}>
            <div className="ed-thumb" style={{ backgroundImage: `url(${JSON.stringify(g.src)})` }} />
            <input
              className="ed-input"
              placeholder="Caption"
              maxLength={60}
              value={g.caption}
              onChange={(e) =>
                onChange(images.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))
              }
            />
            <div className="ed-galbtns">
              <button type="button" disabled={i === 0} onClick={() => onChange(move(images, i, -1))}>
                ←
              </button>
              <button type="button" disabled={i === images.length - 1} onClick={() => onChange(move(images, i, 1))}>
                →
              </button>
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShowcaseEditor({
  embeds,
  onChange,
}: {
  embeds: { id: string; url: string }[];
  onChange: (embeds: { id: string; url: string }[]) => void;
}) {
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');

  function add() {
    const u = url.trim();
    if (!parseEmbed(u)) {
      return setErr("That link isn't supported. Use YouTube, Instagram, Spotify, TikTok or Vimeo.");
    }
    setErr('');
    onChange([...embeds, { id: uid(), url: u }]);
    setUrl('');
  }

  return (
    <div className="ed-field">
      <span>
        Items <em>{embeds.length}/{MAX_EMBEDS}</em>
      </span>
      <div className="ed-addrow">
        <input
          className="ed-input"
          placeholder="Paste a YouTube, Instagram, Spotify, TikTok or Vimeo link"
          value={url}
          disabled={embeds.length >= MAX_EMBEDS}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button type="button" className="ed-btn" onClick={add} disabled={!url || embeds.length >= MAX_EMBEDS}>
          Add
        </button>
      </div>
      {err && <div className="ed-err-sm">{err}</div>}
      {embeds.length === 0 && (
        <div className="ed-hint">
          Nothing here yet. Paste a link to a video, post or song and it shows up on your page.
        </div>
      )}
      {embeds.map((e, i) => {
        const info = parseEmbed(e.url);
        return (
          <div className="ed-embedrow" key={e.id}>
            <span className={`ed-badge${info ? '' : ' bad'}`}>{info?.provider ?? 'unsupported'}</span>
            <input
              className="ed-input"
              value={e.url}
              onChange={(ev) =>
                onChange(embeds.map((x, j) => (j === i ? { ...x, url: ev.target.value } : x)))
              }
            />
            <div className="ed-linkbtns" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <button type="button" disabled={i === 0} onClick={() => onChange(move(embeds, i, -1))}>
                ↑
              </button>
              <button type="button" disabled={i === embeds.length - 1} onClick={() => onChange(move(embeds, i, 1))}>
                ↓
              </button>
              <button type="button" onClick={() => onChange(embeds.filter((_, j) => j !== i))}>
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- editor ---------------- */

type Tab = 'profile' | 'pages' | 'look';

const KIND_LABEL: Record<PageKind, string> = {
  links: 'Links page',
  gallery: 'Photo gallery',
  showcase: 'Showcase',
};

export default function Editor() {
  const nav = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'out' | 'in'>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [draft, setDraft] = useState<SocialProfile>(EMPTY);
  const [saved, setSaved] = useState(''); // JSON of last saved profile ('' = never saved)
  const [savedName, setSavedName] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('profile');
  const [pageSel, setPageSel] = useState(0); // 0 = home, n = extra page n-1
  const [adding, setAdding] = useState(false);
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
    document.title = 'Edit your page · social';
    load();
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

  async function signOut() {
    await api.logout().catch(() => {});
    nav('/', { replace: true });
  }

  const set = (patch: Partial<SocialProfile>) => setDraft((d) => ({ ...d, ...patch }));
  const setTheme = (patch: Partial<Theme>) =>
    setDraft((d) => ({ ...d, theme: { ...d.theme, ...patch } }));
  const setPage = (i: number, patch: Partial<SocialPage>) =>
    setDraft((d) => ({ ...d, pages: d.pages.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));

  function addPage(kind: PageKind) {
    const title = { links: 'More', gallery: 'Gallery', showcase: 'Showcase' }[kind];
    set({
      pages: [...draft.pages, { id: uid(), title, kind, links: [], images: [], embeds: [] }],
    });
    setPageSel(draft.pages.length + 1);
    setAdding(false);
  }

  function removePage(i: number) {
    if (!window.confirm(`Delete the page "${draft.pages[i].title}"? This can't be undone after you save.`)) return;
    set({ pages: draft.pages.filter((_, j) => j !== i) });
    setPageSel(0);
  }

  async function save() {
    if (busy) return;
    if (JSON.stringify(draft).length > MAX_BYTES) {
      return setMsg({ ok: false, text: 'Your page is too large. Remove or shrink some images.' });
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

  if (phase === 'loading') {
    return (
      <div className="sl-root">
        <div className="sl-status">Loading…</div>
      </div>
    );
  }
  if (phase === 'out') return <Navigate to="/login" replace />;

  const t = draft.theme;
  const sel = Math.min(pageSel, draft.pages.length);
  const curPage = sel > 0 ? draft.pages[sel - 1] : null;
  const scale = wide ? Math.min(0.82, (h - 100) / PHONE_H) : Math.min(1, (w - 32) / PHONE_W);
  const showForm = wide || pane === 'edit';
  const showPreview = wide || pane === 'preview';

  return (
    <div className="sl-root sl-editor-root">
      <header className="ed-top">
        <div className="ed-top-left">
          <Link className="sl-logo-link" to="/" aria-label="Home">
            <Logo size={28} />
          </Link>
          {savedName && (
            <>
              <a className="ed-btn sm" href={`/${savedName}`} target="_blank" rel="noopener">
                View my site ↗
              </a>
              <button className="ed-link-btn" onClick={copyLink}>
                {copied ? 'Copied!' : 'Copy link'}
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
                  ['pages', 'Pages'],
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
                    options={[
                      { v: 'circle', label: 'Circle' },
                      { v: 'rounded', label: 'Rounded' },
                      { v: 'square', label: 'Square' },
                    ]}
                  />
                </div>
              </div>
            )}

            {tab === 'pages' && (
              <div className="ed-section">
                <div className="ed-field">
                  <span>
                    Pages <em>{draft.pages.length + 1}/{MAX_PAGES + 1}</em>
                  </span>
                  <div className="ed-pages">
                    <button className={sel === 0 ? 'on' : ''} onClick={() => setPageSel(0)}>
                      {draft.homeTitle || 'Links'} (home)
                    </button>
                    {draft.pages.map((p, i) => (
                      <button key={p.id} className={sel === i + 1 ? 'on' : ''} onClick={() => setPageSel(i + 1)}>
                        {p.title}
                      </button>
                    ))}
                    <button className="add" disabled={draft.pages.length >= MAX_PAGES} onClick={() => setAdding((a) => !a)}>
                      + Add page
                    </button>
                  </div>
                  <small>
                    Visitors switch between pages with tabs at the bottom of your phone screen.
                  </small>
                </div>

                {adding && (
                  <div className="ed-addpage">
                    <button className="ed-btn" onClick={() => addPage('links')}>
                      🔗 Links page
                    </button>
                    <button className="ed-btn" onClick={() => addPage('gallery')}>
                      🖼️ Photo gallery
                    </button>
                    <button className="ed-btn" onClick={() => addPage('showcase')}>
                      🎬 Showcase (videos, posts, music)
                    </button>
                  </div>
                )}

                {!curPage && (
                  <>
                    <label className="ed-field">
                      <span>Tab name</span>
                      <input
                        className="ed-input"
                        maxLength={16}
                        value={draft.homeTitle}
                        onChange={(e) => set({ homeTitle: e.target.value })}
                      />
                    </label>
                    <LinkList links={draft.links} onChange={(links) => set({ links })} quick />
                  </>
                )}

                {curPage && (
                  <>
                    <label className="ed-field">
                      <span>
                        Tab name <em>{KIND_LABEL[curPage.kind]}</em>
                      </span>
                      <input
                        className="ed-input"
                        maxLength={16}
                        value={curPage.title}
                        onChange={(e) => setPage(sel - 1, { title: e.target.value })}
                      />
                    </label>
                    {curPage.kind === 'links' && (
                      <LinkList links={curPage.links} onChange={(links) => setPage(sel - 1, { links })} quick />
                    )}
                    {curPage.kind === 'gallery' && (
                      <GalleryEditor images={curPage.images} onChange={(images) => setPage(sel - 1, { images })} />
                    )}
                    {curPage.kind === 'showcase' && (
                      <ShowcaseEditor embeds={curPage.embeds} onChange={(embeds) => setPage(sel - 1, { embeds })} />
                    )}
                    <button className="ed-link-btn ed-danger" onClick={() => removePage(sel - 1)}>
                      Delete this page
                    </button>
                  </>
                )}
              </div>
            )}

            {tab === 'look' && (
              <div className="ed-section">
                <div className="ed-field">
                  <span>Themes</span>
                  <div className="ed-presets">
                    {PRESETS.map((p) => {
                      const pt = { ...DEFAULT_THEME, ...p.theme } as Theme;
                      const bar = {
                        background: pt.btnStyle === 'fill' ? pt.btnColor : 'transparent',
                        border: `2px solid ${pt.btnColor}`,
                        borderRadius: pt.btnShape === 'pill' ? 99 : pt.btnShape === 'square' ? 2 : 6,
                      };
                      return (
                        <button
                          key={p.name}
                          type="button"
                          className="ed-preset"
                          onClick={() => setTheme({ ...pt, avatarShape: t.avatarShape })}
                        >
                          <div className="ed-preset-box" style={{ background: bgCss(pt) }}>
                            <i style={bar} />
                            <i style={bar} />
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
              <ProfileScreen profile={draft} preview activePage={sel} onPageChange={setPageSel} />
            </PhoneFrame>
          </div>
        )}
      </div>
    </div>
  );
}
