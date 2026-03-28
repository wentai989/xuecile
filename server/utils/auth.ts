import jwt from 'jsonwebtoken'

// 实际项目中这个应该放在环境变量里
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-ai-danci'
const JWT_EXPIRES_IN = '7d' // token 有效期7天

export const signToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}