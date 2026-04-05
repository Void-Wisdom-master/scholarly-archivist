import { galleryModel } from '../models/galleryModel.js';

export const galleryService = {
  async getAll() {
    return galleryModel.findAll();
  },

  async create(cardData) {
    const date = cardData.date || new Date().toLocaleDateString('zh-CN');
    return galleryModel.create({ ...cardData, date });
  },

  async delete(id) {
    return galleryModel.delete(id);
  }
};
