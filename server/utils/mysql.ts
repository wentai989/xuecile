import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from '../db/schema'

let pool: mysql.Pool | null = null
let db: any = null
let initialized = false

const getPool = async () => {
  if (pool) return pool
  const url = process.env.NUXT_MYSQL_URL || process.env.MYSQL_URL
  if (url) {
    pool = mysql.createPool(url)
  } else {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 3306),
      connectionLimit: 5
    })
  }
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
