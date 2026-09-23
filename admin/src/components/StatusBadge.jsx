import { STATUS_COLORS, STATUS_BG, STATUS_LABELS } from '../utils/categories';

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#64748B';
  const bg = STATUS_BG[status] || '#F1F5F9';
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5"
      style={{ color, backgroundColor: bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}