import { getDb } from '~/server/utils/mysql'
import { vocabularies } from '~/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const language = query.language as string | undefined
    const user_id = event.context.user?.id

    if (!user_id) {
      return { code: 400, error: '缺少必要参数1' }
    }

    const db = await getDb()

    // 如果传了 language 就过滤，否则查全部
    const conditions = [eq(vocabularies.user_id, user_id)]
    if (language) {
      conditions.push(eq(vocabularies.language, language))
    }

    // Fetch user's vocabularies ordered by latest
    const result = await db.select()
      .from(vocabularies)
      .where(and(...conditions))
      .orderBy(desc(vocabularies.created_at))

    return {
      code: 200,
      data: result
    }
  } catch (error: any) {
    console.error('Error fetching vocabularies:', error)
    return { code: 500, error: error.message || 'Internal server error' }
  }
})
