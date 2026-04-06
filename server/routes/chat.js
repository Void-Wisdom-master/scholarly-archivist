import Router from '@koa/router';
import { route as smartRoute, routeStream } from '../services/smartRouter.js';
import { chatService, artifactService } from '../services/chatService.js';
import { galleryService } from '../services/galleryService.js';

const router = new Router({ prefix: '/api/chat' });

router.post('/send', async (ctx) => {
  try {
    const {
      message,
      notebookId,
      notebookTitle,
      selectedSourceTitles = [],
      mode = 'auto',
      isGuest = false
    } = ctx.request.body;

    if (!message || !message.trim()) {
      ctx.status = 400;
      ctx.body = { success: false, message: '消息不能为空' };
      return;
    }

    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    if (notebookId && !isGuest) {
      await chatService.saveMessage({
        notebookId,
        role: 'user',
        content: message,
        modelUsed: 'user',
        time: now
      }).catch(err => console.error('[Chat] 保存用户消息失败:', err.message));
    }

    const { content, modelUsed, isCard, intent } = await smartRoute({
      message,
      notebookTitle,
      sourceTitles: selectedSourceTitles,
      mode
    });

    if (notebookId && !isGuest) {
      await chatService.saveMessage({
        notebookId,
        role: 'ai',
        content,
        modelUsed,
        time: now
      }).catch(err => console.error('[Chat] 保存 AI 消息失败:', err.message));
    }

    let cards = null;
    if (isCard) {
      try {
        const parsed = JSON.parse(content);
        cards = parsed.cards || [];
        for (const card of cards) {
          if (!isGuest) {
            await galleryService.create({
              category: '复习卡片',
              categoryColor: 'bg-tertiary-container text-on-tertiary-container',
              title: card.front,
              content: card.back,
              source: `${notebookTitle} · Qwen-Long`,
              icon: 'school',
              actionIcon: 'bookmark',
            }).catch(() => {});
          }
        }
      } catch (parseErr) {
        console.error('[Chat] 解析复习卡片 JSON 失败:', parseErr.message);
      }
    }

    ctx.body = {
      success: true,
      data: {
        content,
        modelUsed,
        isCard,
        cards,
        intent,
        time: now
      }
    };
  } catch (err) {
    console.error('[Chat] 处理失败:', err.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: `AI 引擎暂时无法响应：${err.message}`
    };
  }
});

router.post('/sendStream', async (ctx) => {
  try {
    const {
      message,
      notebookId,
      notebookTitle,
      selectedSourceTitles = [],
      mode = 'auto',
      isGuest = false
    } = ctx.request.body;

    if (!message || !message.trim()) {
      ctx.status = 400;
      ctx.body = { success: false, message: '消息不能为空' };
      return;
    }

    const requestTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    ctx.request.socket.setTimeout(0);
    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);
    
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    ctx.status = 200;

    const { PassThrough } = await import('stream');
    const stream = new PassThrough();
    ctx.body = stream;

    (async () => {
      try {
        if (notebookId && !isGuest) {
          await chatService.saveMessage({
            notebookId,
            role: 'user',
            content: message,
            modelUsed: 'user',
            time: requestTime
          }).catch(() => {});
        }

        const { streamGenerator, modelUsed, isCard, intent } = await routeStream({
          message,
          notebookId,
          notebookTitle,
          sourceTitles: selectedSourceTitles,
          mode
        });

        let fullContent = '';
        stream.write(`data: ${JSON.stringify({ d: '', modelUsed, intent })}\n\n`);

        for await (const chunk of streamGenerator) {
          if (chunk) {
            fullContent += chunk;
            stream.write(`data: ${JSON.stringify({ d: chunk })}\n\n`);
          }
        }

        if (notebookId && !isGuest && fullContent) {
          await chatService.saveMessage({
            notebookId,
            role: 'ai',
            content: fullContent,
            modelUsed,
            time: requestTime
          }).catch(() => {});
        }

        if (isCard && fullContent) {
          try {
            const parsed = JSON.parse(fullContent);
            const cards = parsed.cards || [];
            for (const card of cards) {
              if (!isGuest) {
                await galleryService.create({
                  category: '复习卡片',
                  categoryColor: 'bg-tertiary-container text-on-tertiary-container',
                  title: card.front,
                  content: card.back,
                  source: `${notebookTitle} · Qwen-Long`,
                  icon: 'school',
                  actionIcon: 'bookmark',
                }).catch(() => {});
              }
            }
          } catch (e) {
            console.error('[Stream] 卡片解析失败');
          }
        }

        stream.write('data: [DONE]\n\n');
        stream.end();
      } catch (err) {
        console.error('[Stream] 推送失败', err);
        stream.write(`data: ${JSON.stringify({ d: '\n[Error: 请求中断]' })}\n\n`);
        stream.write('data: [DONE]\n\n');
        stream.end();
      }
    })();

  } catch (err) {
    console.error('[Chat Stream] 处理失败:', err.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: `AI 引擎暂时无法响应：${err.message}`
    };
  }
});

export default router;
