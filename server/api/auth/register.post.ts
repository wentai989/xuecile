import { getDb } from '../../utils/mysql'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { signToken } from '../../utils/auth'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {}
  
  const { phone = '', password = '', name = '' } = body
  if (!phone || !password) {
    return { code: 500, error: '参数不合法' }
  }
  try {
    const db = await getDb()
    const exist = await db.query.users.findFirst({
      where: eq(users.phone, phone)
    })
    if (exist) {
      return { code: 500, error: '手机号已注册' }
    }
    await db.insert(users).values({
      phone,
      password,
      name: name || `用户_${phone.slice(-4)}`
    })
    
    // 注册成功后直接签发 token 自动登录
    const newUser = await db.query.users.findFirst({
      where: eq(users.phone, phone)
    })
    if (newUser) {
      const token = signToken({ id: newUser.id, phone: newUser.phone, name: newUser.name })
      return { code: 200, data: { token, user: { id: newUser.id, phone: newUser.phone, name: newUser.name } } }
    }
    
    return { code: 200, data: '注册成功' }
  } catch (e: any) {
    return { code: 500, error: e?.message || String(e) }
  }
})
