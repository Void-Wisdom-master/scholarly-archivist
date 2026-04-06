import { supabase } from '../db/supabase.js';

export const sourceModel = {
  async findByNotebook(notebookId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('sources')
      .select('id, notebook_id, type, title, date, icon, url, summary, created_at')
      .eq('notebook_id', notebookId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toCamel);
  },

  async findById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('sources')
      .select('id, notebook_id, type, title, date, icon, url, summary, created_at')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return toCamel(data);
  },

  async create({ notebookId, type, title, date, icon, url, contentText, summary }) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { data, error } = await supabase
      .from('sources')
      .insert([{ 
        notebook_id: notebookId, 
        type, 
        title, 
        date, 
        icon, 
        url,
        summary: summary || contentText // 使用 summary 存储提取的文本，作为 content_text 缺失的兜底
      }])
      .select('id, notebook_id, type, title, date, icon, url, summary, created_at')
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { data, error } = await supabase
      .from('sources')
      .delete()
      .eq('id', id)
      .select('id, notebook_id, type, title, date, icon, url, summary, created_at')
      .single();
    if (error) throw error;
    return toCamel(data);
  }
};

function toCamel(row) {
  return {
    id: row.id,
    notebookId: row.notebook_id,
    type: row.type,
    title: row.title,
    date: row.date,
    icon: row.icon,
    url: row.url,
    contentText: row.summary, // 完全降级使用 summary 存储原本 content_text 的内容
    summary: row.summary,
    createdAt: row.created_at
  };
}
