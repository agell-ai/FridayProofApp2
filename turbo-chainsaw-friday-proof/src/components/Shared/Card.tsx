import React from 'react';

interface CardProps {
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
  onClick 
}: CardProps) {
  if (glowOnHover || activeGlow) {
    return (
      <div className={`relative group ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
        <div 
          className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] rounded-xl transition-opacity duration-300 z-0 ${
            activeGlow ? 'opacity-75' : glowOnHover ? 'opacity-0 group-hover:opacity-75' : 'opacity-0'
          }`}
          style={{ filter: 'blur(2px)' }}
          aria-hidden="true"
        />
        <div className={`
          relative z-10 h-full rounded-xl border border-[var(--border)] transition-all duration-300
          bg-[var(--card)] shadow-sm
          ${className}
        `}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`
      h-full rounded-xl border border-[var(--border)] transition-all duration-300
      bg-[var(--card)] shadow-sm
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `} onClick={onClick}>
      {children}
    </div>
  );
}