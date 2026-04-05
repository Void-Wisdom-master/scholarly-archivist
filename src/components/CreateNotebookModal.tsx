import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitialize: (title: string, desc: string) => void;
}

const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({ isOpen, onClose, onInitialize }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleInit = () => {
    if (!title.trim()) return;
    onInitialize(title, desc);
    setTitle('');
    setDesc('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-on-surface/10 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-surface p-12 rounded-[var(--radius-apple-3xl)] shadow-2xl max-w-lg w-full border border-outline-variant/10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
            <h3 className="font-headline text-3xl font-light text-primary mb-8 flex items-center gap-4 italic">
              <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
              初始化新笔记
            </h3>
            <div className="space-y-8">
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-3">研究课题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container/60 border border-outline-variant/10 p-5 rounded-[var(--radius-apple-xl)] text-base font-body focus:ring-1 focus:ring-primary shadow-sm !outline-none transition-all duration-300"
                  placeholder="例如：启蒙运动研究..."
                />
              </div>
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-3">研究纲轴 (描述)</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-surface-container/60 border border-outline-variant/10 p-5 rounded-[var(--radius-apple-xl)] text-base font-body focus:ring-1 focus:ring-primary h-40 shadow-sm resize-none !outline-none transition-all duration-300 custom-scrollbar"
                  placeholder="简要描述研究范围、核心论点及探究目标..."
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={onClose} 
                  className="flex-1 py-4 border border-outline-variant/20 text-outline font-label text-xs uppercase tracking-widest hover:bg-surface-container transition-all rounded-[var(--radius-apple-xl)]"
                >
                  取消
                </button>
                <button 
                  onClick={handleInit} 
                  className="flex-1 py-4 bg-primary text-on-primary font-label text-xs uppercase tracking-[0.2em] font-bold shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all hover:-translate-y-0.5 rounded-[var(--radius-apple-xl)] disabled:opacity-50"
                  disabled={!title.trim()}
                >
                  确认初始化
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateNotebookModal;
