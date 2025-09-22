import React from 'react';

interface CardProps extends React.AriaAttributes {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
  activeGlow?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  glowOnHover = false,
  activeGlow = false,
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
    return (
      <div
        className={`relative group ${interactiveClasses}`}
        {...interactiveProps}
        {...ariaProps}
      >
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] rounded-xl transition-opacity duration-300 z-0 ${
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
