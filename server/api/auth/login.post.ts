import { getDb } from '../../utils/mysql'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { signToken } from '../../utils/auth'

export default async (event: any) => {
  const req = event?.node?.req
  const body = await new Promise<any>((resolve) => {
    if (!req) return resolve({})
    let data = ''
    req.on('data', (chunk: any) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'))
      } catch {
        resolve({})
      }
    })
  })
  const { phone = '', password = '' } = body || {}
  if (!phone || !password) {
    return { code: 500, error: '参数不合法' }
  }
  try {
    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.phone, phone)
    })
    if (user && user.password === password) {
      // 签发真实 JWT token
      const token = signToken({ id: user.id, phone: user.phone, name: user.name })
      return { code: 200, data: { token, user: { id: user.id, phone: user.phone, name: user.name } } }
    }
    return { code: 500, error: '用户名或密码错误' }
  } catch (e: any) {
    return { code: 500, error: e?.message || String(e) }
  }
}
