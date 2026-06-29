import { useState, useEffect } from 'react';

const KEY = 'cialo-dark-mode';

export function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem(KEY) === 'true');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(KEY, dark ? 'true' : 'false');
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
