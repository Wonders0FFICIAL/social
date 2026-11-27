import { useCallback, useEffect, useState } from 'react';
import { LuArrowLeft, LuBan, LuCheck, LuSearch, LuTrash2, LuX } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { api } from './api';
import Logo from './Logo';
import type { AdminReport } from './types';

type Disabled = { username: string; displayName: string };

export default function AdminPage() {
  const [state, setState] = useState<'loading' | 'denied' | 'ok'>('loading');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [disabled, setDisabled] = useState<Disabled[]>([]);
  const [q, setQ] = useState('');
  const [found, setFound] = useState<{ username: string; displayName: string; disabled: boolean } | null | undefined>();
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await api.admin();
      setReports(r.reports);
      setDisabled(r.disabled);
      setState('ok');
    } catch {
      setState('denied');
    }
  }, []);

  useEffect(() => {
    document.title = 'Moderation · social';
    load();
  }, [load]);

  async function act(action: 'disable' | 'enable' | 'dismiss' | 'delete', username: string) {
    if (action === 'delete' && !window.confirm(`Permanently delete @${username} and their data?`)) return;
    setBusy(`${action}:${username}`);
    try {
      await api.adminAct(action, username);
      await load();
      if (found?.username === username) setFound(undefined);
    } finally {
      setBusy('');
    }
  }

  async function find(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setFound((await api.adminFind(q.trim().replace(/^@/, '').toLowerCase()).catch(() => ({ found: null }))).found);
  }

  if (state === 'loading') return <div className="sl-root"><div className="sl-status">Loading…</div></div>;
  if (state === 'denied') {
    return (
      <div className="sl-root">
        <div className="sl-card sl-signin">
          <Logo size={36} />
          <h2>Not authorized</h2>
          <p>This page is for site admins.</p>
          <Link className="sl-btn" to="/">Back home</Link>
        </div>
      </div>
    );
  }

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
        <section className="ad-card">
          <h3>Look up a page</h3>
          <form className="ad-find" onSubmit={find}>
            <input className="ed-input" placeholder="username" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="ed-btn icon"><LuSearch size={15} /><span>Find</span></button>
          </form>
          {found === null && <div className="ed-hint-sm">No such page.</div>}
          {found && (
            <div className="ad-row">
              <div>
                <a href={`/${found.username}`} target="_blank" rel="noopener">@{found.username}</a>
                <small>{found.displayName}{found.disabled ? ' · disabled' : ''}</small>
              </div>
              <div className="ed-actions">
                {found.disabled ? (
                  <button className="ed-btn sm" onClick={() => act('enable', found.username)}>Enable</button>
                ) : (
                  <button className="ed-btn sm" onClick={() => act('disable', found.username)}>Disable</button>
                )}
                <button className="ed-btn sm danger" onClick={() => act('delete', found.username)}>Delete</button>
              </div>
            </div>
          )}
        </section>

        <section className="ad-card">
          <h3>Open reports <span className="ad-count">{reports.length}</span></h3>
          {reports.length === 0 && <div className="ed-hint">No open reports.</div>}
          {reports.map((r) => (
            <div key={r.username} className="ad-report">
              <div className="ad-report-top">
                <div>
                  {r.exists ? <a href={`/${r.username}`} target="_blank" rel="noopener">@{r.username}</a> : <b>@{r.username}</b>}
                  <small>
                    {r.count} report{r.count === 1 ? '' : 's'}
                    {r.displayName ? ` · ${r.displayName}` : ''}
                    {!r.exists ? ' · page no longer exists' : ''}
                    {r.disabled ? ' · disabled' : ''}
                  </small>
                </div>
                <div className="ed-actions">
                  <button className="ed-btn sm icon" disabled={!!busy} onClick={() => act('dismiss', r.username)}><LuX size={14} /><span>Dismiss</span></button>
                  {r.exists && (r.disabled ? (
                    <button className="ed-btn sm icon" disabled={!!busy} onClick={() => act('enable', r.username)}><LuCheck size={14} /><span>Enable</span></button>
                  ) : (
                    <button className="ed-btn sm icon" disabled={!!busy} onClick={() => act('disable', r.username)}><LuBan size={14} /><span>Disable</span></button>
                  ))}
                  {r.exists && <button className="ed-btn sm icon danger" disabled={!!busy} onClick={() => act('delete', r.username)}><LuTrash2 size={14} /><span>Delete</span></button>}
                </div>
              </div>
              <div className="ed-chipline">{[...new Set(r.reasons)].map((x) => <span key={x}>{x}</span>)}</div>
              {r.details.filter(Boolean).slice(0, 3).map((d, i) => <p key={i} className="ad-detail">“{d}”</p>)}
            </div>
          ))}
        </section>

        <section className="ad-card">
          <h3>Disabled pages <span className="ad-count">{disabled.length}</span></h3>
          {disabled.length === 0 && <div className="ed-hint">None.</div>}
          {disabled.map((d) => (
            <div key={d.username} className="ad-row">
              <div><b>@{d.username}</b><small>{d.displayName}</small></div>
              <button className="ed-btn sm" onClick={() => act('enable', d.username)}>Enable</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
