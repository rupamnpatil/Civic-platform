export const CATEGORIES = [
  { id: 'pothole', label: 'Pothole', emoji: '🕳️' },
  { id: 'streetlight', label: 'Streetlight', emoji: '💡' },
  { id: 'sanitation', label: 'Sanitation', emoji: '🗑️' },
  { id: 'water', label: 'Water Leak', emoji: '💧' },
  { id: 'drainage', label: 'Drainage', emoji: '🌊' },
  { id: 'tree', label: 'Tree Issue', emoji: '🌳' },
  { id: 'traffic_signal', label: 'Traffic Signal', emoji: '🚦' },
  { id: 'stray_animals', label: 'Stray Animals', emoji: '🐕' },
  { id: 'vandalism', label: 'Vandalism', emoji: '🚫' },
  { id: 'other', label: 'Other', emoji: '📌' },
];

export const CATEGORY_EMOJI = CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c.emoji;
  return acc;
}, {});

export const CATEGORY_LABEL = CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c.label;
  return acc;
}, {});

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

export const STATUSES = Object.keys(STATUS_COLORS);