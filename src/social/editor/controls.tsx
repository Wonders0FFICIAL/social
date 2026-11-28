import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LuChevronDown, LuChevronRight, LuImagePlus, LuSearch, LuX } from 'react-icons/lu';
import { Icon, ICONS, autoIconFor, iconName } from '../icons';
import { uploadImage, type ImageKind } from '../image';
import { isImageIcon } from '../ProfileScreen';
import { DEFAULT_THEME, SWATCHES } from '../themes';
import type { LinkStyle, Theme } from '../types';

export const MAX_BYTES = 1_500_000;

export function validUrl(u: string, allowMail = true): boolean {
  const s = u.trim();
  if (!s) return false;
  if (allowMail && /^(mailto|tel):.+/i.test(s)) return true;
  try {
    const x = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`);
    return x.protocol === 'https:' && x.hostname.includes('.');
  } catch {
    return false;
  }
}

export function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export const uid = () => crypto.randomUUID();

export function Seg<T extends string>({
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
        <button key={o.v} type="button" className={o.v === value ? 'on' : ''} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="ed-field">
      <span>
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
    </div>
  );
}

export function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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

const isImg = (v: string) => v.startsWith('https://') || v.startsWith('/api/') || v.startsWith('data:');

/** Upload button + optional pasted URL. */
export function ImagePicker({
  value,
  kind,
  onChange,
  extra,
  compact,
}: {
  value: string;
  kind: ImageKind;
  onChange: (v: string) => void;
  extra?: React.ReactNode;
  compact?: boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const has = isImg(value);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    setErr('');
    try {
      onChange(await uploadImage(f, kind));
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
          style={has ? { backgroundImage: `url(${JSON.stringify(value)})` } : undefined}
        />
        <div className="ed-img-actions">
          <button type="button" className="ed-btn sm icon" onClick={() => file.current?.click()} disabled={busy}>
            <LuImagePlus size={15} />
            <span>{busy ? 'Uploading…' : has ? 'Replace' : 'Upload'}</span>
          </button>
          {extra}
          {has && (
            <button type="button" className="ed-link-btn" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      {!compact && (
        <input
          className="ed-input"
          placeholder="…or paste an image URL (https://)"
          value={value.startsWith('https://') ? value : ''}
          onChange={(e) => onChange(e.target.value.trim())}
        />
      )}
      <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
      {err && <div className="ed-err-sm">{err}</div>}
    </div>
  );
}

/** Multi-file upload. */
export function MultiUpload({
  kind,
  onDone,
  label = 'Add photos',
}: {
  kind: ImageKind;
  onDone: (urls: string[]) => void;
  label?: string;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    setErr('');
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setBusy(`Uploading ${i + 1}/${files.length}…`);
      try {
        urls.push(await uploadImage(files[i], kind));
      } catch (er) {
        setErr(`${files[i].name}: ${(er as Error).message}`);
      }
    }
    setBusy('');
    if (urls.length) onDone(urls);
  }

  return (
    <div className="ed-multi">
      <button type="button" className="ed-btn icon" disabled={!!busy} onClick={() => file.current?.click()}>
        <LuImagePlus size={16} />
        <span>{busy || label}</span>
      </button>
      <input ref={file} type="file" accept="image/*" multiple hidden onChange={pick} />
      {err && <div className="ed-err-sm">{err}</div>}
    </div>
  );
}

/** Searchable icon grid. onPick gets the icon name. */
export function IconGrid({ value, onPick }: { value?: string; onPick: (name: string) => void }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ICONS.filter((i) => i.label.toLowerCase().includes(s) || i.name.includes(s)) : ICONS;
  }, [q]);
  return (
    <div className="ed-iconpick">
      <div className="ed-search">
        <LuSearch size={15} />
        <input placeholder="Search icons" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="ed-icongrid">
        {list.map((i) => (
          <button
            key={i.name}
            type="button"
            title={i.label}
            aria-label={i.label}
            className={i.name === value ? 'on' : ''}
            onClick={() => onPick(i.name)}
          >
            <Icon name={i.name} size={18} />
          </button>
        ))}
        {list.length === 0 && <div className="ed-hint-sm">No match</div>}
      </div>
    </div>
  );
}

/** Link icon: auto | none | icon | uploaded image */
export function LinkIconPicker({ value, url, onChange }: { value: string; url: string; onChange: (v: string) => void }) {
  const derived = value === 'none' ? 'none' : iconName(value) ? 'icon' : isImageIcon(value) ? 'image' : 'auto';
  // 'image' mode has an empty value until a file is picked, so remember the choice locally
  const [wantImage, setWantImage] = useState(false);
  const mode = derived === 'auto' && wantImage ? 'image' : derived;
  const [open, setOpen] = useState(false);
  const auto = autoIconFor(url);

  return (
    <div className="ed-field">
      <span>Icon</span>
      <Seg
        value={mode}
        onChange={(m) => {
          setWantImage(m === 'image');
          if (m === 'auto') onChange('');
          else if (m === 'none') onChange('none');
          else if (m === 'icon') {
            onChange(`ic:${auto ?? 'link'}`);
            setOpen(true);
          } else if (derived !== 'image') onChange('');
        }}
        options={[
          { v: 'auto', label: 'Auto' },
          { v: 'icon', label: 'Icon' },
          { v: 'image', label: 'Image' },
          { v: 'none', label: 'None' },
        ]}
      />
      {mode === 'auto' && (
        <small>{auto ? 'Picked from the link address.' : 'We use the site’s own icon when we can.'}</small>
      )}
      {mode === 'icon' && (
        <>
          <button type="button" className="ed-iconbtn" onClick={() => setOpen((o) => !o)}>
            <Icon name={iconName(value)!} size={18} />
            <span>Change icon</span>
          </button>
          {open && <IconGrid value={iconName(value)!} onPick={(n) => onChange(`ic:${n}`)} />}
        </>
      )}
      {mode === 'image' && (
        <ImagePicker
          kind="thumb"
          value={isImageIcon(value) ? value : ''}
          onChange={(v) => {
            onChange(v);
            if (!v) setWantImage(true);
          }}
        />
      )}
    </div>
  );
}

export function IconX({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="ed-x" onClick={onClick} aria-label={label} title={label}>
      <LuX size={15} />
    </button>
  );
}

/** Look of the page being edited, so link editors can show what they inherit. */
export const BlockCtx = createContext<{ theme: Theme; applyStyleToAll: (s: LinkStyle | undefined) => void }>({
  theme: DEFAULT_THEME,
  applyStyleToAll: () => {},
});

/** Colour that falls back to the page colour when empty. */
export function ColorOverride({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string | undefined;
  fallback: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="ed-field">
      <Color label={label} value={value || fallback} onChange={onChange} />
      {value && (
        <button type="button" className="ed-link-btn" onClick={() => onChange('')}>
          Use page colour
        </button>
      )}
    </div>
  );
}

const hasKeys = (o: object | undefined) => !!o && Object.keys(o).length > 0;

/** Per-link style: anything left alone is inherited from the page. */
export function LinkStyleEditor({
  style,
  variant,
  onChange,
}: {
  style: LinkStyle | undefined;
  variant: 'button' | 'card' | 'featured';
  onChange: (s: LinkStyle | undefined) => void;
}) {
  const { theme, applyStyleToAll } = useContext(BlockCtx);
  const [open, setOpen] = useState(false);
  const st = style ?? {};
  const set = (patch: Partial<LinkStyle>) => {
    const next: Record<string, unknown> = { ...st, ...patch };
    for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k];
    onChange(Object.keys(next).length ? (next as LinkStyle) : undefined);
  };
  const eff = <K extends keyof Theme>(k: K) => (st as Record<string, unknown>)[k] as Theme[K] ?? theme[k];

  return (
    <div className="ed-linkstyle">
      <button type="button" className="ed-disclosure" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
        <b>Style</b>
        <span>{hasKeys(style) ? 'Custom' : 'Same as page'}</span>
      </button>
      {open && (
        <div className="ed-linkstyle-body">
          {variant === 'button' && (
            <Field label="Fill">
              <Seg
                value={eff('btnStyle')}
                onChange={(v) => set({ btnStyle: v })}
                options={[{ v: 'fill', label: 'Filled' }, { v: 'outline', label: 'Outline' }, { v: 'soft', label: 'Soft' }]}
              />
            </Field>
          )}
          <Field label="Shape">
            <Seg
              value={eff('btnShape')}
              onChange={(v) => set({ btnShape: v })}
              options={[{ v: 'square', label: 'Square' }, { v: 'rounded', label: 'Rounded' }, { v: 'pill', label: 'Pill' }]}
            />
          </Field>
          <Field label="Size">
            <Seg
              value={st.size ?? 'md'}
              onChange={(v) => set({ size: v })}
              options={[{ v: 'sm', label: 'Small' }, { v: 'md', label: 'Medium' }, { v: 'lg', label: 'Large' }]}
            />
          </Field>
          <Field label="Text alignment">
            <Seg
              value={st.textAlign ?? (variant === 'button' ? 'center' : 'left')}
              onChange={(v) => set({ textAlign: v })}
              options={[{ v: 'left', label: 'Left' }, { v: 'center', label: 'Centre' }]}
            />
          </Field>
          <Field label="Shadow">
            <Seg
              value={eff('btnShadow')}
              onChange={(v) => set({ btnShadow: v })}
              options={[{ v: 'none', label: 'None' }, { v: 'soft', label: 'Soft' }, { v: 'hard', label: 'Hard' }]}
            />
          </Field>
          <Field label="Hover effect">
            <Seg
              value={eff('anim')}
              onChange={(v) => set({ anim: v })}
              options={[{ v: 'none', label: 'None' }, { v: 'lift', label: 'Lift' }, { v: 'pop', label: 'Pop' }]}
            />
          </Field>
          {variant !== 'featured' && (
            <>
              <ColorOverride label="Colour" value={st.btnColor} fallback={theme.btnColor} onChange={(v) => set({ btnColor: v || undefined })} />
              <ColorOverride label="Text colour" value={st.btnTextColor} fallback={theme.btnTextColor} onChange={(v) => set({ btnTextColor: v || undefined })} />
            </>
          )}
          <ColorOverride label="Border colour" value={st.btnBorder} fallback={st.btnColor || theme.btnBorder || theme.btnColor} onChange={(v) => set({ btnBorder: v || undefined })} />
          <div className="ed-actions">
            <button type="button" className="ed-btn sm" disabled={!hasKeys(style)} onClick={() => onChange(undefined)}>
              Reset to page style
            </button>
            <button type="button" className="ed-btn sm" disabled={!hasKeys(style)} onClick={() => applyStyleToAll(style)}>
              Apply to all links on this page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
