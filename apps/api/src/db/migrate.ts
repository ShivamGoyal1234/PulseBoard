import 'dotenv/config'
import path from 'node:path'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from './index'

async function run(): Promise<void> {
  const folder = path.join(__dirname, '../../drizzle')
  console.log(`[migrate] applying migrations from ${folder}`)
  await migrate(db, { migrationsFolder: folder })
  await pool.end()
}

run()
  .then(() => {
    console.log('[migrate] done')
    process.exit(0)
  })
  .catch((err) => {
    console.error('[migrate] failed:', err)
    process.exit(1)
  })
