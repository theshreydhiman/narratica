import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { Sparkles, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const genres = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance',
  'Horror', 'Literary Fiction', 'Historical Fiction', 'Adventure',
  'Drama', 'Comedy', 'Young Adult', 'Children\'s', 'Other',
];

export default function ProjectWizardPage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [format, setFormat] = useState<'novel' | 'screenplay' | 'short_story'>('novel');
  const [genre, setGenre] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const { createProject } = useProjectStore();
  const navigate = useNavigate();

  const brainstorm = async () => {
    if (!idea.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/brainstorm', { idea, genre, format });
      setAiSuggestion(res.data.data.content);
    } catch {
      toast.error('AI brainstorming unavailable. You can continue without it.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateCharacters = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/generate-characters', { premise: idea, genre, format });
      const content = res.data.data.content;
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) setCharacters(JSON.parse(jsonMatch[0]));
      } catch {
        setAiSuggestion(content);
      }
    } catch {
      toast.error('Character generation unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !genre) {
      toast.error('Please provide a title and genre');
      return;
    }
    setCreating(true);
    try {
      const targetWords = format === 'novel' ? 80000 : format === 'short_story' ? 10000 : undefined;
      const project = await createProject({
        title,
        description: idea,
        format,
        genre: genre.toLowerCase(),
        targetWordCount: targetWords,
      });

      // Create story bible if we have data
      if (idea) {
        await api.post(`/projects/${project.id}/story-bible`, {
          premise: idea,
          themes: [],
          setting: '',
          timePeriod: '',
        });
      }

      // Create characters
      for (const char of characters) {
        await api.post(`/projects/${project.id}/characters`, {
          name: char.name,
          role: char.role || 'supporting',
          description: char.description,
          personality: char.personality,
          arc: char.arc,
        });
      }

      // Create first chapter/scene/section
      const firstTitle = format === 'screenplay' ? 'Scene 1' : format === 'short_story' ? 'Section 1' : 'Chapter 1';
      await api.post('/chapters', { projectId: project.id, title: firstTitle, order: 1 });

      toast.success('Project created!');
      navigate(`/project/${project.id}`);
    } catch (err) {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const wizardSteps = ['Your Idea', 'Genre & Title', 'Characters', 'Create'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {wizardSteps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? 'bg-primary-600 text-white' : 'bg-ink-200 text-ink-500'}`}>
              {i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i <= step ? 'text-ink-900 font-medium' : 'text-ink-400'}`}>{s}</span>
            {i < wizardSteps.length - 1 && <div className="w-8 h-px bg-ink-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 0: Idea */}
      {step === 0 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-ink-900 mb-2">What's your story idea?</h2>
          <p className="text-ink-500 mb-6">Describe your idea in a few sentences. Don't worry about perfection — we'll develop it together.</p>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="input min-h-[120px] resize-y mb-4 font-serif"
            placeholder="e.g., A detective in Mumbai discovers that a series of seemingly unrelated disappearances are connected to an ancient underground city..."
          />
          <div className="flex items-center gap-3">
            <button onClick={brainstorm} disabled={!idea.trim() || aiLoading} className="btn-secondary">
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Brainstorm with AI
            </button>
            <button onClick={() => setStep(1)} className="btn-primary ml-auto">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {aiSuggestion && (
            <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h3 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Suggestions
              </h3>
              <p className="text-sm text-primary-800 whitespace-pre-wrap">{aiSuggestion}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Genre & Title */}
      {step === 1 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Format, Genre & Title</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink-700 mb-2">Format</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {([
                { value: 'novel', label: 'Novel' },
                { value: 'screenplay', label: 'Screenplay' },
                { value: 'short_story', label: 'Short Story' },
              ] as const).map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${format === f.value ? 'bg-primary-600 text-white border-primary-600' : 'border-ink-200 text-ink-600 hover:border-primary-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink-700 mb-2">Genre</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${genre === g ? 'bg-primary-600 text-white border-primary-600' : 'border-ink-200 text-ink-600 hover:border-primary-300'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink-700 mb-1">Working Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder={format === 'screenplay' ? 'My Untitled Screenplay' : format === 'short_story' ? 'My Untitled Story' : 'My Untitled Novel'}
            />
            <p className="text-xs text-ink-400 mt-1">You can always change this later.</p>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
            <button onClick={() => { setStep(2); if (characters.length === 0) generateCharacters(); }} disabled={!genre || !title.trim()} className="btn-primary">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Characters */}
      {step === 2 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-ink-900 mb-2">Characters</h2>
          <p className="text-ink-500 mb-6">Here are some character suggestions based on your idea. Edit or remove any you don't like.</p>
          {aiLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <span className="ml-3 text-ink-500">Generating characters...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {characters.map((char, i) => (
                <div key={i} className="border border-ink-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <input value={char.name} onChange={(e) => { const c = [...characters]; c[i].name = e.target.value; setCharacters(c); }} className="font-semibold text-ink-900 bg-transparent border-b border-transparent hover:border-ink-300 focus:border-primary-500 focus:outline-none" />
                    <span className="text-xs px-2 py-1 bg-ink-100 rounded capitalize">{char.role}</span>
                  </div>
                  <p className="text-sm text-ink-600">{char.description}</p>
                </div>
              ))}
              {characters.length === 0 && (
                <p className="text-ink-400 text-center py-4">No characters generated. You can add them later from the project page.</p>
              )}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
            <button onClick={() => setStep(3)} className="btn-primary">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Create */}
      {step === 3 && (
        <div className="card p-8 text-center">
          <Sparkles className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ink-900 mb-2">Ready to Create!</h2>
          <p className="text-ink-500 mb-6">
            <strong>{title}</strong> — a {genre.toLowerCase()} {format.replace('_', ' ')}
            {characters.length > 0 && ` with ${characters.length} characters`}.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
            <button onClick={handleCreate} disabled={creating} className="btn-primary text-lg px-8">
              {creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Project'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
