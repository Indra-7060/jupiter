'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const Ctx = createContext(() => {});

export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((msg, kind = 'ok') => setT({ msg, kind, id: Date.now() }), []);
  useEffect(() => {
    if (!t) return;
    const h = setTimeout(() => setT(null), 3200);
    return () => clearTimeout(h);
  }, [t]);
  return (
    <Ctx.Provider value={show}>
      {children}
      {t && <div className={`toast ${t.kind}`}>{t.msg}</div>}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
