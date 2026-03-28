import { getDb } from '../../utils/mysql'
import { studyAiChat } from '../../db/schema'
import { eq, and, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const word = query.word as string
  const language = query.language as string
  const user_id = event.context.user?.id

  if (!user_id || !word || !language) {
    return { code: 400, error: '缺少必要参数' }
  }

  try {
    const db = await getDb()
    
    // 获取该用户针对该单词的历史对话记录
    const history = await db.select()
      .from(studyAiChat)
      .where(and(
        eq(studyAiChat.user_id, user_id),
        eq(studyAiChat.word, word),
        eq(studyAiChat.language, language)
      ))
      .orderBy(studyAiChat.created_at) // 按时间正序排列

    // 转换为前端需要的消息格式
    const formattedMessages = []
    for (const record of history) {
      // 用户的提问
      formattedMessages.push({
        role: 'user',
        content: record.user_message,
        contextWord: record.word // 将关联的单词作为上下文标识传给前端展示
      })
      // AI 的回答
      formattedMessages.push({
        role: 'ai',
        content: record.ai_response
      })
    }

    return { code: 200, data: formattedMessages }
  } catch (error: any) {
    console.error('Failed to fetch AI chat history:', error)
    return { code: 500, error: '获取历史对话失败' }
  }
})