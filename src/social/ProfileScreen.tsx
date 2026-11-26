import { useRef, useState } from 'react';
import { parseEmbed } from './embed';
import { imageLayer, themeVars } from './themes';
import type { SocialLink, SocialPage, SocialProfile } from './types';

function hostOf(url: string): string {
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`).hostname;
  } catch {
    return '';
  }
}

export const isImageIcon = (icon: string) => icon.startsWith('data:') || icon.startsWith('https://');

function LinkIcon({ icon, url }: { icon: string; url: string }) {
  if (icon === 'none') return null;
  if (icon && isImageIcon(icon)) {
    return (
      <span className="sl-ico">
        <img className="sl-thumb" src={icon} alt="" referrerPolicy="no-referrer" />
      </span>
    );
  }
  if (icon) {
    return (
      <span className="sl-ico">
        <span className="sl-emoji">{icon}</span>
      </span>
    );
  }
  const host = hostOf(url);
  return (
    <span className="sl-ico">
      {host && (
        <img
          className="sl-favicon"
          src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
          alt=""
          onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
        />
      )}
    </span>
  );
}

function LinkList({ links, preview }: { links: SocialLink[]; preview?: boolean }) {
  const shown = links.filter((l) => !l.hidden);
  return (
    <div className="sl-links">
      {shown.length === 0 && preview && <div className="sl-empty">Your links will show up here</div>}
      {shown.map((l) => (
        <a
          key={l.id}
          className={`sl-link${l.icon === 'none' ? ' noicon' : ''}`}
          href={l.url || undefined}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          onClick={preview ? (e) => e.preventDefault() : undefined}
        >
          <LinkIcon icon={l.icon ?? ''} url={l.url} />
          <span className="sl-link-title">{l.title || 'Untitled'}</span>
        </a>
      ))}
    </div>
  );
}

function Gallery({
  page,
  preview,
  onOpen,
}: {
  page: SocialPage;
  preview?: boolean;
  onOpen: (src: string, caption: string) => void;
}) {
  if (page.images.length === 0) {
    return preview ? <div className="sl-empty">Add photos to this gallery</div> : null;
  }
  return (
    <div className="sl-gallery">
      {page.images.map((g) => (
        <button key={g.id} className="sl-gal-item" onClick={() => onOpen(g.src, g.caption)}>
          <img src={g.src} alt={g.caption} loading="lazy" referrerPolicy="no-referrer" />
          {g.caption && <span>{g.caption}</span>}
        </button>
      ))}
    </div>
  );
}

function EmbedCard({ url }: { url: string }) {
  const info = parseEmbed(url);
  const [play, setPlay] = useState(false);
  if (!info) return null;

  const allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write';
  const sandbox = 'allow-scripts allow-same-origin allow-popups allow-presentation allow-forms';

  // YouTube: show a thumbnail first, load the player only on click (faster + more private)
  if (info.provider === 'youtube' && !play) {
    return (
      <button className="sl-embed sl-yt" onClick={() => setPlay(true)} aria-label="Play video">
        <img src={info.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" />
        <span className="sl-play">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <div className="sl-embed" style={info.height ? { height: info.height } : { aspectRatio: '16 / 9' }}>
      <iframe
        src={info.provider === 'youtube' ? `${info.src}?autoplay=1&rel=0` : info.src}
        title={`${info.provider} embed`}
        loading="lazy"
        allow={allow}
        sandbox={sandbox}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

interface Props {
  profile: SocialProfile;
  /** In the editor preview, links shouldn't navigate away. */
  preview?: boolean;
  /** Controlled page index (0 = home). Optional. */
  activePage?: number;
  onPageChange?: (i: number) => void;
}

export default function ProfileScreen({ profile, preview, activePage, onPageChange }: Props) {
  const t = profile.theme;
  const name = profile.displayName || profile.username || 'Your name';
  const layer = imageLayer(t);
  const pages = profile.pages;
  const [inner, setInner] = useState(0);
  const [box, setBox] = useState<{ src: string; caption: string } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const active = Math.min(activePage ?? inner, pages.length);
  const page = active > 0 ? pages[active - 1] : null;
  const hasTabs = pages.length > 0;

  function go(i: number) {
    setInner(i);
    onPageChange?.(i);
    scroller.current?.scrollTo({ top: 0 });
  }

  return (
    <div className="sl-screen" data-btn={t.btnStyle} style={themeVars(t)}>
      {layer && <div className="sl-bgfx" style={layer} />}

      <div ref={scroller} className={`sl-scroll${hasTabs ? ' has-tabs' : ''}`}>
        {!page ? (
          <>
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
            <LinkList links={profile.links} preview={preview} />
          </>
        ) : (
          <>
            <h2 className="sl-pagetitle">{page.title}</h2>
            {page.kind === 'links' && <LinkList links={page.links} preview={preview} />}
            {page.kind === 'gallery' && (
              <Gallery page={page} preview={preview} onOpen={(src, caption) => setBox({ src, caption })} />
            )}
            {page.kind === 'showcase' && (
              <div className="sl-showcase">
                {page.embeds.length === 0 && preview && (
                  <div className="sl-empty">Add videos, posts or songs to this page</div>
                )}
                {page.embeds.map((e) => (
                  <EmbedCard key={e.id} url={e.url} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {hasTabs && (
        <nav className="sl-tabs" aria-label="Pages">
          {[profile.homeTitle || 'Links', ...pages.map((p) => p.title)].map((title, i) => (
            <button key={i} className={i === active ? 'on' : ''} onClick={() => go(i)}>
              {title}
            </button>
          ))}
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
