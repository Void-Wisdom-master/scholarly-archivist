import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  messageApi, 
  sourceApi, 
  chatApi, 
  galleryApi, 
  type User 
} from '../../api';
import mermaid from 'mermaid';

// --- Mermaid Initialization ---
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#70261c',
    primaryTextColor: '#70261c',
    primaryBorderColor: '#70261c',
    lineColor: '#70261c',
    secondaryColor: '#f8f4f0',
    tertiaryColor: '#ffffff',
    fontFamily: '"Noto Serif SC", serif',
    fontSize: '12px'
  },
  securityLevel: 'loose',
});
import { 
  Collection, 
  ArchiveCard, 
  Source, 
  Message, 
  Artifact,
  ReviewCard
} from '../../types';
import { MOCK_DATA } from '../../constants';

// --- Sub-component: MermaidDiagram ---
const MermaidDiagram = ({ content }: { content: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // 清理旧内?(仅当内容变动显著或初始化?
    // containerRef.current.innerHTML = ''; 
    setError(false);

    // 提取代码逻辑：去除可能存在的 Markdown 包裹
    let code = content.trim();
    if (code.startsWith('```mermaid')) {
      code = code.replace(/^```mermaid\n?/, '').replace(/\n?```$/, '');
    }

    // 防御性校验：检查关键字和闭合符
    const isRenderable = /(graph|flowchart|mindmap|classDiagram|stateDiagram|pie|sequenceDiagram|gantt)/.test(code)
                        && (code.includes('\n') || code.length > 20); // 确保有一定的结构

    if (!isRenderable) {
      if (!containerRef.current.innerHTML) {
        containerRef.current.innerHTML = '<div class="text-[10px] italic text-primary/40 animate-pulse text-center py-8">正在构思导图结...</div>';
      }
      return;
    }

    const renderId = `mermaid-svg-${Date.now()}`;
    
    // --- 引入防抖处理：由于流式更新非常快，缩短防抖以提升反馈 ---
    const timeoutId = setTimeout(async () => {
      try {
        // 先进行初步解析校验，避免无效渲染报错
        const { svg } = await mermaid.render(renderId, code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(false);
        }
      } catch (e) {
        // 渲染失败通常是因为代码尚不完整（处于流式中间状态），忽略即可
        if (containerRef.current && !containerRef.current.innerHTML) {
          containerRef.current.innerHTML = '<div class="text-[10px] italic text-primary/40 animate-pulse text-center py-8">正在构筑知识图谱...</div>';
        }
      }
    }, 100); // 缩短?100ms

    return () => clearTimeout(timeoutId);
  }, [content]);

  return (
    <div className="relative group/mermaid bg-surface-container-lowest/50 rounded-[var(--radius-apple-xl)] border border-primary/5">
      <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover/mermaid:opacity-100 transition-opacity">
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="w-6 h-6 rounded-full bg-surface-container-highest/80 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
          <span className="material-symbols-outlined text-xs">zoom_in</span>
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="w-6 h-6 rounded-full bg-surface-container-highest/80 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
          <span className="material-symbols-outlined text-xs">zoom_out</span>
        </button>
        <button onClick={() => setZoom(1)} className="w-6 h-6 rounded-full bg-surface-container-highest/80 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
          <span className="material-symbols-outlined text-xs">restart_alt</span>
        </button>
      </div>
      <div 
        className="mermaid-viewer overflow-auto flex justify-center py-8 custom-scrollbar bg-white/40"
        style={{ maxHeight: '500px' }}
      >
        <div 
          ref={containerRef} 
          style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: zoom > 1 ? 'grab' : 'default'
          }}
        />
      </div>
    </div>
  );
};

