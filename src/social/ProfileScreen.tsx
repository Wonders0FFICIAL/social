import { useRef, useState } from 'react';
import { FaCheck, FaPlay } from 'react-icons/fa6';
import { api } from './api';
import { parseEmbed } from './embed';
import { autoIconFor, hostOf, Icon, iconName } from './icons';
import { CARD_RADIUS, effectiveTheme, imageLayer, RADIUS, themeVars } from './themes';
import type {
  Block,
  ContactBlock,
  GalleryBlock,
  LinkBlock,
  Theme,
  SocialPage,
  SocialProfile,
} from './types';

/* ---------------- icons on links ---------------- */

function LinkIcon({ icon, url, size = 20 }: { icon: string; url: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  if (icon === 'none') return null;

  const nm = iconName(icon);
  if (nm) return <span className="sl-ico"><Icon name={nm} size={size} /></span>;
  if (icon) {
    return (
      <span className="sl-ico">
        <img className="sl-thumb" src={icon} alt="" referrerPolicy="no-referrer" loading="lazy" />
      </span>
    );
  }
  const auto = autoIconFor(url);
  if (auto) return <span className="sl-ico"><Icon name={auto} size={size} /></span>;

  const host = hostOf(url);
  if (host && !broken) {
    return (
      <span className="sl-ico">
        <img
          className="sl-favicon"
          src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
          alt=""
          onError={() => setBroken(true)}
        />
      </span>
    );
  }
  return <span className="sl-ico"><Icon name="link" size={size} /></span>;
}

/* ---------------- blocks ---------------- */

interface Ctx {
  /** theme the current page is drawn with */
  theme: Theme;
  preview?: boolean;
  /** landing-page example: links work, forms never send */
  demo?: boolean;
  username: string;
  open: (src: string, caption: string) => void;
}

const linkProps = (url: string, preview?: boolean) => ({
  href: url || undefined,
  target: url.startsWith('http') ? '_blank' : undefined,
  rel: 'noopener noreferrer nofollow ugc',
  onClick: preview ? (e: React.MouseEvent) => e.preventDefault() : undefined,
});

function linkLook(b: LinkBlock, ctx: Ctx, defaultAlign: 'left' | 'center') {
  const st = b.style ?? {};
  const th = ctx.theme;
  const css: Record<string, string> = {};
  if (st.btnColor) css['--btn'] = st.btnColor;
  if (st.btnTextColor) css['--btn-text'] = st.btnTextColor;
  if (st.btnBorder || st.btnColor) css['--btn-border'] = st.btnBorder || st.btnColor!;
  if (st.btnShape) {
    css['--radius'] = RADIUS[st.btnShape];
    css['--radius-card'] = CARD_RADIUS[st.btnShape];
  }
  return {
    style: Object.keys(css).length ? (css as React.CSSProperties) : undefined,
    'data-btn': st.btnStyle ?? th.btnStyle,
    'data-shadow': st.btnShadow ?? th.btnShadow,
    'data-anim': st.anim ?? th.anim,
    'data-size': st.size ?? 'md',
    'data-talign': st.textAlign ?? defaultAlign,
    'data-custom': st.btnColor || st.btnTextColor || st.btnBorder ? '1' : undefined,
  };
}

function LinkView({ b, ctx }: { b: LinkBlock; ctx: Ctx }) {
  const text = (
    <span className="sl-link-text">
      <b>{b.title || 'Untitled'}</b>
      {b.subtitle && <small>{b.subtitle}</small>}
    </span>
  );

  if (b.variant === 'featured') {
    const look = linkLook(b, ctx, 'left');
    return (
      <a
        {...linkProps(b.url, ctx.preview)}
        {...look}
        className={`sl-featured${b.image ? ' has-img' : ''}`}
        style={{
          ...look.style,
          ...(b.image ? { backgroundImage: `linear-gradient(transparent 35%, rgba(0,0,0,.72)), url(${JSON.stringify(b.image)})` } : {}),
        }}
      >
        <span className="sl-featured-body">
          <LinkIcon icon={b.icon} url={b.url} size={22} />
          {text}
        </span>
      </a>
    );
  }

  if (b.variant === 'card') {
    return (
      <a {...linkProps(b.url, ctx.preview)} {...linkLook(b, ctx, 'left')} className="sl-cardlink">
        {b.image && <img className="sl-card-img" src={b.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}
        <span className="sl-card-body">
          <LinkIcon icon={b.icon} url={b.url} />
          {text}
        </span>
      </a>
    );
  }

  return (
    <a {...linkProps(b.url, ctx.preview)} {...linkLook(b, ctx, 'center')} className={`sl-link${b.icon === 'none' ? ' noicon' : ''}`}>
      <LinkIcon icon={b.icon} url={b.url} />
      {text}
    </a>
  );
}

function GalleryView({ b, ctx }: { b: GalleryBlock; ctx: Ctx }) {
  if (b.images.length === 0) return ctx.preview ? <div className="sl-empty">Add photos to this gallery</div> : null;
  return (
    <div className={`sl-gallery ${b.layout}`}>
      {b.images.map((g) => (
        <button key={g.id} className="sl-gal-item" onClick={() => ctx.open(g.src, g.caption)}>
          <img src={g.src} alt={g.caption} loading="lazy" referrerPolicy="no-referrer" />
          {g.caption && <span>{g.caption}</span>}
        </button>
      ))}
    </div>
  );
}

function EmbedCard({ url, preview }: { url: string; preview?: boolean }) {
  const info = parseEmbed(url);
  const [play, setPlay] = useState(false);
  if (!info) return preview ? <div className="sl-empty">Paste a video, post or song link</div> : null;

  const allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write';
  const sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms';
  const narrow = info.width ? { maxWidth: info.width } : undefined;

  // Instagram profiles can't be embedded: show a follow card
  if (info.card) {
    return (
      <a className="sl-cardlink sl-profilecard" href={info.href} target="_blank" rel="noopener noreferrer">
        <span className="sl-profilecard-ic"><Icon name="instagram" size={22} /></span>
        <span className="sl-link-text">
          <b>@{info.id}</b>
          <small>Follow on Instagram</small>
        </span>
      </a>
    );
  }

  const openLink = info.href && (
    <a className="sl-embed-open" href={info.href} target="_blank" rel="noopener noreferrer">
      Open on {info.provider === 'youtube' ? 'YouTube' : info.provider === 'instagram' ? 'Instagram' : info.provider === 'tiktok' ? 'TikTok' : info.provider}
    </a>
  );

  // YouTube: thumbnail first, player loads on click (faster, more private). Shorts are portrait.
  if (info.provider === 'youtube' && !play) {
    return (
      <div className="sl-embed-wrap" style={narrow}>
        <button
          className="sl-embed sl-yt"
          style={{ aspectRatio: info.vertical ? '9 / 16' : '16 / 9' }}
          onClick={() => setPlay(true)}
          aria-label="Play video"
        >
          <img src={info.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" />
          <span className="sl-play"><FaPlay size={18} /></span>
        </button>
      </div>
    );
  }

  // Instagram: tap to load (its embed script is heavy), with a plain link as a fallback
  if (info.provider === 'instagram' && !play) {
    return (
      <div className="sl-embed-wrap" style={narrow}>
        <button className="sl-embed sl-igfacade" style={{ height: 150 }} onClick={() => setPlay(true)}>
          <Icon name="instagram" size={28} />
          <b>Instagram post</b>
          <small>Tap to load</small>
        </button>
        {openLink}
      </div>
    );
  }

  return (
    <div className="sl-embed-wrap" style={narrow}>
      <div
        className="sl-embed"
        style={info.vertical ? { aspectRatio: '9 / 16' } : info.height ? { height: info.height } : { aspectRatio: '16 / 9' }}
      >
        <iframe
          src={info.provider === 'youtube' ? `${info.src}?autoplay=1&rel=0&playsinline=1` : info.src}
          title={`${info.provider} embed`}
          loading="lazy"
          allow={allow}
          sandbox={sandbox}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {info.provider !== 'spotify' && info.provider !== 'vimeo' && openLink}
    </div>
  );
}

function ContactForm({ b, ctx }: { b: ContactBlock; ctx: Ctx }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [hp, setHp] = useState(''); // honeypot: real people never see or fill this
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (ctx.preview || ctx.demo) {
      setState('done');
      setTimeout(() => setState('idle'), 2500);
      return;
    }
    setState('sending');
    try {
      await api.contact({ username: ctx.username, blockId: b.id, email, name, message: msg, website: hp });
      setState('done');
      setEmail('');
      setName('');
      setMsg('');
    } catch (er) {
      setErr((er as Error).message);
      setState('idle');
    }
  }

  return (
    <form className="sl-contact" onSubmit={submit}>
      {b.title && <h3>{b.title}</h3>}
      {b.subtitle && <p>{b.subtitle}</p>}
      {state === 'done' ? (
        <div className="sl-contact-done">
          <FaCheck size={14} /> {b.success}
        </div>
      ) : (
        <>
          {b.mode === 'message' && (
            <input
              className="sl-field"
              placeholder="Your name (optional)"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="sl-field"
            type="email"
            required
            placeholder="Your email"
            value={email}
            maxLength={200}
            onChange={(e) => setEmail(e.target.value)}
          />
          {b.mode === 'message' && (
            <textarea
              className="sl-field"
              required
              rows={4}
              placeholder="Your message"
              value={msg}
              maxLength={2000}
              onChange={(e) => setMsg(e.target.value)}
            />
          )}
          <input
            className="sl-hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            name="website"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
          {err && <div className="sl-contact-err">{err}</div>}
          <button className="sl-submit" type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : b.button || 'Send'}
          </button>
        </>
      )}
    </form>
  );
}

function BlockView({ b, ctx }: { b: Block; ctx: Ctx }) {
  switch (b.type) {
    case 'link':
      return <LinkView b={b} ctx={ctx} />;

    case 'heading':
      return (
        <div className={`sl-heading ${b.align}`} style={b.color ? { color: b.color } : undefined}>
          <h3>{b.text}</h3>
          {b.subtitle && <p>{b.subtitle}</p>}
        </div>
      );

    case 'text':
      return <p className={`sl-text ${b.align}`} style={b.color ? { color: b.color } : undefined}>{b.text}</p>;

    case 'socials':
      return (
        <div className={`sl-socials ${b.style}`}>
          {b.items.length === 0 && ctx.preview && <div className="sl-empty">Add social icons</div>}
          {b.items.map((s) => {
            const nm = iconName(s.icon) ?? autoIconFor(s.url) ?? 'link';
            return (
              <a key={s.id} {...linkProps(s.url, ctx.preview)} aria-label={nm} className="sl-social">
                <Icon name={nm} size={20} />
              </a>
            );
          })}
        </div>
      );

    case 'gallery':
      return <GalleryView b={b} ctx={ctx} />;

    case 'image': {
      if (!b.src) return ctx.preview ? <div className="sl-empty">Add an image</div> : null;
      const img = (
        <img
          className="sl-image"
          src={b.src}
          alt={b.caption}
          loading="lazy"
          referrerPolicy="no-referrer"
          onClick={b.url ? undefined : () => ctx.open(b.src, b.caption)}
        />
      );
      return (
        <figure className="sl-figure">
          {b.url ? <a {...linkProps(b.url, ctx.preview)}>{img}</a> : img}
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    }

    case 'embed':
      return <EmbedCard url={b.url} preview={ctx.preview} />;

    case 'divider':
      return <div className={`sl-divider ${b.style}`} />;

    case 'contact':
      return <ContactForm b={b} ctx={ctx} />;
  }
}

/* ---------------- screen ---------------- */

interface Props {
  profile: SocialProfile;
  /** In the editor preview, links shouldn't navigate away and forms don't send. */
  preview?: boolean;
  /** Example page on the landing page: links open, contact forms are pretend. */
  demo?: boolean;
  /** Controlled page index (0 = home). Optional. */
  activePage?: number;
  onPageChange?: (i: number) => void;
}

export default function ProfileScreen({ profile, preview, demo, activePage, onPageChange }: Props) {
  const pages = profile.pages;
  const [inner, setInner] = useState(0);
  const [box, setBox] = useState<{ src: string; caption: string } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const visible = pages.map((p, i) => ({ p, i })).filter(({ p, i }) => i === 0 || !p.hidden);
  let active = Math.min(activePage ?? inner, pages.length - 1);
  if (active < 0 || !visible.some((v) => v.i === active)) active = 0;
  const page: SocialPage | undefined = pages[active];
  const t = effectiveTheme(profile.theme, page);
  const name = profile.displayName || profile.username || 'Your name';
  const layer = imageLayer(t);
  const isHome = active === 0;
  const hasNav = visible.length > 1;

  function go(i: number) {
    setInner(i);
    onPageChange?.(i);
    scroller.current?.scrollTo({ top: 0 });
  }

  const ctx: Ctx = {
    theme: t,
    preview,
    demo,
    username: profile.username,
    open: (src, caption) => setBox({ src, caption }),
  };
  const blocks = (page?.blocks ?? []).filter((b) => !b.hidden);

  return (
    <div
      className="sl-screen"
      data-btn={t.btnStyle}
      data-shadow={t.btnShadow}
      data-anim={t.anim}
      data-nav={t.nav}
      style={themeVars(t)}
    >
      {layer && <div className="sl-bgfx" style={layer} />}
      {t.bgPattern !== 'none' && <div className={`sl-pattern ${t.bgPattern}`} />}

      <div
        ref={scroller}
        className={`sl-scroll${hasNav ? ` has-nav nav-${t.nav}` : ''}${isHome ? '' : ' sub'}`}
      >
        {isHome && (
          <div className="sl-header" data-align={t.headerAlign}>
            {profile.avatarUrl ? (
              <img
                className="sl-avatar"
                src={profile.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
              />
            ) : (
              <div className="sl-avatar sl-avatar-fallback">{name.charAt(0).toUpperCase()}</div>
            )}
            <h1 className="sl-name">{name}</h1>
            {profile.username && <div className="sl-handle">@{profile.username}</div>}
            {profile.bio && <p className="sl-bio">{profile.bio}</p>}
          </div>
        )}

        <div className="sl-blocks" key={page?.id}>
          {blocks.length === 0 && preview && (
            <div className="sl-empty">This page is empty. Add blocks in the editor.</div>
          )}
          {blocks.map((b) => (
            <BlockView key={b.id} b={b} ctx={ctx} />
          ))}
        </div>
      </div>

      {hasNav && (
        <nav className={`sl-tabs ${t.nav}`} aria-label="Pages">
          {visible.map(({ p, i }) => {
            const nm = iconName(p.icon);
            const showIcon = t.navLabels !== 'text' && (nm || t.navLabels === 'icons');
            const showText = t.navLabels !== 'icons' || !nm;
            return (
              <button
                key={p.id}
                className={`${i === active ? 'on' : ''}${showIcon && showText ? ' stacked' : ''}`}
                onClick={() => go(i)}
                aria-label={p.title}
              >
                {showIcon && <Icon name={nm ?? 'link'} size={18} />}
                {showText && <span>{p.title}</span>}
              </button>
            );
          })}
        </nav>
      )}

      {box && (
        <div className="sl-lightbox" onClick={() => setBox(null)}>
          <img src={box.src} alt={box.caption} referrerPolicy="no-referrer" />
          {box.caption && <p>{box.caption}</p>}
        </div>
      )}
    </div>
  );
}

/** Used by the editor's icon preview. */
export const isImageIcon = (icon: string) => icon.startsWith('data:') || icon.startsWith('https://') || icon.startsWith('/api/');
