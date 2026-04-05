import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-on-surface/20 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-surface p-12 rounded-[var(--radius-apple-3xl)] shadow-2xl max-w-2xl w-full border border-outline-variant/10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
            <h3 className="font-headline text-3xl font-light text-primary mb-10 flex items-center gap-4 italic text-center justify-center">
              <span className="material-symbols-outlined text-3xl">help_center</span>
              寻道指南
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar">
              <div className="space-y-4 p-8 bg-surface-container-low rounded-[var(--radius-apple-2xl)] border border-outline-variant/5">
                <h4 className="font-headline text-lg font-medium text-primary flex items-center gap-2">
                   <span className="material-symbols-outlined text-base">auto_stories</span>
                   大图书馆
                </h4>
                <p className="text-sm text-on-surface-variant/80 leading-relaxed font-body font-light">
                  管理您的研究计划。在此处初始化、分类和归档您的笔记本。每个笔记本都是一个独立的历史探究课题。
                </p>
              </div>
              <div className="space-y-4 p-8 bg-surface-container-low rounded-[var(--radius-apple-2xl)] border border-outline-variant/5">
                <h4 className="font-headline text-lg font-medium text-primary flex items-center gap-2">
                   <span className="material-symbols-outlined text-base">gallery_thumbnail</span>
                   文思阁
                </h4>
                <p className="text-sm text-on-surface-variant/80 leading-relaxed font-body font-light">
                  在此查阅从研究中生成的“历史闪念”卡片。灵光随笔、复习卡片和探究报告均会以此形式存档。
                </p>
              </div>
              <div className="space-y-4 p-8 bg-surface-container-low rounded-[var(--radius-apple-2xl)] border border-outline-variant/5">
                <h4 className="font-headline text-lg font-medium text-primary flex items-center gap-2">
                   <span className="material-symbols-outlined text-base">chat</span>
                   敏学好问
                </h4>
                <p className="text-sm text-on-surface-variant/80 leading-relaxed font-body font-light">
                  与您的研究助理（AI）进行深度学术对话。系统会根据当前笔记本的背景提供浸润式的知识问答环境。
                </p>
              </div>
              <div className="space-y-4 p-8 bg-surface-container-low rounded-[var(--radius-apple-2xl)] border border-outline-variant/5">
                <h4 className="font-headline text-lg font-medium text-primary flex items-center gap-2">
                   <span className="material-symbols-outlined text-base">spa</span>
                   专注模式
                </h4>
                <p className="text-sm text-on-surface-variant/80 leading-relaxed font-body font-light">
                  开启后，系统将隐藏所有非必要的 UI 元素，让您可以全身心投入到学术典籍的阅读与探究中。
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="font-label text-xs tracking-[0.3em] uppercase bg-primary text-on-primary px-10 py-4 rounded-[var(--radius-apple-xl)] hover:bg-primary/95 transition-all active:scale-95 shadow-xl shadow-primary/20"
              >
                领会
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;
