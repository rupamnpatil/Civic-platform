import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/announcements', label: 'Announcements' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/analytics', label: 'Analytics' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <header className="bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-teal-400 font-black text-sm tracking-tighter">
                RC
              </span>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                Reality Check
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                Admin Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-900">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
                {user?.role}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest px-3 py-2 rounded-md hover:bg-slate-100 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        <nav className="flex gap-1 px-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                  isActive
                    ? 'border-teal-500 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}