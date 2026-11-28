import { LuArrowRight, LuCheck, LuCircleAlert, LuLightbulb, LuQrCode } from 'react-icons/lu';
import type { SocialProfile } from '../types';
import { checklist, type Issue, type Tab } from './model';
import { useQrSvg } from './ShareDialog';

export type Target = { tab: Tab; page?: number; block?: string };

export default function StartTab({
  draft,
  publishedName,
  issues,
  onGo,
  onShare,
}: {
  draft: SocialProfile;
  publishedName: string | null;
  issues: Issue[];
  onGo: (t: Target) => void;
  onShare: () => void;
}) {
  const steps = checklist(draft, !!publishedName);
  const done = steps.filter((s) => s.done).length;
  const allDone = done === steps.length;
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  const url = publishedName ? `${location.origin}/${publishedName}` : '';
  const qr = useQrSvg(url || 'https://example.com', 120);

  return (
    <div className="ed-section">
      {!allDone ? (
        <div className="st-card">
          <div className="st-head">
            <div>
              <h3>Get your page ready</h3>
              <p>{done} of {steps.length} done</p>
            </div>
            <div className="st-ring" style={{ ['--p' as string]: `${(done / steps.length) * 100}%` }}>
              <span>{Math.round((done / steps.length) * 100)}%</span>
            </div>
          </div>
          <ol className="st-steps">
            {steps.map((s) => (
              <li key={s.id} className={s.done ? 'done' : ''}>
                <span className="st-tick">{s.done ? <LuCheck size={13} /> : null}</span>
                <div>
                  <b>{s.label}</b>
                  <small>{s.done ? 'Done' : s.hint}</small>
                </div>
                {!s.done && (
                  <button className="ed-btn sm icon" onClick={() => onGo({ tab: s.tab, page: s.page })}>
                    Go <LuArrowRight size={13} />
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="st-card st-ready">
          <span className="st-tick big"><LuCheck size={18} /></span>
          <div>
            <h3>You’re all set</h3>
            <p>Your page is live. Keep tweaking whenever you like, changes save automatically.</p>
          </div>
        </div>
      )}

      {publishedName && (
        <div className="st-card st-share">
          <div className="st-qr" dangerouslySetInnerHTML={{ __html: qr }} aria-hidden />
          <div>
            <h3>Your link</h3>
            <p className="st-url">{url.replace(/^https?:\/\//, '')}</p>
            <button className="ed-btn sm icon" onClick={onShare}><LuQrCode size={14} /><span>Share and QR code</span></button>
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="st-card">
          <h3>{errors.length ? 'To fix' : 'Worth a look'}</h3>
          <ul className="st-issues">
            {[...errors, ...warns].map((i) => (
              <li key={i.id} className={i.level}>
                {i.level === 'error' ? <LuCircleAlert size={16} /> : <LuLightbulb size={16} />}
                <span>{i.text}</span>
                <button className="ed-link-btn" onClick={() => onGo({ tab: i.tab, page: i.page, block: i.block })}>Fix</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {issues.length === 0 && allDone && <div className="ed-hint">No problems found.</div>}
    </div>
  );
}
