import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from '../db/schema'
import * as dotenv from 'dotenv'

// 强制加载 .env 文件（主要为了线上 node .output/server/index.mjs 启动时能读到）
dotenv.config()

let pool: mysql.Pool | null = null
let db: any = null
let initialized = false

const getPool = async () => {
  if (pool) return pool
  
  // 只使用离散配置进行连接，不再使用拼接的 URL
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    // 增加以下配置防止线上环境参数解析/时区报错
    dateStrings: true,
    timezone: '+08:00',
    charset: 'utf8mb4'
  })
  
  return pool
}

const ensureInit = async () => {
  if (initialized) return
  const p = await getPool()
  db = drizzle(p, { schema, mode: 'default' })
  initialized = true
}

export const getDb = async () => {
  await ensureInit()
  return db
}

export const getMysqlStatus = async () => {
  try {
    const p = await getPool()
    const [rows] = await p.query('SELECT 1 as ok')
    return { ok: true, rows }
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) }
  }
}
