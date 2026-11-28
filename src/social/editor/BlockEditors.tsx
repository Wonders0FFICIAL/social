import { useState } from 'react';
import { LuArrowDown, LuArrowUp, LuChevronDown, LuChevronRight, LuCopy, LuEye, LuEyeOff, LuPlus, LuTrash2 } from 'react-icons/lu';
import { BLOCK_TYPES, newBlock } from '../blocks';
import { parseEmbed } from '../embed';
import { Icon, autoIconFor, iconName } from '../icons';
import type { Block, BlockType, GalleryBlock, LinkStyle, SocialsBlock, Theme } from '../types';
import { BlockCtx, ColorOverride, Field, IconGrid, ImagePicker, LinkIconPicker, LinkStyleEditor, MultiUpload, Seg, move, uid, validUrl } from './controls';
import { useContext } from 'react';

type P<B extends Block> = { b: B; set: (patch: Partial<B>) => void };

const BLOCK_ICON: Record<BlockType, string> = {
  link: 'link', socials: 'heart', heading: 'book', text: 'file', gallery: 'camera',
  image: 'palette', embed: 'video', contact: 'mail', divider: 'star',
};

function summary(b: Block): string {
  switch (b.type) {
    case 'link': return b.title || b.url || 'Untitled link';
    case 'heading': return b.text || 'Heading';
    case 'text': return b.text.slice(0, 50) || 'Empty text';
    case 'socials': return `${b.items.length} icon${b.items.length === 1 ? '' : 's'}`;
    case 'gallery': return `${b.images.length} photo${b.images.length === 1 ? '' : 's'}`;
    case 'image': return b.caption || (b.src ? 'Image' : 'No image yet');
    case 'embed': return parseEmbed(b.url)?.provider ?? (b.url || 'No link yet');
    case 'contact': return b.title || 'Contact form';
    case 'divider': return b.style;
  }
}

/* ---------- per type ---------- */

function BlockColor({ value, onChange }: { value: string | undefined; onChange: (v: string | undefined) => void }) {
  const { theme } = useContext(BlockCtx);
  return <ColorOverride label="Text colour" value={value} fallback={theme.textColor} onChange={(v) => onChange(v || undefined)} />;
}

