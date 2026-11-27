import { bgCss, DEFAULT_THEME, FONTS, GRADIENTS, PRESETS } from '../themes';
import type { Theme } from '../types';
import { Color, Field, ImagePicker, Seg } from './controls';

const FONT_LABELS: Record<string, string> = { sans: 'Inter', serif: 'Playfair', mono: 'Mono', rounded: 'Nunito', grotesk: 'Grotesk', poppins: 'Poppins', display: 'DM Serif', script: 'Caveat' };

export default function AppearanceTab({
  t,
  setTheme,
}: {
  t: Theme;
  setTheme: (patch: Partial<Theme>) => void;
}) {
  return (
    <div className="ed-section">
      <Field label="Themes">
        <div className="ed-presets">
          {PRESETS.map((p) => {
            const pt = { ...DEFAULT_THEME, ...p.theme } as Theme;
            const bar = {
              background: pt.btnStyle === 'fill' ? pt.btnColor : 'transparent',
              border: `2px solid ${pt.btnBorder || pt.btnColor}`,
              borderRadius: pt.btnShape === 'pill' ? 99 : pt.btnShape === 'square' ? 2 : 6,
            };
            return (
              <button key={p.name} type="button" className="ed-preset" onClick={() => setTheme(p.theme)}>
                <div className="ed-preset-box" style={{ background: bgCss(pt) }}>
                  <i style={bar} />
                  <i style={bar} />
                </div>
                <small>{p.name}</small>
              </button>
            );
          })}
        </div>
        <small>Themes change colours and buttons only. Your layout settings stay as they are.</small>
      </Field>

      <div className="ed-group">
        <h4>Background</h4>
        <Seg
          value={t.bgType}
          onChange={(v) => setTheme({ bgType: v })}
          options={[{ v: 'solid', label: 'Solid' }, { v: 'gradient', label: 'Gradient' }, { v: 'image', label: 'Image' }]}
        />
        {t.bgType !== 'image' && (
          <Color label={t.bgType === 'gradient' ? 'Start colour' : 'Colour'} value={t.bg1} onChange={(v) => setTheme({ bg1: v })} />
        )}
        {t.bgType === 'gradient' && (
          <>
            <Color label="End colour" value={t.bg2} onChange={(v) => setTheme({ bg2: v })} />
            <div className="ed-field">
              <span>Quick gradients</span>
              <div className="ed-grads">
                {GRADIENTS.map(([a, b, ang]) => (
                  <button
                    key={a + b}
                    type="button"
                    aria-label={`${a} to ${b}`}
                    style={{ background: `linear-gradient(${ang}deg, ${a}, ${b})` }}
                    onClick={() => setTheme({ bg1: a, bg2: b, bgAngle: ang })}
                  />
                ))}
              </div>
            </div>
            <label className="ed-range">
              <span>Angle <em>{t.bgAngle}°</em></span>
              <input type="range" min={0} max={360} value={t.bgAngle} onChange={(e) => setTheme({ bgAngle: Number(e.target.value) })} />
            </label>
          </>
        )}
        {t.bgType === 'image' && (
          <>
            <ImagePicker kind="bg" value={t.bgImage} onChange={(v) => setTheme({ bgImage: v })} />
            <label className="ed-range">
              <span>Darken image <em>{t.bgDim}%</em></span>
              <input type="range" min={0} max={80} value={t.bgDim} onChange={(e) => setTheme({ bgDim: Number(e.target.value) })} />
            </label>
            <Color label="Fallback colour" value={t.bg1} onChange={(v) => setTheme({ bg1: v })} />
          </>
        )}
        <Field label="Pattern">
          <Seg
            value={t.bgPattern}
            onChange={(v) => setTheme({ bgPattern: v })}
            options={[{ v: 'none', label: 'None' }, { v: 'dots', label: 'Dots' }, { v: 'grid', label: 'Grid' }, { v: 'lines', label: 'Lines' }, { v: 'noise', label: 'Grain' }]}
          />
        </Field>
      </div>

      <div className="ed-group">
        <h4>Text</h4>
        <Color label="Text colour" value={t.textColor} onChange={(v) => setTheme({ textColor: v })} />
        <Field label="Font">
          <div className="ed-fonts">
            {(Object.keys(FONTS) as (keyof typeof FONTS)[]).map((f) => (
              <button key={f} type="button" className={f === t.font ? 'on' : ''} style={{ fontFamily: FONTS[f] }} onClick={() => setTheme({ font: f })}>
                Aa <small>{FONT_LABELS[f]}</small>
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="ed-group">
        <h4>Buttons and cards</h4>
        <Field label="Style">
          <Seg value={t.btnStyle} onChange={(v) => setTheme({ btnStyle: v })} options={[{ v: 'fill', label: 'Filled' }, { v: 'outline', label: 'Outline' }, { v: 'soft', label: 'Soft' }]} />
        </Field>
        <Field label="Shape">
          <Seg value={t.btnShape} onChange={(v) => setTheme({ btnShape: v })} options={[{ v: 'square', label: 'Square' }, { v: 'rounded', label: 'Rounded' }, { v: 'pill', label: 'Pill' }]} />
        </Field>
        <Field label="Shadow">
          <Seg value={t.btnShadow} onChange={(v) => setTheme({ btnShadow: v })} options={[{ v: 'none', label: 'None' }, { v: 'soft', label: 'Soft' }, { v: 'hard', label: 'Hard' }]} />
        </Field>
        <Color label="Button colour" value={t.btnColor} onChange={(v) => setTheme({ btnColor: v })} />
        {t.btnStyle === 'fill' && (
          <Color label="Button text colour" value={t.btnTextColor} onChange={(v) => setTheme({ btnTextColor: v })} />
        )}
        <div className="ed-field">
          <Color label="Border colour" value={t.btnBorder || t.btnColor} onChange={(v) => setTheme({ btnBorder: v })} />
          {t.btnBorder && (
            <button type="button" className="ed-link-btn" onClick={() => setTheme({ btnBorder: '' })}>
              Match button colour
            </button>
          )}
        </div>
        <Field label="Hover effect">
          <Seg value={t.anim} onChange={(v) => setTheme({ anim: v })} options={[{ v: 'none', label: 'None' }, { v: 'lift', label: 'Lift' }, { v: 'pop', label: 'Pop' }]} />
        </Field>
      </div>

      <div className="ed-group">
        <h4>Layout</h4>
        <Field label="Header alignment">
          <Seg value={t.headerAlign} onChange={(v) => setTheme({ headerAlign: v })} options={[{ v: 'center', label: 'Centre' }, { v: 'left', label: 'Left' }]} />
        </Field>
        <Field label="Spacing">
          <Seg value={t.spacing} onChange={(v) => setTheme({ spacing: v })} options={[{ v: 'compact', label: 'Compact' }, { v: 'normal', label: 'Normal' }, { v: 'airy', label: 'Airy' }]} />
        </Field>
        <Field label="Page navigation">
          <Seg value={t.nav} onChange={(v) => setTheme({ nav: v })} options={[{ v: 'bottom', label: 'Bottom bar' }, { v: 'dock', label: 'Floating' }, { v: 'top', label: 'Top tabs' }]} />
        </Field>
        <Field label="Navigation shows">
          <Seg value={t.navLabels} onChange={(v) => setTheme({ navLabels: v })} options={[{ v: 'text', label: 'Text' }, { v: 'icons', label: 'Icons' }, { v: 'both', label: 'Both' }]} />
        </Field>
      </div>
    </div>
  );
}
