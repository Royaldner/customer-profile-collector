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
  first_name: 'Juan',
  last_name: 'Dela Cruz',
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
  first_name: 'Juan',
  last_name: 'Dela Cruz',
  email: 'juan@example.com',
  phone: '09171234567',
  contact_preference: 'email',
  delivery_method: 'delivered',
  delivery_confirmed_at: undefined,
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

      // Content appears in both mobile and desktop views
      expect(screen.getAllByText('Juan Dela Cruz').length).toBeGreaterThan(0)
      expect(screen.getAllByText('juan@example.com').length).toBeGreaterThan(0)
      expect(screen.getAllByText('09171234567').length).toBeGreaterThan(0)
    })

    it('should display customer count', () => {
      const customers = [
        createMockCustomer({ id: '1', first_name: 'Customer', last_name: 'One' }),
        createMockCustomer({ id: '2', first_name: 'Customer', last_name: 'Two' }),
        createMockCustomer({ id: '3', first_name: 'Customer', last_name: 'Three' }),
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
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Phone' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Ready to Ship' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Location' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Registered' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter customers by name', async () => {
      const user = userEvent.setup()
      const customers = [
        createMockCustomer({ id: '1', first_name: 'Juan', last_name: 'Dela Cruz' }),
        createMockCustomer({ id: '2', first_name: 'Maria', last_name: 'Santos' }),
        createMockCustomer({ id: '3', first_name: 'Pedro', last_name: 'Reyes' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'Maria')

      expect(screen.getAllByText('Maria Santos').length).toBeGreaterThan(0)
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

      expect(screen.getAllByText('maria@test.com').length).toBeGreaterThan(0)
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

      expect(screen.getAllByText('09281234567').length).toBeGreaterThan(0)
      expect(screen.queryByText('09171234567')).not.toBeInTheDocument()
    })

    it('should be case-insensitive for name search', async () => {
      const user = userEvent.setup()
      const customers = [createMockCustomer({ first_name: 'Juan', last_name: 'Dela Cruz' })]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'JUAN')

      expect(screen.getAllByText('Juan Dela Cruz').length).toBeGreaterThan(0)
    })

    it('should be case-insensitive for email search', async () => {
      const user = userEvent.setup()
      const customers = [createMockCustomer({ email: 'juan@example.com' })]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'JUAN@EXAMPLE')

      expect(screen.getAllByText('juan@example.com').length).toBeGreaterThan(0)
    })

    it('should show "no match" message when search returns no results', async () => {
      const user = userEvent.setup()
      const customers = [createMockCustomer({ first_name: 'Juan', last_name: 'Dela Cruz' })]
      render(<CustomerList initialCustomers={customers} />)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
      await user.type(searchInput, 'NonExistent')

      expect(screen.getByText('No customers match your search criteria.')).toBeInTheDocument()
      expect(screen.queryByText('Juan Dela Cruz')).not.toBeInTheDocument()
    })

    it('should update customer count when filtering', async () => {
      const user = userEvent.setup()
      const customers = [
        createMockCustomer({ id: '1', first_name: 'Juan', last_name: 'Dela Cruz' }),
        createMockCustomer({ id: '2', first_name: 'Maria', last_name: 'Santos' }),
        createMockCustomer({ id: '3', first_name: 'Pedro', last_name: 'Reyes' }),
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

  describe('Ready to Ship Badge Display', () => {
    it('should display "Pending" badge when customer has not confirmed delivery', () => {
      const customers = [createMockCustomer({ delivery_confirmed_at: undefined })]
      render(<CustomerList initialCustomers={customers} />)

      // Find the badge within a table cell (contains icon + text)
      const cells = screen.getAllByRole('cell')
      const pendingCell = cells.find(cell => cell.textContent?.includes('Pending'))
      expect(pendingCell).toBeDefined()
    })

    it('should display "Ready" badge when customer has confirmed delivery', () => {
      const customers = [createMockCustomer({ delivery_confirmed_at: '2024-01-20T10:00:00Z' })]
      render(<CustomerList initialCustomers={customers} />)

      const cells = screen.getAllByRole('cell')
      const readyCell = cells.find(cell => cell.textContent?.includes('Ready'))
      expect(readyCell).toBeDefined()
    })

    it('should display "Pending" badge when delivery_confirmed_at is null', () => {
      const customers = [createMockCustomer({ delivery_confirmed_at: null as unknown as undefined })]
      render(<CustomerList initialCustomers={customers} />)

      const cells = screen.getAllByRole('cell')
      const pendingCell = cells.find(cell => cell.textContent?.includes('Pending'))
      expect(pendingCell).toBeDefined()
    })
  })

  describe('Checkbox Selection', () => {
    it('should render checkbox for each customer row', () => {
      const customers = [
        createMockCustomer({ id: '1' }),
        createMockCustomer({ id: '2' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      const checkboxes = screen.getAllByRole('checkbox')
      // Should have checkboxes for each row plus the select all checkbox
      expect(checkboxes.length).toBeGreaterThanOrEqual(2)
    })

    it('should have select all checkbox in header', () => {
      const customers = [createMockCustomer()]
      render(<CustomerList initialCustomers={customers} />)

      // The header checkbox for select all
      const headerCheckbox = screen.getAllByRole('checkbox')[0]
      expect(headerCheckbox).toBeInTheDocument()
    })

    it('should toggle individual customer selection', async () => {
      const user = userEvent.setup()
      const customers = [createMockCustomer({ id: '1' })]
      render(<CustomerList initialCustomers={customers} />)

      const checkboxes = screen.getAllByRole('checkbox')
      // The second checkbox should be the row checkbox (first is header)
      const rowCheckbox = checkboxes[1]

      expect(rowCheckbox).not.toBeChecked()
      await user.click(rowCheckbox)
      expect(rowCheckbox).toBeChecked()
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

      expect(screen.getAllByText('Quezon City, Metro Manila').length).toBeGreaterThan(0)
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

      expect(screen.getAllByText('Makati, Metro Manila').length).toBeGreaterThan(0)
    })

    it('should display dash when customer has no addresses', () => {
      const customers = [createMockCustomer({ addresses: [] })]
      render(<CustomerList initialCustomers={customers} />)

      // Only desktop table shows dash, mobile shows nothing
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

      expect(screen.getAllByText('Quezon City, Metro Manila').length).toBeGreaterThan(0)
    })
  })

  describe('View Button', () => {
    it('should render View button for each customer', () => {
      const customers = [
        createMockCustomer({ id: '1' }),
        createMockCustomer({ id: '2' }),
      ]
      render(<CustomerList initialCustomers={customers} />)

      // Mobile shows "View Details", desktop shows "View"
      const viewButtons = screen.getAllByRole('button', { name: /View/i })
      expect(viewButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('should have correct link to customer detail page', () => {
      const customers = [createMockCustomer({ id: 'cust-123' })]
      render(<CustomerList initialCustomers={customers} />)

      // Get links to the customer page
      const links = screen.getAllByRole('link', { name: /View/i })
      expect(links.length).toBeGreaterThan(0)
      expect(links[0]).toHaveAttribute('href', '/admin/customers/cust-123')
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

      expect(screen.getAllByText(/Jan 15, 2024/).length).toBeGreaterThan(0)
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

      expect(screen.getAllByText('Makati, Metro Manila').length).toBeGreaterThan(0)
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

      expect(screen.getAllByText('Pasig, Metro Manila').length).toBeGreaterThan(0)
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

      expect(screen.getAllByText(/Quezon City/).length).toBeGreaterThan(0)
    })
  })
})

describe('Edge Cases and Boundary Conditions', () => {
  it('should handle customer with very long name', () => {
    const longFirstName = 'A'.repeat(100)
    const longLastName = 'B'.repeat(100)
    const customer = createMockCustomer({ first_name: longFirstName, last_name: longLastName })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getAllByText(`${longFirstName} ${longLastName}`).length).toBeGreaterThan(0)
  })

  it('should handle customer with very long email', () => {
    const longEmail = 'a'.repeat(243) + '@example.com'
    const customer = createMockCustomer({ email: longEmail })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getAllByText(longEmail).length).toBeGreaterThan(0)
  })

  it('should handle special characters in search', async () => {
    const user = userEvent.setup()
    const customer = createMockCustomer({ first_name: "O'Brien", last_name: 'Smith' })
    render(<CustomerList initialCustomers={[customer]} />)

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
    await user.type(searchInput, "O'Brien")

    expect(screen.getAllByText("O'Brien Smith").length).toBeGreaterThan(0)
  })

  it('should handle empty search query', async () => {
    const user = userEvent.setup()
    const customers = [
      createMockCustomer({ id: '1', first_name: 'Customer', last_name: 'One' }),
      createMockCustomer({ id: '2', first_name: 'Customer', last_name: 'Two' }),
    ]
    render(<CustomerList initialCustomers={customers} />)

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
    await user.type(searchInput, 'test')
    await user.clear(searchInput)

    expect(screen.getAllByText('Customer One').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Customer Two').length).toBeGreaterThan(0)
  })

  it('should handle large dataset', () => {
    const customers = Array.from({ length: 100 }, (_, i) =>
      createMockCustomer({
        id: `cust-${i}`,
        first_name: 'Customer',
        last_name: `${i}`,
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
      createMockCustomer({ id: '1', first_name: 'Juan', last_name: 'Dela Cruz' }),
      createMockCustomer({ id: '2', first_name: 'Juana', last_name: 'Santos' }),
      createMockCustomer({ id: '3', first_name: 'Maria', last_name: 'Juan' }),
    ]
    render(<CustomerList initialCustomers={customers} />)

    const searchInput = screen.getByPlaceholderText('Search by name, email, or phone...')
    await user.type(searchInput, 'juan')

    expect(screen.getAllByText('Juan Dela Cruz').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Juana Santos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Maria Juan').length).toBeGreaterThan(0)
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

    expect(screen.getAllByText('Juan Dela Cruz').length).toBeGreaterThan(0)
  })

  it('should select middle address if it is default', () => {
    const addresses = [
      createMockAddress({ id: '1', city: 'Manila', is_default: false }),
      createMockAddress({ id: '2', city: 'Quezon City', is_default: true }),
      createMockAddress({ id: '3', city: 'Pasig', is_default: false }),
    ]
    const customer = createMockCustomer({ addresses })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getAllByText(/Quezon City/).length).toBeGreaterThan(0)
  })

  it('should select last address if it is default', () => {
    const addresses = [
      createMockAddress({ id: '1', city: 'Manila', is_default: false }),
      createMockAddress({ id: '2', city: 'Quezon City', is_default: false }),
      createMockAddress({ id: '3', city: 'Pasig', is_default: true }),
    ]
    const customer = createMockCustomer({ addresses })
    render(<CustomerList initialCustomers={[customer]} />)

    expect(screen.getAllByText(/Pasig/).length).toBeGreaterThan(0)
  })
})
