import { useEffect, useState, useCallback } from 'react';
import { Trophy } from 'lucide-react';
import { getSocket } from '../lib/socket';
import { useAuthStore } from '../stores/authStore';

interface Achievement {
  id: number;
  type: string;
  milestone: string;
  description: string;
}

interface ToastItem {
  id: number;
  achievement: Achievement;
}

export default function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { user } = useAuthStore();

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socket.emit('join-user', String(user.id));

    const handleAchievement = (data: { achievements: Achievement[] }) => {
      const newToasts = data.achievements.map(a => ({
        id: Date.now() + Math.random(),
        achievement: a,
      }));
      setToasts(prev => [...prev, ...newToasts]);

      // Auto-dismiss after 5 seconds
      newToasts.forEach(t => {
        setTimeout(() => dismiss(t.id), 5000);
      });
    };

    socket.on('achievement-unlocked', handleAchievement);
    return () => {
      socket.off('achievement-unlocked', handleAchievement);
    };
  }, [user, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map(({ id, achievement }) => (
        <div
          key={id}
          onClick={() => dismiss(id)}
          className="flex items-start gap-3 p-4 bg-white border border-amber-200 rounded-lg shadow-lg cursor-pointer animate-slide-in"
        >
          <div className="p-2 bg-amber-100 rounded-full shrink-0">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Achievement Unlocked!</p>
            <p className="text-sm text-ink-600">{achievement.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
