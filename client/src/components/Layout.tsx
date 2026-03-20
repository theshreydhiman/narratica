import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { BookOpen, Plus, LogOut, User, Flame } from 'lucide-react';
import AchievementToast from './AchievementToast';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="bg-white border-b border-ink-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-primary-600" />
              <span className="text-xl font-bold text-ink-900">Narratica</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              {user && user.streakCount > 0 && (
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-5 h-5" />
                  <span className="font-semibold text-sm">{user.streakCount}</span>
                </div>
              )}
              <Link to="/new-project" className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-sm text-ink-600">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-ghost text-sm p-2" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Achievement Toast Notifications */}
      <AchievementToast />

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
