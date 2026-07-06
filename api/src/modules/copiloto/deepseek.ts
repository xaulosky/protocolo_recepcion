/**
 * Cliente HTTP mínimo para DeepSeek (API compatible con OpenAI chat completions +
 * function-calling). Usa `fetch` nativo de Node, sin dependencias nuevas.
 */
import { env } from '../../env.ts';

const BASE_URL = 'https://api.deepseek.com';
const TIMEOUT_MS = 30_000;

export interface ChatMessageIn {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ToolDef {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

export interface ChatCompletionResult {
  content: string | null;
  tool_calls?: ToolCall[];
}

interface DeepSeekApiResponse {
  choices: { message: ChatCompletionResult }[];
}

export class DeepSeekError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function callOnce(messages: ChatMessageIn[], tools: ToolDef[]): Promise<ChatCompletionResult> {
  if (!env.DEEPSEEK_API_KEY) {
    throw new DeepSeekError('DEEPSEEK_API_KEY no está configurada en el servidor.', 503);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL,
        messages,
        tools: tools.length ? tools : undefined,
      }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('Retry-After')) || 1.5;
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      const retry = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: env.DEEPSEEK_MODEL, messages, tools: tools.length ? tools : undefined }),
      });
      if (!retry.ok) throw new DeepSeekError('El servicio de IA está saturado, intenta en unos segundos.', 503);
      const data = (await retry.json()) as DeepSeekApiResponse;
      return data.choices[0].message;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new DeepSeekError(`DeepSeek respondió ${res.status}: ${body.slice(0, 300)}`, res.status);
    }

    const data = (await res.json()) as DeepSeekApiResponse;
    return data.choices[0].message;
  } catch (err) {
    if (err instanceof DeepSeekError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new DeepSeekError('El copiloto no respondió a tiempo. Intenta de nuevo.', 504);
    }
    throw new DeepSeekError('No se pudo contactar al servicio de IA.', 502);
  } finally {
    clearTimeout(timer);
  }
}

/** Llama a DeepSeek chat.completions. Reintenta una vez en 429; el resto de errores se propagan como DeepSeekError. */
export async function chatCompletion(messages: ChatMessageIn[], tools: ToolDef[] = []): Promise<ChatCompletionResult> {
  return callOnce(messages, tools);
}
