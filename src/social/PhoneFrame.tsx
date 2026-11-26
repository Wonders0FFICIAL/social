import type { ReactNode } from 'react';

// Standard phone: 390 x 844 screen (iPhone 14/15 logical size) plus a 10px bezel.
export const PHONE_W = 410;
export const PHONE_H = 864;

interface Props {
  children: ReactNode;
  scale?: number;
  /** No bezel, fills the viewport (used on real phones). */
  bare?: boolean;
}

export default function PhoneFrame({ children, scale = 1, bare = false }: Props) {
  if (bare) return <div className="sl-bare">{children}</div>;
  return (
    <div className="sl-phone-wrap" style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
      <div className="sl-phone" style={{ transform: `scale(${scale})` }}>
        <div className="sl-notch" />
        {children}
      </div>
    </div>
  );
}
