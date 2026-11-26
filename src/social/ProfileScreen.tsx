import type { SocialProfile } from './types';
import { imageLayer, themeVars } from './themes';

function hostOf(url: string): string {
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`).hostname;
  } catch {
    return '';
  }
}

interface Props {
  profile: SocialProfile;
  /** In the editor preview, links shouldn't navigate away. */
  preview?: boolean;
  onShare?: () => void;
}

export default function ProfileScreen({ profile, preview, onShare }: Props) {
  const t = profile.theme;
  const name = profile.displayName || profile.username || 'Your name';
  const layer = imageLayer(t);
  const links = profile.links.filter((l) => !l.hidden);

  return (
    <div className="sl-screen" data-btn={t.btnStyle} style={themeVars(t)}>
      {layer && <div className="sl-bgfx" style={layer} />}

      {onShare && (
        <button className="sl-share" onClick={onShare} aria-label="Share this page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
            <path d="M16 6l-4-4-4 4" />
            <path d="M12 2v13" />
          </svg>
        </button>
      )}

      <div className="sl-scroll">
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

        <div className="sl-links">
          {links.length === 0 && preview && (
            <div className="sl-empty">Your links will show up here</div>
          )}
          {links.map((l) => {
            const host = hostOf(l.url);
            return (
              <a
                key={l.id}
                className="sl-link"
                href={l.url || undefined}
                target="_blank"
                rel="noopener noreferrer nofollow ugc"
                onClick={preview ? (e) => e.preventDefault() : undefined}
              >
                {host ? (
                  <img
                    className="sl-favicon"
                    src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
                    alt=""
                    onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                  />
                ) : (
                  <span className="sl-favicon" />
                )}
                <span className="sl-link-title">{l.title || 'Untitled'}</span>
              </a>
            );
          })}
        </div>

        <a className="sl-made" href="/edit">
          Create your own page
        </a>
      </div>
    </div>
  );
}
