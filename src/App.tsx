/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';

// --- Modules ---
import LeftSidebar from './components/LeftSidebar';
import LibraryView from './components/views/LibraryView';
import GalleryView from './components/views/GalleryView';
import ChatView from './components/views/ChatView';
import CreateNotebookModal from './components/CreateNotebookModal';
import LoginView from './components/LoginView';
import HelpModal from './components/HelpModal';
import SettingsModal from './components/SettingsModal';

import { MOCK_DATA } from './constants';
import { Collection, ArchiveCard, Artifact, View } from './types';
import { notebookApi, galleryApi, artifactApi, authApi, type User } from './api';

export default function App() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('scholarly_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('scholarly_dark_mode') === 'true';
  });

  const [isZenMode, setIsZenMode] = useState(false);

  const [activeView, setActiveView] = useState<View>('LIBRARY');
  const [activeNotebookId, setActiveNotebookId] = useState<string | undefined>();
  const [isSidebarFixed, setIsSidebarFixed] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const [library, setLibrary] = useState<Collection[]>([]);
  const [gallery, setGallery] = useState<ArchiveCard[]>([]);
  const [pinnedArtifacts, setPinnedArtifacts] = useState<Artifact[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Sync state with route for Navbar compatibility
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/library') setActiveView('LIBRARY');
    else if (location.pathname === '/gallery') setActiveView('GALLERY');
    else if (location.pathname.startsWith('/chat')) {
      const parts = location.pathname.split('/');
      if (parts[2]) {
        setActiveNotebookId(parts[2]);
        setActiveView('CHAT');
      }
    }
  }, [location.pathname]);

  // Theme Sync
  useEffect(() => {
    localStorage.setItem('scholarly_dark_mode', isDarkMode.toString());
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Data Fetching
  useEffect(() => {
    if (!user) return; // Wait until authenticated
    const initData = async () => {
      if (user.id === 'guest') {
        console.log('Guest mode: using local/mock fallback');
        const savedLib = localStorage.getItem('scholarly_library');
        const savedGal = localStorage.getItem('scholarly_gallery');
        const savedArt = localStorage.getItem('scholarly_artifacts');

        setLibrary(savedLib ? JSON.parse(savedLib) : MOCK_DATA.library);
        setGallery(savedGal ? JSON.parse(savedGal) : MOCK_DATA.gallery);
        setPinnedArtifacts(savedArt ? JSON.parse(savedArt) : MOCK_DATA.initialArtifacts);
        return;
      }

      try {
        const [lib, gal, art] = await Promise.all([
          notebookApi.getAll(),
          galleryApi.getAll(),
          artifactApi.getAll()
        ]);
        setLibrary(lib);
        setGallery(gal);
        setPinnedArtifacts(art);
      } catch (err) {
        console.warn('API connection failed, using local/mock fallback');
        const savedLib = localStorage.getItem('scholarly_library');
        const savedGal = localStorage.getItem('scholarly_gallery');
        const savedArt = localStorage.getItem('scholarly_artifacts');

        setLibrary(savedLib ? JSON.parse(savedLib) : MOCK_DATA.library);
        setGallery(savedGal ? JSON.parse(savedGal) : MOCK_DATA.gallery);
        setPinnedArtifacts(savedArt ? JSON.parse(savedArt) : MOCK_DATA.initialArtifacts);
      }
    };
    initData();
  }, [user]);

  // Persist State to LocalStorage (Fallback for offline/guest)
  useEffect(() => {
    localStorage.setItem('scholarly_library', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('scholarly_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('scholarly_artifacts', JSON.stringify(pinnedArtifacts));
  }, [pinnedArtifacts]);

  const handleCreateNotebook = async (title: string, description: string) => {
    try {
      const newNb = await notebookApi.create({ title, description });
      setLibrary([newNb as unknown as Collection, ...library]);
    } catch (err) {
      // Guest mode fallback
      const guestNb: Collection = {
        id: crypto.randomUUID(),
        collectionNum: (library.length + 1).toString().padStart(3, '0'),
        title,
        description,
        sourceCount: 0,
        lastUpdated: '刚刚',
        icon: 'auto_stories'
      };
      setLibrary([guestNb, ...library]);
    }
    setIsModalOpen(false);
  };

  const handleToggleFinish = async (id: string) => {
    try {
      await notebookApi.toggleFinish(id);
      setLibrary(prev => prev.map(item => item.id === id ? { ...item, isFinished: !item.isFinished } : item));
    } catch (err) {
      setLibrary(prev => prev.map(item => item.id === id ? { ...item, isFinished: !item.isFinished } : item));
    }
  };

  const handleDeleteNotebook = async (id: string) => {
    if (!confirm('确定要删除此笔记本吗？相关素材和历史也将被清除。')) return;
    try {
      await notebookApi.delete(id);
      setLibrary(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      setLibrary(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleLogout = () => { localStorage.removeItem('scholarly_token'); localStorage.removeItem('scholarly_user'); window.location.reload(); };

  if (!user) {
    return (
      <LoginView
        onLogin={async (u, p) => {
          try {
            const data = await authApi.login({ username: u, password: p });
            localStorage.setItem('scholarly_token', data.session.access_token);
            localStorage.setItem('scholarly_user', JSON.stringify({ id: data.data.id, username: data.data.username }));
            setUser({ id: data.data.id, username: data.data.username });
          } catch (e: any) { alert(e.message); }
        }}
        onRegister={async (u, p) => {
          try {
            const data = await authApi.register({ username: u, password: p });
            localStorage.setItem('scholarly_token', '');
            localStorage.setItem('scholarly_user', JSON.stringify({ id: data.data.id, username: data.data.username }));
            setUser({ id: data.data.id, username: data.data.username });
          } catch (e: any) { alert(e.message); }
        }}
        onGuest={() => {
          const guestUser = { id: 'guest', username: '访客' };
          localStorage.setItem('scholarly_user', JSON.stringify(guestUser));
          setUser(guestUser);
        }}
      />
    );
  }

  return (
    <div className="flex flex-row h-screen bg-transparent selection:bg-primary/10 overflow-hidden">
      <LeftSidebar
        username={user?.username}
        onLogout={handleLogout}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isFixed={isSidebarFixed}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        isZenMode={isZenMode}
        activeView={activeView}
        setActiveView={(view) => {
          if (view === 'LIBRARY') navigate('/library');
          else if (view === 'GALLERY') navigate('/gallery');
          else if (view === 'CHAT') {
            const lastId = localStorage.getItem('scholarly_active_notebook');
            if (lastId) navigate(`/chat/${lastId}`);
            else navigate('/library');
          }
          setActiveView(view);
        }}
      />

      <main className={`flex-1 overflow-hidden relative flex flex-col transition-all duration-300 ${!isSidebarFixed ? 'ml-20' : ''}`}>
        <AnimatePresence mode="wait">
          {activeView === 'LIBRARY' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <LibraryView
                library={library}
                onOpenModal={() => setIsModalOpen(true)}
                onToggleFinish={handleToggleFinish}
                onDeleteNotebook={handleDeleteNotebook}
                isZenMode={isZenMode}
                onOpenNotebook={(notebookId) => {
                  setActiveNotebookId(notebookId);
                  setActiveView('CHAT');
                }}
              />
            </motion.div>
          )}
          {activeView === 'GALLERY' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <GalleryView
                gallery={gallery}
                library={library}
                onDeleteCard={(id) => setGallery(gallery.filter(g => g.id !== id))}
                onDeleteAll={() => setGallery([])}
                onNewGalleryItem={(item) => setGallery([item, ...gallery])}
                isZenMode={isZenMode}
              />
            </motion.div>
          )}
          {activeView === 'CHAT' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <ChatView
                user={user}
                library={library}
                pinnedArtifacts={pinnedArtifacts}
                setPinnedArtifacts={setPinnedArtifacts}
                onNewGalleryItem={(item) => setGallery([item, ...gallery])}
                setGallery={setGallery}
                notebookId={activeNotebookId}
                onBackToLibrary={() => setActiveView('LIBRARY')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CreateNotebookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInitialize={handleCreateNotebook}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(!isZenMode)}
        isFixed={isSidebarFixed}
        onToggleFixed={() => setIsSidebarFixed(!isSidebarFixed)}
      />
    </div>
  );
}
