import { Flame, Clock, PenTool, Sparkles, Trophy, ArrowLeft, ChevronRight } from 'lucide-react';
import type { SessionStats } from '../hooks/useWritingSession';

interface SessionStatsModalProps {
  stats: SessionStats;
  onKeepWriting: () => void;
  onDone: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

export default function SessionStatsModal({ stats, onKeepWriting, onDone }: SessionStatsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="card max-w-sm w-full mx-4 p-6">
        <h2 className="text-lg font-bold text-ink-900 text-center mb-6">Writing Session Complete</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-ink-50 rounded-lg">
            <PenTool className="w-5 h-5 text-primary-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-ink-900">{stats.wordsWritten.toLocaleString()}</div>
            <div className="text-xs text-ink-500">Words Written</div>
          </div>
          <div className="text-center p-3 bg-ink-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-ink-900">{formatDuration(stats.duration)}</div>
            <div className="text-xs text-ink-500">Time Spent</div>
          </div>
          <div className="text-center p-3 bg-ink-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-ink-900">{stats.aiInteractions}</div>
            <div className="text-xs text-ink-500">AI Assists</div>
          </div>
          <div className="text-center p-3 bg-ink-50 rounded-lg">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-ink-900">{stats.streakCount}</div>
            <div className="text-xs text-ink-500">{stats.streakCount === 1 ? 'Day Streak' : 'Day Streak'}</div>
          </div>
        </div>

        {stats.newAchievements.length > 0 && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">New Achievements!</span>
            </div>
            <ul className="space-y-1">
              {stats.newAchievements.map((a) => (
                <li key={a.milestone} className="text-sm text-amber-700">{a.description}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onKeepWriting} className="btn-secondary flex-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Keep Writing
          </button>
          <button onClick={onDone} className="btn-primary flex-1 text-sm">
            Done <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
