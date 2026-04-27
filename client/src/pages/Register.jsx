import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/learn');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-duo-navy flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-6xl">💵</span>
          <h1 className="text-white font-black text-3xl mt-3">FinLearn</h1>
          <p className="text-duo-gray-dark mt-1">Your financial education starts here</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <h2 className="font-black text-xl text-center">Create Account</h2>

          {error && (
            <div className="bg-red-50 border border-duo-red rounded-xl px-4 py-2 text-duo-red text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-duo-gray-dark uppercase tracking-wide">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handle}
              required
              placeholder="MoneyMaster99"
              className="border-2 border-duo-gray-mid rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-duo-blue transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-duo-gray-dark uppercase tracking-wide">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handle}
              required
              placeholder="you@example.com"
              className="border-2 border-duo-gray-mid rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-duo-blue transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-duo-gray-dark uppercase tracking-wide">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handle}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="border-2 border-duo-gray-mid rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-duo-blue transition-colors"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account…' : 'Get Started'}
          </button>

          <p className="text-center text-sm text-duo-gray-dark">
            Already have an account?{' '}
            <Link to="/login" className="text-duo-blue font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
