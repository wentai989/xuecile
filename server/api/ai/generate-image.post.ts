import OpenAI from 'openai'
import { z } from 'zod'

const generateImageSchema = z.object({
  language: z.string().min(1, '请选择目标外语'),
  description: z.string().optional(),
  imageBase64: z.string().min(1, '图片数据不能为空'), // e.g. "data:image/jpeg;base64,..."
  model: z.string().optional()
})

export default defineEventHandler(async (event: any) => {
  const body = await readBody(event) || {}
  
  const validationResult = generateImageSchema.safeParse(body)
  
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues[0]?.message || '参数验证失败'
    return { code: 500, error: errorMessage }
  }

  const { language, description, imageBase64, model: reqModel } = validationResult.data

  const apiUrl =
    process.env.NUXT_DASHSCOPE_API_URL ||
    process.env.DASHSCOPE_API_URL ||
    ''
  const apiKey =
    process.env.NUXT_DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY || ''
  
  // 对于阿里云，视觉模型一般是 qwen-vl-plus 或者 qwen-vl-max
  const model = reqModel || 'qwen-vl-max'

  if (!apiUrl || !apiKey) {
    return { code: 500, error: 'API 配置缺失' }
  }

  const outputSchema =
    process.env.NUXT_AI_OUTPUT_SCHEMA ||
    '{"fields":["word","phonetic","translation"]}'
  let prompt = `请从这张图片中提取外语单词，目标语言是 ${language}。将提取出的词汇整理为严格的 JSON 数组格式，不要任何解释。
如果图片中没有文字或无法提取，请返回空数组 []。
字段规范：${outputSchema}
`

  if (description) {
    prompt += `\n用户的附加需求描述：${description}`
  }

  const openai = new OpenAI({ baseURL: apiUrl, apiKey })

  let systemPrompt =
    process.env.NUXT_AI_SYSTEM_PROMPT ||
    'Return only a JSON array: [{word, phonetic, translation}]. translation must be only the word meaning, no extra content.'
  const promptFile = process.env.NUXT_AI_SYSTEM_PROMPT_FILE
  if (promptFile) {
    try {
      const { readFile } = await import('node:fs/promises')
      systemPrompt = await readFile(promptFile, 'utf-8')
    } catch {}
  }

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      temperature: 0.1,
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
