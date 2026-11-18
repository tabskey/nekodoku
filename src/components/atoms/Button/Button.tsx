import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 'primary' is coral, for the main action; 'card' is cream, for the rest. */
  variant?: 'primary' | 'card';
}

/** A pixel button with depth from a darker shade of its own color. */
export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return (
    <button type="button" className={`button button-${variant}`} {...props} />
  );
}
