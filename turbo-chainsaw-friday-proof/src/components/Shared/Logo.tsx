import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = false }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === 'dark'
    ? '/Friday Proof - Logo 4 Transparent w White Text.png'
    : '/Friday Proof - Logo 3 Transparent w Black Text.png';

  if (showText) {
    return (
      <div className="flex items-center space-x-3">
        <img
          src={logoSrc}
          alt="Friday Proof Logo"
          className={className || "h-8 w-auto"}
        />
        <span className="text-lg font-bold text-[var(--fg)]">Friday Proof™</span>
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="Friday Proof Logo"
      className={className}
    />
  );
}