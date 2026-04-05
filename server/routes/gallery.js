import Router from '@koa/router';
import { galleryService } from '../services/galleryService.js';

const router = new Router({ prefix: '/api/gallery' });

// GET /api/gallery
router.get('/', async (ctx) => {
  try {
    const cards = await galleryService.getAll();
    ctx.body = { success: true, data: cards };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// POST /api/gallery
router.post('/', async (ctx) => {
  try {
    const card = await galleryService.create(ctx.request.body);
    ctx.status = 201;
    ctx.body = { success: true, data: card };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', async (ctx) => {
  try {
    await galleryService.delete(ctx.params.id);
    ctx.body = { success: true, message: '删除成功' };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

export default router;
