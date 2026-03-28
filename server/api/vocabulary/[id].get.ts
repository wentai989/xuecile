import { getDb } from '~/server/utils/mysql'
import { vocabularies } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))

    if (!id || isNaN(id)) {
      return { code: 400, error: 'Invalid Vocabulary ID' }
    }

    const db = await getDb()

    const result = await db.select()
      .from(vocabularies)
      .where(eq(vocabularies.id, id))
      .limit(1)

    if (!result || result.length === 0) {
      return { code: 404, error: 'Vocabulary not found' }
    }

    return {
      code: 200,
      data: result[0]
    }
  } catch (error: any) {
    console.error('Error fetching vocabulary details:', error)
    return { code: 500, error: error.message || 'Internal server error' }
  }
})
