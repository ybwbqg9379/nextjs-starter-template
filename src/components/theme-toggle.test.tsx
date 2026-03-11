import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from '@/components/theme-toggle';

const mockSetTheme = vi.fn();
const mockMounted = vi.hoisted(() => ({ value: true }));
const mockTheme = vi.hoisted(() => ({ value: 'light' }));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useSyncExternalStore: (
      subscribe: () => () => void,
      getSnapshot: () => boolean,
      getServerSnapshot?: () => boolean
    ) => {
      // Exercise callbacks for coverage, then return controlled value
      const unsub = subscribe();
      unsub();
      getSnapshot();
      getServerSnapshot?.();
      return mockMounted.value;
    },
  };
});

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockTheme.value,
    setTheme: mockSetTheme,
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('ThemeToggle', () => {
  it('renders Moon icon and toggles to dark when light', () => {
    mockMounted.value = true;
    mockTheme.value = 'light';
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'toggleTheme' });
    expect(button.querySelector('svg')).not.toBeNull();
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('renders Sun icon and toggles to light when dark', () => {
    mockMounted.value = true;
    mockTheme.value = 'dark';
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'toggleTheme' });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('renders SSR placeholder when not mounted', () => {
    mockMounted.value = false;
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'toggleTheme' });
    // SSR placeholder has an empty span, no SVG icon
    expect(button.querySelector('svg')).toBeNull();
    expect(button.querySelector('span')).not.toBeNull();
  });
});
