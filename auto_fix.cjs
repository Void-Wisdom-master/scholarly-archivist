const fs = require('fs');
const files = [
  'server/models/artifactModel.js', 'server/models/collectionModel.js', 'server/models/messageModel.js', 'server/models/sourceModel.js', 'server/models/galleryModel.js', 
  'server/db/supabase.js', 'server/routes/auth.js', 'server/routes/notebooks.js', 'server/routes/chat.js', 'server/routes/messages.js', 'server/services/smartRouter.js', 'server/services/sourceService.js', 
  'src/api.ts', 'src/components/CreateNotebookModal.tsx', 'src/components/SettingsModal.tsx', 'src/components/views/ChatView.tsx', 'src/components/views/LibraryView.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let t = fs.readFileSync(f, 'utf8');
    
    // JS and TS error fixes:
    t = t.replace(/\uFFFD\?\);/g, "');");
    t = t.replace(/\uFFFD\? \};/g, "' };");
    t = t.replace(/\uFFFD\? /g, "' ");
    t = t.replace(/\'\uFFFD\?\)/g, "')");
    t = t.replace(/\uFFFD\?\,/g, "',");
    t = t.replace(/\uFFFD\?\)/g, "')");
    
    // TSX fixes:
    if (f.endsWith('CreateNotebookModal.tsx')) {
        t = t.replace('初始化新笔记\uFFFD?            </h3>', '初始化新笔记</h3>');
        t = t.replace('启蒙运动研\uFFFD?\n', '启蒙运动研究"\n');
        t = t.replace('确认初始\uFFFD?                </button>', '确认初始化</button>');
    }
    if (f.endsWith('SettingsModal.tsx')) {
        t = t.replace('偏好设\uFFFD?            </h4>', '偏好设</h4>');
    }
    
    // ChatView specific fixes
    t = t.replace('红\uFFFD? ', "红', ");
    t = t.replace('容\uFFFD?(', "容('");
    t = t.replace('结\uFFFD?..', '结...');
    t = t.replace('馈\uFFFD?---', '馈 ---');
    t = t.replace('略即\uFFFD? ', '略即 ');
    t = t.replace('核\uFFFD?M', '核M');
    t = t.replace('符\uFFFD? ', '符 ');
    t = t.replace('鲁棒\uFFFD?J', '鲁棒J');
    t = t.replace('括\uFFFD? ', '括 ');
    t = t.replace('无\uFFFD? ', '无 ');
    t = t.replace('报\uFFFD? ', '报 ');
    t = t.replace('文\uFFFD?M', '文M');
    t = t.replace('理\uFFFD? : ', "理' : ");
    t = t.replace('分\uFFFD?---', "分---");
    t = t.replace('态\uFFFD? ', "态 ");
    t = t.replace('简易判定）\n', "简易判定）\n    ");
    t = t.replace('临\uFFFD?ID', '临ID');
    t = t.replace('回\uFFFD? ', '回 ');
    t = t.replace('记\uFFFD? +', "记' +");
    t = t.replace('\uFFFD?({', "档案({");
    t = t.replace('\uFFFD?{', "文件{");
    t = t.replace('件\uFFFD? {', "件 {");
    t = t.replace('览\uFFFD?</p>', '览</p>');
    t = t.replace('L\uFFFD?</p>', 'L</p>');
    t = t.replace('案\uFFFD?正在分析档案...</span>', '案正在分析档案...</span>');
    t = t.replace("'?知识闪卡'", "'知识闪卡'");
    t = t.replace("'?思维导图'", "'思维导图'");
    t = t.replace('取\uFFFD?..</span>', '取...</span>');
    t = t.replace('盖\uFFFD?</', '盖</');
    t = t.replace('析\uFFFD?}', "析'}");
    t = t.replace(/\uFFFD\?\.\./g, '..');
    
    // LibraryView specific
    t = t.replace('新建笔记\uFFFD?</span', '新建笔记</span');
    t = t.replace('已归\uFFFD?</span', '已归档</span');
    t = t.replace('完\uFFFD?}', "完'}");
    t = t.replace('笔记\uFFFD?', '笔记"');
    t = t.replace('\uFFFD?</span', '档案</span');
    t = t.replace('更\uFFFD?</span', '更新</span');

    // Remaining generic:
    t = t.replace(/\uFFFD\?\]/g, "']");
    t = t.replace(/\uFFFD\?\}/g, "'}");
    t = t.replace(/\uFFFD\?\"/g, '"');

    fs.writeFileSync(f, t, 'utf8');
  }
});
console.log("Done");
