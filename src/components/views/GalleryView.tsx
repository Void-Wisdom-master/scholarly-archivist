import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { ArchiveCard, Collection } from '../../types';
import { galleryApi } from '../../api';

const inkVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)', scale: 0.98 },
  visible: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 1.2, ease: "easeOut", staggerChildren: 0.1 }, willChange: "transform" }
};

const inkItemVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: 20 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.8, ease: "easeOut" }, willChange: "transform" }
};

interface GalleryViewProps {
  gallery: ArchiveCard[];
  library: Collection[];
  onDeleteCard: (id: string) => void;
  onDeleteAll: () => void;
  onNewGalleryItem: (item: ArchiveCard) => void;
  isZenMode: boolean;
}

const GalleryView: React.FC<GalleryViewProps> = React.memo(({ 
  gallery, 
  library,
  onDeleteCard, 
  onDeleteAll,
  onNewGalleryItem,
  isZenMode 
}) => {
  const [search, setSearch] = useState('');
  const [selectedNotebookFilter, setSelectedNotebookFilter] = useState<string>('ALL');
  const [selectedCard, setSelectedCard] = useState<ArchiveCard | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  
  // New Note Form State
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    notebookId: library[0]?.id || ''
  });

  const filteredCards = gallery.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase()) || 
           card.content.toLowerCase().includes(search.toLowerCase());
    const matchesNotebook = selectedNotebookFilter === 'ALL' || card.source === library.find(n => n.id === selectedNotebookFilter)?.title;
    return matchesSearch && matchesNotebook;
  });

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;

    const selectedNotebook = library.find(n => n.id === newNote.notebookId);
    
    const cardData: Omit<ArchiveCard, 'id'> = {
      title: newNote.title,
      content: newNote.content,
      category: '笔记汇报',
      categoryColor: 'bg-primary text-on-primary',
      date: new Date().toLocaleDateString('zh-CN'),
      source: selectedNotebook ? selectedNotebook.title : '个人笔记',
      icon: 'edit_note',
      actionIcon: 'bookmark'
    };

    try {
      const res = await galleryApi.create(cardData);
      onNewGalleryItem(res as unknown as ArchiveCard);
      setIsCreatingNote(false);
      setNewNote({ title: '', content: '', notebookId: library[0]?.id || '' });
    } catch (err) {
      console.error('Failed to save note:', err);
      // Fallback for guest
      const mockNote: ArchiveCard = { ...cardData, id: 'temp-' + Date.now() };
      onNewGalleryItem(mockNote);
      setIsCreatingNote(false);
      setNewNote({ title: '', content: '', notebookId: library[0]?.id || '' });
    }
  };

  const downloadMarkdown = (card: ArchiveCard) => {
    const markdown = `# ${card.title}\n\n**日期:** ${card.date}\n**分类:** ${card.category}\n**研究源:** ${card.source}\n\n---\n\n${card.content}\n\n---\n*由智史寻道文思阁生成*`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      variants={inkVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8 } }}
      className="h-full flex flex-col p-8 max-w-7xl mx-auto"
    >
      <motion.header 
        variants={inkItemVariants}
        className="w-full max-w-4xl mx-auto pt-6 pb-8"
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-xl group">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container/60 backdrop-blur-md border border-outline-variant/10 focus:border-primary/20 !outline-none transition-all duration-500 font-body py-5 pl-16 pr-8 text-base placeholder-text-placeholder/40 rounded-[var(--radius-apple-3xl)] shadow-sm focus:shadow-xl relative z-10"
                placeholder="在学术成果中搜寻..."
              />
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-500 z-20 text-2xl">search</span>
            </div>

            <div className="flex gap-4 items-center">
              <div className="bg-surface-container-high rounded-[var(--radius-apple-3xl)] p-1 border border-outline-variant/10 shadow-sm">
                <select 
                  value={selectedNotebookFilter}
                  onChange={(e) => setSelectedNotebookFilter(e.target.value)}
                  className="bg-transparent border-none outline-none px-6 py-2.5 text-sm font-label uppercase tracking-widest cursor-pointer"
                >
                  <option value="ALL">全部笔记本</option>
                  {library.map(nb => (
                    <option key={nb.id} value={nb.id}>{nb.title}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => setIsCreatingNote(true)}
                className="flex items-center gap-4 bg-primary text-on-primary px-8 py-4 rounded-[var(--radius-apple-3xl)] hover:bg-primary/95 transition-all duration-500 shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-2xl">edit</span>
                <span className="font-label text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap">撰写</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-6">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-primary/40 font-medium">
              研习手札 ({filteredCards.length} / {gallery.length})
            </span>
            {gallery.length > 0 && (
              <button 
                onClick={onDeleteAll}
                className="flex items-center gap-2 text-xs font-label text-outline hover:text-red-400 transition-all p-1 group/clear"
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
                <span className="uppercase tracking-[0.2em] font-medium">重置展厅</span>
              </button>
            )}
          </div>
        </div>
      </motion.header>

      <section className="flex-1 overflow-y-auto custom-scrollbar px-2 mb-12">
        {filteredCards.length === 0 ? (
          <motion.div variants={inkItemVariants} className="h-full flex flex-col items-center justify-center py-48 text-center space-y-6">
            <p className="font-headline text-3xl tracking-[0.15em] text-primary/30">山空无人，水流花开</p>
            <p className="font-body text-xs tracking-[0.4em] text-outline mt-4 font-light opacity-60 uppercase">在此开启属于您的研究记录</p>
          </motion.div>
        ) : (
          <motion.div variants={inkVariants} className="columns-1 md:columns-2 lg:columns-3 gap-10 space-y-10">
            {filteredCards.map((card) => (
              <motion.article
                variants={inkItemVariants}
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="break-inside-avoid bg-surface-container-lowest shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(44,62,80,0.12)] transition-all duration-700 relative group border border-outline-variant/10 hover:border-primary/20 overflow-hidden cursor-pointer rounded-[var(--radius-apple-3xl)]"
              >
                <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                    <span className="bg-primary/5 text-primary/60 px-3 py-1 rounded-[var(--radius-apple-xl)] text-[10px] font-body tracking-[0.1em] uppercase font-bold">
                      {card.source}
                    </span>
                    <span className="text-outline text-[10px] font-body tracking-widest opacity-60 font-light">{card.date}</span>
                  </div>
                  <h3 className="font-headline font-semibold text-2xl mb-6 leading-tight text-primary group-hover:translate-x-1 transition-transform duration-500">{card.title}</h3>
                  <p className="font-body font-light text-on-surface-variant leading-relaxed text-sm mb-10 line-clamp-6 opacity-80">
                    {card.content}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-outline-variant/10">
                    <div className="flex items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="material-symbols-outlined text-base text-primary/60">ink_pen</span>
                      <span className="text-[10px] font-label uppercase tracking-widest text-outline">研讯录</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCard(card.id);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-red-400 hover:bg-red-50 transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>

      {/* Note Creator Modal */}
      <AnimatePresence>
        {isCreatingNote && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              onClick={() => setIsCreatingNote(false)}
              className="absolute inset-0 bg-primary/10"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-2xl rounded-[var(--radius-apple-3xl)] overflow-hidden flex flex-col"
            >
              <form onSubmit={handleCreateNote}>
                <div className="flex justify-between items-center px-10 py-6 border-b border-outline/10">
                  <h3 className="font-headline text-xl text-primary italic">撰写研究笔记</h3>
                  <button type="button" onClick={() => setIsCreatingNote(false)} className="text-outline hover:text-error">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="p-10 space-y-6">
                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-3">关联笔记本</label>
                    <select 
                      value={newNote.notebookId}
                      onChange={(e) => setNewNote({...newNote, notebookId: e.target.value})}
                      className="w-full bg-white/40 backdrop-blur-sm !border-0 !outline-none rounded-xl p-4 text-sm font-body shadow-sm focus:shadow-md transition-all cursor-pointer"
                    >
                      {library.map(nb => (
                        <option key={nb.id} value={nb.id}>{nb.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] focus-within:shadow-[0_12px_45px_rgba(0,0,0,0.08)] transition-all duration-500">
                    <input 
                      autoFocus
                      placeholder="笔记标题..."
                      value={newNote.title}
                      onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                      className="w-full bg-transparent !border-0 !ring-0 text-2xl font-headline text-primary focus:!outline-none p-0 placeholder:opacity-30"
                    />
                  </div>

                  <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] focus-within:shadow-[0_12px_45px_rgba(0,0,0,0.08)] transition-all duration-500">
                    <textarea 
                      placeholder="在此记录您的灵光一现..."
                      rows={8}
                      value={newNote.content}
                      onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                      className="w-full bg-transparent !border-0 !ring-0 font-body text-base focus:!outline-none p-0 placeholder:opacity-30 resize-none custom-scrollbar"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-outline/10 bg-surface/50 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCreatingNote(false)}
                    className="px-6 py-2.5 rounded-full font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={!newNote.title || !newNote.content}
                    className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-label text-xs uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    存入手稿
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Note Detail Viewer */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              onClick={() => setSelectedCard(null)}
              className="absolute inset-0 bg-white/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 30 }}
              className="relative w-full max-w-3xl bg-surface-container-highest border border-outline/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] rounded-[var(--radius-apple-2xl)]"
            >
              <div className="flex justify-between items-center px-10 py-6 border-b border-outline/10">
                <div className="flex items-center gap-4">
                  <span className="text-primary text-[10px] uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                    {selectedCard.source}
                  </span>
                  <span className="text-outline text-xs">{selectedCard.date}</span>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined font-light">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar">
                <h2 className="font-headline font-light text-4xl text-primary mb-10 leading-tight">{selectedCard.title}</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="font-body font-light text-on-surface-variant leading-loose whitespace-pre-wrap">
                    {selectedCard.content}
                  </p>
                </div>

                <div className="mt-16 pt-8 border-t border-outline/10 flex justify-end">
                  <button
                    onClick={() => downloadMarkdown(selectedCard)}
                    className="flex items-center gap-3 bg-white border border-outline/20 text-primary px-8 py-4 rounded-full hover:bg-surface/50 transition-all shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span className="font-body text-[10px] tracking-widest uppercase">保存古卷 (MD)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default GalleryView;