import { getDb } from '../../utils/mysql'
import { studyAiChat } from '../../db/schema'
import { z } from 'zod'
import { sql } from 'drizzle-orm'

const saveChatSchema = z.object({
  word: z.string(),
  language: z.string(),
  user_message: z.string(),
  ai_response: z.string()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const validationResult = saveChatSchema.safeParse(body)
  if (!validationResult.success) {
    return { code: 400, error: '参数验证失败' }
  }

  const { word, language, user_message, ai_response } = validationResult.data
  const user_id = event.context.user?.id

  if (!user_id) {
    return { code: 400, error: '缺少必要参数' }
  }

  try {
    const db = await getDb()
    // 检查表是否存在，如果不存在则自动创建 (兜底逻辑)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS study_ai_chat (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        word VARCHAR(255) NOT NULL,
        language VARCHAR(50) NOT NULL,
        user_message TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    await db.insert(studyAiChat).values({
      user_id,
      word,
      language,
      user_message,
      ai_response
    })

    return { code: 200, message: '保存成功' }
  } catch (error: any) {
    console.error('Failed to save AI chat:', error)
    return { code: 500, error: '保存对话失败' }
  }
})