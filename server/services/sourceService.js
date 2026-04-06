import { sourceModel } from '../models/sourceModel.js';
import { collectionModel } from '../models/collectionModel.js';
import { supabase } from '../db/supabase.js';
import { PDFParse } from 'pdf-parse';
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
    console.log(`[SourceService] Starting upload: ${title} (${type})`);
    let url = '';
    let contentText = '';
    
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
          console.log('[SourceService] Extracting PDF text...');
          // pdf-parse v2 requires Uint8Array, not raw Node.js Buffer
          const pdfData64 = new Uint8Array(file.buffer);
          const parser = new PDFParse({ data: pdfData64 });
          const pdfData = await parser.getText();
          await parser.destroy();
          contentText = pdfData.text || '';
          console.log(`[SourceService] PDF text extracted: ${contentText.length} chars`);
        } else if (type === 'Markdown' || type === 'Text') {
          contentText = file.buffer.toString('utf-8');
        }
      } catch (extractErr) {
        console.error('[Text Extraction Error]', extractErr);
        contentText = '文本提取失败';
      }

      // 3. AI 预处理生成提要已被禁用
      // if (contentText && contentText.length > 50 && qwenClient) { ... }
    }

    const date = new Date().toLocaleDateString('zh-CN');
    console.log('[SourceService] Creating database record...');
    const newSource = await sourceModel.create({
      notebookId, 
      type, 
      title, 
      date, 
      icon, 
      url,
      contentText
    });
    console.log('[SourceService] Record created successfully');
    
    // 更新笔记本素材数
    const notebook = await collectionModel.findById(notebookId);
    if (notebook) {
      const currentCount = notebook.sourceCount || 0;
      await collectionModel.update(notebookId, { sourceCount: currentCount + 1 });
      console.log(`[SourceService] Updated notebook source count: ${currentCount} -> ${currentCount + 1}`);
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
        await collectionModel.update(row.notebookId, { sourceCount: Math.max(0, (notebook.sourceCount || 0) - 1) });
      }
    }
    return row;
  }
};
