/**
 * Customer Profile Collector - Admin Components Tests
 * Tests for admin dashboard UI components and helper functions
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CustomerList } from '@/components/admin/customer-list'
import { Customer, Address } from '@/lib/types'

// Mock data generators
const createMockAddress = (overrides?: Partial<Address>): Address => ({
  id: 'addr-1',
  customer_id: 'cust-1',
  label: 'Home',
  street_address: '123 Main Street',
  barangay: 'San Antonio',
  city: 'Makati',
  province: 'Metro Manila',
  region: 'NCR',
  postal_code: '1203',
  is_default: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
})

const createMockCustomer = (overrides?: Partial<Customer>): Customer => ({
  id: 'cust-1',
  name: 'Juan Dela Cruz',
  email: 'juan@example.com',
  phone: '09171234567',
  contact_preference: 'email',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  addresses: [createMockAddress()],
  ...overrides,
})

describe('CustomerList Component', () => {
  describe('Rendering', () => {
    it('should render customer list with initial customers', () => {
      const customers = [createMockCustomer()]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument()
      expect(screen.getByText('juan@example.com')).toBeInTheDocument()
      expect(screen.getByText('09171234567')).toBeInTheDocument()
    })

    it('should display customer count', () => {
      const customers = [
        createMockCustomer({ id: '1', name: 'Customer 1' }),
        createMockCustomer({ id: '2', name: 'Customer 2' }),
        createMockCustomer({ id: '3', name: 'Customer 3' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.getByText(/Customers \(3\)/)).toBeInTheDocument()
    })

    it('should show empty state when no customers', () => {
      render(<CustomerList initialCustomers={[]} />)

      expect(screen.getByText('No customers registered yet.')).toBeInTheDocument()
    })

    it('should render table header columns', () => {
      const customers = [createMockCustomer()]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Phone' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Contact Pref.' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Location' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Registered' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter customers by name', async () => {
      const user = userEvent.setup()
      const customers = [
        createMockCustomer({ id: '1', name: 'Juan Dela Cruz' }),
        createMockCustomer({ id: '2', name: 'Maria Santos' }),
        createMockCustomer({ id: '3', name: 'Pedro Reyes' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'Maria')

      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      expect(screen.queryByText('Juan Dela Cruz')).not.toBeInTheDocument()
      expect(screen.queryByText('Pedro Reyes')).not.toBeInTheDocument()
    })

    it('should filter customers by email', async () => {
      const user = userEvent.setup()
      const customers = [
        createMockCustomer({ id: '1', email: 'juan@example.com' }),
        createMockCustomer({ id: '2', email: 'maria@test.com' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'test.com')

      expect(screen.getByText('maria@test.com')).toBeInTheDocument()
      expect(screen.queryByText('juan@example.com')).not.toBeInTheDocument()
    })

    it('should filter customers by phone', async () => {
      const user = userEvent.setup()
      const customers = [
        createMockCustomer({ id: '1', phone: '09171234567' }),
        createMockCustomer({ id: '2', phone: '09281234567' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, '0928')

      expect(screen.getByText('09281234567')).toBeInTheDocument()
      expect(screen.queryByText('09171234567')).not.toBeInTheDocument()
    })

    it('should be case-insensitive for name search', async () => {
      const user = userEvent.setup()
      const customers = [createMockCustomer({ name: 'Juan Dela Cruz' })]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'JUAN')

      expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument()
    })

    it('should be case-insensitive for email search', async () => {
      const user = userEvent.setup()
      const customers = [createMockCustomer({ email: 'juan@example.com' })]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'JUAN@EXAMPLE')

      expect(screen.getByText('juan@example.com')).toBeInTheDocument()
    })

    it('should show "no match" message when search returns no results', async () => {
      const user = userEvent.setup()
      const customers = [createMockCustomer({ name: 'Juan Dela Cruz' })]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'NonExistent')

      expect(screen.getByText('No customers match your search criteria.')).toBeInTheDocument()
      expect(screen.queryByText('Juan Dela Cruz')).not.toBeInTheDocument()
    })

    it('should update customer count when filtering', async () => {
      const user = userEvent.setup()
      const customers = [
        createMockCustomer({ id: '1', name: 'Juan Dela Cruz' }),
        createMockCustomer({ id: '2', name: 'Maria Santos' }),
        createMockCustomer({ id: '3', name: 'Pedro Reyes' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.getByText(/Customers \(3\)/)).toBeInTheDocument()

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'Maria')

      expect(screen.getByText(/Customers \(1 of 3\)/)).toBeInTheDocument()
    })
  })

  describe('Clear Filters', () => {
    it('should show clear filters button when search is active', async () => {
      const user = userEvent.setup()
      const customers = [createMockCustomer()]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.queryByText('Clear filters')).not.toBeInTheDocument()

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'test')

      expect(screen.getByText('Clear filters')).toBeInTheDocument()
    })
  })

  describe('Contact Preference Badge Display', () => {
    it('should display "Email" badge for email preference', () => {
      const customers = [createMockCustomer({ contact_preference: 'email' })]
      render(<CustomerList initialCustomers={customers} />)

      // Find the badge within a table cell
      const cells = screen.getAllByRole('cell')
      const badgeCell = cells.find(cell => cell.textContent === 'Email')
      expect(badgeCell).toBeDefined()
    })

    it('should display "Phone" badge for phone preference', () => {
      const customers = [createMockCustomer({ contact_preference: 'phone' })]
      render(<CustomerList initialCustomers={customers} />)

      const cells = screen.getAllByRole('cell')
      const badgeCell = cells.find(cell => cell.textContent === 'Phone')
      expect(badgeCell).toBeDefined()
    })

    it('should display "SMS" badge for sms preference', () => {
      const customers = [createMockCustomer({ contact_preference: 'sms' })]
      render(<CustomerList initialCustomers={customers} />)

      const cells = screen.getAllByRole('cell')
      const badgeCell = cells.find(cell => cell.textContent === 'SMS')
      expect(badgeCell).toBeDefined()
    })
  })

  describe('Address Display', () => {
    it('should display default address location', () => {
      const customers = [
        createMockCustomer({
          addresses: [
            createMockAddress({
              city: 'Quezon City',
              province: 'Metro Manila',
              is_default: true,
            }),
          ],
        }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.getByText('Quezon City, Metro Manila')).toBeInTheDocument()
    })

    it('should display first address when no default is set', () => {
      const customers = [
        createMockCustomer({
          addresses: [
            createMockAddress({
              city: 'Makati',
              province: 'Metro Manila',
              is_default: false,
            }),
          ],
        }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.getByText('Makati, Metro Manila')).toBeInTheDocument()
    })

    it('should display dash when customer has no addresses', () => {
      const customers = [createMockCustomer({ addresses: [] })]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should prioritize default address over non-default', () => {
      const customers = [
        createMockCustomer({
          addresses: [
            createMockAddress({
              id: '1',
              city: 'Manila',
              province: 'Metro Manila',
              is_default: false,
            }),
            createMockAddress({
              id: '2',
              city: 'Quezon City',
              province: 'Metro Manila',
              is_default: true,
            }),
          ],
        }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      expect(screen.getByText('Quezon City, Metro Manila')).toBeInTheDocument()
    })
  })

  describe('View Button', () => {
    it('should render View button for each customer', () => {
      const customers = [
        createMockCustomer({ id: '1' }),
        createMockCustomer({ id: '2' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      const viewButtons = screen.getAllByText('View')
      expect(viewButtons).toHaveLength(2)
    })

    it('should have correct link to customer detail page', () => {
      const customers = [createMockCustomer({ id: 'cust-123' })]
      render(<CustomerList initialCustomers={customers} />)

      const viewButton = screen.getByText('View')
      const link = viewButton.closest('a')
      expect(link).toHaveAttribute('href', '/admin/customers/cust-123')
    })
  })
})

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('should format date in Philippine locale', () => {
      const customer = createMockCustomer({
        created_at: '2024-01-15T10:00:00Z',
      })
      render(<CustomerList initialCustomers={[customer]} />)

      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument()
    })
  })

  describe('getDefaultAddress', () => {
    it('should return null when customer has no addresses', () => {
      const customer = createMockCustomer({ addresses: [] })
      render(<CustomerList initialCustomers={[customer]} />)

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should return null when addresses is undefined', () => {
      const customer = createMockCustomer({ addresses: undefined })
      render(<CustomerList initialCustomers={[customer]} />)

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should return default address when available', () => {
      const defaultAddr = createMockAddress({
        id: '1',
        city: 'Makati',
        province: 'Metro Manila',
        is_default: true,
      })
      const customer = createMockCustomer({ addresses: [defaultAddr] })
      render(<CustomerList initialCustomers={[customer]} />)

      expect(screen.getByText('Makati, Metro Manila')).toBeInTheDocument()
    })

    it('should return first address when no default is set', () => {
      const firstAddr = createMockAddress({
        id: '1',
        city: 'Pasig',
        province: 'Metro Manila',
        is_default: false,
      })
      const customer = createMockCustomer({ addresses: [firstAddr] })
      render(<CustomerList initialCustomers={[customer]} />)

      expect(screen.getByText('Pasig, Metro Manila')).toBeInTheDocument()
    })

    it('should return default address from multiple addresses', () => {
      const addresses = [
        createMockAddress({
          id: '1',
          city: 'Manila',
          is_default: false,
        }),
        createMockAddress({
          id: '2',
          city: 'Quezon City',
          is_default: true,
        }),
        createMockAddress({
          id: '3',
          city: 'Pasig',
          is_default: false,
        }),
      ]
      const customer = createMockCustomer({ addresses })
      render(<CustomerList initialCustomers={[customer]} />)

      expect(screen.getByText(/Quezon City/)).toBeInTheDocument()
    })
  })
})

describe('Edge Cases and Boundary Conditions', () => {
  it('should handle customer with very long name', () => {
    const longName = 'A'.repeat(255)
    const customer = createMockCustomer({ name: longName })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getByText(longName)).toBeInTheDocument()
  })

  it('should handle customer with very long email', () => {
    const longEmail = 'a'.repeat(243) + '@example.com'
    const customer = createMockCustomer({ email: longEmail })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getByText(longEmail)).toBeInTheDocument()
  })

  it('should handle special characters in search', async () => {
    const user = userEvent.setup()
    const customer = createMockCustomer({ name: "O'Brien-Smith" })
    render(<CustomerList initialCustomers={[customer]} />)

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
    await user.type(searchInput, "O'Brien")

    expect(screen.getByText("O'Brien-Smith")).toBeInTheDocument()
  })

  it('should handle empty search query', async () => {
    const user = userEvent.setup()
    const customers = [
      createMockCustomer({ id: '1', name: 'Customer 1' }),
      createMockCustomer({ id: '2', name: 'Customer 2' }),
    ]
    render(<CustomerList initialCustomers={customers} />)

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
    await user.type(searchInput, 'test')
    await user.clear(searchInput)

    expect(screen.getByText('Customer 1')).toBeInTheDocument()
    expect(screen.getByText('Customer 2')).toBeInTheDocument()
  })

  it('should handle large dataset', () => {
    const customers = Array.from({ length: 100 }, (_, i) =>
      createMockCustomer({
        id: `cust-${i}`,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
      })
    )
    render(<CustomerList initialCustomers={customers} />)

    expect(screen.getByText(/Customers \(100\)/)).toBeInTheDocument()
  })
})

describe('Search Performance', () => {
  it('should filter efficiently with partial matches', async () => {
    const user = userEvent.setup()
    const customers = [
      createMockCustomer({ id: '1', name: 'Juan Dela Cruz' }),
      createMockCustomer({ id: '2', name: 'Juana Santos' }),
      createMockCustomer({ id: '3', name: 'Maria Juan' }),
    ]
    render(<CustomerList initialCustomers={customers} />)

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
    await user.type(searchInput, 'juan')

    expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument()
    expect(screen.getByText('Juana Santos')).toBeInTheDocument()
    expect(screen.getByText('Maria Juan')).toBeInTheDocument()
  })
})

describe('Multiple Addresses Scenarios', () => {
  it('should handle customer with maximum 3 addresses', () => {
    const addresses = [
      createMockAddress({ id: '1', label: 'Home', is_default: true }),
      createMockAddress({ id: '2', label: 'Work', is_default: false }),
      createMockAddress({ id: '3', label: 'Vacation', is_default: false }),
    ]
    const customer = createMockCustomer({ addresses })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument()
  })

  it('should select middle address if it is default', () => {
    const addresses = [
      createMockAddress({ id: '1', city: 'Manila', is_default: false }),
      createMockAddress({ id: '2', city: 'Quezon City', is_default: true }),
      createMockAddress({ id: '3', city: 'Pasig', is_default: false }),
    ]
    const customer = createMockCustomer({ addresses })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getByText(/Quezon City/)).toBeInTheDocument()
  })

  it('should select last address if it is default', () => {
    const addresses = [
      createMockAddress({ id: '1', city: 'Manila', is_default: false }),
      createMockAddress({ id: '2', city: 'Quezon City', is_default: false }),
      createMockAddress({ id: '3', city: 'Pasig', is_default: true }),
    ]
    const customer = createMockCustomer({ addresses })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getByText(/Pasig/)).toBeInTheDocument()
  })
})
