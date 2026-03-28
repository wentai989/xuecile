import { getDb } from '~/server/utils/mysql'
import { errorWords } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
  const { language, word } = body || {}
  const user_id = event.context.user?.id

  if (!user_id || !language || !word) {
    return { code: 500, error: '参数不合法' }
    }

    const db = await getDb()

    // 根据 user_id, language, word 精确删除该错词记录
    await db.delete(errorWords)
      .where(and(
        eq(errorWords.user_id, user_id),
        eq(errorWords.language, language),
        eq(errorWords.word, word)
      ))

    return { code: 200, message: '删除成功' }
  } catch (error) {
    console.error('Remove error word failed:', error)
    return { code: 500, error: '删除错词失败' }
  }
})