function LinkEd({ b, set }: P<Extract<Block, { type: 'link' }>>) {
  return (
    <>
      <Field label="Title">
        <input className="ed-input" maxLength={80} value={b.title} onChange={(e) => set({ title: e.target.value })} placeholder="My portfolio" />
      </Field>
      <Field label="Link">
        <input
          className={`ed-input${b.url && !validUrl(b.url) ? ' bad' : ''}`}
          value={b.url}
          maxLength={500}
          placeholder="https://… or mailto: / tel:"
          onChange={(e) => set({ url: e.target.value.trim() })}
        />
      </Field>
      <Field label="Layout">
        <Seg
          value={b.variant}
          onChange={(v) => set({ variant: v })}
          options={[
            { v: 'button', label: 'Button' },
            { v: 'card', label: 'Card' },
            { v: 'featured', label: 'Banner' },
          ]}
        />
      </Field>
      {b.variant !== 'button' && (
        <Field label="Description">
          <input className="ed-input" maxLength={120} value={b.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
        </Field>
      )}
      {b.variant === 'button' && (
        <Field label="Description" hint="optional, shown under the title">
          <input className="ed-input" maxLength={120} value={b.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
        </Field>
      )}
      {b.variant !== 'button' && (
        <Field label="Cover image">
          <ImagePicker kind="card" value={b.image} onChange={(v) => set({ image: v })} />
        </Field>
      )}
      {b.variant === 'button' && <LinkIconPicker value={b.icon} url={b.url} onChange={(v) => set({ icon: v })} />}
      <LinkStyleEditor style={b.style} variant={b.variant} onChange={(style) => set({ style })} />
    </>
  );
}

function HeadingEd({ b, set }: P<Extract<Block, { type: 'heading' }>>) {
  return (
    <>
      <Field label="Heading">
        <input className="ed-input" maxLength={80} value={b.text} onChange={(e) => set({ text: e.target.value })} />
      </Field>
      <Field label="Subtitle" hint="optional">
        <input className="ed-input" maxLength={120} value={b.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
      </Field>
      <Field label="Alignment">
        <Seg value={b.align} onChange={(v) => set({ align: v })} options={[{ v: 'left', label: 'Left' }, { v: 'center', label: 'Centre' }]} />
      </Field>
      <BlockColor value={b.color} onChange={(color) => set({ color })} />
    </>
  );
}

function TextEd({ b, set }: P<Extract<Block, { type: 'text' }>>) {
  return (
    <>
      <Field label="Text" hint={`${b.text.length}/600`}>
        <textarea className="ed-input" rows={4} maxLength={600} value={b.text} onChange={(e) => set({ text: e.target.value })} />
      </Field>
      <Field label="Alignment">
        <Seg value={b.align} onChange={(v) => set({ align: v })} options={[{ v: 'left', label: 'Left' }, { v: 'center', label: 'Centre' }]} />
      </Field>
      <BlockColor value={b.color} onChange={(color) => set({ color })} />
    </>
  );
}

function SocialsEd({ b, set }: P<SocialsBlock>) {
  const [pick, setPick] = useState<string | null>(null);
  const upd = (i: number, patch: Partial<SocialsBlock['items'][number]>) =>
    set({ items: b.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  return (
    <>
      <Field label="Style">
        <Seg
          value={b.style}
          onChange={(v) => set({ style: v })}
          options={[{ v: 'filled', label: 'Filled' }, { v: 'outline', label: 'Outline' }, { v: 'plain', label: 'Plain' }]}
        />
      </Field>
      <div className="ed-rows">
        {b.items.map((it, i) => {
          const nm = iconName(it.icon) ?? autoIconFor(it.url) ?? 'link';
          return (
            <div key={it.id} className="ed-row">
              <button type="button" className="ed-iconbtn square" onClick={() => setPick(pick === it.id ? null : it.id)} title="Change icon">
                <Icon name={nm} size={18} />
              </button>
              <input
                className={`ed-input${it.url && !validUrl(it.url) ? ' bad' : ''}`}
                placeholder="https://instagram.com/you"
                value={it.url}
                maxLength={500}
                onChange={(e) => {
                  const url = e.target.value.trim();
                  upd(i, { url });
                }}
              />
              <div className="ed-rowbtns">
                <button type="button" onClick={() => set({ items: move(b.items, i, -1) })} disabled={i === 0} aria-label="Move up"><LuArrowUp size={14} /></button>
                <button type="button" onClick={() => set({ items: move(b.items, i, 1) })} disabled={i === b.items.length - 1} aria-label="Move down"><LuArrowDown size={14} /></button>
                <button type="button" onClick={() => set({ items: b.items.filter((_, j) => j !== i) })} aria-label="Remove"><LuTrash2 size={14} /></button>
              </div>
              {pick === it.id && (
                <div className="ed-row-wide">
                  <button type="button" className="ed-link-btn" onClick={() => { upd(i, { icon: '' }); setPick(null); }}>
                    Pick automatically from link
                  </button>
                  <IconGrid value={nm} onPick={(n) => { upd(i, { icon: `ic:${n}` }); setPick(null); }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button type="button" className="ed-btn icon" onClick={() => set({ items: [...b.items, { id: uid(), icon: '', url: '' }] })}>
        <LuPlus size={15} /> <span>Add icon</span>
      </button>
    </>
  );
}

function GalleryEd({ b, set }: P<GalleryBlock>) {
  const upd = (i: number, caption: string) =>
    set({ images: b.images.map((x, j) => (j === i ? { ...x, caption } : x)) });
  return (
    <>
      <Field label="Layout">
        <Seg
          value={b.layout}
          onChange={(v) => set({ layout: v })}
          options={[
            { v: 'grid2', label: '2 cols' },
            { v: 'grid3', label: '3 cols' },
            { v: 'masonry', label: 'Masonry' },
            { v: 'carousel', label: 'Slider' },
          ]}
        />
      </Field>
      <MultiUpload kind="photo" onDone={(urls) => set({ images: [...b.images, ...urls.map((src) => ({ id: uid(), src, caption: '' }))] })} />
      <div className="ed-gallist">
        {b.images.map((im, i) => (
          <div key={im.id} className="ed-galitem">
            <div className="ed-thumb photo" style={{ backgroundImage: `url(${JSON.stringify(im.src)})` }} />
            <input className="ed-input" placeholder="Caption (optional)" maxLength={120} value={im.caption} onChange={(e) => upd(i, e.target.value)} />
            <div className="ed-rowbtns">
              <button type="button" onClick={() => set({ images: move(b.images, i, -1) })} disabled={i === 0} aria-label="Move up"><LuArrowUp size={14} /></button>
              <button type="button" onClick={() => set({ images: move(b.images, i, 1) })} disabled={i === b.images.length - 1} aria-label="Move down"><LuArrowDown size={14} /></button>
              <button type="button" onClick={() => set({ images: b.images.filter((_, j) => j !== i) })} aria-label="Remove"><LuTrash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ImageEd({ b, set }: P<Extract<Block, { type: 'image' }>>) {
  return (
    <>
      <Field label="Picture">
        <ImagePicker kind="card" value={b.src} onChange={(v) => set({ src: v })} />
      </Field>
      <Field label="Caption" hint="optional">
        <input className="ed-input" maxLength={120} value={b.caption} onChange={(e) => set({ caption: e.target.value })} />
      </Field>
      <Field label="Opens link" hint="optional">
        <input className={`ed-input${b.url && !validUrl(b.url) ? ' bad' : ''}`} placeholder="https://…" maxLength={500} value={b.url} onChange={(e) => set({ url: e.target.value.trim() })} />
      </Field>
    </>
  );
}

function EmbedEd({ b, set }: P<Extract<Block, { type: 'embed' }>>) {
  const info = b.url ? parseEmbed(b.url) : null;
  return (
    <>
      <Field label="Link to a video, post or track">
        <input className={`ed-input${b.url && !info ? ' bad' : ''}`} placeholder="Paste a YouTube, Instagram, Spotify, TikTok or Vimeo link" maxLength={500} value={b.url} onChange={(e) => set({ url: e.target.value.trim() })} />
      </Field>
      {b.url && <div className={`ed-badge${info ? '' : ' bad'}`}>{info ? `${info.provider} link detected` : 'Not a supported link'}</div>}
    </>
  );
}

function DividerEd({ b, set }: P<Extract<Block, { type: 'divider' }>>) {
  return (
    <Field label="Style">
      <Seg value={b.style} onChange={(v) => set({ style: v })} options={[{ v: 'line', label: 'Line' }, { v: 'dots', label: 'Dots' }, { v: 'space', label: 'Space' }]} />
    </Field>
  );
}

function ContactEd({ b, set }: P<Extract<Block, { type: 'contact' }>>) {
  return (
    <>
      <Field label="Collect">
        <Seg
          value={b.mode}
          onChange={(v) => set({ mode: v })}
          options={[{ v: 'subscribe', label: 'Emails only' }, { v: 'message', label: 'Name + message' }]}
        />
      </Field>
      <Field label="Title">
        <input className="ed-input" maxLength={60} value={b.title} onChange={(e) => set({ title: e.target.value })} />
      </Field>
      <Field label="Description">
        <input className="ed-input" maxLength={160} value={b.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
      </Field>
      <Field label="Button text">
        <input className="ed-input" maxLength={24} value={b.button} onChange={(e) => set({ button: e.target.value })} />
      </Field>
      <Field label="Thank-you message">
        <input className="ed-input" maxLength={120} value={b.success} onChange={(e) => set({ success: e.target.value })} />
      </Field>
      <small className="ed-hint-sm">Submissions show up in your Inbox tab.</small>
    </>
  );
}

function Body({ b, set }: { b: Block; set: (patch: Partial<Block>) => void }) {
  const s = set as never;
  switch (b.type) {
    case 'link': return <LinkEd b={b} set={s} />;
    case 'heading': return <HeadingEd b={b} set={s} />;
    case 'text': return <TextEd b={b} set={s} />;
    case 'socials': return <SocialsEd b={b} set={s} />;
    case 'gallery': return <GalleryEd b={b} set={s} />;
    case 'image': return <ImageEd b={b} set={s} />;
    case 'embed': return <EmbedEd b={b} set={s} />;
    case 'divider': return <DividerEd b={b} set={s} />;
    case 'contact': return <ContactEd b={b} set={s} />;
  }
}

/* ---------- card + list ---------- */

function BlockCard({
  b, index, count, open, onToggle, onChange, onMove, onDuplicate, onDelete,
}: {
  b: Block; index: number; count: number; open: boolean;
  onToggle: () => void; onChange: (patch: Partial<Block>) => void;
  onMove: (dir: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const meta = BLOCK_TYPES.find((m) => m.type === b.type)!;
  return (
    <div className={`ed-block${b.hidden ? ' off' : ''}${open ? ' open' : ''}`}>
      <div className="ed-block-head">
        <button type="button" className="ed-block-title" onClick={onToggle} aria-expanded={open}>
          {open ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
          <Icon name={BLOCK_ICON[b.type]} size={14} />
          <b>{meta.label}</b>
          <span>{summary(b)}</span>
        </button>
        <div className="ed-rowbtns">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up" title="Move up"><LuArrowUp size={14} /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Move down" title="Move down"><LuArrowDown size={14} /></button>
          <button type="button" onClick={() => onChange({ hidden: !b.hidden })} aria-label={b.hidden ? 'Show' : 'Hide'} title={b.hidden ? 'Show on page' : 'Hide from page'}>
            {b.hidden ? <LuEyeOff size={14} /> : <LuEye size={14} />}
          </button>
          <button type="button" onClick={onDuplicate} aria-label="Duplicate" title="Duplicate"><LuCopy size={14} /></button>
          <button type="button" className="danger" onClick={onDelete} aria-label="Delete" title="Delete"><LuTrash2 size={14} /></button>
        </div>
      </div>
      {open && (
        <div className="ed-block-body">
          <Body b={b} set={onChange} />
        </div>
      )}
    </div>
  );
}

export function AddBlock({ onAdd }: { onAdd: (t: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ed-addblock">
      <button type="button" className="ed-btn primary icon wide" onClick={() => setOpen((o) => !o)}>
        <LuPlus size={16} /> <span>Add block</span>
      </button>
      {open && (
        <div className="ed-blockpicker">
          {BLOCK_TYPES.map((m) => (
            <button key={m.type} type="button" onClick={() => { onAdd(m.type); setOpen(false); }}>
              <span className="bp-ic"><Icon name={BLOCK_ICON[m.type]} size={16} /></span>
              <span>
                <b>{m.label}</b>
                <small>{m.desc}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BlockList({ blocks, onChange, theme }: { blocks: Block[]; onChange: (b: Block[]) => void; theme: Theme }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const add = (t: BlockType) => {
    const nb = newBlock(t);
    onChange([...blocks, nb]);
    setOpenId(nb.id);
  };
  const applyStyleToAll = (style: LinkStyle | undefined) =>
    onChange(blocks.map((x) => (x.type === 'link' ? { ...x, style: style ? { ...style } : undefined } : x)));
  return (
    <BlockCtx.Provider value={{ theme, applyStyleToAll }}>
    <div className="ed-blocks">
      {blocks.length === 0 && <div className="ed-hint">This page is empty. Add your first block below.</div>}
      {blocks.map((b, i) => (
        <BlockCard
          key={b.id}
          b={b}
          index={i}
          count={blocks.length}
          open={openId === b.id}
          onToggle={() => setOpenId(openId === b.id ? null : b.id)}
          onChange={(patch) => onChange(blocks.map((x) => (x.id === b.id ? ({ ...x, ...patch } as Block) : x)))}
          onMove={(d) => onChange(move(blocks, i, d))}
          onDuplicate={() => {
            const copy = JSON.parse(JSON.stringify(b)) as Block;
            copy.id = uid();
            if (copy.type === 'socials') copy.items = copy.items.map((x) => ({ ...x, id: uid() }));
            if (copy.type === 'gallery') copy.images = copy.images.map((x) => ({ ...x, id: uid() }));
            const next = [...blocks];
            next.splice(i + 1, 0, copy);
            onChange(next);
            setOpenId(copy.id);
          }}
          onDelete={() => onChange(blocks.filter((x) => x.id !== b.id))}
        />
      ))}
      <AddBlock onAdd={add} />
    </div>
    </BlockCtx.Provider>
  );
}
