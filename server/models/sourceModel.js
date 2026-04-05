import { supabase } from '../db/supabase.js';

export const sourceModel = {
  async findByNotebook(notebookId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('notebook_id', notebookId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toCamel);
  },

  async findById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('sources')
      .select('*')
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
        content_text: contentText,
        summary
      }])
      .select()
      .single();
    if (error) throw error;
    // Update source_count on collection
    await supabase.rpc('increment_source_count', { notebook_id: notebookId }).catch(() => {});
    return toCamel(data);
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { data, error } = await supabase
      .from('sources')
      .delete()
      .eq('id', id)
      .select()
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
    contentText: row.content_text,
    summary: row.summary,
    createdAt: row.created_at
  };
}
