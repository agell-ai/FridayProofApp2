import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
  glowOnHover?: boolean;
  activeGlow?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  disabled = false,
  type = 'button',
  glowOnHover = false,
  activeGlow = false,
  onClick,
  ...rest
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    primary: 'bg-[var(--card)] text-[var(--fg)] focus-visible:ring-[var(--accent-orange)] shadow-sm',
    secondary: 'bg-[var(--card)] text-[var(--fg)] focus-visible:ring-[var(--accent-mid)] shadow-sm',
    ghost: 'text-[var(--fg-muted)] focus-visible:ring-[var(--accent-mid)] hover:bg-[var(--card)] shadow-sm',
    outline: 'border border-[var(--border)] text-[var(--fg)] focus-visible:ring-[var(--accent-mid)] hover:bg-[var(--card)] shadow-sm',
    gradient:
      'bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] text-white shadow-sm focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-[var(--surface)] hover:opacity-90'
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} relative z-10 ${className}`;
  const wrapperClasses = className ? `relative group ${className}` : 'relative group';

  if (glowOnHover || activeGlow) {
    if (href) {
      return (
        <div className={wrapperClasses}>
          <div
            className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] rounded-lg transition-opacity duration-300 z-0 ${
              activeGlow ? 'opacity-100' : glowOnHover ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
            }`}
            style={{ filter: 'blur(2px)' }}
            aria-hidden="true"
          />
          <a
            href={disabled ? undefined : href}
            aria-disabled={disabled}
            className={`${buttonClasses} ${disabled ? 'pointer-events-none' : ''}`}
            onClick={onClick}
            {...rest}
          >
            {children}
          </a>
        </div>
      );
    }

    return (
      <div className={wrapperClasses}>
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] rounded-lg transition-opacity duration-300 z-0 ${
            activeGlow ? 'opacity-75' : glowOnHover ? 'opacity-0 group-hover:opacity-75' : 'opacity-0'
          }`}
          style={{ filter: 'blur(2px)' }}
          aria-hidden="true"
        />
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={buttonClasses}
          {...rest}
        >
          {children}
        </button>
      </div>
    );
  }
  
  // No glow version
  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        aria-disabled={disabled}
        className={`${buttonClasses} ${disabled ? 'pointer-events-none' : ''}`}
        onClick={onClick}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...rest}
    >
      {children}
    </button>
  );
}