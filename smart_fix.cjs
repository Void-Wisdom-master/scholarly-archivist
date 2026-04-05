const fs = require('fs');

const manualFixes = {
    'server/index.js': [
        [35, "  if (ctx.method === 'OPTIONS') {"],
        [44, "  ctx.body = { success: false, message: '内部服务器错误' };"]
    ],
    'server/models/artifactModel.js': [
        [15, "    if (!supabase) throw new Error('Supabase 未配置');"],
        [26, "    if (!supabase) throw new Error('Supabase 未配置');"]
    ],
    'server/models/collectionModel.js': [
        [26, "    if (!supabase) throw new Error('Supabase 未配置');"],
        [37, "    if (!supabase) throw new Error('Supabase 未配置');"],
        [55, "    if (!supabase) throw new Error('Supabase 未配置');"]
    ],
    'server/models/messageModel.js': [
        [17, "    if (!supabase) throw new Error('Supabase 未配置');"],
        [34, "    if (!supabase) throw new Error('Supabase 未配置');"]
    ],
    'server/models/sourceModel.js': [
        [30, "    if (!supabase) throw new Error('Supabase 未配置');"],
        [52, "    if (!supabase) throw new Error('Supabase 未配置');"]
    ],
    'server/routes/auth.js': [
        [43, "    ctx.body = { success: false, message: '请提供用户名和密码' };"],
        [56, "    ctx.body = { success: false, message: '未找到该用户' };"],
        [103, "    ctx.body = { success: false, message: '密码错误' };"],
        [119, "    ctx.body = { success: false, message: '登录失败' };"]
    ],
    'server/routes/chat.js': [
        [24, "    if (!message) return ctx.body = { success: false, message: '消息为空' };"],
        [124, "      ctx.body = { success: false, message: '不支持' };"]
    ],
    'server/routes/messages.js': [
        [41, "    if (!notebookId) return ctx.body = { success: false, message: '未提供 notebookId' };"]
    ],
    'server/services/smartRouter.js': [
        [75, "      console.log('API Key 未提供');"],
        [113, "      console.log('调用后端报错');"],
        [138, "      cards: [{ front: '概念', back: '解释', tags: ['标签']}]"],
        [157, "      cards: [{ front: '概念', back: '解释', tags: ['标签']}]"],
        [210, "        throw new Error('解析失败');"],
        [259, "        throw new Error('网络请求异常');"]
    ],
    'server/services/sourceService.js': [
        [87, "        content: '解析完成',"],
        [88, "        summary: '摘要内容',"],
        [103, "        summary: '处理异常',"] // 103,5: ',' expected
    ],
    'src/components/CreateNotebookModal.tsx': [
        [39, '            <h3 className="font-headline text-3xl font-light text-primary mb-8 flex items-center gap-4 italic">'],
        [40, '              <span className="material-symbols-outlined text-primary">menu_book</span>'],
        [41, '              初始化新笔记</h3>'],
        [50, '                  placeholder="例如：启蒙运动研究..."'],
        [51, '                />'],
        [74, '                  确认初始化                </button>']
    ],
    'src/components/SettingsModal.tsx': [
        [83, '              <h4 className="font-headline text-lg text-primary tracking-widest border-b border-outline/10 pb-2 flex items-center gap-2"><span className="material-symbols-outlined uppercase">tune</span>偏好设置</h4>']
    ],
    'src/components/views/ChatView.tsx': [
        [245, '                  <span className="font-label text-[10px] text-outline uppercase tracking-widest flex items-center gap-1">'],
        [246, '                    <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>正在处理...</span>'],
        [561, "            alert('对话异常');"],
        [769, '                <p>无法显示</p>'],
        [777, '                <p>无法显示</p>'],
        [978, '                <span className="font-label text-xs uppercase tracking-widest ml-2 text-outline">正在处理...</span>']
    ],
    'src/components/views/LibraryView.tsx': [
        [75, '                      <span className="font-label text-[10px] uppercase tracking-widest text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">archive</span>已获取</span>'],
        [95, '                      <span className="font-label text-xs tracking-widest text-outline group-hover:text-primary transition-colors flex items-center gap-2 relative z-10 before:content-[\'\'] before:absolute before:-inset-2 before:bg-surface-container before:rounded-lg before:-z-10 before:opacity-0 group-hover:before:opacity-100 before:transition-all"><span className="material-symbols-outlined text-sm">add_circle</span>新建笔记</span>'],
        [124, "                        title='点击进入'"],
        [138, "                      <div className=\"flex flex-col gap-1 items-end\">"],
        [147, "                        <span className=\"font-label text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1 bg-secondary-container/30 px-2 py-1 rounded-md\"><span className=\"material-symbols-outlined text-[12px]\">check_circle</span>已归档</span>"],
        [150, "                        <span className=\"font-label text-[10px] uppercase tracking-widest text-primary flex items-center gap-1 bg-primary-container/30 px-2 py-1 rounded-md\"><span className=\"material-symbols-outlined text-[12px]\">schedule</span>进行中</span>"]
    ]
};

for(const [file, fixes] of Object.entries(manualFixes)) {
    if(fs.existsSync(file)) {
        let lines = fs.readFileSync(file, 'utf8').split('\n');
        for(const fix of fixes) {
            lines[fix[0]-1] = fix[1];
        }
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
    }
}
console.log('Lines replaced.');
