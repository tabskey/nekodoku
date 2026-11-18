import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

/** The coral primary button, with depth from its own darker shade. */
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="button" {...props} />;
}
