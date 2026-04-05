import Router from '@koa/router';
import multer from '@koa/multer';
import { sourceService } from '../services/sourceService.js';

const router = new Router({ prefix: '/api/sources' });
const upload = multer();

// GET /api/sources?notebookId=xxx
router.get('/', async (ctx) => {
  try {
    const { notebookId } = ctx.query;
    if (!notebookId) { ctx.status = 400; ctx.body = { success: false, message: '需要提�?notebookId' }; return; }
    const sources = await sourceService.getByNotebook(notebookId);
    ctx.body = { success: true, data: sources };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// POST /api/sources
router.post('/', upload.single('file'), async (ctx) => {
  try {
    const { notebookId, type, title, icon } = ctx.request.body;
    const file = ctx.file;
    if (!notebookId || !title) { 
      ctx.status = 400; 
      ctx.body = { success: false, message: '需�?notebookId �?title' }; 
      return; 
    }
    const source = await sourceService.create({ 
      notebookId, 
      type, 
      title, 
      icon, 
      file 
    });
    ctx.status = 201;
    ctx.body = { success: true, data: source };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// DELETE /api/sources/:id
router.delete('/:id', async (ctx) => {
  try {
    await sourceService.delete(ctx.params.id);
    ctx.body = { success: true, message: '删除成功' };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

export default router;
