import { getDb } from '~/server/utils/mysql'
import { errorWords } from '~/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const language = query.language as string
    const userId = event.context.user?.id

    if (!userId || !language) {
      return { code: 400, error: '缺少必要参数' }
    }

    const db = await getDb()

    let conditions = undefined
    if (language && language !== 'all') {
      conditions = and(eq(errorWords.user_id, userId), eq(errorWords.language, language))
    } else {
      conditions = eq(errorWords.user_id, userId)
    }

    const list = await db.select()
      .from(errorWords)
      .where(conditions)
      .orderBy(desc(errorWords.error_count), desc(errorWords.created_at))

    return {
      code: 200,
      data: list
    }
  } catch (error: any) {
    console.error('Error fetching error words:', error)
    return { code: 500, error: error.message || 'Internal server error' }
  }
})