// --- Sub-component: FlashCard (Premium View) ---
const FlashCard = ({ card, index }: { card: ReviewCard; index: number }) => (
  <motion.div 
    initial={{ opacity: 0, x: -5 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group/card relative bg-surface-container-lowest p-5 rounded-[var(--radius-apple-xl)] border border-primary/10 hover:border-primary/30 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(44,62,80,0.04)] mb-4"
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/10">
        {index + 1}
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
    </div>
    
    <div className="space-y-4">
      <div className="font-headline text-sm font-bold text-on-surface leading-snug tracking-tight">
        {card.front}
      </div>
      <div className="pl-4 border-l-2 border-primary/10 py-1 italic font-body text-[13px] text-on-surface-variant/90 leading-relaxed bg-primary/[0.02] rounded-r-sm">
        {card.back}
      </div>
    </div>

    {card.tags && card.tags.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-1.5 opacity-60 group-hover/card:opacity-100 transition-opacity">
        {card.tags.map(t => (
          <span key={t} className="px-1.5 py-0.5 bg-surface-container-high text-[8px] font-label uppercase tracking-widest rounded-sm">
            #{t}
          </span>
        ))}
      </div>
    )}
  </motion.div>
);

// --- Sub-component: ArtifactPreview ---
const ArtifactPreview = ({ artifact }: { artifact: Artifact }) => {
  // 1. Loading State (Streaming/Extracting)
  if (!artifact.content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 opacity-50">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin shadow-[0_0_20px_rgba(112,38,28,0.1)]" />
        <div className="text-[10px] font-label uppercase tracking-[0.25em] text-primary animate-pulse">正在精读解析...</div>
      </div>
    );
  }

  // 2. Mind Map Rendering
  if (artifact.type === 'mind_map') {
    // 鲁棒型核心Mermaid剥离：寻找第一个关键字到最后一个闭合符
    let code = artifact.content.trim();
    const mermaidRegex = /```mermaid([\s\S]*?)```|((?:graph|flowchart|mindmap|sequenceDiagram|classDiagram|stateDiagram|pie|gantt|timeline)[\s\S]*)/i;
    const match = code.match(mermaidRegex);
    
    if (match) {
      code = (match[1] || match[2]).trim();
    }
    
    return (
      <div className="relative group/mind-map">
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center opacity-0 group-hover/mind-map:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-xs text-primary/40 animate-pulse">hub</span>
        </div>
        <div className="max-h-[550px] overflow-hidden rounded-[var(--radius-apple-xl)] border border-primary/10 shadow-[0_4px_25px_rgba(112,38,28,0.03)] bg-white/40 backdrop-blur-sm">
          <MermaidDiagram content={code} />
        </div>
      </div>
    );
  }

  // 3. Review Card Rendering
  if (artifact.type === 'review_card') {
    try {
      // 鲁棒JSON 剥离：定位最外层的大括号/中括
      let jsonContent = artifact.content.trim();
      const jsonRegex = /```json([\s\S]*?)```|(\{[\s\S]*\}|\[[\s\S]*\])/;
      const match = jsonContent.match(jsonRegex);
      
      if (match) {
        jsonContent = (match[1] || match[2]).trim();
      }
      
      const data = JSON.parse(jsonContent) as { cards: ReviewCard[] };
      return (
        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar py-2">
          {data.cards.map((card, idx) => (
            <FlashCard key={idx} card={card} index={idx} />
          ))}
          <div id="artifact-bottom" className="h-4" />
        </div>
      );
    } catch (e) {
      // 非法 JSON 且还在提取中：静默，不报错
      if (artifact.content.length < 100) {
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
             <div className="text-[10px] font-label uppercase tracking-widest animate-pulse">正在精炼知识..</div>
          </div>
        );
      }
      // 如果显著不是 JSON，按纯文Markdown 处理
      return (
        <div className="p-6 bg-surface-container-low/50 rounded-lg border border-primary/5 font-body text-sm leading-relaxed text-on-surface-variant italic">
          <ReactMarkdown>{artifact.content}</ReactMarkdown>
        </div>
      );
    }
  }

  // 4. Default / Insight Rendering
  return (
    <div className="p-6 bg-surface-container-lowest rounded-[var(--radius-apple-xl)] border border-primary/10 italic text-sm text-on-surface-variant leading-relaxed shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      <ReactMarkdown>{artifact.content}</ReactMarkdown>
    </div>
  );
};


