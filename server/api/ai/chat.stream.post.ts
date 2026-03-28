import OpenAI from 'openai'
import { z } from 'zod'

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  context: z.object({
    word: z.string().optional(),
    translation: z.string().optional(),
    language: z.string().optional()
  }).optional()
})

export default defineEventHandler(async (event: any) => {
  const body = await readBody(event) || {}
  
  const validationResult = chatSchema.safeParse(body)
  
  if (!validationResult.success) {
    return { code: 400, error: '参数验证失败' }
  }

  const { messages, context } = validationResult.data

  const apiUrl =
    process.env.NUXT_DASHSCOPE_API_URL ||
    process.env.DASHSCOPE_API_URL ||
    ''
  const apiKey =
    process.env.NUXT_DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY || ''
  const model =
    process.env.NUXT_DASHSCOPE_MODEL ||
    process.env.DASHSCOPE_MODEL ||
    'qwen3.5-plus'

  if (!apiUrl || !apiKey) {
    return { code: 500, error: 'API 配置缺失' }
  }

  let systemPrompt = `你是一个名为 Tutor_AI 的多语种外语学习专家。请根据用户的具体提问，提供**精准、重点突出**的解答。

如果用户问的是特定的方面（例如：只问了“例句”、“释义”或“记忆技巧”），请**只针对该方面**进行深入详尽的解答，不要啰嗦其他无关内容。

只有当用户的问题非常宽泛（比如仅仅发送了一个词汇，或者说“分析一下这个词”）时，你才需要提供全面的分析，此时可以包含以下部分或全部内容：
1. 核心释义、词性与发音要点。
2. 词源分析/词根词缀/汉字构成。
3. 近义词/反义词辨析。
4. 常见搭配/固定用法/惯用句。
5. 2-3个高质量的、符合真实语境的双语例句。

请务必使用**纯 Markdown 格式**回答。你可以使用 Markdown 的标题（##, ###）、加粗（**加粗**）、列表（-）、引用（>）等标准语法来组织内容，使排版清晰易读。
**绝对不要**使用任何 HTML 标签或 Tailwind CSS 类名。`

  if (context && context.word) {
    systemPrompt += `\n当前用户正在学习的内容是：${context.word}（翻译：${context.translation || '未知'}，目标语言：${context.language || '未知'}）。请结合这个上下文进行回答。`
  }

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ]

  const openai = new OpenAI({ baseURL: apiUrl, apiKey })

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: apiMessages as any,
      temperature: 0.7,
      stream: true
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta || {}
            
            // 兼容支持深度思考的模型（如 deepseek-r1, qwen-max 等可能返回 reasoning_content）
            const content = delta.content || ''
            const reasoning = (delta as any).reasoning_content || ''
            
            if (content || reasoning) {
              const payload = {
                content,
                reasoning
              }
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`))
            }
          }
          controller.enqueue(new TextEncoder().encode('data: "[DONE]"\n\n'))
          controller.close()
        } catch (e: any) {
          controller.enqueue(new TextEncoder().encode(`data: {"error": ${JSON.stringify(e?.message || String(e))}}\n\n`))
          controller.close()
        }
      }
    })

    return sendStream(event, readableStream)
  } catch (e: any) {
    return { code: 500, error: e?.message || String(e) }
  }
})