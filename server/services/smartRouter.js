/**
 * Smart Router
 * 根据用户意图自动分发
 */

import OpenAI from 'openai';
import { supabase } from '../db/supabase.js';

const deepseekClient = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    })
  : null;

const qwenClient = process.env.QWEN_API_KEY
  ? new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    })
  : null;


export function detectIntent(message) {
  const msg = message.trim();

  if (/生成复习卡|制作闪卡|anki卡片|复习卡|flashcard/i.test(msg)) {
    return 'review_card';
  }

  const deepAnalysisPattern =
    /为什么|如何评价|评价一下|怎么看待|原因是什么|原因何在|如何解释|如何理解|分析一下|深入分析|背后的逻辑|意义何在|影响了什么|为何|何以|探讨/;
  if (deepAnalysisPattern.test(msg)) {
    return 'deep_analysis';
  }

  if (/思维导图|脑图|结构图|知识点图谱|mindmap|mind map/i.test(msg)) {
    return 'mind_map';
  }

  return 'general';
}

async function callDeepSeekChat(systemPrompt, userMessage) {
  if (!deepseekClient) {
    return '[DeepSeek] API Key 未配置';
  }
  const completion = await deepseekClient.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });
  return completion.choices[0].message.content;
}

async function* callDeepSeekChatStream(systemPrompt, userMessage) {
  if (!deepseekClient) {
    yield '[DeepSeek] API Key 未配置';
    return;
  }
  const stream = await deepseekClient.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });
  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || '';
  }
}

async function callDeepSeekReasoner(systemPrompt, userMessage) {
  if (!deepseekClient) {
    return '[DeepSeek] API Key 未配置';
  }
  const completion = await deepseekClient.chat.completions.create({
    model: 'deepseek-reasoner',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 4096,
  });
  return completion.choices[0].message.content;
}

async function* callDeepSeekReasonerStream(systemPrompt, userMessage) {
  if (!deepseekClient) {
    yield '[DeepSeek] API Key 未配置';
    return;
  }
  const stream = await deepseekClient.chat.completions.create({
    model: 'deepseek-reasoner',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 4096,
    stream: true,
  });
  for await (const chunk of stream) {
    // 关键修正：DeepSeek Reasoner (R1) 开启 streaming 后会先吐出 reasoning_content，再吐出 content。
    // 为确保作为制品（思维导图/卡片）的输出不包含思考过程及其干扰，我们仅推送最终 content。
    yield chunk.choices[0]?.delta?.content || '';
  }
}

async function callQwenLong(systemPrompt, userMessage) {
  if (!qwenClient) {
    return JSON.stringify({
      cards: [{ front: '概念', back: '解释', tags: ['标签']}]
    });
  }
  const completion = await qwenClient.chat.completions.create({
    model: 'qwen-long',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 3000,
  });
  return completion.choices[0].message.content;
}

async function* callQwenLongStream(systemPrompt, userMessage) {
  if (!qwenClient) {
    yield JSON.stringify({
      cards: [{ front: '概念', back: '解释', tags: ['标签']}]
    });
    return;
  }
  const stream = await qwenClient.chat.completions.create({
    model: 'qwen-long',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 3000,
    stream: true,
  });
  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || '';
  }
}

async function callMindMap(systemPrompt, userMessage) {
  return await callDeepSeekReasoner(systemPrompt, userMessage);
}

async function* callMindMapStream(systemPrompt, userMessage) {
  return yield* callDeepSeekReasonerStream(systemPrompt, userMessage);
}


export async function route({ message, notebookTitle, sourceTitles = [], mode = 'auto' }) {
  const intent = mode === 'review_card' ? 'review_card' : detectIntent(message);

  const sourceContext = sourceTitles.length > 0
    ? `用户当前参考的素材：${sourceTitles.join('，')}。`
    : '';

  let content, modelUsed, isCard = false;

  if (intent === 'review_card') {
    modelUsed = 'qwen-long';
    isCard = true;
    const systemPrompt = `你是一位精通记忆科学的学术助手，专门为历史学习者生成 Anki 复习卡片。请严格以 JSON 格式输出，结构为：
{
  "cards": [
    { "front": "问题（正面）", "back": "详细答案（背面）", "tags": ["标签1", "标签2"] }
  ]
}
每张卡片聚焦一个知识点，正面简洁，背面详实。生成 5-8 张卡片。不要输出任何 JSON 以外的内容。`;
    const userMsg = `请根据笔记本《${notebookTitle}》 ${sourceContext}生成复习卡片。用户消息：${message}`;
    content = await callQwenLong(systemPrompt, userMsg);

  } else if (intent === 'mind_map') {
    modelUsed = 'deepseek-reasoner';
    const systemPrompt = `你是一位精通结构化思维的学术教练。请根据用户提供的素材和笔记本标题《${notebookTitle}》，生成一份逻辑严密的思维导图。
请使用 Mermaid 语法（graph TD 或 mindmap）来表示结构。
直接输出 Mermaid 代码块，例如：
\`\`\`mermaid
graph TD
  A[标题] --> B[子节点]
\`\`\`
你可以适当使用 Emoji 增强视觉效果。不要输出多余的解释。`;
    const userMsg = `请根据笔记本《${notebookTitle}》 ${sourceContext}生成思维导图。用户消息：${message}`;
    content = await callMindMap(systemPrompt, userMsg);

  } else if (intent === 'deep_analysis') {
    modelUsed = 'deepseek-reasoner';
    const systemPrompt = `你是一位博学多识的学术研究助手，擅长历史与哲学的深度分析。
当前研究项目：《${notebookTitle}》 ${sourceContext}
请提供深入、严谨且富有批判性的分析，引用史料或哲学论据支撑观点，使用 Markdown 格式。`;
    content = await callDeepSeekReasoner(systemPrompt, message);

  } else {
    modelUsed = 'deepseek-chat';
    const systemPrompt = `你是一位博学多才的学术研究助手，专注于历史、哲学与人文领域。
当前研究项目：《${notebookTitle}》 ${sourceContext}
请根据参考资料和你的知识储备，提供深入、严谨且富有洞察力的回答，使用 Markdown 格式。`;
    content = await callDeepSeekChat(systemPrompt, message);
  }

  return { content, modelUsed, isCard, intent };
}

