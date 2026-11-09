import { useEffect, useState } from 'react';

/** Brief loading state so lists show their skeleton like they would over the network. */
export function useFirstLoad(ms = 300): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return loading;
}
