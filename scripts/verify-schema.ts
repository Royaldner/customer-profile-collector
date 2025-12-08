/**
 * Database Schema Verification Script
 * Run this after executing schema.sql in Supabase SQL Editor
 *
 * Usage: npx tsx scripts/verify-schema.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifySchema() {
  console.log('🔍 Verifying database schema...\n')

  const testEmail = `test-${Date.now()}@example.com`
  let customerId: string | null = null

  try {
    // Test 1: Create customer
    console.log('1️⃣  Testing customer creation...')
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: 'Juan Dela Cruz',
        email: testEmail,
        phone: '09171234567',
        contact_preference: 'email',
      })
      .select()
      .single()

    if (customerError) throw new Error(`Customer creation failed: ${customerError.message}`)
    customerId = customer.id
    console.log('   ✅ Customer created successfully')

    // Test 2: Create address with Philippine format
    console.log('2️⃣  Testing address creation (Philippine format)...')
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .insert({
        customer_id: customerId,
        label: 'Home',
        street_address: '123 Rizal Street',
        barangay: 'Barangay San Antonio',
        city: 'Makati City',
        province: 'Metro Manila',
        region: 'NCR',
        postal_code: '1203',
        is_default: true,
      })
      .select()
      .single()

    if (addressError) throw new Error(`Address creation failed: ${addressError.message}`)
    console.log('   ✅ Address created successfully')

    // Test 3: Verify one default address constraint
    console.log('3️⃣  Testing one-default-address constraint...')
    const { error: duplicateError } = await supabase
      .from('addresses')
      .insert({
        customer_id: customerId,
        label: 'Work',
        street_address: '456 Ayala Avenue',
        barangay: 'Barangay Poblacion',
        city: 'Makati City',
        province: 'Metro Manila',
        postal_code: '1200',
        is_default: true, // Should fail - already have a default
      })

    if (duplicateError) {
      console.log('   ✅ Constraint working: Duplicate default address rejected')
    } else {
      throw new Error('Constraint NOT working: Should have rejected duplicate default address')
    }

    // Test 4: Fetch customer with addresses
    console.log('4️⃣  Testing customer with addresses fetch...')
    const { data: customerWithAddresses, error: fetchError } = await supabase
      .from('customers')
      .select(`*, addresses (*)`)
      .eq('id', customerId)
      .single()

    if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`)
    if (!customerWithAddresses.addresses || customerWithAddresses.addresses.length === 0) {
      throw new Error('No addresses returned with customer')
    }
    console.log('   ✅ Customer with addresses fetched successfully')

    // Test 5: Cascade delete
    console.log('5️⃣  Testing cascade delete...')
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)

    if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`)

    const { data: orphanedAddresses } = await supabase
      .from('addresses')
      .select()
      .eq('customer_id', customerId)

    if (orphanedAddresses && orphanedAddresses.length > 0) {
      throw new Error('Cascade delete NOT working: Addresses still exist after customer deletion')
    }
    console.log('   ✅ Cascade delete working correctly')

    console.log('\n✅ All schema verifications passed!\n')
    console.log('Database is ready for Phase 3: Customer Registration Form')

  } catch (error) {
    console.error('\n❌ Verification failed:', error)

    // Cleanup on failure
    if (customerId) {
      await supabase.from('customers').delete().eq('id', customerId)
    }
    process.exit(1)
  }
}

verifySchema()
