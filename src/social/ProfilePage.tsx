import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from './api';
import PhoneFrame from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import type { SocialProfile } from './types';

// Public page: /:username
export default function ProfilePage() {
  const { username = '' } = useParams();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'missing'>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');
    api
      .get(username)
      .then((r) => {
        if (!alive) return;
        setProfile(r.profile);
        setState('ok');
        document.title = `${r.profile.displayName} (@${r.profile.username}) · JR.`;
      })
      .catch(() => alive && setState('missing'));
    return () => {
      alive = false;
    };
  }, [username]);

  return (
    <div className="sl-root sl-public">
      {state === 'loading' && <div className="sl-status">Loading…</div>}

      {state === 'missing' && (
        <div className="sl-status">
          <h2>No one here yet</h2>
          <p>@{username} isn't taken. Want it?</p>
          <Link className="sl-btn" to="/edit">
            Claim your page
          </Link>
        </div>
      )}

      {state === 'ok' && profile && (
        <PhoneFrame>
          <ProfileScreen profile={profile} />
        </PhoneFrame>
      )}
    </div>
  );
}
