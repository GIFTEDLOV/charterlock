/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export function useData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ loading: boolean; data?: T; error?: string }>({ loading: true });
  useEffect(() => { let active = true; void loader().then((data) => { if (active) setState({ loading: false, data }); }).catch((error: unknown) => { if (active) setState({ loading: false, error: error instanceof Error ? error.message : "Unable to load protocol state." }); }); return () => { active = false; };
  }, deps);
  return state;
}
