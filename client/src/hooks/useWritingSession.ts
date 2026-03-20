import { useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface SessionStats {
  wordsWritten: number;
  duration: number; // in seconds
  aiInteractions: number;
  streakCount: number;
  newAchievements: Array<{ milestone: string; description: string }>;
}

interface UseWritingSessionOptions {
  projectId: number;
  initialWordCount: number;
  onSessionEnd?: (stats: SessionStats) => void;
}

export function useWritingSession({ projectId, initialWordCount, onSessionEnd }: UseWritingSessionOptions) {
  const startedAtRef = useRef(new Date());
  const initialWordsRef = useRef(initialWordCount);
  const currentWordsRef = useRef(initialWordCount);
  const aiInteractionsRef = useRef(0);
  const endedRef = useRef(false);

  // Update initial word count when it becomes available
  useEffect(() => {
    initialWordsRef.current = initialWordCount;
    currentWordsRef.current = initialWordCount;
  }, [initialWordCount]);

  const trackAiInteraction = useCallback(() => {
    aiInteractionsRef.current += 1;
  }, []);

  const updateWordCount = useCallback((count: number) => {
    currentWordsRef.current = count;
  }, []);

  const endSession = useCallback(async (): Promise<SessionStats | null> => {
    if (endedRef.current) return null;
    endedRef.current = true;

    const now = new Date();
    const wordsWritten = Math.max(0, currentWordsRef.current - initialWordsRef.current);
    const duration = Math.round((now.getTime() - startedAtRef.current.getTime()) / 1000);

    // Don't record empty sessions (less than 30 seconds or 0 words)
    if (duration < 30 && wordsWritten === 0) return null;

    try {
      const res = await api.post('/users/sessions', {
        projectId,
        wordsWritten,
        aiInteractions: aiInteractionsRef.current,
        startedAt: startedAtRef.current.toISOString(),
        endedAt: now.toISOString(),
      });

      const { newAchievements } = res.data.data;

      // Re-fetch user to update streak/totalWords in header
      await useAuthStore.getState().checkAuth();
      const user = useAuthStore.getState().user;

      const stats: SessionStats = {
        wordsWritten,
        duration,
        aiInteractions: aiInteractionsRef.current,
        streakCount: user?.streakCount || 0,
        newAchievements: newAchievements || [],
      };

      onSessionEnd?.(stats);
      return stats;
    } catch {
      return null;
    }
  }, [projectId, onSessionEnd]);

  // Use sendBeacon as fallback on page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (endedRef.current) return;
      const wordsWritten = Math.max(0, currentWordsRef.current - initialWordsRef.current);
      const data = JSON.stringify({
        projectId,
        wordsWritten,
        aiInteractions: aiInteractionsRef.current,
        startedAt: startedAtRef.current.toISOString(),
        endedAt: new Date().toISOString(),
      });
      navigator.sendBeacon('/api/users/sessions', new Blob([data], { type: 'application/json' }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectId]);

  return { trackAiInteraction, updateWordCount, endSession };
}

export type { SessionStats };
