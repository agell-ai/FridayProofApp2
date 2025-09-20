import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { mode, setMode, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const currentThemeOption = themeOptions.find(option => option.value === mode);
  const CurrentIcon = currentThemeOption?.icon || Monitor;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-2 text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5" />
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
          <div className="py-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = mode === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setMode(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'bg-[var(--surface)] text-[var(--fg)]'
                      : 'text-[var(--fg-muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                  {option.value === 'system' && (
                    <span className="ml-auto text-xs text-[var(--fg-muted)]">
                      ({resolvedTheme})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;