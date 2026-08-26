import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZoomableImage } from '@/components/content/ZoomableImage';

describe('ZoomableImage (Accessibility & Keyboard Zoom)', () => {
  it('renders zoom button with accessible label and tabIndex=0', () => {
    render(<ZoomableImage src="/test.jpg" alt="Architecture Diagram" caption="System Overview" />);

    const zoomButton = screen.getByRole('button', { name: /Zoom image: Architecture Diagram/i });
    expect(zoomButton).toBeInTheDocument();
    expect(zoomButton).toHaveAttribute('tabIndex', '0');
  });

  it('opens lightbox dialog on keyboard Enter key press', () => {
    render(<ZoomableImage src="/test.jpg" alt="Architecture Diagram" />);

    const zoomButton = screen.getByRole('button', { name: /Zoom image: Architecture Diagram/i });
    fireEvent.keyDown(zoomButton, { key: 'Enter' });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('opens lightbox dialog on click and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<ZoomableImage src="/test.jpg" alt="Preview Screenshot" />);

    const zoomButton = screen.getByRole('button', { name: /Zoom image: Preview Screenshot/i });
    await user.click(zoomButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
