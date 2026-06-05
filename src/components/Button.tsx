import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'primary' | 'secondary' | 'ghost' | 'danger';
  block?: boolean;
}

export function Button({ children, tone = 'primary', block = false, className = '', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`button button--${tone} ${block ? 'button--block' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
