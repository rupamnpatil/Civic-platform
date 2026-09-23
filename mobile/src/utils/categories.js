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

export const STATUS_COLORS = {
  submitted: '#f59e0b',
  assigned: '#3b82f6',
  in_progress: '#8b5cf6',
  resolved: '#10b981',
  rejected: '#ef4444',
};

export const STATUS_LABELS = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};