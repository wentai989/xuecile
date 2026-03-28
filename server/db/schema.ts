import { mysqlTable, int, varchar, text, json, timestamp, primaryKey } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  phone: varchar('phone', { length: 191 }).notNull(),
  password: varchar('password', { length: 191 }).notNull(),
  name: varchar('name', { length: 191 }).notNull()
})

export const vocabularies = mysqlTable('vocabularies', {
  id: int('id').autoincrement().primaryKey(),
  user_id: int('user_id').notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  description: text('description'),
  count: int('count').notNull(),
  learned_count: int('learned_count').default(0).notNull(), // 已学习数量
  status: varchar('status', { length: 50 }).default('not_started').notNull(), // not_started, in_progress, completed

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
})

// 错词本表
export const errorWords = mysqlTable('error_words', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  word: varchar('word', { length: 255 }).notNull(),
  phonetic: varchar('phonetic', { length: 255 }),
  translation: text('translation'),
  error_count: int('error_count').default(1).notNull(), // 错误次数，默认1
  created_at: timestamp('created_at').defaultNow().notNull()
})

// AI 对话历史表
export const studyAiChat = mysqlTable('study_ai_chat', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull(),
  word: varchar('word', { length: 255 }).notNull(), // 针对哪个词的提问
  language: varchar('language', { length: 50 }).notNull(),
  user_message: text('user_message').notNull(), // 用户的提问
  ai_response: text('ai_response').notNull(), // AI 的回答 (content)
  created_at: timestamp('created_at').defaultNow().notNull()
})

export const words = mysqlTable('words', {
  id: int('id').autoincrement().primaryKey(),
  vocabulary_id: int('vocabulary_id'),
  order_index: int('order_index').default(0),
  word_text: varchar('word_text', { length: 255 }).notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  phonetic: varchar('phonetic', { length: 255 }),
  translation: text('translation'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
})

export const vocabularyListWords = mysqlTable('vocabulary_list_words', {
  vocabulary_id: int('vocabulary_id').notNull(),
  word_id: int('word_id').notNull(),
  order_index: int('order_index').default(0).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.vocabulary_id, table.word_id] })
  }
})
