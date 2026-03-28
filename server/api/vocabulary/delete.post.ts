import { getDb } from '~/server/utils/mysql'
import { vocabularies, words } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id } = body || {}
    const user_id = event.context.user?.id

    if (!user_id || !id) {
      return { code: 400, error: '参数不合法' }
    }

    const db = await getDb()

    const vocabularyId = Number(id)
    if (!vocabularyId || isNaN(vocabularyId)) {
      return { code: 400, error: '参数不合法' }
    }

    const existing = await db.select()
      .from(vocabularies)
      .where(and(
        eq(vocabularies.user_id, user_id),
        eq(vocabularies.id, vocabularyId)
      ))
      .limit(1)

    if (!existing || existing.length === 0) {
      return { code: 404, error: '词库不存在或无权限' }
    }

    await db.delete(words).where(eq(words.vocabulary_id, vocabularyId))
    await db.delete(vocabularies).where(eq(vocabularies.id, vocabularyId))

    return { code: 200, message: '删除成功' }
  } catch (error) {
    console.error('Delete vocabulary failed:', error)
    return { code: 500, error: '删除词库失败' }
  }
})
