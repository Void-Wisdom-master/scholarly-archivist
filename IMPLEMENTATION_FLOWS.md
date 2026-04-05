# 稽古研史，智启新思 | 模块实现流程详细文档
# Implementation Flows & Logic Decomposition

本指南旨在详细描述“稽古研史，智启新思”各核心模块的逻辑实现。文档采用**步骤化描述**，便于直接转化为 Mermaid 或 PlantUML 等流程图。

---

## 1. 用户认证与会话管理 (Authentication & Session)
**场景**：用户访问应用、登录、切换访客模式。

1.  **[启动]** 应用初始化 (`App.tsx`)。
2.  **[检查]** 从 `localStorage` 读取 `scholarly_user` 机密。
3.  **[分支: 已有用户]**
    - 状态机：`setUser(JSON.parse(savedUser))`。
    - 鉴权：在后续 API 请求的 Header 中注入 `Authorization: Bearer <token>`。
4.  **[分支: 无用户]**
    - 渲染：显示 `LoginView` (黛蓝美学毛玻璃界面)。
    - **[决策: 操作类型]**
        - **注册/登录**：调用 `authApi.login/register` -> Supabase Auth 返回 Session -> 持久化到 `localStorage` -> `window.location.reload()`。
        - **访客模式**：调用 `onGuest()` -> `setUser({ id: 'guest', username: '访客' })` -> 持久化 -> 进入主界面。
5.  **[结束]** 主界面渲染，侧边栏载入用户信息。

---

## 2. 笔记本研究生命周期 (Notebook Research Lifecycle)
**场景**：用户在“藏经阁”创建、管理研究项目。

1.  **[动作]** 点击“新建笔记本”按钮。
2.  **[输入]** 用户输入《标题》与《研究初衷》。
3.  **[调用]** `notebookApi.create({ title, description })`。
4.  **[后端逻辑]** (`notebookService.js`)
    - **计数**：统计数据库中当前笔记本总数。
    - **格式化**：生成 `collection_num` (如 `004`)。
    - **入库**：在 `notebooks` 表插入记录，初始化 `source_count = 0`。
5.  **[反馈]** 前端 `setLibrary([newNb, ...library])` 实时更新 UI。
6.  **[状态更新]** 如果点击“归档”，调用 `notebookApi.toggleFinish(id)` -> 状态取反 -> `last_updated` 刷新为当前日期。

---

## 3. 史料归档与 RAG 预处理 (Source Archiving & RAG Pipeline)
**场景**：上传 PDF 或 Markdown 史料。

1.  **[上传]** 用户在“源头活水”面板选择文件。
2.  **[前端预处理]** 识别后缀 (PDF/MD/TXT) 并指定图标与类型。
3.  **[API 调用]** 发送 `FormData` 到 `/api/sources`。
4.  **[后端处理]** (`sourceService.js`)
    - **Step A: 物理存储** -> 上传至 Supabase Storage `source-files` 存储桶 -> 获取 `publicUrl`。
    - **Step B: 文本提取** -> 使用 `pdf-parse` 解析 PDF 原始文本 (Buffer -> String)。
    - **Step C: AI 自动化摘要** -> 将前 10000 字发送至 `qwen-long` 模型 -> 生成 200 字以内的“档案提要”。
    - **Step D: 持久化** -> `sources` 表记录存储，包括 `content_text` (供 RAG 检索)。
5.  **[回写]** 修改 `notebooks` 表中的 `source_count` (+1)。
6.  **[反馈]** 前端面板显示新素材卡片，由于 `summary` 已异步生成，页面可即时显示提要。

---

## 4. 智能研讨与 Agentic 路由 (Smart Chat & Router)
**场景**：用户在“文思阁”提问或请求分析。

1.  **[前端输入]** 用户输入问题并通过“搜索框”勾选参考史料。
2.  **[意图识别]** (`smartRouter.js`)
    - 使用正则表达式识别关键词（如“思维导图”、“复习卡”）。
    - 判定意图：`general` (普通对话), `review_card` (复习卡), `mind_map` (思维导图), `deep_analysis` (深度分析)。
3.  **[RAG 上下文检索]**
    - **检查**：若勾选了特定 `sourceTitles`。
    - **查询**：后端根据 `notebookId` 和标题在 `sources` 表中查找 `content_text`。
    - **注入**：将史料内容拼接至 System Prompt 供模型参考。
4.  **[模型分发与流式输出]**
    - `review_card` -> `qwen-long` (结构化 JSON 模式)。
    - `mind_map` -> `deepseek-reasoner` (Mermaid 语法模式)。
    - 其他 -> `deepseek-chat` / `deepseek-reasoner` (Markdown 模式)。
5.  **[前端渲染]**
    - **[流式消费]**：通过 `ReadableStream` 逐包更新 `messages` 数组。
    - **[Artifact 捕获]**：若检测到有效 Mermaid 代码块或 JSON 卡片，`ArtifactPreview` 组件实时编译并渲染。
6.  **[结束]** 回到输入待命状态。

---

## 5. 制品持久化与画廊展示 (Artifact & Gallery Lifecycle)
**场景**：将 AI 生成的成果（如图、卡）存入“翰墨留香”侧边栏或侧视图。

1.  **[触发]** 用户点击 AI 消息下方的“固定到文思阁”按钮。
2.  **[制品封装]** (`ChatView.tsx`)
    - 自动提取当前对话的《问》与《答》。
    - 结构化整合：`{ id, title, type, content, tags }`。
3.  **[保存]**
    - **登录用户**：调用 `artifactApi.create` 存入 Supabase。
    - **访客模式**：存入 LocalStorage `scholarly_artifacts`。
4.  **[侧边栏展示]**
    - 侧栏列表实时 `setPinnedArtifacts`。
    - 点击某一记录 -> 激活 `currentArtifact` -> 开启右侧预览面板。
5.  **[画廊视图]** (GalleryView.tsx)
    - 载入所有 Artifacts。
    - 使用 Framer Motion 列表动画展示学术成果卡片。

---

## 附录：核心逻辑判定表

| 功能点 | 触发逻辑 | 核心组件/服务 | 关键后端依赖 |
| :--- | :--- | :--- | :--- |
| **PDF 解析** | 文件上传完成 | `sourceService.js` | `pdf-parse` |
| **导图生成** | 正则命中 / `mode: mind_map` | `smartRouter.js` | `deepseek-reasoner` |
| **卡片生成** | `mode: review_card` | `smartRouter.js` | `qwen-long` |
| **数据同步** | 每次状态变更 | `App.tsx` (useEffect) | LocalStorage / API |