// --- Sub-component: ChatMessage ---
const ChatMessage = React.memo(({ msg, onPin }: { msg: Message; onPin: (m: Message) => void }) => {
  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[90%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
        {msg.role === 'ai' && (
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px] text-white">auto_awesome</span>
            </div>
            <span className="font-label text-[10px] text-primary uppercase tracking-[0.15em] font-bold">神谕 AI</span>
          </div>
        )}
        <div className={`p-6 rounded-[var(--radius-apple-2xl)] text-sm leading-relaxed shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/10 ${msg.role === 'user' ? 'bg-surface-container-low text-on-surface' : 'bg-surface-container-lowest text-on-surface'
          }`}>
          <div className="markdown-body">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        </div>
        <div className="text-[10px] font-label text-on-surface-variant flex items-center gap-2 uppercase tracking-widest justify-start">
          {msg.role === 'user' ? '档案管理' : 'AI'} 文件{msg.time}
        </div>
        {msg.role === 'ai' && (
          <div className="flex gap-4 pt-2">
            <button className="flex items-center gap-1.5 text-[10px] font-label text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">content_copy</span> 复制
            </button>
            <button
              onClick={() => onPin(msg)}
              className="flex items-center gap-1.5 text-[10px] font-label text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">push_pin</span> 固定到文思阁
            </button>
            <button className="flex items-center gap-1.5 text-[10px] font-label text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">refresh</span> 重新生成
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// --- Main View Component: ChatView ---
interface ChatViewProps {
  user: User | null;
  library: Collection[];
  pinnedArtifacts: Artifact[];
  setPinnedArtifacts: (a: Artifact[]) => void;
  onNewGalleryItem: (item: ArchiveCard) => void;
  setGallery: React.Dispatch<React.SetStateAction<ArchiveCard[]>>;
  notebookId?: string;
  onBackToLibrary: () => void;
}

const ChatView: React.FC<ChatViewProps> = React.memo(({
  user,
  library,
  pinnedArtifacts,
  setPinnedArtifacts,
  onNewGalleryItem,
  setGallery,
  notebookId,
  onBackToLibrary
}) => {
  const id = notebookId;
  const activeNotebook = library.find(nb => nb.id === id);

  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [viewingSource, setViewingSource] = useState<Source | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if ((id && !activeNotebook && library.length > 0) || !id || !activeNotebook) {
      onBackToLibrary();
    }
  }, [id, activeNotebook, library.length, onBackToLibrary]);

  // If no ID provided at all
  if (!id || !activeNotebook) {
    return <div className="h-full w-full flex items-center justify-center font-headline text-primary italic">未找到笔记本信息...</div>;
  }

  useEffect(() => {
    const fetchData = async () => {
      const isMockNotebook = activeNotebook.id === 'd1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1' ||
        activeNotebook.id === 'd2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2';

      try {
        const [history, notebookSources] = await Promise.all([
          messageApi.getHistory(activeNotebook.id),
          sourceApi.getByNotebook(activeNotebook.id)
        ]);

        if (history.length > 0 || notebookSources.length > 0) {
          setMessages(history);
          setSources(notebookSources as unknown as Source[]);
        } else if (isMockNotebook) {
          setMessages(MOCK_DATA.initialChat);
          setSources(MOCK_DATA.sources);
        } else {
          setMessages([]);
          setSources([]);
        }
      } catch (err) {
        console.warn('Failed to sync with backend, falling back to empty/mock:', err);
        if (isMockNotebook) {
          setMessages(MOCK_DATA.initialChat);
          setSources(MOCK_DATA.sources);
        } else {
          setMessages([]);
          setSources([]);
        }
      }
    };
    fetchData();
  }, [activeNotebook.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (currentArtifact) {
      const artifactBottom = document.getElementById('artifact-bottom');
      artifactBottom?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentArtifact?.content]);

  const toggleSource = (id: string) => {
    setSelectedSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      let type = '文件';
      let icon = 'description';

      if (extension === 'pdf') {
        type = 'PDF';
        icon = 'picture_as_pdf';
      } else if (extension === 'md' || extension === 'markdown') {
        type = 'Markdown';
        icon = 'notes';
      } else if (extension === 'txt') {
        type = 'Text';
        icon = 'article';
      } else if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
        type = 'Image';
        icon = 'image';
      }

      if (user?.id === 'guest') {
        const newSrc: Source = {
          id: crypto.randomUUID(),
          type,
          title: file.name,
          date: '刚刚',
          icon
        };
        setSources(prev => [newSrc, ...prev]);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('notebookId', activeNotebook.id);
        formData.append('title', file.name);
        formData.append('type', type);
        formData.append('icon', icon);

        const newSource = await sourceApi.create(formData);
        setSources(prev => [newSource as unknown as Source, ...prev]);
        setSelectedSources(prev => [...prev, newSource.id]);
      } catch (err) {
        console.error('Failed to save source to backend:', err);
      }
    }
    
    if (user?.id === 'guest') {
      alert('已导入本地素材');
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('确定要删除此素材吗？')) return;

    if (user?.id === 'guest') {
      setSources(prev => prev.filter(s => s.id !== id));
      setSelectedSources(prev => prev.filter(sid => sid !== id));
      return;
    }

    try {
      await sourceApi.delete(id);
      setSources(prev => prev.filter(s => s.id !== id));
      setSelectedSources(prev => prev.filter(sid => sid !== id));
    } catch (err) {
      console.error('Failed to delete source:', err);
      setSources(prev => prev.filter(s => s.id !== id));
      setSelectedSources(prev => prev.filter(sid => sid !== id));
    }
  };

  const handleSend = async (overrideMode?: 'auto' | 'review_card' | 'mind_map') => {
    if (!input.trim() && overrideMode !== 'review_card' && overrideMode !== 'mind_map') return;

    // --- 1. 声明处理逻辑 (位于顶部避免 hoisted 引用错误) ---
    
    // 普通对话逻辑
    const proceedDialogue = async (prompt: string, ctrl: AbortController) => {
      const userMsgId = Date.now().toString();
      const aiMsgId = (Date.now() + 1).toString();
      let currentContent = '';

      const userMsg: Message = { 
        id: userMsgId, role: 'user', content: prompt, 
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) 
      };
      const aiMsg: Message = { 
        id: aiMsgId, role: 'ai', content: '', 
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) 
      };
      
      // 原子操作：同步更新用户和 AI 占位
      setMessages(prev => [...prev, userMsg, aiMsg]);
      setIsTyping(false);

      try {
        const streamGen = chatApi.sendStream({
          message: prompt,
          notebookId: activeNotebook.id,
          notebookTitle: activeNotebook.title,
          selectedSourceTitles: sources.filter(s => selectedSources.includes(s.id)).map(s => s.title),
          mode: 'auto',
          isGuest: user?.id === 'guest'
        }, ctrl.signal);

        for await (const chunk of streamGen) {
          if (!isMounted.current || ctrl.signal.aborted) break;
          const delta = chunk.delta || '';
          if (delta) {
            currentContent += delta;
            setMessages(prev => 
              prev.map(m => m.id === aiMsgId ? { ...m, content: currentContent } : m)
            );
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('[Stream] Dialogue failed:', err);
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, content: currentContent + '\n\n> [!CAUTION]\n> 对话发生异常，请检查网络或稍后重试' } : m
          ));
        }
      } finally {
        if (isMounted.current) setIsTyping(false);
      }
    };

    // 制品生成逻辑
    const proceedArtifact = async (mode: 'review_card' | 'mind_map', prompt: string, ctrl: AbortController) => {
      const newArt: Artifact = {
        id: `temp-${Date.now()}`,
        title: mode === 'review_card' ? '知识闪卡' : '思维导图',
        type: mode,
        content: '',
        tags: [mode === 'review_card' ? '复习' : '思维导图'],
        color: 'border-primary'
      };

      if (isMounted.current) {
        setCurrentArtifact(newArt);
        setIsExtracting(true);
      }

      try {
        const streamGen = chatApi.sendStream({
          message: prompt,
          notebookId: activeNotebook.id,
          notebookTitle: activeNotebook.title,
          selectedSourceTitles: sources.filter(s => selectedSources.includes(s.id)).map(s => s.title),
          mode: mode,
          isGuest: user?.id === 'guest'
        }, ctrl.signal);

        let tempContent = '';
        for await (const chunk of streamGen) {
          if (!isMounted.current || ctrl.signal.aborted) break;
          const delta = chunk.delta || '';
          if (delta) {
            tempContent += delta;
            setCurrentArtifact(prev => prev ? { ...prev, content: tempContent } : { ...newArt, content: tempContent });
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error('[Stream] Artifact failed:', err);
      } finally {
        if (isMounted.current) setIsExtracting(false);
      }
    };

    // --- 2. 意图解析与分发 ---
    
    const lowerInput = input.toLowerCase();
    const isIntentArtifact = !overrideMode && (
      (lowerInput.includes('思维导图') || lowerInput.includes('脑图') || lowerInput.includes('图谱') || 
       lowerInput.includes('流程') || lowerInput.includes('架构') || lowerInput.includes('拓扑') ||
       lowerInput.includes('闪卡') || lowerInput.includes('卡片') || lowerInput.includes('复习'))
      || (lowerInput.includes('思维导图') || lowerInput.includes('脑图') || lowerInput.includes('知识闪卡'))
    );
    
    const effectiveMode = overrideMode || (isIntentArtifact ? (lowerInput.includes('闪卡') || lowerInput.includes('卡片') ? 'review_card' : 'mind_map') : 'auto');
    const isArtifactGen = effectiveMode !== 'auto';
    const msgContent = input.trim() || (effectiveMode === 'review_card' ? '生成复习卡片' : '生成思维导图');

    // 清空状态
    setInput('');
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 执行
    if (isArtifactGen) {
      await proceedArtifact(effectiveMode as 'review_card' | 'mind_map', msgContent, controller);
    } else {
      await proceedDialogue(msgContent, controller);
    }
  };

  const handleArchiveArtifact = (art: Artifact) => {
    // 检查是否已经在 Studio 中存在（通过 IDTitle+Content 简易判定）
    const isAlreadyPinned = pinnedArtifacts.some(p => p.id === art.id || (p.title === art.title && p.content === art.content));
    
    if (isAlreadyPinned) {
      alert('该制品已保存在翰墨留香侧边栏');
      return;
    }

    const pinnedArt: Artifact = {
      ...art,
      id: 'a' + Date.now().toString(), // 赋予持久化临ID
    };

    setPinnedArtifacts([pinnedArt, ...pinnedArtifacts]);
    
    // 同时同步到文思阁 (Gallery)
    const newCard: ArchiveCard = {
      id: 'g' + Date.now().toString(),
      title: art.title || (art.type === 'mind_map' ? '思维导图' : '知识闪卡'),
      content: art.content,
      category: art.type === 'mind_map' ? '思维导图' : (art.type === 'review_card' ? '知识闪卡' : 'AI 洞察'),
      categoryColor: 'bg-primary text-on-primary',
      date: new Date().toLocaleDateString('zh-CN'),
      source: activeNotebook.title, // 确保链接到当前笔记本
      icon: art.type === 'mind_map' ? 'account_tree' : (art.type === 'review_card' ? 'school' : 'auto_awesome'),
      actionIcon: 'bookmark'
    };
    onNewGalleryItem(newCard);

    setCurrentArtifact(null);
    alert('灵光已捕捉，相关制品已同步至翰墨留香及文思阁');
  };


  const pinToStudio = React.useCallback((msg: Message) => {
    // 深度寻找关联的用户提问：使用 slice/reverse/find 最优回答
    const msgIndex = messages.findIndex(m => m.id === msg.id);
    const prevUserMsg = messages.slice(0, msgIndex).reverse().find(m => m.role === 'user');
    const userQuestion = prevUserMsg ? prevUserMsg.content : "";

    const formattedContent = userQuestion 
      ? `问：${userQuestion}\n\n答：${msg.content}`
      : msg.content;

    const newArtifact: Artifact = {
      id: 'a' + Date.now(),
      type: 'AI 洞察',
      title: '研究笔记' + msg.content.substring(0, 15) + '...',
      content: formattedContent,
      tags: ['AI', '笔记'],
      color: 'border-primary/40'
    };
    setPinnedArtifacts([newArtifact, ...pinnedArtifacts]);

    // 同时同步到文思阁 (Gallery)
    const newCard: ArchiveCard = {
      id: 'g' + Date.now().toString(),
      title: 'AI 洞察: ' + msg.content.substring(0, 15) + '...',
      content: formattedContent,
      category: 'AI 洞察',
      categoryColor: 'bg-primary text-on-primary',
      date: new Date().toLocaleDateString('zh-CN'),
      source: activeNotebook.title, // 关键：确保链接到位
      icon: 'auto_awesome',
      actionIcon: 'bookmark'
    };
    onNewGalleryItem(newCard);

    alert('灵光已捕捉，已同步至翰墨留香及文思阁');
  }, [messages, pinnedArtifacts, setPinnedArtifacts, activeNotebook.title, onNewGalleryItem]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full overflow-hidden"
    >
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Panel 1: Source Manager */}
        <section className="col-span-3 bg-surface-container-low border-r border-outline-variant/10 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-xl italic">源头活水</h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
                multiple
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-on-primary px-4 py-2 rounded-[var(--radius-apple-xl)] font-label text-[10px] tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10"
              >
                <span className="material-symbols-outlined text-sm">add</span> 导入
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input className="w-full bg-surface-container border-none text-xs py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-primary font-label rounded-md" placeholder="搜索或筛选素.." type="text" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            <div className="px-2 mb-2">
              <span className="font-label text-[10px] uppercase tracking-widest text-outline">当前档案档案({sources.length})</span>
            </div>
            {sources.map((source) => (
              <div
                key={source.id}
                className={`p-4 rounded-[var(--radius-apple-2xl)] transition-all cursor-pointer group border relative ${selectedSources.includes(source.id)
                  ? 'bg-surface-container-lowest border-primary shadow-[0_4px_12px_rgba(44,62,80,0.06)] translate-x-1'
                  : 'bg-transparent border-transparent hover:bg-surface-container hover:border-outline-variant/10'
                  }`}
              >
                <div className="flex items-start gap-4" onClick={() => toggleSource(source.id)}>
                  <div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${selectedSources.includes(source.id) ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-outline'}`}>
                    <span className="material-symbols-outlined text-xl">{source.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-body font-bold truncate mb-1 ${selectedSources.includes(source.id) ? 'text-on-surface' : 'text-on-surface-variant'}`}>{source.title}</h4>
                    {source.type !== 'IMAGE' && (
                      <p className="text-[10px] text-on-surface-variant/70 line-clamp-1 mb-1 italic">
                        {source.summary || '正在研读...'}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`font-label text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${selectedSources.includes(source.id) ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-outline'}`}>{source.type}</span>
                      <span className="font-label text-[9px] text-on-surface-variant/60">{source.date}</span>
                    </div>
                  </div>
                  {selectedSources.includes(source.id) && (
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  )}
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingSource(source);
                    }}
                    className="p-1 rounded-full bg-surface-container-highest/50 text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all"
                    title="查看内容"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSource(source.id);
                    }}
                    className="p-1 rounded-full bg-surface-container-highest/50 text-on-surface-variant hover:bg-error hover:text-white transition-all"
                    title="删除素材"
                  >
                    <span className="material-symbols-outlined text-sm text-red-600 group-hover:text-red-600">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PDF Preview Modal */}
        <AnimatePresence>
          {viewingSource && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingSource(null)}
                className="absolute inset-0 bg-on-surface/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-surface w-full max-w-5xl h-full rounded-[var(--radius-apple-3xl)] shadow-2xl overflow-hidden flex flex-col border border-outline-variant/20"
              >
                <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">{viewingSource.icon}</span>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">{viewingSource.title}</h3>
                      <p className="text-[10px] font-label text-outline uppercase tracking-widest">{viewingSource.type} &middot; {viewingSource.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingSource(null)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="flex-1 bg-surface-container-lowest relative">
                  {viewingSource.url ? (
                    viewingSource.type.includes('PDF') ? (
                      <iframe
                        src={viewingSource.url}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                      />
                    ) : viewingSource.type.includes('IMAGE') || viewingSource.icon === 'image' ? (
                      <div className="w-full h-full flex items-center justify-center p-8">
                        <img src={viewingSource.url} alt={viewingSource.title} className="max-w-full max-h-full object-contain shadow-lg" />
                      </div>
                    ) : (
                      <div className="p-12 font-body text-on-surface leading-relaxed max-w-3xl mx-auto">
                        <div className="p-8 bg-surface-container rounded-lg border border-outline-variant/10">
                          <p className="italic text-on-surface-variant mb-4">预览内容</p>
                          <p>文件: {viewingSource.title}</p>
                          <p>文件大小: 模拟数据</p>
                          <hr className="my-6 border-outline-variant/20" />
                          <p>无法显示</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                      <span className="material-symbols-outlined text-6xl text-outline mb-4">find_in_page</span>
                      <h4 className="font-headline text-xl mb-2">暂无在线预览</h4>
                      <p>无法显示</p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-end gap-3">
                  <button
                    onClick={() => {
                      toggleSource(viewingSource.id);
                      setViewingSource(null);
                    }}
                    className={`px-6 py-2 rounded-full font-label text-xs uppercase tracking-widest transition-all ${selectedSources.includes(viewingSource.id)
                      ? 'bg-outline-variant text-on-surface-variant'
                      : 'bg-primary text-on-primary shadow-md hover:bg-primary-container'
                      }`}
                  >
                    {selectedSources.includes(viewingSource.id) ? '取消选择' : '选择为研究源'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Panel 2: Chat Interface */}
        <section className="col-span-6 bg-surface-container-low flex flex-col overflow-hidden relative">
          <div className="h-16 flex items-center justify-between px-10 border-b border-outline-variant/10 bg-surface/40 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-primary flex-1 text-center">{activeNotebook.title}</h2>
            <div className="flex items-center gap-1">
              <button
                className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                title="清除对话"
                onClick={() => setMessages([])}
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-12 py-12 space-y-10">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} onPin={pinToStudio} />
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[90%] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-pulse">
                      <span className="material-symbols-outlined text-[14px] text-white">auto_awesome</span>
                    </div>
                    <span className="font-label text-[10px] text-primary uppercase tracking-[0.15em] font-bold">档案正在分析档案...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="px-8 pb-10 pt-4 bg-transparent transition-all">
            <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-[var(--radius-apple-2xl)] p-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:shadow-[0_12px_45px_rgba(112,38,28,0.1)] transition-all duration-500 flex items-center gap-4 group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                className="flex-1 !border-0 !outline-none focus:!ring-0 bg-transparent font-body text-sm placeholder:italic resize-none h-16 py-5 px-4 custom-scrollbar"
                placeholder="在此向档案库开启对.."
              ></textarea>
              <button
                onClick={() => handleSend()}
                className="bg-primary text-on-primary w-12 h-12 rounded-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 mr-1"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        </section>

        {/* Panel 3: Studio */}
        <section className="col-span-3 bg-surface-container-low border-l border-outline-variant/10 flex flex-col overflow-hidden text-on-surface">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <h2 className="font-headline text-xl italic mb-1">翰墨留香</h2>

            {currentArtifact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-[var(--radius-apple-2xl)] shadow-inner"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-primary text-lg ${isExtracting ? 'animate-pulse' : ''}`}>
                      {currentArtifact.type === 'review_card' ? 'quiz' : 'account_tree'}
                    </span>
                    <h4 className="font-headline text-sm font-bold text-primary flex items-center gap-2">
                      {currentArtifact.type === 'review_card' ? '知识闪卡' : '思维导图'}
                      {isExtracting && <span className="text-[10px] font-label text-primary/50 italic animate-pulse">萃取...</span>}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    {!isExtracting && !currentArtifact.content && (
                      <button
                        onClick={() => {
                          const cached = localStorage.getItem('last_artifact_prompt');
                          handleSend(currentArtifact.type as any);
                        }}
                        className="px-3 py-1 bg-secondary text-on-secondary font-label text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-secondary/80 transition-all shadow-sm flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">refresh</span> 重试
                      </button>
                    )}
                    <button
                      onClick={() => handleArchiveArtifact(currentArtifact)}
                      className={`px-3 py-1 bg-primary text-on-primary font-label text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-primary/80 transition-all shadow-sm ${(!currentArtifact.content || isExtracting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!currentArtifact.content || isExtracting}
                    >
                      存档
                    </button>

                    <button
                      onClick={() => {
                        setCurrentArtifact(null);
                        localStorage.removeItem('last_artifact_prompt');
                      }}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:bg-error hover:text-white transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                </div>

                <div key={currentArtifact.id}>
                  <ArtifactPreview artifact={currentArtifact} />
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              {pinnedArtifacts.map((art) => (
                <div 
                  key={art.id} 
                  className={`bg-surface-container-lowest p-6 rounded-[var(--radius-apple-2xl)] shadow-sm border border-outline-variant/10 border-l-4 ${art.color} relative group cursor-pointer hover:shadow-xl hover:border-primary/20 transition-all`}
                  onClick={() => setCurrentArtifact(art)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPinnedArtifacts(pinnedArtifacts.filter(a => a.id !== art.id));
                    }}
                    className="absolute top-2 right-2 material-symbols-outlined text-xs text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                  >
                    close
                  </button>
                  <span className="font-label text-[9px] tracking-widest text-primary font-bold uppercase block mb-2">{art.type}</span>
                  <h4 className="text-xs font-body font-bold mb-1">{art.title || (art.type === 'mind_map' ? '思维导图' : '知识闪卡')}</h4>
                  <p 
                    className="text-[11px] font-body text-on-surface mb-3 whitespace-pre-wrap line-clamp-6"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {art.content.startsWith('问：') && art.content.includes('\n\n答：') ? (
                      <>
                        <span className="font-bold text-primary/70">问：</span>
                        <span className="text-on-surface/80 italic">{art.content.split('\n\n答：')[0].replace('问：', '')}</span>
                        <br /><br />
                        <span className="font-bold text-on-surface/90">答：</span>
                        <span>{art.content.split('\n\n答：')[1]}</span>
                      </>
                    ) : art.content}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {art.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-surface-container text-[8px] font-label text-on-surface-variant uppercase tracking-tighter rounded-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-6 mt-4 border-t border-outline-variant/20">
              <button
                onClick={() => handleSend('mind_map')}
                className="w-full flex items-center justify-between p-3.5 bg-surface-container-highest/60 border border-outline-variant/20 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary opacity-70 group-hover:opacity-100 transition-opacity">account_tree</span>
                  <span className="font-label text-[10px] font-bold tracking-widest uppercase text-primary/80 group-hover:text-primary">生成思维导图</span>
                </div>
                <span className="material-symbols-outlined text-sm text-primary/40 group-hover:text-primary transition-colors">chevron_right</span>
              </button>
              <button
                onClick={() => handleSend('review_card')}
                className="w-full flex items-center justify-between p-3.5 bg-surface-container-highest/60 border border-outline-variant/20 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary opacity-70 group-hover:opacity-100 transition-opacity">school</span>
                  <span className="font-label text-[10px] font-bold tracking-widest uppercase text-primary/80 group-hover:text-primary">生成知识闪卡</span>
                </div>
                <span className="material-symbols-outlined text-sm text-primary/40 group-hover:text-primary transition-colors">auto_awesome</span>
              </button>
            </div>
          </div>

          <div className="mx-6 mb-8 p-6 bg-surface-container-lowest border border-outline/10 rounded-[var(--radius-apple-2xl)] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label text-[10px] uppercase text-on-surface-variant">档案覆盖率</span>
              <span className="font-label text-[10px] font-bold text-primary">
                {sources.length > 0 ? Math.round((selectedSources.length / sources.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${sources.length > 0 ? (selectedSources.length / sources.length) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="mt-4 text-[9px] font-label leading-relaxed text-on-surface-variant/70 italic uppercase tracking-widest">
              {selectedSources.length > 0
                ? `综合分析已激活：${selectedSources.length} 个主要来源。`
                : '请在左侧选择研究素材以激活智能分析'}
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  );
});

export default ChatView;
