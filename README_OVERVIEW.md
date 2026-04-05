# 稽古研史，智启新思 | Scholarly Archivist 📜

> **“黛蓝如墨，素纸留白；智启古今，史熠新思。”**

这是一个专为学者和研究人员设计的高端学术引擎。它结合了最前沿的人工智能技术与中式传统美学，旨在通过 Agent 协作与 RAG（检索增强生成）策略，重塑历史研究与知识归档的体验。

---

## 🌟 产品说明 (Product Description)

### 1. 核心愿景
本项目旨在打造一个“懂历史、重逻辑”的智能学术助手。它不仅是一个笔记工具，更是一个具备深度推理能力的知识协作平台。

### 2. 功能模块
*   **📚 笔记本 (Library/Notebooks)**：系统化管理研究主题，支持任务进度追踪（已完成/研究中）。
*   **🖼️ 珍藏馆 (Gallery/Museum)**：数字化归档珍贵史料、图片及 AI 生成的各种 Artifacts（卡片式管理）。
*   **📂 史料库 (Sources)**：支持 PDF 智能解析，自动提取关键信息并建立领域知识索引。
*   **💬 智能研讨 (Chat with Smart Router)**：内置智能路由，可根据问题深度自动选择模型或调用 RAG 策略进行深度解析。
*   **💡 Artifact 系统**：支持代码、代码片段、Mermaid 流程图、Markdown 报表的即时生成与预览。

### 3. 设计美学 (Neo-Chinese Aesthetics)
*   **视觉风格**：黛蓝 (#2C3E50) 与 宣纸色 (#F9F6F1) 的完美融合。
*   **交互体验**：基于毛玻璃效果 (Glassmorphism) 与 丝滑动画 (Framer Motion) 的现代 UI。
*   **书卷气**：采用 Google Fonts 精选字体，兼具传统学术的厚重感与互联网产品的简洁性。

---

## 🛠️ 全技术栈 (Full Technical Stack)

### **Frontend | 前端端**
- **Core**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) (极致灵活性)
- **Animation**: [Motion (Framer Motion)](https://framer.com/motion)
- **Icons**: Lucide React
- **Visualization**: Mermaid.js (流程图与关系图)
- **Markdown**: React Markdown

### **Backend | 后端**
- **Runtime**: Node.js
- **Framework**: [Koa2](https://koajs.com/) (极简、高性能)
- **Routing**: @koa/router
- **File Upload**: Koa Multer
- **Parser**: pdf-parse (PDF 数据提取)

### **AI & Data | 智能与数据**
- **LLM**: Google Gemini (@google/genai), OpenAI API
- **RAG**: 基于智能向量检索的增强策略
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Caching**: LocalStorage (支持访客模式下的状态持久化)

---

## 🚀 快速开始 (Quick Start)

### 环境依赖
- Node.js (推荐 v18+)
- npm / pnpm

### 安装步骤
1. **克隆并安装依赖**
   ```bash
   npm install
   ```

2. **环境变量配置**
   在根目录创建 `.env` 文件并填入：
   ```env
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **启动开发服务器**
   ```bash
   # 同时启动前端与 Koa 后端
   npm run dev:all
   ```

---

## 📅 项目路线图
- [x] 基于 React 19 的新中式 UI 构建
- [x] 集成 Google Gemini Pro 智能路由
- [x] 多模块数据持久化 (Supabase)
- [ ] 增强型长文本 RAG 解析引擎
- [ ] 知识图谱 (Knowledge Graph) 可视化

---

© 2026 研史明智项目组. 保留所有权利。
