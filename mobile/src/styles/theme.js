export const Theme = {
  colors: {
    background: '#0f172a',
    surface: 'rgba(30, 41, 59, 0.7)', // Glass effect
    primary: '#6366f1',
    accent: '#818cf8',
    text: '#ffffff',
    textMuted: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.1)',
    danger: '#ef4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
};

export const globalStyles = {
  glassPanel: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.sm,
  },
  text: {
    color: Theme.colors.text,
    fontSize: 16,
  },
};
