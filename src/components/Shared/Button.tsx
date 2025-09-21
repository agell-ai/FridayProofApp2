import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonAppearance = 'glow' | 'solid' | 'outline';

const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ');

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'text-[var(--fg)]',
  secondary: 'text-[var(--fg)]',
  ghost: 'text-[var(--fg-muted)] hover:text-[var(--fg)] focus-visible:text-[var(--fg)]',
  outline: 'text-[var(--fg)]',
};

const defaultAppearanceByVariant: Record<ButtonVariant, ButtonAppearance> = {
  primary: 'glow',
  secondary: 'solid',
  ghost: 'outline',
  outline: 'outline',
};

const appearanceClasses: Record<ButtonAppearance, string> = {
  glow: 'border border-transparent bg-[var(--card)] shadow-sm group-hover:bg-[var(--surface)] group-focus-within:bg-[var(--surface)] group-hover:text-[var(--fg)] group-focus-within:text-[var(--fg)] focus-visible:ring-0 focus-visible:ring-offset-0',
  solid: 'border border-[var(--border)] bg-[var(--card)] shadow-sm hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-start)]',
  outline: 'border border-[var(--border)] bg-transparent hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-start)]',
};

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  glowOnHover?: boolean;
  activeGlow?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  appearance,
  size = 'md',
  className = '',
  innerClassName = '',
  onClick,
  href,
  disabled = false,
  type = 'button',
  glowOnHover = true,
  activeGlow = false,
}: ButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none';

  const resolvedAppearance: ButtonAppearance = appearance ?? defaultAppearanceByVariant[variant];
  const useGlowWrapper = resolvedAppearance === 'glow';
  const resolvedGlowOnHover = useGlowWrapper ? glowOnHover : false;

  const buttonClasses = cx(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    appearanceClasses[resolvedAppearance],
    variant === 'ghost' ? 'border border-transparent bg-transparent hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-start)]' : undefined,
    innerClassName,
  );

  const overlayClasses = cx(
    'absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] transition-opacity duration-300 pointer-events-none',
    activeGlow ? 'opacity-80' : resolvedGlowOnHover ? 'opacity-0 group-hover:opacity-80 group-focus-within:opacity-80' : 'opacity-0',
  );

  if (useGlowWrapper) {
    if (href) {
      return (
        <div className={cx('relative inline-flex group', disabled ? 'pointer-events-none' : undefined, className)}>
          <div className={overlayClasses} style={{ filter: 'blur(2px)' }} aria-hidden="true" />
          <a href={href} onClick={onClick} className={buttonClasses}>
            {children}
          </a>
        </div>
      );
    }

    return (
      <div className={cx('relative inline-flex group', disabled ? 'pointer-events-none' : undefined, className)}>
        <div className={overlayClasses} style={{ filter: 'blur(2px)' }} aria-hidden="true" />
        <button type={type} onClick={onClick} disabled={disabled} className={buttonClasses}>
          {children}
        </button>
      </div>
    );
  }

  if (href) {
    return (
      <a href={href} onClick={onClick} className={cx(buttonClasses, className)}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cx(buttonClasses, className)}>
      {children}
    </button>
  );
}