import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@civic.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-teal-500 mx-auto flex items-center justify-center mb-5">
            <span className="text-white font-black text-lg tracking-tighter">RC</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Reality Check
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 mt-2 font-bold">
            Admin Portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-7 shadow-2xl"
        >
          <h2 className="text-lg font-extrabold text-slate-900 mb-6 tracking-tight">
            Sign in
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold mb-4">
              {error}
            </div>
          )}

          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 mb-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            required
          />

          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 mb-6 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-extrabold py-3 rounded-lg tracking-wider transition"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-[10px] text-slate-400 text-center mt-6 uppercase tracking-widest font-bold">
            Demo · admin@civic.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
}