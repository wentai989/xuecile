import { getDb } from '~/server/utils/mysql'
import { errorWords } from '~/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { language, word, phonetic, translation } = body
    const user_id = event.context.user?.id

    if (!user_id || !language || !word) {
      return { code: 400, error: '缺少必要参数' }
    }

    const db = await getDb()

    // 检查是否已经存在该单词
    const existing = await db.select()
      .from(errorWords)
      .where(and(
        eq(errorWords.user_id, user_id),
        eq(errorWords.language, language),
        eq(errorWords.word, word)
      ))
      .limit(1)

    if (existing && existing.length > 0) {
      // 如果存在，增加错误次数
      await db.update(errorWords)
        .set({ 
          error_count: sql`${errorWords.error_count} + 1`
        })
        .where(eq(errorWords.id, existing[0].id))
        
      return {
        code: 200,
        data: { message: '错词错误次数已更新' }
      }
    } else {
      // 如果不存在，新增记录
      await db.insert(errorWords).values({
        user_id,
        language,
        word,
        phonetic: phonetic || '',
        translation: translation || ''
      })
      
      return {
        code: 200,
        data: { message: '已加入错词本' }
      }
    }
  } catch (error: any) {
    console.error('Error saving error word:', error)
    return { code: 500, error: error.message || 'Internal server error' }
  }
})
