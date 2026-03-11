'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const t = useTranslations('common');
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  // Avoid hydration mismatch: resolvedTheme is undefined during SSR
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={t('toggleTheme')}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <span className="size-icon" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggleTheme')}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {isDark ? <Sun className="size-icon" /> : <Moon className="size-icon" />}
    </button>
  );
}
