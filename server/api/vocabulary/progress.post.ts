import { getDb } from '~/server/utils/mysql'
import { vocabularies } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, learned_count, status } = body
    const user_id = event.context.user?.id

    if (!id || !user_id || learned_count === undefined) {
      return { code: 400, error: 'Missing required fields' }
    }

    const db = await getDb()

    // 验证词库是否存在且属于该用户
    const existing = await db.select().from(vocabularies).where(
      and(
        eq(vocabularies.id, id),
        eq(vocabularies.user_id, user_id)
      )
    ).limit(1)

    if (!existing || existing.length === 0) {
      return { code: 404, error: 'Vocabulary not found or permission denied' }
    }

    // 确保 learned_count 不会超过总词数
    const totalCount = existing[0].count
    const validLearnedCount = Math.min(Math.max(0, learned_count), totalCount)
    
    // 自动计算状态（前端传了就用前端的，没传则根据进度计算）
    let finalStatus = status
    if (!finalStatus) {
      if (validLearnedCount === 0) {
        finalStatus = 'not_started'
      } else if (validLearnedCount >= totalCount) {
        finalStatus = 'completed'
      } else {
        finalStatus = 'in_progress'
      }
    }

    await db.update(vocabularies)
      .set({ 
        learned_count: validLearnedCount,
        status: finalStatus
      })
      .where(eq(vocabularies.id, id))

    return {
      code: 200,
      data: {
        message: 'Progress updated successfully',
        learned_count: validLearnedCount,
        status: finalStatus
      }
    }
  } catch (error: any) {
    console.error('Error updating progress:', error)
    return { code: 500, error: error.message || 'Internal server error' }
  }
})
