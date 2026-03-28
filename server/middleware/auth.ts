import { verifyToken } from '../utils/auth'

export default defineEventHandler((event) => {
  const url = event.node.req.url || ''
  
  // 只拦截以 /api/ 开头的请求
  if (url.startsWith('/api/')) {
    const path = url.split('?')[0]
    
    // 排除不需要登录的接口
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/register'
    ]
    
    if (publicPaths.includes(path)) {
      return
    }

    const authHeader = getHeader(event, 'Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: '未登录或 Token 不存在'
      })
    }
    
    const user = verifyToken(token)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Token 无效或已过期'
      })
    }
    
    // 将解析出的用户信息挂载到 context 上，后续业务 API 可以通过 event.context.user.id 访问
    event.context.user = user
  }
})