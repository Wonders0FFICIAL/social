import { useEffect, useRef } from 'react';

const SRC = 'https://accounts.google.com/gsi/client';

export default function GoogleSignIn({
  onCredential,
  onFail,
  text = 'continue_with',
}: {
  onCredential: (credential: string) => void;
  /** Google's script was blocked or never produced a button */
  onFail?: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const fail = useRef(onFail);
  fail.current = onFail;

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
        shape: 'pill',
        text,
        width: 320,
      });
    }

    // if nothing has drawn a button after a while, tell the page (ad blocker, offline, ...)
    const watchdog = setTimeout(() => {
      if (ref.current && ref.current.childElementCount === 0) fail.current?.();
    }, 7000);

    if ((window as any).google?.accounts?.id) {
      init();
      return () => clearTimeout(watchdog);
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    const onError = () => fail.current?.();
    script.addEventListener('load', init);
    script.addEventListener('error', onError);
    return () => {
      clearTimeout(watchdog);
      script!.removeEventListener('load', init);
      script!.removeEventListener('error', onError);
    };
  }, []);

  return <div ref={ref} />;
}
