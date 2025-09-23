import React, { createContext, useState, useEffect } from 'react';
import { themes, Theme } from '../themes';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
  theme: Theme;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getStoredMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = window.localStorage.getItem('theme');
  return (stored as ThemeMode) ?? 'system';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = window.document.documentElement;

    const updateTheme = () => {
      let newResolvedTheme: 'light' | 'dark';
      
      if (mode === 'system') {
        newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newResolvedTheme = mode;
      }
      
      setResolvedTheme(newResolvedTheme);
      
      // Toggle dark class on html element for Tailwind CSS dark mode
      if (newResolvedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Apply theme colors as CSS custom properties
      const theme = themes[newResolvedTheme];
      Object.entries(theme).forEach(([key, value]) => {
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVarName}`, value);
      });

      // Generate and set favicon
      const generateFavicon = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, 32, 32);
            
            // Convert canvas to data URL and set as favicon
            const dataURL = canvas.toDataURL('image/png');
            
            // Remove existing favicon
            const existingFavicon = document.querySelector('link[rel="icon"]');
            if (existingFavicon) {
              existingFavicon.remove();
            }
            
            // Add new favicon
            const favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.type = 'image/png';
            favicon.href = dataURL;
            document.head.appendChild(favicon);
          };
          
          img.onerror = () => {
            console.warn('Failed to load favicon image');
          };
          
          img.src = '/Friday Proof - Logo 1.png';
        }
      };

      generateFavicon();
    };

    updateTheme();

    // Listen for system theme changes when using system theme
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [mode]);

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', newMode);
    }
  };

  const theme = themes[resolvedTheme];

  return (
    <ThemeContext.Provider value={{ mode, setMode: handleSetMode, resolvedTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};