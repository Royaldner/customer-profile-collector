/**
 * Database Schema Tests
 * Tests CRUD operations for customers and addresses tables
 *
 * Prerequisites: Run supabase/schema.sql in Supabase SQL Editor first
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { Customer, Address } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test data
const testCustomer = {
  name: 'Juan Dela Cruz',
  email: `test-${Date.now()}@example.com`, // Unique email for each test run
  phone: '09171234567',
  contact_preference: 'email' as const,
}

const testAddress = {
  label: 'Home',
  street_address: '123 Rizal Street',
  barangay: 'Barangay San Antonio',
  city: 'Makati City',
  province: 'Metro Manila',
  region: 'NCR',
  postal_code: '1203',
  is_default: true,
}

let createdCustomerId: string | null = null
let createdAddressId: string | null = null

describe('Database Schema Tests', () => {
  describe('Customers Table', () => {
    it('should create a customer', async () => {
      const { data, error } = await supabase
        .from('customers')
        .insert(testCustomer)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.name).toBe(testCustomer.name)
      expect(data?.email).toBe(testCustomer.email)
      expect(data?.phone).toBe(testCustomer.phone)
      expect(data?.contact_preference).toBe(testCustomer.contact_preference)
      expect(data?.id).toBeDefined()
      expect(data?.created_at).toBeDefined()
      expect(data?.updated_at).toBeDefined()

      createdCustomerId = data?.id ?? null
    })

    it('should read the created customer', async () => {
      expect(createdCustomerId).not.toBeNull()

      const { data, error } = await supabase
        .from('customers')
        .select()
        .eq('id', createdCustomerId!)
        .single()

      expect(error).toBeNull()
      expect(data?.name).toBe(testCustomer.name)
    })

    it('should update the customer', async () => {
      expect(createdCustomerId).not.toBeNull()

      const updatedName = 'Juan Dela Cruz Jr.'
      const { data, error } = await supabase
        .from('customers')
        .update({ name: updatedName })
        .eq('id', createdCustomerId!)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.name).toBe(updatedName)
    })

    it('should reject duplicate email', async () => {
      const { error } = await supabase
        .from('customers')
        .insert({ ...testCustomer }) // Same email

      expect(error).not.toBeNull()
      expect(error?.code).toBe('23505') // Unique violation
    })

    it('should reject invalid contact_preference', async () => {
      const { error } = await supabase
        .from('customers')
        .insert({
          ...testCustomer,
          email: `invalid-${Date.now()}@example.com`,
          contact_preference: 'fax', // Invalid value
        })

      expect(error).not.toBeNull()
    })
  })

  describe('Addresses Table', () => {
    it('should create an address for the customer', async () => {
      expect(createdCustomerId).not.toBeNull()

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...testAddress,
          customer_id: createdCustomerId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.label).toBe(testAddress.label)
      expect(data?.street_address).toBe(testAddress.street_address)
      expect(data?.barangay).toBe(testAddress.barangay)
      expect(data?.city).toBe(testAddress.city)
      expect(data?.province).toBe(testAddress.province)
      expect(data?.region).toBe(testAddress.region)
      expect(data?.postal_code).toBe(testAddress.postal_code)
      expect(data?.is_default).toBe(true)

      createdAddressId = data?.id ?? null
    })

    it('should read the created address', async () => {
      expect(createdAddressId).not.toBeNull()

      const { data, error } = await supabase
        .from('addresses')
        .select()
        .eq('id', createdAddressId!)
        .single()

      expect(error).toBeNull()
      expect(data?.barangay).toBe(testAddress.barangay)
    })

    it('should allow only one default address per customer', async () => {
      expect(createdCustomerId).not.toBeNull()

      // Try to create another default address
      const { error } = await supabase
        .from('addresses')
        .insert({
          ...testAddress,
          customer_id: createdCustomerId,
          label: 'Work',
          is_default: true, // Another default - should fail
        })

      expect(error).not.toBeNull()
      expect(error?.code).toBe('23505') // Unique violation on partial index
    })

    it('should allow non-default addresses', async () => {
      expect(createdCustomerId).not.toBeNull()

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...testAddress,
          customer_id: createdCustomerId,
          label: 'Work',
          street_address: '456 Ayala Avenue',
          is_default: false,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.is_default).toBe(false)
    })

    it('should fetch customer with addresses', async () => {
      expect(createdCustomerId).not.toBeNull()

      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          addresses (*)
        `)
        .eq('id', createdCustomerId!)
        .single()

      expect(error).toBeNull()
      expect(data?.addresses).toBeDefined()
      expect(data?.addresses.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Cascade Delete', () => {
    it('should delete addresses when customer is deleted', async () => {
      expect(createdCustomerId).not.toBeNull()

      // Delete the customer
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', createdCustomerId!)

      expect(deleteError).toBeNull()

      // Verify addresses are also deleted
      const { data: addresses } = await supabase
        .from('addresses')
        .select()
        .eq('customer_id', createdCustomerId!)

      expect(addresses).toEqual([])
    })
  })
})
