import { collectionModel } from '../models/collectionModel.js';

export const notebookService = {
  async getAll() {
    const rows = await collectionModel.findAll();
    return rows.map(toFrontend);
  },

  async getById(id) {
    const row = await collectionModel.findById(id);
    return row ? toFrontend(row) : null;
  },

  async create({ title, description }) {
    const totalCount = await collectionModel.count();
    const collectionNum = (totalCount + 1).toString().padStart(3, '0');
    const lastUpdated = new Date().toLocaleDateString('zh-CN');
    const row = await collectionModel.create({
      title,
      description: description || '',
      collectionNum,
      icon: 'menu_book',
      lastUpdated
    });
    return toFrontend(row);
  },

  async update(id, fields) {
    const row = await collectionModel.update(id, {
      ...fields,
      lastUpdated: new Date().toLocaleDateString('zh-CN')
    });
    return toFrontend(row);
  },

  async toggleFinish(id) {
    const existing = await collectionModel.findById(id);
    if (!existing) throw new Error('笔记本不存在');
    const row = await collectionModel.update(id, {
      isFinished: !existing.is_finished,
      lastUpdated: new Date().toLocaleDateString('zh-CN')
    });
    return toFrontend(row);
  },

  async delete(id) {
    return collectionModel.delete(id);
  }
};

function toFrontend(row) {
  return {
    id: row.id,
    collectionNum: row.collection_num,
    title: row.title,
    description: row.description,
    sourceCount: row.source_count,
    icon: row.icon,
    isFinished: row.is_finished,
    lastUpdated: row.last_updated,
  };
}
