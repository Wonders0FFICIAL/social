import { useCallback, useEffect, useMemo, useState } from 'react';
import { LuArrowLeft, LuBan, LuCheck, LuEye, LuFlag, LuSearch, LuShieldCheck, LuTrash2, LuX } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { api } from './api';
import Logo from './Logo';
import PhoneFrame from './PhoneFrame';
import ProfileScreen from './ProfileScreen';
import type { AdminReport, SocialProfile } from './types';

type Act = 'disable' | 'enable' | 'dismiss' | 'delete';
type Disabled = { username: string; displayName: string };
type Found = { username: string; displayName: string; disabled: boolean; open: number };
type View = Awaited<ReturnType<typeof api.adminView>>;
type Tab = 'reports' | 'disabled' | 'lookup';

const when = (d: string) => {
  const t = new Date(d);
  return isNaN(+t) ? '' : t.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function AdminPage() {
  const [state, setState] = useState<'loading' | 'denied' | 'ok'>('loading');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [disabled, setDisabled] = useState<Disabled[]>([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<Tab>('reports');
  const [q, setQ] = useState('');
  const [found, setFound] = useState<Found | null | undefined>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [peek, setPeek] = useState<{ username: string; data: View | null; failed?: boolean } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.admin();
      setReports(r.reports);
      setDisabled(r.disabled);
      setTotal(r.totalPages ?? 0);
      setState('ok');
    } catch {
      setState('denied');
    }
  }, []);

  useEffect(() => {
    document.title = 'Moderation · social';
    load();
  }, [load]);

  async function act(action: Act, username: string) {
    setBusy(true);
    setErr('');
    try {
      await api.adminAct(action, username);
      await load();
      if (found?.username === username) {
        const r = await api.adminFind(username).catch(() => null);
        setFound(r ? r.found : undefined);
      }
      if (peek?.username === username) {
        if (action === 'delete') setPeek(null);
        else setPeek({ username, data: await api.adminView(username).catch(() => null) });
      }
    } catch (e) {
      setErr((e as Error).message || 'That did not work. Try again.');
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  async function open(username: string) {
    setPeek({ username, data: null });
    try {
      setPeek({ username, data: await api.adminView(username) });
    } catch {
      setPeek({ username, data: null, failed: true });
    }
  }

  async function find(e: React.FormEvent) {
    e.preventDefault();
    const name = q.trim().replace(/^@/, '').toLowerCase();
    if (!name) return;
    setFound(undefined);
    setFound((await api.adminFind(name).catch(() => ({ found: null }))).found);
  }

  useEffect(() => {
    if (!peek && !confirm) return;
    const f = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirm) setConfirm(null);
      else setPeek(null);
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [peek, confirm]);

  const peekOpenReports = useMemo(() => peek?.data?.reports.filter((r) => r.status === 'open').length ?? 0, [peek]);

  if (state === 'loading') return <div className="sl-root"><div className="sl-status">Loading…</div></div>;
  if (state === 'denied') {
    return (
      <div className="sl-root">
        <div className="sl-card sl-signin">
          <Logo size={36} />
          <h2>Not authorized</h2>
          <p>This page is for site admins. If you just added your email to ADMIN_EMAILS, sign out and back in.</p>
          <Link className="sl-btn" to="/">Back home</Link>
        </div>
      </div>
    );
  }

  const Row = ({ username, name, meta, children }: { username: string; name?: string | null; meta?: React.ReactNode; children: React.ReactNode }) => (
    <div className="ad-item">
      <div className="ad-who">
        <b>@{username}</b>
        <small>{name && <span>{name}</span>}{name && meta ? <span aria-hidden>·</span> : null}{meta}</small>
      </div>
      <div className="ad-acts">{children}</div>
    </div>
  );

  const ViewBtn = ({ u }: { u: string }) => (
    <button className="ed-btn sm icon" onClick={() => open(u)}><LuEye size={14} /><span>Review</span></button>
  );

  return (
    <div className="sl-root sl-editor-root">
      <header className="ed-top">
        <div className="ed-top-left">
          <Link className="sl-logo-link" to="/"><Logo size={28} /></Link>
          <b>Moderation</b>
        </div>
        <div className="ed-top-right">
          <Link className="ed-btn sm icon ghost" to="/edit"><LuArrowLeft size={14} /><span>Editor</span></Link>
        </div>
      </header>

      <div className="ad-wrap">
        <div className="ad-stats">
          <div><b>{reports.length}</b><span>pages reported</span></div>
          <div><b>{disabled.length}</b><span>disabled</span></div>
          <div><b>{total}</b><span>pages total</span></div>
        </div>

        <div className="ad-tabs" role="tablist">
          {(['reports', 'disabled', 'lookup'] as Tab[]).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {k === 'reports' ? 'Reports' : k === 'disabled' ? 'Disabled' : 'Look up'}
              {k === 'reports' && reports.length > 0 && <em>{reports.length}</em>}
              {k === 'disabled' && disabled.length > 0 && <em className="mute">{disabled.length}</em>}
            </button>
          ))}
        </div>

        {err && <div className="ad-err">{err}</div>}

        {tab === 'reports' && (
          <section className="ad-card">
            {reports.length === 0 && (
              <div className="ad-empty"><LuShieldCheck size={26} /><b>All clear</b><span>No open reports right now.</span></div>
            )}
            {reports.map((r) => (
              <div key={r.username} className="ad-report">
                <Row
                  username={r.username}
                  name={r.displayName}
                  meta={
                    <>
                      <LuFlag size={11} /> {r.count} report{r.count === 1 ? '' : 's'} · latest {when(r.latest)}
                      {!r.exists ? ' · page deleted' : r.disabled ? ' · disabled' : ''}
                    </>
                  }
                >
                  {r.exists && <ViewBtn u={r.username} />}
                  <button className="ed-btn sm icon" disabled={busy} onClick={() => act('dismiss', r.username)}><LuX size={14} /><span>Dismiss</span></button>
                  {r.exists && !r.disabled && (
                    <button className="ed-btn sm icon" disabled={busy} onClick={() => act('disable', r.username)}><LuBan size={14} /><span>Disable</span></button>
                  )}
                  {r.exists && r.disabled && (
                    <button className="ed-btn sm icon" disabled={busy} onClick={() => act('enable', r.username)}><LuCheck size={14} /><span>Enable</span></button>
                  )}
                  {r.exists && (
                    <button className="ed-btn sm icon danger" disabled={busy} onClick={() => setConfirm(r.username)}><LuTrash2 size={14} /></button>
                  )}
                </Row>
                <div className="ed-chipline">{r.reasons.map((x) => <span key={x}>{x}</span>)}</div>
                {r.details.slice(0, 3).map((d, i) => <p key={i} className="ad-detail">“{d}”</p>)}
              </div>
            ))}
          </section>
        )}

        {tab === 'disabled' && (
          <section className="ad-card">
            {disabled.length === 0 && <div className="ad-empty"><b>Nothing disabled</b><span>Pages you disable show up here.</span></div>}
            {disabled.map((d) => (
              <Row key={d.username} username={d.username} name={d.displayName}>
                <ViewBtn u={d.username} />
                <button className="ed-btn sm icon" disabled={busy} onClick={() => act('enable', d.username)}><LuCheck size={14} /><span>Enable</span></button>
                <button className="ed-btn sm icon danger" disabled={busy} onClick={() => setConfirm(d.username)}><LuTrash2 size={14} /></button>
              </Row>
            ))}
          </section>
        )}

        {tab === 'lookup' && (
          <section className="ad-card">
            <form className="ad-find" onSubmit={find}>
              <input className="ed-input" placeholder="username" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Username" />
              <button className="ed-btn primary icon"><LuSearch size={15} /><span>Find</span></button>
            </form>
            {found === null && <div className="ad-empty tight"><span>No page with that username.</span></div>}
            {found && (
              <Row username={found.username} name={found.displayName} meta={`${found.disabled ? 'disabled' : 'live'}${found.open ? ` · ${found.open} open report${found.open === 1 ? '' : 's'}` : ''}`}>
                <ViewBtn u={found.username} />
                {found.disabled ? (
                  <button className="ed-btn sm icon" disabled={busy} onClick={() => act('enable', found.username)}><LuCheck size={14} /><span>Enable</span></button>
                ) : (
                  <button className="ed-btn sm icon" disabled={busy} onClick={() => act('disable', found.username)}><LuBan size={14} /><span>Disable</span></button>
                )}
                <button className="ed-btn sm icon danger" disabled={busy} onClick={() => setConfirm(found.username)}><LuTrash2 size={14} /></button>
              </Row>
            )}
          </section>
        )}
      </div>

      {peek && (
        <div className="dlg-back" onClick={() => setPeek(null)}>
          <div className="dlg ad-peek" role="dialog" aria-modal="true" aria-label={`Review @${peek.username}`} onClick={(e) => e.stopPropagation()}>
            <button className="dlg-x" onClick={() => setPeek(null)} aria-label="Close"><LuX size={18} /></button>
            <h3 className="dlg-title">@{peek.username}</h3>
            {!peek.data && !peek.failed && <p className="dlg-sub">Loading…</p>}
            {peek.failed && <p className="dlg-sub">Could not load this page.</p>}
            {peek.data && (
              <div className="ad-peek-body">
                <div className="ad-peek-phone">
                  {peek.data.profile ? (
                    <PhoneFrame scale={0.6}>
                      <ProfileScreen profile={peek.data.profile as SocialProfile} preview />
                    </PhoneFrame>
                  ) : (
                    <p className="dlg-sub">This page no longer exists.</p>
                  )}
                </div>
                <div className="ad-peek-side">
                  <p className="ad-note">Links are not clickable here. Only admins can see a disabled page.</p>
                  <h4>Reports ({peek.data.reports.length})</h4>
                  {peek.data.reports.length === 0 && <small className="ad-note">None on file.</small>}
                  <ul className="ad-reps">
                    {peek.data.reports.map((r, i) => (
                      <li key={i} className={r.status}>
                        <b>{r.reason}</b> <small>{when(r.createdAt)} · {r.status}</small>
                        {r.details && <p>“{r.details}”</p>}
                      </li>
                    ))}
                  </ul>
                  {peek.data.profile && (
                    <div className="ad-acts wrap">
                      {peekOpenReports > 0 && (
                        <button className="ed-btn sm icon" disabled={busy} onClick={() => act('dismiss', peek.username)}><LuX size={14} /><span>Dismiss reports</span></button>
                      )}
                      {peek.data.disabled ? (
                        <button className="ed-btn sm icon" disabled={busy} onClick={() => act('enable', peek.username)}><LuCheck size={14} /><span>Enable</span></button>
                      ) : (
                        <button className="ed-btn sm icon" disabled={busy} onClick={() => act('disable', peek.username)}><LuBan size={14} /><span>Disable</span></button>
                      )}
                      <button className="ed-btn sm icon danger" disabled={busy} onClick={() => setConfirm(peek.username)}><LuTrash2 size={14} /><span>Delete</span></button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirm && (
        <div className="dlg-back" style={{ zIndex: 110 }} onClick={() => setConfirm(null)}>
          <div className="dlg" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="dlg-title">Delete @{confirm}?</h3>
            <p className="dlg-sub">This permanently removes the page, its uploaded images and its inbox. It cannot be undone. Disabling is reversible.</p>
            <div className="share-actions">
              <button className="ed-btn" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="ed-btn danger" disabled={busy} onClick={() => act('delete', confirm)}>Delete forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
