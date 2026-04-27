import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export function AdminLogin() {
  const { login } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin');
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
          <span className="text-5xl">🔐</span>
          <h1 className="text-white font-black text-2xl mt-3">Admin Access</h1>
          <p className="text-duo-gray-dark text-sm mt-1">FinLearn Business Dashboard</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-duo-red rounded-xl px-4 py-2 text-duo-red text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-duo-gray-dark uppercase tracking-wide">Admin Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handle}
              required
              className="border-2 border-duo-gray-mid rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-duo-navy transition-colors"
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
              className="border-2 border-duo-gray-mid rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-duo-navy transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-duo-navy hover:bg-gray-900 text-white font-bold py-3 rounded-2xl border-b-4 border-gray-900 transition-all duration-150 active:translate-y-0.5 mt-2"
          >
            {loading ? 'Authenticating…' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
