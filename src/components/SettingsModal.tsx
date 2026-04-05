import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isFixed: boolean;
  onToggleFixed: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  isZenMode,
  onToggleZenMode,
  isFixed,
  onToggleFixed
}) => {
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
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20"></div>
            <h3 className="font-headline text-3xl font-light text-primary mb-12 flex items-center gap-4 italic justify-center text-center">
              <span className="material-symbols-outlined text-3xl">settings</span>
              系统偏好设置
            </h3>

            <div className="space-y-12">
              <div className="flex items-center justify-between group">
                <div>
                  <h4 className="font-headline text-xl text-primary group-hover:text-primary transition-colors">暗色模式</h4>
                  <p className="text-xs text-on-surface-variant/70 font-body mt-2">深色视觉体验，适合夜间研究</p>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className={`w-16 h-8 rounded-full transition-all duration-500 relative ${isDarkMode ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high'}`}
                >
                  <motion.div
                    animate={{ x: isDarkMode ? 36 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between group">
                <div>
                  <h4 className="font-headline text-xl text-primary group-hover:text-primary transition-colors">专注模式</h4>
                  <p className="text-xs text-on-surface-variant/70 font-body mt-2">隐藏非核心 UI，享受沉浸式研读</p>
                </div>
                <button
                  onClick={onToggleZenMode}
                  className={`w-16 h-8 rounded-full transition-all duration-500 relative ${isZenMode ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high'}`}
                >
                  <motion.div
                    animate={{ x: isZenMode ? 36 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between group">
                <div>
                  <h4 className="font-headline text-xl text-primary group-hover:text-primary transition-colors">固定导航</h4>
                  <p className="text-xs text-on-surface-variant/70 font-body mt-2">固定侧边栏，不随鼠标悬浮自动收起</p>
                </div>
                <button
                  onClick={onToggleFixed}
                  className={`w-16 h-8 rounded-full transition-all duration-500 relative ${isFixed ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high'}`}
                >
                  <motion.div
                    animate={{ x: isFixed ? 36 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
            </div>

            <div className="mt-14 pt-8 border-t border-outline-variant/10 flex justify-end">
              <button
                onClick={onClose}
                className="font-label text-xs tracking-[0.3em] uppercase bg-surface-container-high text-on-surface-variant hover:text-primary px-10 py-4 rounded-[var(--radius-apple-xl)] transition-all shadow-sm active:scale-95"
              >
                完成
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
