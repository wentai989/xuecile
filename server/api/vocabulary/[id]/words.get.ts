import { getDb } from '~/server/utils/mysql'
import { vocabularies, words } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const vocabularyId = Number(getRouterParam(event, 'id'))
    const user_id = event.context.user?.id

    if (!vocabularyId || isNaN(vocabularyId)) {
      return { code: 400, error: 'Invalid Vocabulary ID' }
    }

    if (!user_id) {
      return { code: 400, error: 'User ID is required' }
    }

    const db = await getDb()

    // 验证词汇列表是否存在且属于该用户
    const existingVocabulary = await db.select()
      .from(vocabularies)
      .where(and(
        eq(vocabularies.id, vocabularyId),
        eq(vocabularies.user_id, user_id)
      ))
      .limit(1)

    if (!existingVocabulary || existingVocabulary.length === 0) {
      return { code: 404, error: 'Vocabulary not found or permission denied' }
    }

    // 获取词汇列表中的所有单词
    const result = await db.select({
        id: words.id,
        word_text: words.word_text,
        language: words.language,
        phonetic: words.phonetic,
        translation: words.translation,
      })
      .from(words)
      .where(eq(words.vocabulary_id, vocabularyId))
      .orderBy(words.order_index)

    return {
      code: 200,
      data: result
    }
  } catch (error: any) {
    console.error('Error fetching vocabulary words:', error)
    return { code: 500, error: error.message || 'Internal server error' }
  }
})
