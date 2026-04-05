import 'dotenv/config';
import Koa from 'koa';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Router from '@koa/router';

// 路由导入
import notebookRouter from './routes/notebooks.js';
import galleryRouter from './routes/gallery.js';
import sourceRouter from './routes/sources.js';
import { messageRouter, artifactRouter } from './routes/messages.js';
import chatRouter from './routes/chat.js';
import authRouter from './routes/auth.js';

const app = new Koa();
const PORT = process.env.PORT || 3001;

// ─── 中间件 ───────────────────────────────────────────────────────────────────────────
app.use(logger());
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser({ jsonLimit: '10mb' }));

// ─── 全局错误处理 ──────────────────────────────────────────────────────────────────────
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('[Server Error]', err.message);
    ctx.status = err.status || 500;
    ctx.body = { success: false, message: err.message || '内部服务器错误' };
  }
});

// ─── 健康检查 ──────────────────────────────────────────────────────────────────────────
const rootRouter = new Router();
rootRouter.get('/api/health', (ctx) => {
  ctx.body = {
    success: true,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

// ─── 挂载路由 ──────────────────────────────────────────────────────────────────────────
app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
app.use(notebookRouter.routes()).use(notebookRouter.allowedMethods());
app.use(galleryRouter.routes()).use(galleryRouter.allowedMethods());
app.use(sourceRouter.routes()).use(sourceRouter.allowedMethods());
app.use(messageRouter.routes()).use(messageRouter.allowedMethods());
app.use(artifactRouter.routes()).use(artifactRouter.allowedMethods());
app.use(chatRouter.routes()).use(chatRouter.allowedMethods());
app.use(authRouter.routes()).use(authRouter.allowedMethods());

// ─── 启动 ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║    研史明智 · 学术引擎后端服务             ║
║    http://localhost:${PORT}             ║
╚══════════════════════════════════════════════╝
  `);
  console.log('[API Routes]');
  console.log('  GET  /api/health');
  console.log('  GET|POST|PUT|DELETE  /api/notebooks');
  console.log('  GET|POST|DELETE      /api/gallery');
  console.log('  GET|POST|DELETE      /api/sources');
  console.log('  GET|POST|DELETE      /api/messages');
  console.log('  GET|POST|DELETE      /api/artifacts');
  console.log('  POST                 /api/chat/send  → Smart Router');
});

export default app;
