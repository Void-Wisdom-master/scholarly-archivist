import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';

interface LeftSidebarProps {
  onLogout: () => void;
  username?: string;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  isFixed: boolean;
  isExpanded: boolean;
  setIsExpanded: (b: boolean) => void;
  isZenMode: boolean;
  activeView: View;
  setActiveView: (view: View) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = React.memo(({
  onLogout,
  username,
  onOpenHelp,
  onOpenSettings,
  isFixed,
  isExpanded,
  setIsExpanded,
  isZenMode,
  activeView,
  setActiveView
}) => {
  if (isZenMode) return null;

  return (
    <motion.nav
      onMouseEnter={() => !isFixed && setIsExpanded(true)}
      onMouseLeave={() => !isFixed && setIsExpanded(false)}
      initial={false}
      animate={{
        width: isFixed || isExpanded ? 280 : 80,
        x: 0,
        position: isFixed ? 'relative' : 'fixed',
        zIndex: 50
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className={`h-screen bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-8 shadow-2xl overflow-hidden`}
    >
      <div className="px-6 mb-12 flex items-center gap-4 h-10">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-on-primary">history_edu</span>
        </div>
        <AnimatePresence mode="wait">
          {(isFixed || isExpanded) && (
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-headline text-xl italic tracking-tight text-primary whitespace-nowrap overflow-hidden"
            >
              研史明智
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 px-4 space-y-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`
                w-full flex items-center h-12 gap-4 px-4 rounded-2xl transition-all group relative overflow-hidden
                ${isActive ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}
              `}
            >
              <span className={`material-symbols-outlined flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-on-primary' : 'text-outline/70 group-hover:text-primary'}`}>{item.icon}</span>
              <AnimatePresence mode="wait">
                {(isFixed || isExpanded) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-label text-xs uppercase tracking-[0.2em] font-bold whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1.5 h-6 bg-secondary rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-auto space-y-2">
        <button
          onClick={onOpenHelp}
          className="w-full flex items-center h-11 gap-4 px-4 rounded-2xl text-on-surface-variant hover:bg-surface-container-high transition-all group overflow-hidden"
        >
          <span className="material-symbols-outlined flex-shrink-0 text-outline/70 group-hover:text-primary transition-colors">help</span>
          {(isFixed || isExpanded) && (
            <span className="font-label text-xs uppercase tracking-widest whitespace-nowrap">寻道指南</span>
          )}
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center h-11 gap-4 px-4 rounded-2xl text-on-surface-variant hover:bg-surface-container-high transition-all group overflow-hidden"
        >
          <span className="material-symbols-outlined flex-shrink-0 text-outline/70 group-hover:text-primary transition-colors">settings</span>
          {(isFixed || isExpanded) && (
            <span className="font-label text-xs uppercase tracking-widest whitespace-nowrap">系统偏好</span>
          )}
        </button>

        <div className="pt-4 mt-2 border-t border-outline/10 px-2 flex items-center gap-4 overflow-hidden h-14">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
          </div>
          {(isFixed || isExpanded) && (
            <div className="flex-1 min-w-0">
              <p className="font-headline text-sm font-bold truncate text-primary">{username || '研究员'}</p>
              <button
                onClick={onLogout}
                className="text-[10px] font-label uppercase tracking-widest text-outline hover:text-primary transition-colors whitespace-nowrap"
              >
                退出档案库
              </button>
            </div>
          )}
        </div>

        {/* Integrated Footer in Sidebar */}
        {(isFixed || isExpanded) && (
          <div className="pt-4 pb-2 px-2 opacity-30 text-[8px] font-label uppercase tracking-[0.15em] leading-relaxed select-none">
            <div className="italic mb-1">问道无涯</div>
          </div>
        )}
      </div>
    </motion.nav>
  );
});

export default LeftSidebar;