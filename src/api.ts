/**
 * 前端 API 工具' * 统一封装所有后端请求，前端组件通过此模块与后端通信' */

const BASE = '/api';

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  returnFull: boolean = false
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('scholarly_token') || ''}`
    },
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      options.body = body;
      // Do NOT set Content-Type header; fetch will set it correctly with the boundary
    } else {
      (options.headers as any)['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch (err) {
    throw new Error('网络请求失败，请检查后端服务是否启动');
  }

  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error(`服务器响应异�?(Status: ${res.status})`);
    return {} as T;
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error('服务器响应格式错误，请检查后端服务日志');
  }

  if (!json.success) throw new Error(json.message || '请求失败');
  
  if (returnFull) return json as T;
  return json.data as T;
}

// ─── 笔记本（大图书馆）────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  collectionNum: string;
  title: string;
  description: string;
  sourceCount: number;
  icon: string;
  isFinished?: boolean;
  lastUpdated: string;
}

export const notebookApi = {
  getAll: () => request<Collection[]>('GET', '/notebooks'),
  getById: (id: string) => request<Collection>('GET', `/notebooks/${id}`),
  create: (data: { title: string; description?: string }) =>
    request<Collection>('POST', '/notebooks', data),
  update: (id: string, data: Partial<Collection>) =>
    request<Collection>('PUT', `/notebooks/${id}`, data),
  toggleFinish: (id: string) =>
    request<Collection>('PUT', `/notebooks/${id}/finish`, {}),
  delete: (id: string) =>
    request<void>('DELETE', `/notebooks/${id}`),
};

// ─── 文思阁卡片 ───────────────────────────────────────────────────────────────

export interface ArchiveCard {
  id: string;
  category: string;
  categoryColor: string;
  date: string;
  title: string;
  content: string;
  source: string;
  icon: string;
  actionIcon: string;
  image?: string;
}

export const galleryApi = {
  getAll: () => request<ArchiveCard[]>('GET', '/gallery'),
  create: (data: Omit<ArchiveCard, 'id'>) =>
    request<ArchiveCard>('POST', '/gallery', data),
  delete: (id: string) => request<void>('DELETE', `/gallery/${id}`),
};

// ─── 素材 ─────────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  notebookId: string;
  type: string;
  title: string;
  date: string;
  icon: string;
  url?: string;
  summary?: string;
  contentText?: string;
}

export const sourceApi = {
  getByNotebook: (notebookId: string) =>
    request<Source[]>('GET', `/sources?notebookId=${notebookId}`),
  create: (data: FormData) =>
    request<Source>('POST', '/sources', data),
  delete: (id: string) => request<void>('DELETE', `/sources/${id}`),
};

// ─── 固定洞察 ─────────────────────────────────────────────────────────────────

export interface Artifact {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
}

export const artifactApi = {
  getAll: () => request<Artifact[]>('GET', '/artifacts'),
  create: (data: Omit<Artifact, 'id'>) =>
    request<Artifact>('POST', '/artifacts', data),
  delete: (id: string) => request<void>('DELETE', `/artifacts/${id}`),
};

// ─── 对话历史 ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  modelUsed?: string;
  time: string;
}

export const messageApi = {
  getHistory: (notebookId: string) =>
    request<Message[]>('GET', `/messages?notebookId=${notebookId}`),
  clearHistory: (notebookId: string) =>
    request<void>('DELETE', `/messages?notebookId=${notebookId}`),
};

// ─── 历史探索与笔�?(中式留白主题) ────────────────────────────────────────────────────────
export interface HistoryNote {
  id: string;
  title: string;
  content: string;
  themeConfig: {
    primaryColor: 'dai-blue' | string;
    surfaceColor: 'shui-mo-white' | string;
    outlineColor: 'han-silver' | string;
    backdropBlur: string;
  };
  timestamp: string;
}

// ─── 聊天 / Smart Router ─────────────────────────────────────────────────────

export interface ReviewCard {
  front: string;
  back: string;
  tags: string[];
}

export interface ChatResponse {
  content: string;
  modelUsed: string;
  isCard: boolean;
  cards: ReviewCard[] | null;
  intent: string;
  time: string;
}

export const chatApi = {
  send: (data: {
    message: string;
    notebookId?: string;
    notebookTitle?: string;
    selectedSourceTitles?: string[];
    mode?: 'auto' | 'review_card' | 'mind_map';
    isGuest?: boolean;
  }) => request<ChatResponse>('POST', '/chat/send', data),

  /* [动效] 支持流式返回的打字机接口：如墨色入水 */
  sendStream: async function* (data: {
    message: string;
    notebookId?: string;
    notebookTitle?: string;
    selectedSourceTitles?: string[];
    mode?: 'auto' | 'review_card' | 'mind_map';
    isGuest?: boolean;
  }, signal?: AbortSignal): AsyncGenerator<{delta: string, intent?: string, modelUsed?: string}, void, unknown> {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('scholarly_token') || ''}`
      },
      body: JSON.stringify(data),
      signal
    };

    const res = await fetch(`${BASE}/chat/sendStream`, options);
    if (!res.ok) throw new Error('流式请求失败');
    if (!res.body) throw new Error('环境不支持流式响');

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        // Final flush when done
        if (done) {
          if (buffer.trim()) {
            const finalLines = buffer.split(/\r?\n/);
            for (const line of finalLines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data:')) {
                const payload = trimmed.slice(5).trim();
                if (payload === '[DONE]') break;
                try {
                  const parsed = JSON.parse(payload);
                  const delta = parsed.d ?? parsed.delta ?? parsed.content ?? '';
                  yield { 
                    delta, 
                    intent: parsed.intent, 
                    modelUsed: parsed.modelUsed 
                  };
                } catch (e) {
                  console.warn('[SSE] Flush JSON parse error:', e, payload);
                }
              }
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Use a more frequent line split (supports \n or \r\n)
        const lines = buffer.split(/\r?\n/);
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') return;
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.d ?? parsed.delta ?? parsed.content ?? '';
              yield { 
                delta, 
                intent: parsed.intent, 
                modelUsed: parsed.modelUsed 
              };
            } catch (e) {
              // Partial JSON or heartbeat, ignore usually, but log if it looks wrong
              if (payload !== ':heartbeat' && !payload.includes('heartbeat')) {
                console.warn('[SSE] Stream JSON parse error:', e, payload);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
};

// ─── 用户认证 ────────────────────────────────────────────────────────

export interface User {
  id: string;
  username?: string;
}

export const authApi = {
  login: (data: { username: string; password: string }) => 
    request<any>('POST', '/auth/login', data, true),
  register: (data: { username: string; password: string }) => 
    request<any>('POST', '/auth/register', data, true),
  getMe: () => request<User>('GET', '/auth/me'),
};
