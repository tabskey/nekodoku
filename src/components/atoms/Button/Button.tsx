import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 'primary' is coral, for the main action; 'card' is for the rest; 'danger' is red, for what cannot be undone. */
  variant?: 'primary' | 'card' | 'danger';
}

/** A pixel button with depth from a darker shade of its own color. */
export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return (
    <button type="button" className={`button button-${variant}`} {...props} />
  );
}
