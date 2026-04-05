import { supabase } from '../db/supabase.js';

export const galleryModel = {
  async findAll() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('gallery_cards')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toCamel);
  },

  async create({ category, categoryColor, date, title, content, source, icon, actionIcon, image }) {
    if (!supabase) throw new Error('Supabase 未配');
    const { data, error } = await supabase
      .from('gallery_cards')
      .insert([{ category, category_color: categoryColor, date, title, content, source, icon, action_icon: actionIcon, image }])
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase 未配');
    const { error } = await supabase.from('gallery_cards').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

function toCamel(row) {
  return {
    id: row.id,
    category: row.category,
    categoryColor: row.category_color,
    date: row.date,
    title: row.title,
    content: row.content,
    source: row.source,
    icon: row.icon,
    actionIcon: row.action_icon,
    image: row.image,
    createdAt: row.created_at
  };
}
