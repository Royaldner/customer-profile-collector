/**
 * Customer Profile Collector - Zod Validation Tests
 * Tests for customer and address schema validation
 */

import { describe, it, expect } from 'vitest'
import {
  addressSchema,
  customerSchema,
  customerWithAddressesSchema,
  type AddressFormData,
  type CustomerFormData,
} from '@/lib/validations/customer'

describe('Address Schema Validation', () => {
  const validAddress: AddressFormData = {
    label: 'Home',
    street_address: '123 Main Street',
    barangay: 'San Antonio',
    city: 'Makati',
    province: 'Metro Manila',
    region: 'NCR',
    postal_code: '1203',
    is_default: true,
  }

  describe('Valid Addresses', () => {
    it('should validate a complete valid address', () => {
      const result = addressSchema.safeParse(validAddress)
      expect(result.success).toBe(true)
    })

    it('should validate 4-digit postal codes', () => {
      const codes = ['0000', '1234', '9999']
      codes.forEach(code => {
        const r = addressSchema.safeParse({...validAddress, postal_code: code})
        expect(r.success).toBe(true)
      })
    })
  })

  describe('Invalid Postal Codes', () => {
    it('should reject 3-digit postal code', () => {
      const r = addressSchema.safeParse({...validAddress, postal_code: '123'})
      expect(r.success).toBe(false)
    })

    it('should reject postal code with letters', () => {
      const r = addressSchema.safeParse({...validAddress, postal_code: '12AB'})
      expect(r.success).toBe(false)
    })
  })
})

