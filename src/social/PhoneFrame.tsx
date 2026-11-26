import type { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="sl-phone">
      <div className="sl-notch" />
      {children}
    </div>
  );
}
