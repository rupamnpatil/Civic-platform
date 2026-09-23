export const COLORS = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  primary: '#0F172A',
  primaryHover: '#1E293B',
  accent: '#0D9488',
  accentSoft: '#CCFBF1',

  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
};

export const STATUS_COLORS = {
  submitted: '#D97706',
  assigned: '#2563EB',
  in_progress: '#7C3AED',
  resolved: '#059669',
  rejected: '#DC2626',
};

export const STATUS_BG = {
  submitted: '#FEF3C7',
  assigned: '#DBEAFE',
  in_progress: '#EDE9FE',
  resolved: '#D1FAE5',
  rejected: '#FEE2E2',
};

export const STATUS_LABELS = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const RADIUS = {
  sm: 6, md: 10, lg: 14, xl: 20, full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A', shadowOpacity: 0.04,
    shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  md: {
    shadowColor: '#0F172A', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  lg: {
    shadowColor: '#0F172A', shadowOpacity: 0.08,
    shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
};