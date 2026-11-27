import { useEffect, useState } from 'react';
import { LuDownload, LuTrash2 } from 'react-icons/lu';
import { api } from '../api';
import type { InboxMessage } from '../types';

function csv(rows: InboxMessage[]): string {
  const q = (s: string) => `"${(/^[=+\-@\t\r]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
  const head = ['Date', 'Form', 'Email', 'Name', 'Message'];
  return [head, ...rows.map((m) => [m.createdAt, m.blockTitle, m.email, m.name, m.message])]
    .map((r) => r.map((c) => q(String(c ?? ''))).join(','))
    .join('\n');
}

export default function InboxTab() {
  const [rows, setRows] = useState<InboxMessage[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.inbox().then((r) => setRows(r.messages)).catch((e) => setErr((e as Error).message));
  }, []);

  async function del(id: string) {
    setRows((r) => r?.filter((m) => m.id !== id) ?? r);
    await api.deleteMessage(id).catch(() => {});
  }
  async function clear() {
    if (!window.confirm('Delete every message in your inbox?')) return;
    setRows([]);
    await api.clearInbox().catch(() => {});
  }
  function download() {
    const blob = new Blob([csv(rows ?? [])], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inbox.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="ed-section">
      {err && <div className="ed-err-sm">{err}</div>}
      {rows === null && !err && <div className="ed-hint">Loading…</div>}
      {rows && rows.length === 0 && (
        <div className="ed-hint">
          Nothing yet. Add a <b>Contact form</b> block to a page and submissions will land here.
        </div>
      )}
      {rows && rows.length > 0 && (
        <>
          <div className="ed-actions">
            <button className="ed-btn sm icon" onClick={download}><LuDownload size={14} /><span>Download CSV</span></button>
            <button className="ed-btn sm icon danger" onClick={clear}><LuTrash2 size={14} /><span>Clear all</span></button>
          </div>
          <div className="ed-inbox">
            {rows.map((m) => (
              <div key={m.id} className="ed-msg">
                <div className="ed-msg-top">
                  <a href={`mailto:${m.email}`}>{m.email}</a>
                  <time>{new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                </div>
                {m.name && <div className="ed-msg-name">{m.name}</div>}
                {m.message && <p>{m.message}</p>}
                <div className="ed-msg-bot">
                  <small>{m.blockTitle}</small>
                  <button className="ed-x" onClick={() => del(m.id)} aria-label="Delete message"><LuTrash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
