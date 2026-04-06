import Router from '@koa/router';
import { chatService, artifactService } from '../services/chatService.js';

const router = new Router({ prefix: '/api/messages' });
const artifactRouter = new Router({ prefix: '/api/artifacts' });

// ─── 对话消息路由 ─────────────────────────────────────────────────────────────

// GET /api/messages?notebookId=xxx
router.get('/', async (ctx) => {
  try {
    const { notebookId } = ctx.query;
    if (!notebookId) { ctx.status = 400; ctx.body = { success: false, message: '需要 notebookId' }; return; }
    const messages = await chatService.getHistory(notebookId);
    ctx.body = { success: true, data: messages };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// POST /api/messages
router.post('/', async (ctx) => {
  try {
    const { notebookId, role, content, modelUsed, time } = ctx.request.body;
    const msg = await chatService.saveMessage({ notebookId, role, content, modelUsed, time });
    ctx.status = 201;
    ctx.body = { success: true, data: msg };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// DELETE /api/messages?notebookId=xxx  (清空对话)
router.delete('/', async (ctx) => {
  try {
    const { notebookId } = ctx.query;
    if (!notebookId) { ctx.status = 400; ctx.body = { success: false, message: '需要 notebookId' }; return; }
    await chatService.clearHistory(notebookId);
    if (!notebookId) return ctx.body = { success: false, message: '未提供 notebookId' };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// ─── 固定洞察路由 ─────────────────────────────────────────────────────────────

// GET /api/artifacts
artifactRouter.get('/', async (ctx) => {
  try {
    const artifacts = await artifactService.getAll();
    ctx.body = { success: true, data: artifacts };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// POST /api/artifacts
artifactRouter.post('/', async (ctx) => {
  try {
    const artifact = await artifactService.create(ctx.request.body);
    ctx.status = 201;
    ctx.body = { success: true, data: artifact };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

// DELETE /api/artifacts/:id
artifactRouter.delete('/:id', async (ctx) => {
  try {
    await artifactService.delete(ctx.params.id);
    ctx.body = { success: true, message: '删除成功' };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
});

export { router as messageRouter, artifactRouter };
