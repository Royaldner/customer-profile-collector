'use client'

import { useState, useMemo } from 'react'
import { Customer, ContactPreference } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface CustomerListProps {
  initialCustomers: Customer[]
}

const contactPreferenceLabels: Record<ContactPreference, string> = {
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
}

export function CustomerList({ initialCustomers }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [contactFilter, setContactFilter] = useState<ContactPreference | 'all'>('all')

  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((customer) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery === '' ||
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchQuery)

      // Contact preference filter
      const matchesContact =
        contactFilter === 'all' || customer.contact_preference === contactFilter

      return matchesSearch && matchesContact
    })
  }, [initialCustomers, searchQuery, contactFilter])

  const getDefaultAddress = (customer: Customer) => {
    if (!customer.addresses || customer.addresses.length === 0) return null
    return customer.addresses.find((a) => a.is_default) || customer.addresses[0]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>
            Customers ({filteredCustomers.length}
            {filteredCustomers.length !== initialCustomers.length &&
              ` of ${initialCustomers.length}`}
            )
          </CardTitle>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-md"
            />
          </div>
          <Select
            value={contactFilter}
            onValueChange={(value) => setContactFilter(value as ContactPreference | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Contact preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All preferences</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || contactFilter !== 'all') && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery('')
                setContactFilter('all')
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {initialCustomers.length === 0
                ? 'No customers registered yet.'
                : 'No customers match your search criteria.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden">
              {filteredCustomers.map((customer) => {
                const defaultAddress = getDefaultAddress(customer)
                return (
                  <div
                    key={customer.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{customer.first_name} {customer.last_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {customer.email}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {contactPreferenceLabels[customer.contact_preference]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">{customer.phone}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Registered:</span>
                        <p className="font-medium">{formatDate(customer.created_at)}</p>
                      </div>
                    </div>
                    {defaultAddress && (
                      <p className="text-sm text-muted-foreground">
                        {defaultAddress.city}, {defaultAddress.province}
                      </p>
                    )}
                    <Link href={`/admin/customers/${customer.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Contact Pref.</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const defaultAddress = getDefaultAddress(customer)
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.first_name} {customer.last_name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {contactPreferenceLabels[customer.contact_preference]}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {defaultAddress
                            ? `${defaultAddress.city}, ${defaultAddress.province}`
                            : '-'}
                        </TableCell>
                        <TableCell>{formatDate(customer.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
