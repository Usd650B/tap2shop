const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for migrations
)

async function runMigration() {
  console.log('Starting RLS policy migration...')
  
  try {
    // Read the migration SQL
    const fs = require('fs')
    const path = require('path')
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/fix_rls_policies.sql'), 
      'utf8'
    )
    
    console.log('Executing migration SQL...')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }
    
    console.log('Migration completed successfully!')
    console.log('RLS policies have been updated to fix order access issues.')
    
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

runMigration()
