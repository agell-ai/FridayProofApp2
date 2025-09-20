import React from 'react';
import { Logo } from './Logo';
import { Container } from './Container';
import { content } from '../../lib/content';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12 text-sm text-[var(--fg-muted)]">
      <Container className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo showText />
        
        <nav className="flex flex-wrap items-center gap-6">
          {content.footer.links.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className="hover:text-[var(--fg)] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <div className="text-center sm:text-right">
          {content.footer.note}
        </div>
      </Container>
    </footer>
  );
}