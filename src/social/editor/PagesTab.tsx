import { useState } from 'react';
import { LuArrowLeft, LuArrowRight, LuCopy, LuEye, LuEyeOff, LuPlus, LuTrash2 } from 'react-icons/lu';
import { newPage } from '../blocks';
import { Icon, iconName } from '../icons';
import type { SocialPage, SocialProfile } from '../types';
import { effectiveTheme } from '../themes';
import { BlockList } from './BlockEditors';
import PageLook from './PageLook';
import { Field, IconGrid, move, uid, useReorder } from './controls';

const MAX_PAGES = 25;

export default function PagesTab({
  draft,
  set,
  sel,
  setSel,
  focus,
}: {
  draft: SocialProfile;
  set: (patch: Partial<SocialProfile>) => void;
  sel: number;
  setSel: (i: number) => void;
  focus?: { block?: string; nonce: number };
}) {
  const [iconOpen, setIconOpen] = useState(false);
  const pages = draft.pages;
  const i = Math.min(sel, pages.length - 1);
  const page = pages[i];
  const home = i === 0;
  const reorder = useReorder(pages, (next) => {
    const cur = pages[i]?.id;
    set({ pages: next });
    setSel(Math.max(0, next.findIndex((p) => p.id === cur)));
  }, 'x', 1);

  const setPage = (patch: Partial<SocialPage>) =>
    set({ pages: pages.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  function addPage() {
    set({ pages: [...pages, newPage(`Page ${pages.length + 1}`)] });
    setSel(pages.length);
  }
  function duplicate() {
    const copy = JSON.parse(JSON.stringify(page)) as SocialPage;
    copy.id = uid();
    copy.title = `${page.title} copy`.slice(0, 20);
    copy.blocks = copy.blocks.map((b) => {
      const n = { ...b, id: uid() } as typeof b;
      if (n.type === 'socials') n.items = n.items.map((x) => ({ ...x, id: uid() }));
      if (n.type === 'gallery') n.images = n.images.map((x) => ({ ...x, id: uid() }));
      return n;
    });
    const next = [...pages];
    next.splice(i + 1, 0, copy);
    set({ pages: next });
    setSel(i + 1);
  }
  function remove() {
    if (!window.confirm(`Delete the page "${page.title}"? This can't be undone after you save.`)) return;
    set({ pages: pages.filter((_, j) => j !== i) });
    setSel(Math.max(0, i - 1));
  }
  function shift(dir: -1 | 1) {
    if (home || i + dir < 1 || i + dir >= pages.length) return;
    set({ pages: move(pages, i, dir) });
    setSel(i + dir);
  }

  const nm = iconName(page.icon);

  return (
    <div className="ed-section">
      <div className="ed-field">
        <span>
          Pages <em>{pages.length}/{MAX_PAGES}</em>
        </span>
        <div className="ed-pages">
          {pages.map((p, j) => (
            <button
              key={p.id}
              className={`${j === i ? 'on' : ''}${p.hidden ? ' hid' : ''}${reorder.indicator(j) ? ` drop-${reorder.indicator(j)}` : ''}`}
              onClick={() => setSel(j)}
              {...reorder.grab(j)}
              {...reorder.target(j)}
            >
              {iconName(p.icon) && <Icon name={iconName(p.icon)!} size={13} />}
              {p.title || 'Untitled'}
              {j === 0 && <small>home</small>}
            </button>
          ))}
          <button className="add" disabled={pages.length >= MAX_PAGES} onClick={addPage}>
            <LuPlus size={14} /> Add page
          </button>
        </div>
        <small>
          Drag pages to reorder them. Visitors switch between pages with the tab bar on your phone screen. Your photo, name and bio only show on the home page.
        </small>
      </div>

      <div className="ed-pagecard">
        <div className="ed-pagecard-head">
          <label className="ed-field grow">
            <span>Page name</span>
            <input
              className="ed-input"
              maxLength={20}
              value={page.title}
              onChange={(e) => setPage({ title: e.target.value })}
            />
          </label>
          <div className="ed-field">
            <span>Icon</span>
            <button type="button" className="ed-iconbtn square" onClick={() => setIconOpen((o) => !o)} title="Choose an icon">
              {nm ? <Icon name={nm} size={18} /> : <span className="ed-none">–</span>}
            </button>
          </div>
        </div>
        {iconOpen && (
          <div>
            <button type="button" className="ed-link-btn" onClick={() => { setPage({ icon: '' }); setIconOpen(false); }}>
              No icon
            </button>
            <IconGrid value={nm ?? undefined} onPick={(n) => { setPage({ icon: `ic:${n}` }); setIconOpen(false); }} />
          </div>
        )}
        <Field label="Page actions">
          <div className="ed-actions">
            <button className="ed-btn sm icon" onClick={() => shift(-1)} disabled={home || i <= 1} title="Move earlier"><LuArrowLeft size={14} /></button>
            <button className="ed-btn sm icon" onClick={() => shift(1)} disabled={home || i >= pages.length - 1} title="Move later"><LuArrowRight size={14} /></button>
            <button className="ed-btn sm icon" onClick={() => setPage({ hidden: !page.hidden })} disabled={home} title="Hidden pages are not shown to visitors">
              {page.hidden ? <LuEyeOff size={14} /> : <LuEye size={14} />}
              <span>{page.hidden ? 'Hidden' : 'Visible'}</span>
            </button>
            <button className="ed-btn sm icon" onClick={duplicate} disabled={pages.length >= MAX_PAGES}><LuCopy size={14} /><span>Duplicate</span></button>
            <button className="ed-btn sm icon danger" onClick={remove} disabled={home}><LuTrash2 size={14} /><span>Delete</span></button>
          </div>
        </Field>
      </div>

      <PageLook global={draft.theme} page={page} setPage={setPage} />

      <BlockList blocks={page.blocks} onChange={(blocks) => setPage({ blocks })} theme={effectiveTheme(draft.theme, page)} focus={focus} />
    </div>
  );
}
