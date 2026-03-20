import Groq from 'groq-sdk';

interface AiOptions {
  mode: 'brainstorm' | 'co_write' | 'critique' | 'teach' | 'format' | 'ghost_write';
  prompt: string;
  systemPrompt?: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface AiStreamCallback {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  brainstorm: `You are a creative writing partner helping brainstorm story ideas. Ask probing questions, suggest interesting angles, and build on the user's ideas. Generate multiple options when appropriate. Be encouraging and enthusiastic.`,
  co_write: `You are an inline writing assistant. Continue the narrative naturally, matching the established tone, style, and voice. Offer suggestions for dialogue, descriptions, and transitions. Keep suggestions concise (1-3 sentences) unless asked for more. If the format is a short story, prioritize economy of language — every sentence must earn its place. Favor specificity over exposition.`,
  critique: `You are a constructive writing editor. Analyze the text for pacing, character consistency, plot holes, repetitive language, and show-don't-tell opportunities. Be specific with feedback and always suggest improvements. Be encouraging but honest.`,
  teach: `You are a writing craft instructor. When you identify a teachable moment, briefly explain the writing concept using the user's own text as an example. Keep explanations short and practical. Focus on one concept at a time.`,
  format: `You are a formatting assistant. Help structure and format the manuscript according to industry standards. Generate supplementary materials like synopses, query letters, and loglines when requested.`,
  ghost_write: `You are an invisible inline writing assistant. Continue the narrative naturally from exactly where the text left off, matching the established tone, style, voice, and tense. Output ONLY the continuation text — no explanations, no quotes, no prefixes. Write 1-2 sentences maximum.`,
};

class AiService {
  private groqClient: Groq | null = null;
  private ollamaBaseUrl: string;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  async generate(options: AiOptions): Promise<string> {
    const systemPrompt = options.systemPrompt || MODE_SYSTEM_PROMPTS[options.mode] || '';
    const fullPrompt = options.context ? `${options.context}\n\n${options.prompt}` : options.prompt;

    try {
      if (this.groqClient) {
        return await this.generateWithGroq(systemPrompt, fullPrompt, options);
      }
      return await this.generateWithOllama(systemPrompt, fullPrompt, options);
    } catch (error) {
      // Fallback to Ollama if Groq fails
      if (this.groqClient) {
        console.warn('Groq failed, falling back to Ollama:', (error as Error).message);
        return await this.generateWithOllama(systemPrompt, fullPrompt, options);
      }
      throw error;
    }
  }

  async generateStream(options: AiOptions, callbacks: AiStreamCallback): Promise<void> {
    const systemPrompt = options.systemPrompt || MODE_SYSTEM_PROMPTS[options.mode] || '';
    const fullPrompt = options.context ? `${options.context}\n\n${options.prompt}` : options.prompt;

    try {
      if (this.groqClient) {
        await this.streamWithGroq(systemPrompt, fullPrompt, options, callbacks);
      } else {
        await this.streamWithOllama(systemPrompt, fullPrompt, options, callbacks);
      }
    } catch (error) {
      if (this.groqClient) {
        console.warn('Groq streaming failed, falling back to Ollama');
        await this.streamWithOllama(systemPrompt, fullPrompt, options, callbacks);
      } else {
        callbacks.onError(error as Error);
      }
    }
  }

  private async generateWithGroq(systemPrompt: string, prompt: string, options: AiOptions): Promise<string> {
    const response = await this.groqClient!.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
    });
    return response.choices[0]?.message?.content || '';
  }

  private async streamWithGroq(systemPrompt: string, prompt: string, options: AiOptions, callbacks: AiStreamCallback): Promise<void> {
    const stream = await this.groqClient!.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      stream: true,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullText += token;
        callbacks.onToken(token);
      }
    }
    callbacks.onComplete(fullText);
  }

  private async generateWithOllama(systemPrompt: string, prompt: string, options: AiOptions): Promise<string> {
    const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: {
          num_predict: options.maxTokens || 2048,
          temperature: options.temperature ?? 0.7,
        },
      }),
    });
    const data: any = await response.json();
    return data.message?.content || '';
  }

  private async streamWithOllama(systemPrompt: string, prompt: string, options: AiOptions, callbacks: AiStreamCallback): Promise<void> {
    const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: true,
        options: {
          num_predict: options.maxTokens || 2048,
          temperature: options.temperature ?? 0.7,
        },
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          const token = data.message?.content || '';
          if (token) {
            fullText += token;
            callbacks.onToken(token);
          }
        } catch {
          // skip invalid JSON lines
        }
      }
    }
    callbacks.onComplete(fullText);
  }
}

export const aiService = new AiService();
export default aiService;
