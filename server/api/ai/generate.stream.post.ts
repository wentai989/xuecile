import OpenAI from 'openai'
import { readFile } from 'node:fs/promises'
import { z } from 'zod'

const generateSchema = z.object({
  language: z.string().min(1, '请选择目标外语'),
  count: z.coerce.number()
    .min(1, '生成的数量不能少于 1')
    .max(500, '生成的数量不能大于 500')
    .default(50),
  description: z.string().trim().min(1, '请填写内容需求描述'),
  addons: z.array(z.string()).default([]),
  model: z.string().optional()
})

export default defineEventHandler(async (event: any) => {
  const body = await readBody(event) || {}
  
  // 1. 使用 Zod 进行表单数据验证
  const validationResult = generateSchema.safeParse(body?.form || {})
  
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues[0]?.message || '参数验证失败'
    return { code: 500, error: errorMessage }
  }

  const form = validationResult.data

  const apiUrl =
    process.env.NUXT_DASHSCOPE_API_URL ||
    process.env.DASHSCOPE_API_URL ||
    ''
  const apiKey =
    process.env.NUXT_DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY || ''
  const model =
    body?.model ||
    process.env.NUXT_DASHSCOPE_MODEL ||
    process.env.DASHSCOPE_MODEL ||
    'qwen3.5-plus'

  if (!apiUrl || !apiKey) {
    return { code: 500, error: 'API 配置缺失' }
  }

  const count = form.count
  const language = form.language
  const description = form.description
  const addons = form.addons

  let systemPrompt =
    process.env.NUXT_AI_SYSTEM_PROMPT ||
    'Return only a JSON array: [{word, phonetic, translation}]. translation must be only the word meaning, no extra content.'
  const promptFile = process.env.NUXT_AI_SYSTEM_PROMPT_FILE
  if (promptFile) {
    try {
      systemPrompt = await readFile(promptFile, 'utf-8')
    } catch {}
  }

  const outputSchema =
    process.env.NUXT_AI_OUTPUT_SCHEMA ||
    '{"fields":["word","phonetic","translation"]}'
  const prompt = `请基于以下参数生成 ${count} 个 ${language} 目标语言的学习词条。严格仅输出 JSON 数组，不要任何解释。\n字段规范：${outputSchema}\n\n附加要求：${addons.join('、') || '无'}\n需求描述：${description}`

  const openai = new OpenAI({ baseURL: apiUrl, apiKey })

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  // Disable nginx buffering
  setHeader(event, 'X-Accel-Buffering', 'no')

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature:
        (process.env.NUXT_AI_DISABLE_REASONING === 'true' ||
          process.env.AI_DISABLE_REASONING === 'true')
          ? 0
          : 0.7,
      stream: true
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(content)}\n\n`))
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
