import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FeatureCard } from '@/components/feature-card';

describe('FeatureCard', () => {
  const defaultProps = {
    icon: <span data-testid="test-icon">search</span>,
    title: 'Test Title',
    description: 'Test Description',
  };

  it('renders title and description', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('uses correct heading level', () => {
    render(<FeatureCard {...defaultProps} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Title');
  });
});
