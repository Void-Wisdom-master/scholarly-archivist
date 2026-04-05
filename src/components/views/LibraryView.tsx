import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Collection } from '../../types';

const inkVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)', scale: 0.98 },
  visible: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 1.2, ease: "easeOut", staggerChildren: 0.1 }, willChange: "transform" }
};

const inkItemVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: 20 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.8, ease: "easeOut" }, willChange: "transform" }
};

interface LibraryViewProps {
  library: Collection[];
  onOpenModal: () => void;
  onToggleFinish: (id: string) => void;
  onDeleteNotebook: (id: string) => void;
  isZenMode: boolean;
  onOpenNotebook: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = React.memo(({ 
  library, 
  onOpenModal, 
  onToggleFinish, 
  onDeleteNotebook, 
  isZenMode,
  onOpenNotebook
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ARCHIVED'>('ALL');

  const filteredLibrary = library.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' ? !item.isFinished : item.isFinished;
    return matchesSearch && matchesTab;
  });

  return (
    <motion.div
      variants={inkVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8 } }}
      className="max-w-7xl mx-auto px-8 py-16"
    >
      <AnimatePresence>
        {!isZenMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-6 items-center justify-start">
              <motion.div variants={inkItemVariants} className="relative flex-1 max-w-lg group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="在您的学术档案库中寻找..."
                  className="w-full bg-surface-container/60 backdrop-blur-md border border-outline-variant/10 !outline-none rounded-[var(--radius-apple-3xl)] py-5 pl-16 pr-6 text-base font-body shadow-sm focus:shadow-xl focus:border-primary/20 transition-all duration-500"
                />
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors text-2xl">search</span>
              </motion.div>
              <div className="flex gap-4">
                <motion.div variants={inkItemVariants} className="flex bg-surface-container-high rounded-[var(--radius-apple-3xl)] p-1 border border-outline-variant/10">
                  <select className="bg-transparent border-none outline-none px-6 py-2 font-label text-xs uppercase tracking-widest cursor-pointer">
                    <option>全部笔记本</option>
                    <option>最近更新</option>
                    <option>按字母序</option>
                  </select>
                </motion.div>
                <motion.button
                  variants={inkItemVariants}
                  onClick={onOpenModal}
                  className="group flex items-center gap-4 bg-primary text-on-primary px-8 py-4 rounded-[var(--radius-apple-3xl)] hover:bg-primary/95 transition-all duration-500 shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap will-change-transform"
                >
                  <span className="material-symbols-outlined text-2xl">edit</span>
                  <span className="font-label text-sm font-bold tracking-[0.2em] uppercase">写笔记本</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={inkItemVariants} className="mb-16 flex items-center border-b border-outline-variant/10 pb-6">
        <div className="flex gap-12 text-sm font-label uppercase tracking-[0.3em] font-medium opacity-60">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`transition-all duration-500 pb-6 -mb-[26px] relative flex items-center gap-2 ${activeTab === 'ALL' ? 'text-primary opacity-100' : 'hover:opacity-100 hover:text-primary'}`}
          >
            <span>全部研究</span>
            <span className="text-[10px] opacity-40">({library.filter(l => !l.isFinished).length})</span>
            {activeTab === 'ALL' && <motion.div layoutId="libTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('ARCHIVED')}
            className={`transition-all duration-500 pb-6 -mb-[26px] relative flex items-center gap-2 ${activeTab === 'ARCHIVED' ? 'text-primary opacity-100' : 'hover:opacity-100 hover:text-primary'}`}
          >
            <span>已归档</span>
            <span className="text-[10px] opacity-40">({library.filter(l => l.isFinished).length})</span>
            {activeTab === 'ARCHIVED' && <motion.div layoutId="libTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
          </button>
        </div>
      </motion.div>

      <motion.div variants={inkVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredLibrary.map((item) => (
          <motion.div
            variants={inkItemVariants}
            key={item.id}
            onClick={() => onOpenNotebook(item.id)}
            className="group relative bg-surface-container-lowest p-10 border border-outline-variant/10 hover:border-primary/20 shadow-sm hover:shadow-[0_20px_60px_-20px_rgba(44,62,80,0.15)] hover:-translate-y-1.5 transition-all duration-700 flex flex-col min-h-[400px] cursor-pointer rounded-[var(--radius-apple-3xl)] overflow-hidden will-change-transform"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary to-secondary/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-10 flex justify-between items-start">
                <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors duration-500">
                   <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-2xl">auto_stories</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFinish(item.id);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${item.isFinished ? 'bg-primary/10 text-primary' : 'bg-surface-container-high/50 text-outline hover:text-primary hover:bg-primary/5'}`}
                    title={item.isFinished ? "标记为进行中" : "标记为完结"}
                  >
                    <span className="material-symbols-outlined text-base">{item.isFinished ? 'check_circle' : 'task_alt'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotebook(item.id);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high/50 text-outline hover:text-red-400 hover:bg-red-50 transition-all duration-300"
                    title="删除笔记本"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
              <h3 className="font-headline font-semibold text-2xl text-primary mb-4 leading-tight tracking-[0.05em]">{item.title}</h3>
              <p className="text-on-surface-variant text-sm line-clamp-3 mb-8 leading-relaxed font-body font-light opacity-80">{item.description}</p>

              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-2 text-primary/60">
                   <span className="material-symbols-outlined text-sm">calendar_month</span>
                   <span className="font-label text-[10px] uppercase tracking-widest">创建于 {item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN') : item.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2 text-primary/60">
                   <span className="material-symbols-outlined text-sm">update</span>
                   <span className="font-label text-[10px] uppercase tracking-widest">最后更新 {item.lastUpdated}</span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-label text-[10px] text-primary/40 uppercase tracking-[0.2em]">学术素材</span>
                  <span className="font-body text-base font-bold text-primary/80">{item.sourceCount} 项档案</span>
                </div>
                <div className="px-3 py-1 bg-primary/5 rounded-full">
                   <span className="font-body text-[10px] font-bold text-primary italic uppercase tracking-widest">NO.{item.collectionNum}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {activeTab === 'ALL' && (
          <motion.button
            variants={inkItemVariants}
            whileHover={{ scale: 1.01 }}
            onClick={onOpenModal}
            className="group relative bg-surface-container-low/40 border-2 border-dashed border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-high/60 transition-all duration-700 flex flex-col items-center justify-center p-12 space-y-6 rounded-[var(--radius-apple-3xl)] min-h-[400px] overflow-hidden group shadow-inner"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="font-headline text-2xl font-medium text-primary/30 group-hover:text-primary/60 transition-colors tracking-[0.1em]">山空无人，水流花开</span>
              <span className="font-label text-[11px] tracking-[0.5em] text-outline/50 uppercase group-hover:text-primary/40 transition-colors">在此开启属于您的研究记录</span>
            </div>
          </motion.button>
        )}
      </motion.div>

    </motion.div>
  );
});

export default LibraryView;
