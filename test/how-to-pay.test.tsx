/**
 * EPIC 15: How to Pay - Tests
 * Tests for clipboard utility, payment modal, how-to-pay view, and order card Pay Now button
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { copyToClipboard } from '@/lib/utils/clipboard'
import { PAYMENT_METHODS } from '@/lib/constants/payment-methods'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { onError, ...rest } = props
    return <img {...rest} data-testid="qr-image" />
  },
}))

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when navigator.clipboard succeeds', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    const result = await copyToClipboard('test')
    expect(result).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test')
  })

  it('uses execCommand fallback when clipboard API fails', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('fail')) },
    })
    const mockExecCommand = vi.fn().mockReturnValue(true)
    document.execCommand = mockExecCommand

    const result = await copyToClipboard('fallback-text')
    expect(result).toBe(true)
    expect(mockExecCommand).toHaveBeenCalledWith('copy')
  })

  it('returns false when both methods fail', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('fail')) },
    })
    document.execCommand = vi.fn().mockReturnValue(false)

    const result = await copyToClipboard('text')
    expect(result).toBe(false)
  })
})

describe('PaymentModal', () => {
  // Dynamic import to avoid mock ordering issues
  let PaymentModal: typeof import('@/components/customer/payment-modal').PaymentModal

  beforeEach(async () => {
    const mod = await import('@/components/customer/payment-modal')
    PaymentModal = mod.PaymentModal
  })

  it('renders payment method fields', () => {
    const method = PAYMENT_METHODS[0] // GCash
    render(
      <PaymentModal method={method} open={true} onOpenChange={() => {}} />
    )
    expect(screen.getByText('Pay with GCash')).toBeInTheDocument()
    expect(screen.getByText('Account Number')).toBeInTheDocument()
    expect(screen.getByText('09301697375')).toBeInTheDocument()
  })

  it('renders BPI with multiple fields', () => {
    const method = PAYMENT_METHODS[1] // BPI
    render(
      <PaymentModal method={method} open={true} onOpenChange={() => {}} />
    )
    expect(screen.getByText('Pay with BPI')).toBeInTheDocument()
    expect(screen.getByText('Account Name')).toBeInTheDocument()
    expect(screen.getByText('Perpee Berse')).toBeInTheDocument()
    expect(screen.getByText('Account Number')).toBeInTheDocument()
    expect(screen.getByText('9319317497')).toBeInTheDocument()
  })

  it('renders order context fields when provided', () => {
    const method = PAYMENT_METHODS[0]
    const orderContext = { invoiceNumber: 'INV-00042', amount: '₱1,250.00' }
    render(
      <PaymentModal
        method={method}
        open={true}
        onOpenChange={() => {}}
        orderContext={orderContext}
      />
    )
    expect(screen.getByText('Invoice Number')).toBeInTheDocument()
    expect(screen.getByText('INV-00042')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('₱1,250.00')).toBeInTheDocument()
    expect(screen.getByText('50% required upon order')).toBeInTheDocument()
  })

  it('renders instructions', () => {
    const method = PAYMENT_METHODS[0]
    render(
      <PaymentModal method={method} open={true} onOpenChange={() => {}} />
    )
    expect(screen.getByText('Open GCash App')).toBeInTheDocument()
  })

  it('returns null when method is null', () => {
    const { container } = render(
      <PaymentModal method={null} open={true} onOpenChange={() => {}} />
    )
    expect(container.innerHTML).toBe('')
  })
})

describe('HowToPayView', () => {
  let HowToPayView: typeof import('@/components/customer/how-to-pay-view').HowToPayView

  beforeEach(async () => {
    const mod = await import('@/components/customer/how-to-pay-view')
    HowToPayView = mod.HowToPayView
  })

  it('renders all payment methods as cards', () => {
    render(<HowToPayView onBack={() => {}} />)
    expect(screen.getByText('GCash')).toBeInTheDocument()
    expect(screen.getByText('BPI')).toBeInTheDocument()
  })

  it('shows "How to Pay" title without order context', () => {
    render(<HowToPayView onBack={() => {}} />)
    expect(screen.getByText('How to Pay')).toBeInTheDocument()
  })

  it('shows order-specific title with order context', () => {
    const ctx = { invoiceNumber: 'INV-00042', amount: '₱1,250.00' }
    render(<HowToPayView onBack={() => {}} orderContext={ctx} />)
    expect(screen.getByText('Pay for INV-00042')).toBeInTheDocument()
  })

  it('calls onBack when back button clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<HowToPayView onBack={onBack} />)
    const backBtn = screen.getByRole('button')
    await user.click(backBtn)
    expect(onBack).toHaveBeenCalled()
  })
})

describe('OrderCard Pay Now', () => {
  let OrderCard: typeof import('@/components/orders/order-card').OrderCard

  beforeEach(async () => {
    const mod = await import('@/components/orders/order-card')
    OrderCard = mod.OrderCard
  })

  const mockOrder = {
    id: '1',
    invoiceNumber: 'INV-00042',
    date: '2026-01-15',
    dueDate: '2026-02-15',
    status: 'sent' as const,
    statusLabel: 'Unpaid',
    items: [{ name: 'Widget', quantity: 2, rate: 500, total: 1000 }],
    total: 1250,
    paid: 0,
    balance: 1250,
    currencySymbol: '₱',
  }

  it('shows Pay Now button when balance > 0 and onPayNow provided', () => {
    render(<OrderCard order={mockOrder} onPayNow={() => {}} />)
    expect(screen.getByText('Pay Now')).toBeInTheDocument()
  })

  it('hides Pay Now button when balance is 0', () => {
    const paidOrder = { ...mockOrder, balance: 0, paid: 1250 }
    render(<OrderCard order={paidOrder} onPayNow={() => {}} />)
    expect(screen.queryByText('Pay Now')).not.toBeInTheDocument()
  })

  it('hides Pay Now button when onPayNow not provided', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.queryByText('Pay Now')).not.toBeInTheDocument()
  })

  it('calls onPayNow with order when clicked', async () => {
    const user = userEvent.setup()
    const onPayNow = vi.fn()
    render(<OrderCard order={mockOrder} onPayNow={onPayNow} />)
    await user.click(screen.getByText('Pay Now'))
    expect(onPayNow).toHaveBeenCalledWith(mockOrder)
  })
})
