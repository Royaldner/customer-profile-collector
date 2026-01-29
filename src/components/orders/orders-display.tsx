'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderCard } from './order-card'
import { Loader2, RefreshCw, Package, CheckCircle } from 'lucide-react'
import type { OrderDisplay, InvoiceFilter } from '@/lib/types/zoho'

interface OrdersDisplayProps {
  customerId: string
  zohoContactId: string | null
  apiBasePath: string // '/api/admin/customers/[id]/orders' or '/api/customer/orders'
}

interface OrdersState {
  orders: OrderDisplay[]
  hasMore: boolean
  total: number
  cachedAt: string | null
  isLoading: boolean
  error: string | null
}

export function OrdersDisplay({ customerId, zohoContactId, apiBasePath }: OrdersDisplayProps) {
  const [activeFilter, setActiveFilter] = useState<InvoiceFilter>('recent')
  const [recentOrders, setRecentOrders] = useState<OrdersState>({
    orders: [],
    hasMore: false,
    total: 0,
    cachedAt: null,
    isLoading: false,
    error: null,
  })
  const [completedOrders, setCompletedOrders] = useState<OrdersState>({
    orders: [],
    hasMore: false,
    total: 0,
    cachedAt: null,
    isLoading: false,
    error: null,
  })

  const fetchOrders = useCallback(async (filter: InvoiceFilter, page: number = 1) => {
    const setState = filter === 'recent' ? setRecentOrders : setCompletedOrders

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const url = apiBasePath.includes('[id]')
        ? apiBasePath.replace('[id]', customerId)
        : apiBasePath

      const response = await fetch(`${url}?filter=${filter}&page=${page}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }

      setState({
        orders: data.orders,
        hasMore: data.hasMore,
        total: data.total,
        cachedAt: data.cachedAt,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch orders',
      }))
    }
  }, [apiBasePath, customerId])

  // Fetch orders when component mounts or zoho contact changes
  useEffect(() => {
    if (zohoContactId) {
      fetchOrders('recent')
      fetchOrders('completed')
    }
  }, [zohoContactId, fetchOrders])

  const currentOrders = activeFilter === 'recent' ? recentOrders : completedOrders

  const formatCachedTime = (cachedAt: string | null) => {
    if (!cachedAt) return null
    const date = new Date(cachedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    return `${diffHours} hours ago`
  }

  // Not linked to Zoho
  if (!zohoContactId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Link this customer to a Zoho Books contact to view their orders.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Orders from Zoho Books</CardTitle>
          {currentOrders.cachedAt && (
            <span className="text-xs text-muted-foreground">
              Updated {formatCachedTime(currentOrders.cachedAt)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab buttons */}
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('recent')}
          >
            <Package className="mr-2 h-4 w-4" />
            Recent Orders
            {recentOrders.total > 0 && (
              <span className="ml-2 bg-primary-foreground/20 text-xs px-1.5 py-0.5 rounded">
                {recentOrders.total}
              </span>
            )}
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('completed')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
            {completedOrders.total > 0 && (
              <span className="ml-2 bg-primary-foreground/20 text-xs px-1.5 py-0.5 rounded">
                {completedOrders.total}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchOrders(activeFilter)}
            disabled={currentOrders.isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${currentOrders.isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        {currentOrders.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : currentOrders.error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{currentOrders.error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fetchOrders(activeFilter)}
            >
              Retry
            </Button>
          </div>
        ) : currentOrders.orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {activeFilter === 'recent'
              ? 'No pending orders'
              : 'No completed orders'}
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {currentOrders.hasMore && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
