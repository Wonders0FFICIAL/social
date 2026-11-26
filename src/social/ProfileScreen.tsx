import type { CSSProperties } from 'react';
import type { SocialProfile } from './types';

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
}

export default function ProfileScreen({ profile, preview }: Props) {
  const name = profile.displayName || profile.username || 'Your name';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="sl-screen" style={{ '--accent': profile.accent } as CSSProperties}>
      {profile.avatarUrl ? (
        <img
          className="sl-avatar"
          src={profile.avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
        />
      ) : (
        <div className="sl-avatar sl-avatar-fallback">{initial}</div>
      )}

      <h1 className="sl-name">{name}</h1>
      {profile.username && <div className="sl-handle">@{profile.username}</div>}
      {profile.bio && <p className="sl-bio">{profile.bio}</p>}

      <div className="sl-links">
        {profile.links.length === 0 && preview && (
          <div className="sl-empty">Your links will show up here</div>
        )}
        {profile.links.map((l) => {
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

      <a className="sl-made" href="https://jrofficial.org">
        Made with JR.
      </a>
    </div>
  );
}
