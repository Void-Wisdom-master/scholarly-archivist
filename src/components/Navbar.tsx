import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveView = () => {
    if (location.pathname.startsWith('/chat')) return 'CHAT';
    if (location.pathname === '/gallery') return 'GALLERY';
    return 'LIBRARY';
  };

  const currentView = getActiveView();

  return (
    <nav className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center h-20">
        <div className="flex items-center gap-10 cursor-pointer h-full" onClick={() => navigate('/library')}>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-[var(--radius-apple-xl)] shadow-lg shadow-primary/20 transition-transform active:scale-95 group-hover:-rotate-3 duration-500">
              <span className="material-symbols-outlined text-on-primary text-3xl">history_edu</span>
            </div>
            <span className="text-2xl font-headline font-bold text-primary tracking-tight whitespace-nowrap">智史寻道</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-12 ml-6">
            {[
              { id: 'LIBRARY', label: '大图书馆', path: '/library' },
              { id: 'GALLERY', label: '文思阁', path: '/gallery' },
              { id: 'CHAT', label: '敏学好问', path: '/chat' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.id === 'CHAT') {
                    const lastId = localStorage.getItem('scholarly_active_notebook');
                    if (lastId) navigate(`/chat/${lastId}`);
                    else navigate('/library');
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`font-label text-xs uppercase tracking-[0.25em] transition-all py-2 relative group items-center flex gap-3 ${
                  currentView === item.id
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant/60 hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                   {item.id === 'LIBRARY' && <span className="material-symbols-outlined text-base">local_library</span>}
                   {item.id === 'GALLERY' && <span className="material-symbols-outlined text-base">gallery_thumbnail</span>}
                   {item.id === 'CHAT' && <span className="material-symbols-outlined text-base">chat</span>}
                   {item.label}
                </div>
                {currentView === item.id && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary/30 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="w-11 h-11 rounded-full border border-outline/20 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all shadow-sm active:scale-95 duration-300">
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
