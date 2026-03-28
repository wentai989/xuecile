import { getDb } from '../../utils/mysql'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default async (event: any) => {
  const url = event?.node?.req?.url || ''
  const u = new URL(url, 'http://localhost')
  const phone = u.searchParams.get('phone') || ''
  const password = u.searchParams.get('password') || ''
  try {
    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.phone, phone)
    })
    if (user && user.password === password) {
      const token = 'mock_' + Math.random().toString(36).slice(2)
      return { code: 200, data: { token, user: { id: user.id, phone: user.phone, name: user.name } } }
    }
    return { code: 500, error: '用户名或密码错误' }
  } catch (e: any) {
    return { code: 500, error: e?.message || String(e) }
  }
}
