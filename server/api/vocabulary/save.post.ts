import { getDb } from '~/server/utils/mysql'
import { vocabularies, words } from '~/server/db/schema'


export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const user_id = event.context.user?.id

    // Validate body parameters
    if (!user_id) {
      return { code: 400, error: 'User ID is required' }
    }
    if (!body.words_data || !Array.isArray(body.words_data) || body.words_data.length === 0) {
      return { code: 400, error: 'Words data is empty' }
    }
    const validWords = body.words_data.filter((item: any) => item?.word_text)
    if (validWords.length === 0) {
      return { code: 400, error: 'Words data is empty' }
    }

    const db = await getDb()
    const vocabularyId = await db.transaction(async (tx: any) => {
      const [vocabularyResult] = await tx.insert(vocabularies).values({
        user_id: user_id,
        language: body.language || 'en',
        description: body.description || '',
        count: validWords.length,
      })
      const newVocabularyId = vocabularyResult.insertId

      for (const [index, wordData] of validWords.entries()) {
        await tx.insert(words).values({
          vocabulary_id: newVocabularyId,
          order_index: index,
          word_text: wordData.word_text,
          language: body.language || 'en',
          phonetic: wordData.phonetic || '',
          translation: wordData.translation || '',
        })
      }
      return newVocabularyId
    })

    return {
      code: 200,
      data: {
        id: vocabularyId,
        message: 'Vocabulary saved successfully'
      }
    }
  } catch (error: any) {
    console.error('Error saving vocabulary:', error)
    return { code: 500, error: error.message || 'Internal server error' }
  }
})
