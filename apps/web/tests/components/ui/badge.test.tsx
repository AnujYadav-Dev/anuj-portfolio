import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('UI Primitives (Badge & Card)', () => {
  it('renders Badge with variants and sizes', () => {
    const { rerender } = render(<Badge variant="accent">Featured</Badge>);
    let badge = screen.getByText('Featured');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-accent');

    rerender(
      <Badge variant="success" size="lg">
        Live
      </Badge>,
    );
    badge = screen.getByText('Live');
    expect(badge.className).toContain('text-success');
  });

  it('renders Card with subcomponents correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Distributed Cache</CardTitle>
          <CardDescription>High throughput Redis cluster</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Architecture details here</p>
        </CardContent>
        <CardFooter>
          <span>Footer note</span>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText('Distributed Cache')).toBeInTheDocument();
    expect(screen.getByText('High throughput Redis cluster')).toBeInTheDocument();
    expect(screen.getByText('Architecture details here')).toBeInTheDocument();
    expect(screen.getByText('Footer note')).toBeInTheDocument();
  });
});
