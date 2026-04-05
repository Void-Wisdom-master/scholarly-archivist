import { supabase } from '../db/supabase.js';

export const messageModel = {
  async findByNotebook(notebookId, limit = 100) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('notebook_id', notebookId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data.map(toCamel);
  },

  async create({ notebookId, role, content, modelUsed, time }) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        notebook_id: notebookId,
        role,
        content,
        model_used: modelUsed || 'deepseek-chat',
        time
      }])
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  async deleteByNotebook(notebookId) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { error } = await supabase.from('messages').delete().eq('notebook_id', notebookId);
    if (error) throw error;
    return true;
  }
};

function toCamel(row) {
  return {
    id: row.id,
    notebookId: row.notebook_id,
    role: row.role,
    content: row.content,
    modelUsed: row.model_used,
    time: row.time,
    createdAt: row.created_at
  };
}
