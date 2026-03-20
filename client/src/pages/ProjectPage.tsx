import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { Plus, Pencil, Trash2, BookOpen, Users, Map, FileText, Loader2, MessageSquareWarning } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading, fetchProject, createChapter, deleteChapter, deleteProject } = useProjectStore();

  useEffect(() => {
    if (projectId) fetchProject(parseInt(projectId));
  }, [projectId, fetchProject]);

  const isShortStory = currentProject?.format === 'short_story';
  const isScreenplay = currentProject?.format === 'screenplay';
  const unitLabel = isScreenplay ? 'Scene' : isShortStory ? 'Section' : 'Chapter';
  const unitsLabel = isScreenplay ? 'Scenes' : isShortStory ? 'Sections' : 'Chapters';

  const handleAddChapter = async () => {
    if (!currentProject) return;
    const chapters = currentProject.chapters || [];
    const order = chapters.length + 1;
    const chapter = await createChapter({
      projectId: currentProject.id,
      title: `${unitLabel} ${order}`,
      order,
    });
    toast.success(`${unitLabel} created`);
    fetchProject(currentProject.id);
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    await deleteProject(currentProject.id);
    toast.success('Project deleted');
    navigate('/');
  };

  if (loading || !currentProject) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  const statusLabel: Record<string, string> = {
    spark: 'Idea Phase',
    blueprint: 'Outlining',
    draft: 'Writing',
    refine: 'Revising',
    polish: 'Polishing',
    complete: 'Complete',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">{currentProject.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-ink-500">
            <span className="capitalize">{currentProject.genre}</span>
            <span>·</span>
            <span className="capitalize">{currentProject.format.replace('_', ' ')}</span>
            <span>·</span>
            <span>{statusLabel[currentProject.status] || currentProject.status}</span>
          </div>
          {currentProject.description && (
            <p className="text-ink-600 mt-3 max-w-2xl">{currentProject.description}</p>
          )}
        </div>
        <button onClick={handleDeleteProject} className="btn-ghost text-red-500 hover:bg-red-50">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* Word Count Progress */}
      {currentProject.targetWordCount && currentProject.targetWordCount > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-700">Progress</span>
            <span className="text-sm text-ink-500">
              {currentProject.currentWordCount.toLocaleString()} / {currentProject.targetWordCount.toLocaleString()} words
            </span>
          </div>
          <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (currentProject.currentWordCount / currentProject.targetWordCount) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-sm text-ink-500">{unitsLabel}</p>
            <p className="text-lg font-bold text-ink-900">{(currentProject.chapters || []).length}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
          <div>
            <p className="text-sm text-ink-500">Characters</p>
            <p className="text-lg font-bold text-ink-900">{currentProject.storyBible?.characters?.length || 0}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg"><Map className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-sm text-ink-500">Story Beats</p>
            <p className="text-lg font-bold text-ink-900">{currentProject.outline?.beats?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-900">{unitsLabel}</h2>
        <button onClick={handleAddChapter} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add {unitLabel}
        </button>
      </div>

      {(currentProject.chapters || []).length === 0 ? (
        <div className="card p-8 text-center">
          <BookOpen className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 mb-4">No {unitsLabel.toLowerCase()} yet. Add your first {unitLabel.toLowerCase()} to start writing!</p>
          <button onClick={handleAddChapter} className="btn-primary">
            <Plus className="w-4 h-4" /> Add First {unitLabel}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {(currentProject.chapters || [])
            .sort((a: any, b: any) => a.order - b.order)
            .map((chapter: any) => (
              <div key={chapter.id} className="card p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-ink-400 font-mono w-8">{String(chapter.order).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-medium text-ink-900 flex items-center gap-1.5">
                      {chapter.title}
                      {!!chapter.hasCritique && (
                        <span title="Has AI critique" className="text-orange-500"><MessageSquareWarning className="w-3.5 h-3.5" /></span>
                      )}
                    </h3>
                    <p className="text-xs text-ink-400">{chapter.wordCount.toLocaleString()} words · {chapter.status.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/project/${currentProject.id}/write/${chapter.id}`}
                    className="btn-primary text-sm py-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Write
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
