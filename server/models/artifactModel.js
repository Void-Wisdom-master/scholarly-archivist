import { supabase } from '../db/supabase.js';

export const artifactModel = {
  async findAll() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create({ type, title, content, tags, color }) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { data, error } = await supabase
      .from('artifacts')
      .insert([{ type, title, content, tags: tags || [], color }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { error } = await supabase.from('artifacts').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
