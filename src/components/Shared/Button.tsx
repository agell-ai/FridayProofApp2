import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
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
  size = 'md',
  className = '',
  onClick,
  href,
  disabled = false,
  type = 'button',
  glowOnHover = false,
  activeGlow = false,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[var(--card)] text-[var(--fg)] focus:ring-[var(--accent-orange)] shadow-sm',
    secondary: 'bg-[var(--card)] text-[var(--fg)] focus:ring-[var(--accent-mid)] shadow-sm',
    ghost: 'text-[var(--fg-muted)] focus:ring-[var(--accent-mid)] hover:bg-[var(--card)] shadow-sm',
    outline: 'border border-[var(--border)] text-[var(--fg)] focus:ring-[var(--accent-mid)] hover:bg-[var(--card)] shadow-sm'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} relative z-10`;
  
  if (glowOnHover || activeGlow) {
    if (href) {
      return (
        <div className={`relative group ${className}`}>
          <div 
            className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] rounded-lg transition-opacity duration-300 z-0 ${
              activeGlow ? 'opacity-100' : glowOnHover ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
            }`}
            style={{ filter: 'blur(2px)' }}
            aria-hidden="true"
          />
          <a href={href} className={buttonClasses}>
            {children}
          </a>
        </div>
      );
    }
    
    return (
      <div className={`relative group ${className}`}>
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
        >
          {children}
        </button>
      </div>
    );
  }
  
  // No glow version
  if (href) {
    return (
      <a href={href} className={`${buttonClasses} ${className}`}>
        {children}
      </a>
    );
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClasses} ${className}`}
    >
      {children}
    </button>
  );
}