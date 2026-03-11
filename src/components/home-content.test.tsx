import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HomeContent } from '@/components/home-content';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('HomeContent', () => {
  it('renders the hero section with title and subtitle', () => {
    render(<HomeContent />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('home.title');
    expect(screen.getByText('home.subtitle')).toBeInTheDocument();
  });

  it('renders the get started button', () => {
    render(<HomeContent />);
    expect(screen.getByRole('button', { name: 'home.getStarted' })).toBeInTheDocument();
  });

  it('renders three feature cards with titles and descriptions', () => {
    render(<HomeContent />);
    expect(screen.getByText('home.features.typeSafety')).toBeInTheDocument();
    expect(screen.getByText('home.features.typeSafetyDesc')).toBeInTheDocument();
    expect(screen.getByText('home.features.i18n')).toBeInTheDocument();
    expect(screen.getByText('home.features.i18nDesc')).toBeInTheDocument();
    expect(screen.getByText('home.features.designSystem')).toBeInTheDocument();
    expect(screen.getByText('home.features.designSystemDesc')).toBeInTheDocument();
  });
});
