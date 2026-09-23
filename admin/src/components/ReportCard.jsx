import React from 'react';
import StatusBadge from './StatusBadge';
import { CATEGORY_EMOJI, CATEGORY_LABEL } from '../utils/categories';

export default function ReportCard({ report, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 mb-2 rounded-lg cursor-pointer border transition ${
        active
          ? 'bg-slate-900 border-slate-900 text-white'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {report.photoUrl && (
          <img
            src={report.photoUrl}
            alt="report"
            className="w-14 h-14 rounded-md object-cover bg-slate-100 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-widest ${
                active ? 'text-teal-400' : 'text-slate-900'
              }`}
            >
              {CATEGORY_EMOJI[report.category]}{' '}
              {CATEGORY_LABEL[report.category] || report.category}
            </span>
            <StatusBadge status={report.status} />
          </div>
          <p
            className={`text-xs leading-relaxed truncate ${
              active ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {report.description}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span
              className={`text-[10px] font-semibold ${
                active ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {new Date(report.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            {report.upvotes?.length > 0 && (
              <span
                className={`text-[10px] font-extrabold ${
                  active ? 'text-teal-400' : 'text-teal-600'
                }`}
              >
                ▲ {report.upvotes.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}