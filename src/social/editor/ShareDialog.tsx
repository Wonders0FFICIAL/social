import { useEffect, useState } from 'react';
import { LuCheck, LuCopy, LuDownload, LuExternalLink, LuShare2, LuX } from 'react-icons/lu';

export function useQrSvg(url: string, size = 220): string {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((Q) => Q.toString(url, { type: 'svg', margin: 1, width: size, color: { dark: '#1b1a17', light: '#ffffff' } }))
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(''));
    return () => {
      alive = false;
    };
  }, [url, size]);
  return svg;
}

export default function ShareDialog({ url, name, fresh, onClose }: { url: string; name: string; fresh?: boolean; onClose: () => void }) {
  const svg = useQrSvg(url, 220);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }
  async function downloadQr() {
    const Q = await import('qrcode');
    const data = await Q.toDataURL(url, { width: 1024, margin: 2, color: { dark: '#1b1a17', light: '#ffffff' } });
    const a = document.createElement('a');
    a.href = data;
    a.download = `${name}-qr.png`;
    a.click();
  }

  return (
    <div className="dlg-back" onClick={onClose}>
      <div className="dlg share" role="dialog" aria-modal="true" aria-label="Share your page" onClick={(e) => e.stopPropagation()}>
        <button className="dlg-x" onClick={onClose} aria-label="Close"><LuX size={18} /></button>
        <h3>{fresh ? 'You’re live!' : 'Share your page'}</h3>
        <p className="dlg-sub">{fresh ? 'Your page is published. Put this link anywhere.' : 'Anyone with this link can see your page.'}</p>

        <div className="share-qr" aria-label="QR code" dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="share-url">{url.replace(/^https?:\/\//, '')}</div>

        <div className="share-actions">
          <button className="ed-btn primary icon" onClick={copy}>
            {copied ? <LuCheck size={15} /> : <LuCopy size={15} />}<span>{copied ? 'Copied' : 'Copy link'}</span>
          </button>
          {canShare && (
            <button className="ed-btn icon" onClick={() => navigator.share({ title: name, url }).catch(() => {})}>
              <LuShare2 size={15} /><span>Share</span>
            </button>
          )}
          <button className="ed-btn icon" onClick={downloadQr} disabled={!svg}><LuDownload size={15} /><span>QR image</span></button>
          <a className="ed-btn icon" href={url} target="_blank" rel="noopener"><LuExternalLink size={15} /><span>Open</span></a>
        </div>
      </div>
    </div>
  );
}
