import Router from '@koa/router';
import { supabase, supabaseAdmin } from '../db/supabase.js';

const router = new Router({ prefix: '/api/auth' });

const toInternalEmail = (username) => `${username.toLowerCase().trim()}@internal.local`;

router.post('/register', async (ctx) => {
  const { username, password } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { success: false, message: '账号和密码不能为空' };
    return;
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/.test(username)) {
    ctx.status = 400;
    ctx.body = { success: false, message: '账号只能包含字母、数字、下划线或中文，长度2-20' };
    return;
  }
  if (password.length < 6) {
    ctx.status = 400;
    ctx.body = { success: false, message: '密码至少需6个字符' };
    return;
  }
  try {
    const internalEmail = toInternalEmail(username);
    if (!supabase) {
      throw new Error('数据库故障，请稍后重试');
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: internalEmail,
        password,
        email_confirm: true,
        user_metadata: { username }
      });
      if (error) throw error;
      ctx.body = { success: true, message: '注册成功', data: { ...data.user, username } };
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: internalEmail,
        password,
        options: { data: { username } }
      });
      if (error) throw error;
      ctx.body = { success: true, message: '注册成功', data: { ...data.user, username } };
    }
  } catch (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: error.message || '注册失败' };
  }
});

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { success: false, message: '请输入账号和密码' };
    return;
  }
  try {
    const internalEmail = toInternalEmail(username);
    if (!supabase) {
      throw new Error('数据库故障');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: internalEmail, password });
    if (error) throw error;

    if (!data.session) {
      throw new Error('登录失败：未能获取会话 token');
    }

    ctx.body = {
      success: true,
      data: {
        ...data.user,
        username: data.user?.user_metadata?.username || username
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    };
  } catch (error) {
    ctx.status = 401;
    ctx.body = { success: false, message: '登录失败：账号或密码错误' };
  }
});

router.get('/me', async (ctx) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { success: false, message: '未授权' };
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    ctx.body = {
      success: true,
      data: {
        ...user,
        username: user.user_metadata?.username || user.email?.replace('@internal.local', '')
      }
    };
  } catch (error) {
    ctx.status = 401;
    ctx.body = { success: false, message: '会话已过期，请重新登录' };
  }
});

export default router;
