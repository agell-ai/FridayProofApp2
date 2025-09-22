export interface Theme {
  bgStart: string;
  bgEnd: string;
  fg: string;
  fgMuted: string;
  border: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  accentStart: string;
  accentMid: string;
  accentEnd: string;
  accentOrange: string;
  accentPink: string;
  accentRed: string;
  accentPurple: string;
  onAccent: string;
  header: string;
}

export const themes: Record<string, Theme> = {
  light: {
    bgStart: '#FAFAFA',
    bgEnd: '#F4F4F5',
    fg: '#0A0A0B',
    fgMuted: 'rgba(10,10,11,0.70)',
    border: 'rgba(0,0,0,0.12)',
    surface: 'rgba(0,0,0,0.04)',
    surfaceElevated: '#FFFFFF',
    card: '#FFFFFF',
    accentStart: '#EEB647',
    accentMid: '#FFB44D',
    accentEnd: '#FF3C77',
    accentOrange: '#FFB44D',
    accentPink: '#FF6A5C',
    accentRed: '#FF3C77',
    accentPurple: '#9A3CFF',
    onAccent: '#FFFFFF',
    header: 'rgba(250,250,250,0.85)',
  },
  dark: {
    bgStart: '#0A0A0B',
    bgEnd: '#1A1A1C',
    fg: '#FFFFFF',
    fgMuted: 'rgba(255,255,255,0.70)',
    border: 'rgba(255,255,255,0.12)',
    surface: 'rgba(255,255,255,0.08)',
    surfaceElevated: '#1F1F24',
    card: '#2C2C2E',
    accentStart: '#EEB647',
    accentMid: '#FFB44D',
    accentEnd: '#FF3C77',
    accentOrange: '#FFB44D',
    accentPink: '#FF6A5C',
    accentRed: '#FF3C77',
    accentPurple: '#9A3CFF',
    onAccent: '#FFFFFF',
    header: 'rgba(26,26,28,0.85)',
  },
};
