// Test file to verify Supabase connection
// Run this in your browser console or as a temporary component

import { supabase } from '@/lib/supabase'

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('shops')
      .select('count')
      .single()
    
    if (error) {
      console.error('❌ Supabase Connection Error:', error)
      return false
    }
    
    console.log('✅ Supabase Connection Successful!')
    console.log('Shop count:', data)
    
    // Test order table access
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('count')
      .single()
    
    if (orderError) {
      console.error('❌ Orders Table Access Error:', orderError)
      return false
    }
    
    console.log('✅ Orders Table Access Successful!')
    console.log('Order count:', orderData)
    
    return true
  } catch (err) {
    console.error('❌ Unexpected Error:', err)
    return false
  }
}

// Auto-run test
testSupabaseConnection()

export default testSupabaseConnection
