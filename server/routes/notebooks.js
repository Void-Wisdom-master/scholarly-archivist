import Router from '@koa/router';
import { notebookService } from '../services/notebookService.js';

const router = new Router({ prefix: '/api/notebooks' });

// GET /api/notebooks
router.get('/', async (ctx) => {
  try {
    const notebooks = await notebookService.getAll();
    ctx.body = { success: true, data: notebooks };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// GET /api/notebooks/:id
router.get('/:id', async (ctx) => {
  try {
    const notebook = await notebookService.getById(ctx.params.id);
    if (!notebook) { ctx.status = 404; ctx.body = { success: false, message: '未找' }; return; }
    ctx.body = { success: true, data: notebook };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// POST /api/notebooks
router.post('/', async (ctx) => {
  try {
    const { title, description } = ctx.request.body;
    if (!title) { ctx.status = 400; ctx.body = { success: false, message: '标题不能为空' }; return; }
    const notebook = await notebookService.create({ title, description });
    ctx.status = 201;
    ctx.body = { success: true, data: notebook };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// PUT /api/notebooks/:id
router.put('/:id', async (ctx) => {
  try {
    const notebook = await notebookService.update(ctx.params.id, ctx.request.body);
    ctx.body = { success: true, data: notebook };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// PUT /api/notebooks/:id/finish  (切换完结状�?
router.put('/:id/finish', async (ctx) => {
  try {
    const notebook = await notebookService.toggleFinish(ctx.params.id);
    ctx.body = { success: true, data: notebook };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// DELETE /api/notebooks/:id
router.delete('/:id', async (ctx) => {
  try {
    await notebookService.delete(ctx.params.id);
    ctx.body = { success: true, message: '删除成功' };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

export default router;
