'use client';

import { useEffect, useState } from 'react';

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  return mounted ? <>{children}</> : null;
}