describe('Customer Schema Validation', () => {
  const validCustomer: CustomerFormData = {
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '09171234567',
    contact_preference: 'email',
    delivery_method: 'delivered',
  }

  it('should validate valid customer', () => {
    const r = customerSchema.safeParse(validCustomer)
    expect(r.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const r = customerSchema.safeParse({...validCustomer, email: 'invalid'})
    expect(r.success).toBe(false)
  })

  it('should reject short phone', () => {
    const r = customerSchema.safeParse({...validCustomer, phone: '123'})
    expect(r.success).toBe(false)
  })
})

describe('Customer With Addresses Schema', () => {
  const validCustomer: CustomerFormData = {
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '09171234567',
    contact_preference: 'email',
    delivery_method: 'delivered',
    courier: 'lbc',
  }

  const validAddress = {
    label: 'Home',
    street_address: '123 Main Street',
    barangay: 'San Antonio',
    city: 'Makati',
    province: 'Metro Manila',
    region: 'NCR',
    postal_code: '1203',
    is_default: true,
  }

  it('should validate customer with one address', () => {
    const data = { customer: validCustomer, addresses: [validAddress] }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(true)
  })

  it('should reject no addresses', () => {
    const data = { customer: validCustomer, addresses: [] }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(false)
  })

  it('should reject no default address', () => {
    const data = { customer: validCustomer, addresses: [{...validAddress, is_default: false}] }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(false)
  })

  it('should reject multiple default addresses', () => {
    const data = { 
      customer: validCustomer, 
      addresses: [
        validAddress,
        {...validAddress, label: 'Work', is_default: true}
      ] 
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(false)
  })
})


describe('Address Schema - Additional Edge Cases', () => {
  const validAddress = {
    label: 'Home',
    street_address: '123 Main St',
    barangay: 'San Antonio',
    city: 'Makati',
    province: 'Metro Manila',
    region: 'NCR',
    postal_code: '1203',
    is_default: true,
  }

  it('should reject 5-digit postal code', () => {
    const r = addressSchema.safeParse({...validAddress, postal_code: '12345'})
    expect(r.success).toBe(false)
  })

  it('should reject postal with special chars', () => {
    const r = addressSchema.safeParse({...validAddress, postal_code: '12-3'})
    expect(r.success).toBe(false)
  })

  it('should reject empty city', () => {
    const r = addressSchema.safeParse({...validAddress, city: ''})
    expect(r.success).toBe(false)
  })

  it('should reject empty province', () => {
    const r = addressSchema.safeParse({...validAddress, province: ''})
    expect(r.success).toBe(false)
  })

  it('should reject label exceeding 100 chars', () => {
    const r = addressSchema.safeParse({...validAddress, label: 'a'.repeat(101)})
    expect(r.success).toBe(false)
  })

  it('should validate label at 100 chars', () => {
    const r = addressSchema.safeParse({...validAddress, label: 'a'.repeat(100)})
    expect(r.success).toBe(true)
  })

  it('should reject street exceeding 500 chars', () => {
    const r = addressSchema.safeParse({...validAddress, street_address: 'a'.repeat(501)})
    expect(r.success).toBe(false)
  })

  it('should validate street at 500 chars', () => {
    const r = addressSchema.safeParse({...validAddress, street_address: 'a'.repeat(500)})
    expect(r.success).toBe(true)
  })
})

describe('Customer Schema - Additional Edge Cases', () => {
  const validCustomer = {
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '09171234567',
    contact_preference: 'email' as const,
    delivery_method: 'delivered' as const,
  }

  it('should validate phone contact preference', () => {
    const r = customerSchema.safeParse({...validCustomer, contact_preference: 'phone'})
    expect(r.success).toBe(true)
  })

  it('should validate sms contact preference', () => {
    const r = customerSchema.safeParse({...validCustomer, contact_preference: 'sms'})
    expect(r.success).toBe(true)
  })

  it('should reject empty name', () => {
    const r = customerSchema.safeParse({...validCustomer, name: ''})
    expect(r.success).toBe(false)
  })

  it('should reject name exceeding 255 chars', () => {
    const r = customerSchema.safeParse({...validCustomer, name: 'a'.repeat(256)})
    expect(r.success).toBe(false)
  })

  it('should validate name at 255 chars', () => {
    const r = customerSchema.safeParse({...validCustomer, name: 'a'.repeat(255)})
    expect(r.success).toBe(true)
  })

  it('should reject email exceeding 255 chars', () => {
    const r = customerSchema.safeParse({...validCustomer, email: 'a'.repeat(250) + '@ex.com'})
    expect(r.success).toBe(false)
  })

  it('should reject phone exceeding 50 chars', () => {
    const r = customerSchema.safeParse({...validCustomer, phone: '0'.repeat(51)})
    expect(r.success).toBe(false)
  })

  it('should validate phone at 50 chars', () => {
    const r = customerSchema.safeParse({...validCustomer, phone: '0'.repeat(50)})
    expect(r.success).toBe(true)
  })

  it('should validate exactly 10-digit phone', () => {
    const r = customerSchema.safeParse({...validCustomer, phone: '0123456789'})
    expect(r.success).toBe(true)
  })

  it('should validate email with plus sign', () => {
    const r = customerSchema.safeParse({...validCustomer, email: 'user+tag@example.com'})
    expect(r.success).toBe(true)
  })

  it('should validate email with subdomain', () => {
    const r = customerSchema.safeParse({...validCustomer, email: 'user@mail.example.com'})
    expect(r.success).toBe(true)
  })
})

describe('Customer With Addresses - Additional Edge Cases', () => {
  const validCustomer = {
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '09171234567',
    contact_preference: 'email' as const,
    delivery_method: 'delivered' as const,
    courier: 'lbc',
  }

  const validAddress = {
    label: 'Home',
    street_address: '123 Main St',
    barangay: 'San Antonio',
    city: 'Makati',
    province: 'Metro Manila',
    region: 'NCR',
    postal_code: '1203',
    is_default: true,
  }

  it('should validate two addresses with one default', () => {
    const data = {
      customer: validCustomer,
      addresses: [
        validAddress,
        {...validAddress, label: 'Work', is_default: false}
      ]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(true)
  })

  it('should validate three addresses with one default', () => {
    const data = {
      customer: validCustomer,
      addresses: [
        validAddress,
        {...validAddress, label: 'Work', is_default: false},
        {...validAddress, label: 'Office', is_default: false}
      ]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(true)
  })

  it('should reject four addresses', () => {
    const data = {
      customer: validCustomer,
      addresses: [
        validAddress,
        {...validAddress, label: 'Work', is_default: false},
        {...validAddress, label: 'Office', is_default: false},
        {...validAddress, label: 'Vacation', is_default: false}
      ]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(false)
  })

  it('should reject all addresses set as default', () => {
    const data = {
      customer: validCustomer,
      addresses: [
        validAddress,
        {...validAddress, label: 'Work', is_default: true},
        {...validAddress, label: 'Office', is_default: true}
      ]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(false)
  })

  it('should reject none set as default', () => {
    const data = {
      customer: validCustomer,
      addresses: [
        {...validAddress, is_default: false},
        {...validAddress, label: 'Work', is_default: false}
      ]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(false)
  })

  it('should validate second address as default', () => {
    const data = {
      customer: validCustomer,
      addresses: [
        {...validAddress, is_default: false},
        {...validAddress, label: 'Work', is_default: true}
      ]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(true)
  })
})


describe('Boundary Value Tests', () => {
  const validAddress = {
    label: 'Home',
    street_address: '123 Main St',
    barangay: 'San Antonio',
    city: 'Makati',
    province: 'Metro Manila',
    region: 'NCR',
    postal_code: '1203',
    is_default: true,
  }

  const validCustomer = {
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '09171234567',
    contact_preference: 'email' as const,
    delivery_method: 'delivered' as const,
  }

  it('should validate barangay at 255 chars', () => {
    const r = addressSchema.safeParse({...validAddress, barangay: 'a'.repeat(255)})
    expect(r.success).toBe(true)
  })

  it('should reject barangay at 256 chars', () => {
    const r = addressSchema.safeParse({...validAddress, barangay: 'a'.repeat(256)})
    expect(r.success).toBe(false)
  })

  it('should validate city at 255 chars', () => {
    const r = addressSchema.safeParse({...validAddress, city: 'a'.repeat(255)})
    expect(r.success).toBe(true)
  })

  it('should reject city at 256 chars', () => {
    const r = addressSchema.safeParse({...validAddress, city: 'a'.repeat(256)})
    expect(r.success).toBe(false)
  })

  it('should validate province at 255 chars', () => {
    const r = addressSchema.safeParse({...validAddress, province: 'a'.repeat(255)})
    expect(r.success).toBe(true)
  })

  it('should reject province at 256 chars', () => {
    const r = addressSchema.safeParse({...validAddress, province: 'a'.repeat(256)})
    expect(r.success).toBe(false)
  })

  it('should validate region at 100 chars', () => {
    const r = addressSchema.safeParse({...validAddress, region: 'a'.repeat(100)})
    expect(r.success).toBe(true)
  })

  it('should reject region at 101 chars', () => {
    const r = addressSchema.safeParse({...validAddress, region: 'a'.repeat(101)})
    expect(r.success).toBe(false)
  })

  it('should validate email at 255 chars', () => {
    const email = 'a'.repeat(243) + '@example.com'
    const r = customerSchema.safeParse({...validCustomer, email})
    expect(r.success).toBe(true)
  })
})

describe('Philippine-Specific Validation', () => {
  const validAddress = {
    label: 'Home',
    street_address: 'Blk 5 Lot 10 Phase 2',
    barangay: 'Barangay San Antonio',
    city: 'Makati City',
    province: 'Metro Manila',
    region: 'NCR',
    postal_code: '1203',
    is_default: true,
  }

  it('should validate NCR region', () => {
    const r = addressSchema.safeParse({...validAddress, region: 'NCR'})
    expect(r.success).toBe(true)
  })

  it('should validate Region IV-A format', () => {
    const r = addressSchema.safeParse({...validAddress, region: 'Region IV-A (CALABARZON)'})
    expect(r.success).toBe(true)
  })

  it('should validate Philippine mobile number format', () => {
    const phones = ['09171234567', '09281234567', '09991234567']
    phones.forEach(phone => {
      const r = customerSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
        phone,
        contact_preference: 'sms' as const,
        delivery_method: 'delivered' as const,
      })
      expect(r.success).toBe(true)
    })
  })

  it('should validate Manila postal codes', () => {
    const codes = ['1000', '1200', '1600']
    codes.forEach(code => {
      const r = addressSchema.safeParse({...validAddress, postal_code: code})
      expect(r.success).toBe(true)
    })
  })
})

describe('Combined Validation Scenarios', () => {
  it('should reject customer with invalid data and invalid addresses', () => {
    const data = {
      customer: {
        name: '',
        email: 'not-an-email',
        phone: '123',
        contact_preference: 'email' as const,
        delivery_method: 'delivered' as const,
      },
      addresses: [{
        label: '',
        street_address: '',
        barangay: '',
        city: '',
        province: '',
        postal_code: 'ABCD',
        is_default: false
      }]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(false)
  })

  it('should validate complete valid registration', () => {
    const data = {
      customer: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '09171234567',
        contact_preference: 'email' as const,
        delivery_method: 'delivered' as const,
        courier: 'lbc',
      },
      addresses: [
        {
          label: 'Home',
          street_address: '123 Rizal Street',
          barangay: 'Barangay 1',
          city: 'Quezon City',
          province: 'Metro Manila',
          region: 'NCR',
          postal_code: '1100',
          is_default: true
        },
        {
          label: 'Work',
          street_address: '456 Ayala Avenue',
          barangay: 'Bel-Air',
          city: 'Makati',
          province: 'Metro Manila',
          region: 'NCR',
          postal_code: '1200',
          is_default: false
        }
      ]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(true)
  })

  it('should validate complete registration with three addresses', () => {
    const data = {
      customer: {
        name: 'Jose Rizal',
        email: 'jose.rizal@national.ph',
        phone: '09991234567',
        contact_preference: 'phone' as const,
        delivery_method: 'cod' as const,
        courier: 'jrs',
      },
      addresses: [
        {
          label: 'Home',
          street_address: 'Calamba',
          barangay: 'Barangay Real',
          city: 'Calamba',
          province: 'Laguna',
          region: 'Region IV-A',
          postal_code: '4027',
          is_default: true
        },
        {
          label: 'Office',
          street_address: 'Intramuros',
          barangay: 'Barangay 659',
          city: 'Manila',
          province: 'Metro Manila',
          region: 'NCR',
          postal_code: '1002',
          is_default: false
        },
        {
          label: 'Vacation Home',
          street_address: 'Dapitan St',
          barangay: 'Barangay 370',
          city: 'Manila',
          province: 'Metro Manila',
          region: 'NCR',
          postal_code: '1011',
          is_default: false
        }
      ]
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(true)
  })

  it('should validate pickup order without addresses', () => {
    const data = {
      customer: {
        name: 'Pickup Customer',
        email: 'pickup@example.com',
        phone: '09171234567',
        contact_preference: 'email' as const,
        delivery_method: 'pickup' as const,
      },
      addresses: []
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(true)
  })

  it('should reject delivery order without addresses', () => {
    const data = {
      customer: {
        name: 'Delivery Customer',
        email: 'delivery@example.com',
        phone: '09171234567',
        contact_preference: 'email' as const,
        delivery_method: 'delivered' as const,
      },
      addresses: []
    }
    const r = customerWithAddressesSchema.safeParse(data)
    expect(r.success).toBe(false)
  })
})
