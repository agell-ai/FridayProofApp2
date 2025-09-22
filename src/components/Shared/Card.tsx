import React from 'react';

interface CardProps extends React.AriaAttributes {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
  activeGlow?: boolean;
  onClick?: () => void;
  glowStyle?: 'gradient' | 'outline';
}

export function Card({
  children,
  className = "",
  glowOnHover = false,
  activeGlow = false,
  glowStyle = 'gradient',
  onClick,
  ...ariaProps
}: CardProps) {
  const isInteractive = typeof onClick === 'function';

  const interactiveClasses = isInteractive
    ? 'cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-pink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]'
    : '';

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!onClick) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      onClick();
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
    }
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!onClick) return;

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      onClick();
    }
  };

  const interactiveProps = isInteractive
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp
      }
    : {};

  if (glowOnHover || activeGlow) {
    if (glowStyle === 'outline') {
      const outlineGlowClass = activeGlow
        ? 'opacity-100 ring-2 ring-[var(--accent-purple)] shadow-[0_0_20px_rgba(134,86,255,0.35)]'
        : glowOnHover
          ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 ring-1 ring-[var(--accent-purple)]/60 shadow-[0_0_14px_rgba(134,86,255,0.2)]'
          : 'opacity-0';

      return (
        <div
          className={`relative group ${interactiveClasses}`}
          {...interactiveProps}
          {...ariaProps}
        >
          <div
            className={`pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 z-0 ${outlineGlowClass}`}
            aria-hidden="true"
          />
          <div
            className={`
          relative z-10 h-full rounded-xl border border-[var(--border)] transition-all duration-300
          bg-[var(--card)] shadow-sm
          ${className}
        `}
          >
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`relative group ${interactiveClasses}`}
        {...interactiveProps}
        {...ariaProps}
      >
        <div
          className={`pointer-events-none absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] rounded-xl transition-opacity duration-300 z-0 ${
            activeGlow
              ? 'opacity-75'
              : glowOnHover
                ? 'opacity-0 group-hover:opacity-75 group-focus:opacity-75 group-focus-visible:opacity-75'
                : 'opacity-0'
          }`}
          style={{ filter: 'blur(2px)' }}
          aria-hidden="true"
        />
        <div
          className={`
          relative z-10 h-full rounded-xl border border-[var(--border)] transition-all duration-300
          bg-[var(--card)] shadow-sm
          ${className}
        `}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
      h-full rounded-xl border border-[var(--border)] transition-all duration-300
      bg-[var(--card)] shadow-sm
      ${interactiveClasses}
      ${className}
    `}
      {...interactiveProps}
      {...ariaProps}
    >
      {children}
    </div>
  );
}
