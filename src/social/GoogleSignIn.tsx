import { useEffect, useRef } from 'react';

const SRC = 'https://accounts.google.com/gsi/client';

export default function GoogleSignIn({
  onCredential,
}: {
  onCredential: (credential: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;

  useEffect(() => {
    function init() {
      const g = (window as any).google;
      if (!g?.accounts?.id || !ref.current) return;
      g.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (r: { credential: string }) => cb.current(r.credential),
      });
      g.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 280,
      });
    }

    if ((window as any).google?.accounts?.id) {
      init();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', init);
    return () => script!.removeEventListener('load', init);
  }, []);

  return <div ref={ref} />;
}