export async function routeStream({ message, notebookId, notebookTitle, sourceTitles = [], mode = 'auto' }) {
  const intent = mode === 'review_card' ? 'review_card' : detectIntent(message);

  let sourceContext = '';
  
  if (sourceTitles.length > 0 && notebookId) {
    try {
      const { data, error } = await supabase
        .from('sources')
        .select('title, summary')
        .eq('notebook_id', notebookId)
        .in('title', sourceTitles);

      if (!error && data && data.length > 0) {
        const contextText = data.map(d => `【${d.title}】\n${d.summary}`).join('\n\n');
        sourceContext = `以下是选定的历史档案内容：\n${contextText}\n\n请基于此回答用户问题。如果使用了素材内容，需在文末或句末标注 (源自: 对应素材标题)。`;
      } else {
        sourceContext = `用户当前参考的素材：${sourceTitles.join('，')}。`;
      }
    } catch (err) {
      console.error('[RAG] 获取素材内容失败:', err);
      sourceContext = `用户当前参考的素材：${sourceTitles.join('，')}。`;
    }
  } else if (sourceTitles.length > 0) {
    sourceContext = `用户当前参考的素材：${sourceTitles.join('，')}。`;
  }

  let modelUsed, isCard = false;
  let streamGenerator;

  if (intent === 'review_card') {
    modelUsed = 'qwen-long';
    isCard = true;
    const systemPrompt = `你是一位精通记忆科学的学术助手，专门为历史学习者生成 Anki 复习卡片。请严格以 JSON 格式输出，结构为：
{
  "cards": [
    { "front": "问题（正面）", "back": "详细答案（背面）", "tags": ["标签1", "标签2"] }
  ]
}
每张卡片聚焦一个知识点，正面简洁，背面详实。生成 5-8 张卡片。不要输出任何 JSON 以外的内容。`;
    const userMsg = `请根据笔记本《${notebookTitle}》 ${sourceContext}生成复习卡片。用户消息：${message}`;
    streamGenerator = callQwenLongStream(systemPrompt, userMsg);

  } else if (intent === 'mind_map') {
    modelUsed = 'deepseek-reasoner';
    const systemPrompt = `你是一位精通结构化思维的学术教练。请根据用户提供的素材和笔记本标题《${notebookTitle}》，生成一份逻辑严密的思维导图。
请严格遵守以下规则：
1. 必须使用 Mermaid 语法 (使用 graph TD 或 mindmap 结构)。
2. 输出的内容必须直接包含在 \`\`\`mermaid 代码块中。
3. 不要输出任何代码块以外的解释性文字或思考过程。
4. 确保节点标签中如果包含特殊字符（如括号），请用引号包裹，例如：A["(子节点)"]。
5. 你可以使用适当的 Emoji 来增强视觉效果。

输出示例：
\`\`\`mermaid
graph TD
  A[核心主题] --> B[分支1]
  A --> C[分支2]
\`\`\`
`;
    const userMsg = `请根据笔记本《${notebookTitle}》 ${sourceContext}生成思维导图。用户消息：${message}`;
    streamGenerator = callMindMapStream(systemPrompt, userMsg);

  } else if (intent === 'deep_analysis') {
    modelUsed = 'deepseek-reasoner';
    const systemPrompt = `你是一位博学多识的学术研究助手，擅长历史与哲学的深度分析。
当前研究项目：《${notebookTitle}》 ${sourceContext}
请提供深入、严谨且富有批判性的分析，引用史料或哲学论据支撑观点，使用 Markdown 格式。`;
    streamGenerator = callDeepSeekReasonerStream(systemPrompt, message);

  } else {
    modelUsed = 'deepseek-chat';
    const systemPrompt = `你是一位博学多才的学术研究助手，专注于历史、哲学与人文领域。
当前研究项目：《${notebookTitle}》 ${sourceContext}
请根据参考资料和你的知识储备，提供深入、严谨且富有洞察力的回答，使用 Markdown 格式。`;
    streamGenerator = callDeepSeekChatStream(systemPrompt, message);
  }

  return { streamGenerator, modelUsed, isCard, intent };
}
