// src/styles/theme.ts
// Shared design tokens for a modern, consistent look across the app.

export const colors = {
  accent: '#ff7a18',
  accentLight: '#ffa63d',
  accentDark: '#e8650a',
  ink: '#0f172a',
  ink2: '#1e293b',
  slate: '#334155',
  muted: '#94a3b8',
  surface: '#ffffff',
  borderSoft: 'rgba(15, 23, 42, 0.08)',
  textLight: '#f8fafc',
  success: '#10b981',
  successDark: '#059669',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const gradients = {
  accent: 'linear-gradient(135deg, #ffa63d 0%, #ff7a18 100%)',
  header: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  success: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
};

export const shadows = {
  sm: '0 2px 8px rgba(2, 6, 23, 0.08)',
  md: '0 4px 14px rgba(2, 6, 23, 0.10)',
  lg: '0 12px 26px rgba(2, 6, 23, 0.16)',
  accent: '0 4px 12px rgba(255, 122, 24, 0.35)',
};

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  pill: '30px',
};
