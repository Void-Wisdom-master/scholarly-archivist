import { messageModel } from '../models/messageModel.js';
import { artifactModel } from '../models/artifactModel.js';

export const chatService = {
  async getHistory(notebookId) {
    return messageModel.findByNotebook(notebookId);
  },

  async saveMessage({ notebookId, role, content, modelUsed, time }) {
    return messageModel.create({ notebookId, role, content, modelUsed, time });
  },

  async clearHistory(notebookId) {
    return messageModel.deleteByNotebook(notebookId);
  }
};

export const artifactService = {
  async getAll() {
    return artifactModel.findAll();
  },

  async create({ type, title, content, tags, color }) {
    return artifactModel.create({ type, title, content, tags, color });
  },

  async delete(id) {
    return artifactModel.delete(id);
  }
};
