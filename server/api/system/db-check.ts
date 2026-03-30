import { getDb } from '../../utils/mysql'
import { users } from '../../db/schema'

export default defineEventHandler(async () => {
  try {
    const db = await getDb()
    await db.select().from(users).limit(1)
    return { code: 200, data: { usersTable: 'ok' } }
  } catch (e: any) {
    return { code: 500, error: e?.message || String(e) }
  }
})
