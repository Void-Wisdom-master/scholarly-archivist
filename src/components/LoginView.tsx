import React, { useState } from 'react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onLogin: (username: string, pass: string) => void;
  onRegister: (username: string, pass: string) => void;
  onGuest: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister, onGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) onLogin(username, password);
    else onRegister(username, password);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface py-16 px-4 relative overflow-y-auto">
      {/* 墨水质感轻微晕染 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(44,62,80,0.04),transparent)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Title Header above Card */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center z-10"
      >
        <h1 className="font-headline text-5xl md:text-6xl font-light text-primary tracking-wide italic drop-shadow-sm">研史明智</h1>
        <p className="mt-4 text-xs font-label text-primary/40 tracking-[0.4em] uppercase">学术引擎 · 敬畏历史</p>
      </motion.header>

      {/* Login Card - Glassmorphism UI */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[340px] p-8 bg-surface-container-lowest/40 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_8px_32px_rgba(44,62,80,0.08)] relative z-10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-body font-normal text-primary/80 ml-1 tracking-wider">研究员账号</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/80 border border-outline-variant/60 p-4 rounded-xl text-sm font-body focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder-primary/30"
              placeholder="输入您的账号名"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-body font-normal text-primary/80 ml-1 tracking-wider">访问权限密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/80 border border-outline-variant/60 p-4 rounded-xl text-sm font-body focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder-primary/30"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-2 bg-primary text-on-primary rounded-xl font-label text-sm uppercase tracking-[0.2em] font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {isLogin ? '开启档案库' : '申请加入'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[11px] font-body text-primary/60 hover:text-primary transition-colors tracking-wider underline-offset-4 hover:underline"
          >
            {isLogin ? '没有账号？申请加入' : '已有身份？立即归档'}
          </button>

          <div className="w-full flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-primary/[0.05]"></div>
            <span className="text-[9px] font-label text-primary/30 uppercase tracking-[0.2em]">或者</span>
            <div className="h-px flex-1 bg-primary/[0.05]"></div>
          </div>

          <button
            onClick={onGuest}
            className="text-[11px] font-body text-primary/40 hover:text-primary transition-all tracking-wider underline-offset-4 hover:underline"
          >
            访客身份查阅
          </button>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-8 text-center w-full z-10 pointer-events-none"
      >
        <p className="text-[10px] font-body text-primary/30 tracking-widest uppercase">Scholarly Archivist</p>
      </motion.div>
    </div>
  );
};

export default LoginView;
