import { useState } from 'react';
import { LuChevronDown, LuChevronRight } from 'react-icons/lu';
import { effectiveTheme, PAGE_THEME_KEYS, snapshotPageTheme } from '../themes';
import type { PageTheme, SocialPage, Theme } from '../types';
import { BackgroundControls, ButtonControls, PresetGrid, TextControls } from './AppearanceTab';
import { Field, Seg } from './controls';

/** Per-page look: inherit the global theme, or override colours / background / buttons for this page only. */
export default function PageLook({
  global,
  page,
  setPage,
}: {
  global: Theme;
  page: SocialPage;
  setPage: (patch: Partial<SocialPage>) => void;
}) {
  const custom = !!page.theme;
  const [open, setOpen] = useState(false);
  const eff = effectiveTheme(global, page);
  const count = page.theme ? Object.keys(page.theme).length : 0;

  const setTheme = (patch: Partial<Theme>) => {
    const next: Record<string, unknown> = { ...(page.theme ?? snapshotPageTheme(global)) };
    for (const k of PAGE_THEME_KEYS) if (k in patch) next[k] = (patch as Record<string, unknown>)[k];
    setPage({ theme: next as PageTheme });
  };

  return (
    <div className="ed-pagelook">
      <button type="button" className="ed-disclosure" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
        <b>Page look</b>
        <span>{custom ? 'Custom for this page' : 'Same as your theme'}</span>
      </button>
      {open && (
        <div className="ed-pagelook-body">
          <Field label="This page uses">
            <Seg
              value={custom ? 'custom' : 'global'}
              onChange={(v) => {
                if (v === 'global') setPage({ theme: undefined });
                else if (!custom) setPage({ theme: snapshotPageTheme(global) });
              }}
              options={[
                { v: 'global', label: 'My theme' },
                { v: 'custom', label: 'Its own look' },
              ]}
            />
            <small>
              {custom
                ? `${count} setting${count === 1 ? '' : 's'} differ from your main theme. Navigation, header and photo shape always follow the main theme.`
                : 'Give this page a different background, colours, buttons or font from the rest of your site.'}
            </small>
          </Field>
          {custom && (
            <>
              <PresetGrid setTheme={setTheme} />
              <BackgroundControls t={eff} setTheme={setTheme} />
              <TextControls t={eff} setTheme={setTheme} />
              <ButtonControls t={eff} setTheme={setTheme} />
              <button type="button" className="ed-link-btn" onClick={() => setPage({ theme: undefined })}>
                Reset to my theme
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
