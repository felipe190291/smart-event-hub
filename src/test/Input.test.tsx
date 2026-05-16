import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../components/ui/Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Username" error="Invalid username" />);
    expect(screen.getByText('Invalid username')).toBeInTheDocument();
    expect(screen.getByText('Invalid username')).toHaveClass('text-red-500');
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<Input label="Username" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'testuser' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Input label="Username" className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });
});
