import { supabase } from '../db/supabase.js';

export const collectionModel = {
  async findAll() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toCamel);
  },

  async findById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  async create({ title, description, collectionNum, icon, lastUpdated }) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { data, error } = await supabase
      .from('collections')
      .insert([{ title, description, collection_num: collectionNum, icon, last_updated: lastUpdated }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    if (!supabase) throw new Error('Supabase 未配置');
    const mapped = {};
    if (fields.title !== undefined) mapped.title = fields.title;
    if (fields.description !== undefined) mapped.description = fields.description;
    if (fields.isFinished !== undefined) mapped.is_finished = fields.isFinished;
    if (fields.lastUpdated !== undefined) mapped.last_updated = fields.lastUpdated;
    if (fields.sourceCount !== undefined) mapped.source_count = fields.sourceCount;
    const { data, error } = await supabase
      .from('collections')
      .update(mapped)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase 未配置');
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async count() {
    if (!supabase) return 0;
    const { count, error } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
};

function toCamel(row) {
  if (!row) return null;
  return {
    id: row.id,
    collectionNum: row.collection_num,
    title: row.title,
    description: row.description,
    sourceCount: row.source_count,
    lastUpdated: row.last_updated,
    icon: row.icon,
    isFinished: row.is_finished,
    createdAt: row.created_at
  };
}
