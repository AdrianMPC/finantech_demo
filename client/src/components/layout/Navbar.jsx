import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { XPBadge } from '../ui/XPBadge';

export function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const navLink = (to, label, icon) => (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 text-xs font-bold transition-colors px-3 py-1 rounded-xl
        ${pathname === to ? 'text-duo-green border-b-2 border-duo-green' : 'text-duo-gray-dark hover:text-duo-navy'}`}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-duo-gray-mid">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/learn" className="flex items-center gap-2 font-black text-duo-green text-xl select-none">
          <span className="text-2xl">💵</span>
          <span>FinLearn</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLink('/learn', 'Learn', '📚')}
          {navLink('/profile', 'Profile', '👤')}
        </nav>

        <div className="flex items-center gap-3">
          {user && <XPBadge xp={user.xp} />}
          <button onClick={logout} className="text-xs font-bold text-duo-gray-dark hover:text-duo-red transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
