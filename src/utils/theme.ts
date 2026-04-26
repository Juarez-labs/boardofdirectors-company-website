/**
 * D5 Theme System — Dark / Light Mode
 *
 * Uses `data-theme` attribute on <html> element.
 * Persists to localStorage. Defaults to system preference.
 */

export type Theme = 'dark' | 'light';

export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage unavailable (SSR, private mode)
  }
  return null;
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getEffectiveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Ignore storage errors
  }
}

export function toggleTheme(): Theme {
  const current = getEffectiveTheme();
  const next: Theme = current === 'dark' ? 'light' : 'dark';

  // Use View Transition API for bloom effect (if supported)
  if ('startViewTransition' in document) {
    (document as Document & { startViewTransition: (cb: () => void) => void })
      .startViewTransition(() => applyTheme(next));
  } else {
    applyTheme(next);
  }

  return next;
}

/**
 * Inline script content — paste into <head> to prevent FOUC.
 * Must run before first paint.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try{
    var t=localStorage.getItem('theme');
    if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);return;}
    if(window.matchMedia('(prefers-color-scheme: dark)').matches){
      document.documentElement.setAttribute('data-theme','dark');
    }
  }catch(e){}
})();
`.trim();
