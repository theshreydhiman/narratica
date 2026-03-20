import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import { Plus, BookOpen, Flame, Trophy, PenTool, Clock } from 'lucide-react';
import api from '../lib/api';

interface Achievement {
  id: number;
  type: string;
  milestone: string;
  description: string;
  unlockedAt: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { projects, loading, fetchProjects } = useProjectStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchProjects();
    api.get('/users/profile').then(res => {
      setAchievements(res.data.data.achievements || []);
    }).catch(() => {});
  }, [fetchProjects]);

  const statusColors: Record<string, string> = {
    spark: 'bg-yellow-100 text-yellow-700',
    blueprint: 'bg-blue-100 text-blue-700',
    draft: 'bg-purple-100 text-purple-700',
    refine: 'bg-orange-100 text-orange-700',
    polish: 'bg-green-100 text-green-700',
    complete: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-ink-500 mt-1">Ready to continue your writing journey?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg"><BookOpen className="w-5 h-5 text-primary-600" /></div>
            <div>
              <p className="text-sm text-ink-500">Projects</p>
              <p className="text-xl font-bold text-ink-900">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><Flame className="w-5 h-5 text-orange-500" /></div>
            <div>
              <p className="text-sm text-ink-500">Writing Streak</p>
              <p className="text-xl font-bold text-ink-900">{user?.streakCount || 0} days</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><PenTool className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-ink-500">Total Words</p>
              <p className="text-xl font-bold text-ink-900">{(user?.totalWords || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Trophy className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-ink-500">Completed</p>
              <p className="text-xl font-bold text-ink-900">{projects.filter(p => p.status === 'complete').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">Achievements</h2>
          <div className="flex flex-wrap gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-ink-200 rounded-lg shadow-sm"
                title={`Unlocked ${new Date(a.unlockedAt).toLocaleDateString()}`}
              >
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-sm text-ink-700">{a.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-900">Your Projects</h2>
        <Link to="/new-project" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink-700 mb-2">No projects yet</h3>
          <p className="text-ink-500 mb-6">Start your writing journey by creating your first project.</p>
          <Link to="/new-project" className="btn-primary">
            <Plus className="w-4 h-4" /> Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} to={`/project/${project.id}`} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-ink-900 line-clamp-1">{project.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || 'bg-ink-100 text-ink-600'}`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-ink-500 line-clamp-2 mb-3">{project.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-ink-400">
                <span className="capitalize">{project.genre} · {project.format.replace('_', ' ')}</span>
                <span>{project.currentWordCount.toLocaleString()} words</span>
              </div>
              {project.targetWordCount && project.targetWordCount > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (project.currentWordCount / project.targetWordCount) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-400 mt-1">
                    {Math.round((project.currentWordCount / project.targetWordCount) * 100)}% of {project.targetWordCount.toLocaleString()} word goal
                  </p>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-ink-400 mt-3">
                <Clock className="w-3 h-3" />
                <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
