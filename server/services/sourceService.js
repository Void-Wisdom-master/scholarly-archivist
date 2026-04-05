import { sourceModel } from '../models/sourceModel.js';
import { collectionModel } from '../models/collectionModel.js';
import { supabase } from '../db/supabase.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import OpenAI from 'openai';

// 初始 Qwen 客户端用于预处理
const qwenClient = process.env.QWEN_API_KEY
  ? new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    })
  : null;

export const sourceService = {
  async getByNotebook(notebookId) {
    return sourceModel.findByNotebook(notebookId);
  },

  async create({ notebookId, type, title, icon, file }) {
    let url = '';
    let contentText = '';
    let summary = '';
    
    // 1. 上传物理文件到 Supabase Storage
    if (file && supabase) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${notebookId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('source-files')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('[Supabase Storage Error]', error);
        if (error.message === 'Bucket not found') {
          throw new Error('存储"source-files" 不存在。请到 Supabase 控制台中创建该存储桶并设置为公开(Public)');
        }
        throw new Error('存入 Supabase Storage 失败: ' + error.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('source-files')
        .getPublicUrl(filePath);
      
      url = publicUrl;

      // 2. 提取文本内容
      try {
        if (type === 'PDF') {
          const pdfData = await pdf(file.buffer);
          contentText = pdfData.text;
        } else if (type === 'Markdown' || type === 'Text') {
          contentText = file.buffer.toString('utf-8');
        }
      } catch (extractErr) {
        console.error('[Text Extraction Error]', extractErr);
        contentText = '文本提取失败';
      }

      // 3. AI 预处理生成提要
      if (contentText && contentText.length > 50 && qwenClient) {
        try {
          const response = await qwenClient.chat.completions.create({
            model: 'qwen-long',
            messages: [
              { role: 'system', content: '你是一位博雅的研究员，擅长将复杂的学术资料提取为简明扼要的『档案提要』。请将以下文本缩写成 200 字以内的摘要，保留核心论点与关键细节。直接输出摘要内容' },
              { role: 'user', content: contentText.substring(0, 10000) } // 限制输入长度
            ],
            temperature: 0.3,
            max_tokens: 300,
          });
          summary = response.choices[0].message.content.trim();
        } catch (aiErr) {
          console.error('[AI Summary Error]', aiErr);
          summary = ''; // 留空触发 UI "正在研读..."
        }
      }
    }

    const date = new Date().toLocaleDateString('zh-CN');
    const newSource = await sourceModel.create({
      notebookId, 
      type, 
      title, 
      date, 
      icon, 
      url,
      contentText,
      summary
    });
    
    // 更新笔记本素材数
    const notebook = await collectionModel.findById(notebookId);
    if (notebook) {
      await collectionModel.update(notebookId, { sourceCount: (notebook.source_count || 0) + 1 });
    }
    
    return newSource;
  },

  async delete(id) {
    // 1. 获取素材信息，用于清理物理文件
    const source = await sourceModel.findById(id);
    if (source && source.url && supabase) {
      try {
        const urlObj = new URL(source.url);
        const pathParts = urlObj.pathname.split('/');
        const bucketIndex = pathParts.indexOf('source-files');
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/');
          await supabase.storage.from('source-files').remove([filePath]);
          console.log(`[Storage] Deleted file: ${filePath}`);
        }
      } catch (err) {
        console.warn('[Storage Cleanup Warning] Failed to parse URL for cleanup:', err.message);
      }
    }

    const row = await sourceModel.delete(id);
    if (row && row.notebookId) {
      const notebook = await collectionModel.findById(row.notebookId);
      if (notebook) {
        await collectionModel.update(row.notebookId, { sourceCount: Math.max(0, (notebook.source_count || 0) - 1) });
      }
    }
    return row;
  }
};
