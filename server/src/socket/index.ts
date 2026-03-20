import { Server as SocketServer, Socket } from 'socket.io';
import aiService from '../services/ai';
import { setSocketServer } from '../services/gamification';

export function setupSocketHandlers(io: SocketServer): void {
  setSocketServer(io);

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    let abortController: AbortController | null = null;

    // Join user-specific room for achievement notifications
    socket.on('join-user', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    // Join project room for real-time updates
    socket.on('join-project', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    // Auto-save chapter content
    socket.on('chapter-save', (data: { chapterId: number; content: string }) => {
      socket.to(`project:${data.chapterId}`).emit('chapter-updated', data);
    });

    // Cancel any in-flight AI stream
    socket.on('ai-cancel', () => {
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
    });

    // AI streaming co-write
    socket.on('ai-stream', async (data: { mode: string; prompt: string; context?: string; projectId?: number; maxTokens?: number }) => {
      // Cancel any previous stream
      if (abortController) abortController.abort();
      abortController = new AbortController();
      const signal = abortController.signal;

      try {
        await aiService.generateStream(
          {
            mode: data.mode as any,
            prompt: data.prompt,
            context: data.context,
            maxTokens: data.maxTokens,
          },
          {
            onToken: (token) => {
              if (signal.aborted) return;
              socket.emit('ai-token', { token });
            },
            onComplete: (fullText) => {
              if (signal.aborted) return;
              socket.emit('ai-complete', { content: fullText });
            },
            onError: (error) => {
              if (signal.aborted) return;
              socket.emit('ai-error', { error: error.message });
            },
          }
        );
      } catch (error) {
        if (!signal.aborted) {
          socket.emit('ai-error', { error: 'AI streaming failed' });
        }
      } finally {
        abortController = null;
      }
    });

    socket.on('disconnect', () => {
      if (abortController) abortController.abort();
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
