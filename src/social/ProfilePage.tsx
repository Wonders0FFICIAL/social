import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from './api';
import PhoneFrame, { PHONE_H } from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import type { SocialProfile } from './types';
import { useViewport } from './useViewport';

// Public page: /:username
export default function ProfilePage() {
  const { username = '' } = useParams();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [copied, setCopied] = useState(false);
  const { w, h } = useViewport();

  useEffect(() => {
    let alive = true;
    setState('loading');
    api
      .get(username)
      .then((r) => {
        if (!alive) return;
        setProfile(r.profile);
        setState('ok');
        document.title = `${r.profile.displayName} (@${r.profile.username})`;
      })
      .catch(() => alive && setState('missing'));
    return () => {
      alive = false;
    };
  }, [username]);

  async function share() {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled */
    }
  }

  const bare = w <= 520;
  const scale = Math.min(1, (h - 40) / PHONE_H);

  if (state === 'ok' && profile) {
    return (
      <div className={`sl-root sl-public${bare ? ' is-bare' : ''}`}>
        <PhoneFrame scale={scale} bare={bare}>
          <ProfileScreen profile={profile} onShare={share} />
        </PhoneFrame>
        {copied && <div className="sl-toast">Link copied</div>}
      </div>
    );
  }

  return (
    <div className="sl-root">
      {state === 'loading' ? (
        <div className="sl-status">Loading…</div>
      ) : (
        <div className="sl-card sl-signin">
          <h2>No one here yet</h2>
          <p>
            <b>@{username}</b> isn't taken. Want it?
          </p>
          <Link className="sl-btn" to="/edit">
            Claim your page
          </Link>
        </div>
      )}
    </div>
  );
}
