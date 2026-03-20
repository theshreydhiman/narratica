import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { GhostText } from '../extensions/GhostText';
import { ArrowLeft, Save, Sparkles, Loader2, X, MessageSquareWarning, Eye } from 'lucide-react';
import { ScreenplayEditor } from '../components/screenplay';
import { getSocket } from '../lib/socket';
import { useWritingSession, type SessionStats } from '../hooks/useWritingSession';
import SessionStatsModal from '../components/SessionStatsModal';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function EditorPage() {
  const { projectId, chapterId } = useParams();
  const navigate = useNavigate();
  const { currentProject, currentChapter, fetchProject, fetchChapter, updateChapter } = useProjectStore();
  const [saving, setSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'co_write' | 'critique'>('co_write');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [critiqueFocus, setCritiqueFocus] = useState('overall');
  const [critiqueResult, setCritiqueResult] = useState<string | null>(null);
  const [savedCritique, setSavedCritique] = useState<string | null>(null);
  const [showSavedCritique, setShowSavedCritique] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSavedRef = useRef<string>('');
  const ghostTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ghostStreamingRef = useRef(false);

  const isScreenplay = currentProject?.format === 'screenplay';
  const isShortStory = currentProject?.format === 'short_story';

  // ── Writing session tracking ────────────────────────────
  const { trackAiInteraction, updateWordCount, endSession } = useWritingSession({
    projectId: projectId ? parseInt(projectId) : 0,
    initialWordCount: currentChapter?.wordCount || 0,
    onSessionEnd: (stats) => setSessionStats(stats),
  });

  // ── Prose editor (novel / short story) ──────────────────
  const proseEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: currentProject?.format === 'short_story' ? 'Start writing your short story...' : 'Start writing your story...' }),
      CharacterCount,
      GhostText,
    ],
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[60vh] px-4 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        autoSave(editor.getHTML());
      }, 2000);

      // Update session word count
      const words = editor.storage.characterCount.words() || 0;
      updateWordCount(words);

      // Cancel any in-flight ghost text and schedule new one
      cancelGhostStream();
      if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
      ghostTimerRef.current = setTimeout(() => {
        triggerGhostText(editor.getText());
      }, 3000);
    },
  });

  // ── Ghost text (inline AI suggestions) ──────────────────
  const cancelGhostStream = useCallback(() => {
    if (ghostStreamingRef.current) {
      const socket = getSocket();
      socket.emit('ai-cancel');
      socket.off('ai-token');
      socket.off('ai-complete');
      socket.off('ai-error');
      ghostStreamingRef.current = false;
    }
    if (proseEditor && !proseEditor.isDestroyed) {
      proseEditor.commands.clearGhostText();
    }
  }, [proseEditor]);

  const triggerGhostText = useCallback((text: string) => {
    if (!text || text.length < 20 || isScreenplay) return;
    if (!proseEditor || proseEditor.isDestroyed) return;

    const context = text.slice(-500);
    const socket = getSocket();

    cancelGhostStream();
    ghostStreamingRef.current = true;
    let accumulated = '';

    const onToken = (data: { token: string }) => {
      if (!ghostStreamingRef.current) return;
      accumulated += data.token;
      proseEditor.commands.setGhostText(accumulated);
    };
    const onComplete = () => {
      ghostStreamingRef.current = false;
      socket.off('ai-token', onToken);
      socket.off('ai-complete', onComplete);
      socket.off('ai-error', onError);
    };
    const onError = () => {
      ghostStreamingRef.current = false;
      proseEditor.commands.clearGhostText();
      socket.off('ai-token', onToken);
      socket.off('ai-complete', onComplete);
      socket.off('ai-error', onError);
    };

    socket.on('ai-token', onToken);
    socket.on('ai-complete', onComplete);
    socket.on('ai-error', onError);

    socket.emit('ai-stream', {
      mode: 'ghost_write',
      prompt: 'Continue from where the text left off.',
      context,
      maxTokens: 100,
    });
  }, [proseEditor, isScreenplay, cancelGhostStream]);

  // Clean up ghost timer on unmount
  useEffect(() => {
    return () => {
      if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
      cancelGhostStream();
    };
  }, [cancelGhostStream]);

  // ── Screenplay content auto-save handler ────────────────
  const handleScreenplayUpdate = useCallback((html: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      autoSave(html);
    }, 2000);
    // Update word count for session
    const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length || 0;
    updateWordCount(words);
  }, [updateWordCount]);

  // ── Fetch project + chapter ─────────────────────────────
  useEffect(() => {
    if (projectId) fetchProject(parseInt(projectId));
  }, [projectId, fetchProject]);

  useEffect(() => {
    if (chapterId) fetchChapter(parseInt(chapterId));
  }, [chapterId, fetchChapter]);

  // ── Load saved critique ────────────────────────────────
  useEffect(() => {
    if (chapterId) {
      api.get(`/ai/critique/${chapterId}`).then(res => {
        setSavedCritique(res.data.data.critique || null);
      }).catch(() => {});
    }
  }, [chapterId]);

  // ── Load content into prose editor ──────────────────────
  useEffect(() => {
    if (!isScreenplay && currentChapter && proseEditor && !proseEditor.isDestroyed) {
      if (currentChapter.content && currentChapter.content !== lastSavedRef.current) {
        proseEditor.commands.setContent(currentChapter.content);
        lastSavedRef.current = currentChapter.content;
      }
    }
  }, [currentChapter, proseEditor, isScreenplay]);

  // ── Auto-save ───────────────────────────────────────────
  const autoSave = useCallback(async (content: string) => {
    if (!chapterId || content === lastSavedRef.current) return;
    setSaving(true);
    try {
      await updateChapter(parseInt(chapterId), { content });
      lastSavedRef.current = content;
    } catch {
      // Silent fail for auto-save
    } finally {
      setSaving(false);
    }
  }, [chapterId, updateChapter]);

  // ── Manual save ─────────────────────────────────────────
  const handleManualSave = async () => {
    if (!chapterId) return;
    const content = isScreenplay
      ? lastSavedRef.current // screenplay saves via onUpdate
      : proseEditor?.getHTML() || '';

    setSaving(true);
    try {
      await updateChapter(parseInt(chapterId), { content });
      lastSavedRef.current = content;
      await api.post(`/chapters/${chapterId}/versions`);
      toast.success('Saved & version created');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Back / End session ────────────────────────────────────
  const handleBack = async () => {
    const stats = await endSession();
    if (!stats) {
      navigate(`/project/${projectId}`);
    }
    // If stats exist, the onSessionEnd callback will show the modal
  };

  // ── AI assist (co-write mode) ──────────────────────────
  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    trackAiInteraction();

    const contextText = isScreenplay
      ? lastSavedRef.current?.replace(/<[^>]+>/g, ' ').slice(-1500)
      : proseEditor?.getText()?.slice(-1500);

    try {
      const socket = getSocket();
      socket.emit('ai-stream', {
        mode: 'co_write',
        prompt: aiPrompt,
        context: contextText,
        projectId: projectId ? parseInt(projectId) : undefined,
      });

      const onToken = (data: { token: string }) => {
        setAiResponse((prev) => prev + data.token);
      };
      const onComplete = () => {
        setAiLoading(false);
        socket.off('ai-token', onToken);
        socket.off('ai-complete', onComplete);
        socket.off('ai-error', onError);
      };
      const onError = () => {
        socket.off('ai-token', onToken);
        socket.off('ai-complete', onComplete);
        socket.off('ai-error', onError);
        api.post('/ai/generate', {
          mode: 'co_write',
          prompt: aiPrompt,
          projectId: projectId ? parseInt(projectId) : undefined,
          chapterId: chapterId ? parseInt(chapterId) : undefined,
        }).then((res) => {
          setAiResponse(res.data.data.content);
        }).catch(() => {
          toast.error('AI unavailable');
        }).finally(() => {
          setAiLoading(false);
        });
      };

      socket.on('ai-token', onToken);
      socket.on('ai-complete', onComplete);
      socket.on('ai-error', onError);
    } catch {
      setAiLoading(false);
      toast.error('AI unavailable');
    }
  };

  // ── AI critique ───────────────────────────────────────
  const handleCritique = async () => {
    if (!chapterId || !projectId) return;
    setAiLoading(true);
    setCritiqueResult(null);
    trackAiInteraction();

    try {
      const res = await api.post('/ai/critique', {
        chapterId: parseInt(chapterId),
        projectId: parseInt(projectId),
        focusArea: critiqueFocus,
      });
      const critique = res.data.data.critique;
      setCritiqueResult(critique);
      setSavedCritique(critique);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'AI critique failed';
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const insertAiText = () => {
    if (aiResponse && proseEditor && !isScreenplay) {
      proseEditor.chain().focus().insertContent(aiResponse).run();
      setAiResponse('');
      setAiPrompt('');
      setAiOpen(false);
    }
  };

  const wordCount = isScreenplay
    ? (lastSavedRef.current?.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length || 0)
    : (proseEditor?.storage.characterCount.words() || 0);

  const coWriteActions = isScreenplay
    ? ['Write the next scene', 'Suggest dialogue for this character', 'Describe the location', 'Write a transition']
    : isShortStory
    ? ['Continue the story', 'Tighten this paragraph', 'Write a vivid opening line', 'Build toward the twist', 'End the scene with impact']
    : ['Continue this scene', 'Suggest dialogue', 'Describe the setting', 'What happens next?'];

  const critiqueFocusOptions = [
    { value: 'overall', label: 'Overall Critique' },
    { value: 'pacing', label: 'Pacing' },
    { value: 'dialogue', label: 'Dialogue' },
    { value: 'show_not_tell', label: 'Show vs Tell' },
    { value: 'character', label: 'Character Consistency' },
    { value: 'opening', label: 'Opening Hook' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Session Stats Modal */}
      {sessionStats && (
        <SessionStatsModal
          stats={sessionStats}
          onKeepWriting={() => setSessionStats(null)}
          onDone={() => navigate(`/project/${projectId}`)}
        />
      )}

      {/* Editor Toolbar */}
      <div className="sticky top-0 z-40 bg-white border-b border-ink-200 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={handleBack} className="btn-ghost p-2 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-ink-700 truncate">{currentChapter?.title || 'Loading...'}</span>
            {isScreenplay && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-medium shrink-0 hidden sm:inline">Screenplay</span>
            )}
            {isShortStory && (
              <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded font-medium shrink-0 hidden sm:inline">Short Story</span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-ink-400 hidden sm:inline">{wordCount.toLocaleString()} words</span>
            {saving && <span className="text-xs text-ink-400 hidden sm:inline">Saving...</span>}
            <button onClick={() => setAiOpen(!aiOpen)} className={`btn-ghost text-sm p-2 ${aiOpen ? 'text-primary-600 bg-primary-50' : ''}`}>
              <Sparkles className="w-4 h-4" />
            </button>
            <button onClick={handleManualSave} className="btn-primary text-sm py-1.5" disabled={saving}>
              <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-6xl mx-auto relative">
        {/* Editor Area */}
        <div className={`flex-1 ${aiOpen ? 'sm:max-w-3xl' : 'max-w-4xl mx-auto'}`}>
          <div className="py-8 px-4">
            {isScreenplay ? (
              <ScreenplayEditor
                content={currentChapter?.content || ''}
                onUpdate={handleScreenplayUpdate}
              />
            ) : (
              <EditorContent editor={proseEditor} />
            )}
          </div>
        </div>

        {/* AI Sidebar */}
        {aiOpen && (
          <div className="fixed inset-0 z-50 bg-white sm:static sm:inset-auto sm:z-auto sm:w-80 sm:border-l sm:border-ink-200 sm:bg-ink-50 sm:sticky sm:top-14 sm:h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600" /> AI Assistant
              </h3>
              <button onClick={() => setAiOpen(false)} className="text-ink-400 hover:text-ink-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-1 mb-4 bg-ink-100 rounded-lg p-1">
              <button
                onClick={() => { setAiMode('co_write'); setCritiqueResult(null); }}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${aiMode === 'co_write' ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
              >
                <Sparkles className="w-3 h-3" /> Co-Write
              </button>
              <button
                onClick={() => { setAiMode('critique'); setAiResponse(''); }}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${aiMode === 'critique' ? 'bg-white text-orange-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
              >
                <MessageSquareWarning className="w-3 h-3" /> Critique
              </button>
            </div>

            {/* Co-Write Mode */}
            {aiMode === 'co_write' && (
              <div className="space-y-3">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="input text-sm min-h-[80px] resize-y"
                  placeholder={isScreenplay
                    ? "Ask AI to help... e.g., 'Write the next scene' or 'Suggest dialogue for SARAH'"
                    : isShortStory
                    ? "Ask AI to help... e.g., 'Tighten this paragraph' or 'Write a punchy ending'"
                    : "Ask AI to help... e.g., 'Continue this scene' or 'Write dialogue between...'"
                  }
                />
                <button onClick={handleAiAssist} disabled={aiLoading || !aiPrompt.trim()} className="btn-primary w-full text-sm">
                  {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
                </button>

                {aiResponse && (
                  <div className="mt-4">
                    <div className="bg-white rounded-lg border border-ink-200 p-3 text-sm text-ink-700 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
                      {aiResponse}
                    </div>
                    {!isScreenplay && (
                      <button onClick={insertAiText} className="btn-secondary w-full text-sm mt-2">
                        Insert into Editor
                      </button>
                    )}
                  </div>
                )}

                <div className="border-t border-ink-200 pt-3 mt-4">
                  <p className="text-xs text-ink-400 font-medium mb-2">Quick Actions</p>
                  <div className="space-y-1">
                    {coWriteActions.map((q) => (
                      <button
                        key={q}
                        onClick={() => setAiPrompt(q)}
                        className="block w-full text-left text-xs text-ink-600 hover:text-primary-600 hover:bg-white rounded px-2 py-1.5 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Critique Mode */}
            {aiMode === 'critique' && (
              <div className="space-y-3">
                {/* Focus area selector */}
                <div>
                  <label className="text-xs font-medium text-ink-500 block mb-1.5">Focus Area</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {critiqueFocusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setCritiqueFocus(opt.value)}
                        className={`text-xs px-2 py-1.5 rounded-md border transition-all ${critiqueFocus === opt.value ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium' : 'border-ink-200 text-ink-500 hover:border-orange-200'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleCritique} disabled={aiLoading} className="w-full text-sm py-2 rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800">
                  {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><MessageSquareWarning className="w-4 h-4" /> Critique This {isScreenplay ? 'Scene' : isShortStory ? 'Section' : 'Chapter'}</>}
                </button>

                {/* Critique result */}
                {critiqueResult && (
                  <div className="mt-3 bg-white rounded-lg border border-orange-200 p-3 text-sm text-ink-700 max-h-[50vh] overflow-y-auto">
                    <div className="prose prose-sm prose-orange max-w-none">
                      {critiqueResult.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-ink-900 mt-3 mb-1">{line.replace('## ', '')}</h3>;
                        if (line.startsWith('- ')) return <p key={i} className="text-sm text-ink-600 pl-3 border-l-2 border-orange-200 my-1">{line.replace('- ', '')}</p>;
                        if (line.trim() === '') return <div key={i} className="h-2" />;
                        return <p key={i} className="text-sm text-ink-600 my-1">{line}</p>;
                      })}
                    </div>
                  </div>
                )}

                {/* Saved critique viewer */}
                {!critiqueResult && savedCritique && (
                  <div className="border-t border-ink-200 pt-3 mt-2">
                    <button
                      onClick={() => setShowSavedCritique(!showSavedCritique)}
                      className="flex items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700 w-full"
                    >
                      <Eye className="w-3 h-3" />
                      {showSavedCritique ? 'Hide' : 'View'} Previous Critique
                    </button>
                    {showSavedCritique && (
                      <div className="mt-2 bg-white rounded-lg border border-ink-200 p-3 text-sm text-ink-600 max-h-[40vh] overflow-y-auto">
                        {savedCritique.split('\n').map((line, i) => {
                          if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-ink-900 mt-3 mb-1">{line.replace('## ', '')}</h3>;
                          if (line.startsWith('- ')) return <p key={i} className="text-sm text-ink-600 pl-3 border-l-2 border-ink-200 my-1">{line.replace('- ', '')}</p>;
                          if (line.trim() === '') return <div key={i} className="h-2" />;
                          return <p key={i} className="text-sm text-ink-600 my-1">{line}</p>;
                        })}
                      </div>
                    )}
                  </div>
                )}

                {!critiqueResult && !savedCritique && (
                  <p className="text-xs text-ink-400 text-center py-4">
                    Select a focus area and click critique to get AI feedback on your writing.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ghost text hint */}
      {!isScreenplay && (
        <div className="fixed bottom-4 right-4 text-xs text-ink-400 pointer-events-none hidden sm:block">
          <kbd className="px-1 py-0.5 bg-ink-100 rounded text-ink-500">Tab</kbd> accept suggestion &middot; <kbd className="px-1 py-0.5 bg-ink-100 rounded text-ink-500">Esc</kbd> dismiss
        </div>
      )}
    </div>
  );
}
