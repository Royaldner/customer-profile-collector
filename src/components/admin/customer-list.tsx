'use client'

import { useState, useMemo } from 'react'
import { Customer, ContactPreference, EmailTemplate } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { SendEmailDialog } from './send-email-dialog'
import Link from 'next/link'
import { Mail, Check, Clock } from 'lucide-react'

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false)

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

  const getReadyToShipStatus = (customer: Customer) => {
    if (customer.delivery_confirmed_at) {
      return {
        label: 'Ready',
        variant: 'default' as const,
        icon: <Check className="h-3 w-3 mr-1" />,
      }
    }
    return {
      label: 'Pending',
      variant: 'secondary' as const,
      icon: <Clock className="h-3 w-3 mr-1" />,
    }
  }

  // Selection handlers
  const isAllSelected =
    filteredCustomers.length > 0 && filteredCustomers.every((c) => selectedIds.has(c.id))
  const isSomeSelected = filteredCustomers.some((c) => selectedIds.has(c.id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all filtered
      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        filteredCustomers.forEach((c) => newSet.delete(c.id))
        return newSet
      })
    } else {
      // Select all filtered
      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        filteredCustomers.forEach((c) => newSet.add(c.id))
        return newSet
      })
    }
  }

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectedCustomers = initialCustomers.filter((c) => selectedIds.has(c.id))

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Customers ({filteredCustomers.length}
              {filteredCustomers.length !== initialCustomers.length &&
                ` of ${initialCustomers.length}`}
              )
            </CardTitle>
            {selectedIds.size > 0 && (
              <Button onClick={() => setIsSendEmailOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email to Selected ({selectedIds.size})
              </Button>
            )}
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
                  const readyStatus = getReadyToShipStatus(customer)
                  return (
                    <div key={customer.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedIds.has(customer.id)}
                          onCheckedChange={() => handleSelectOne(customer.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium truncate">
                                {customer.first_name} {customer.last_name}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {customer.email}
                              </p>
                            </div>
                            <Badge variant={readyStatus.variant} className="shrink-0">
                              {readyStatus.icon}
                              {readyStatus.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
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
                            <p className="text-sm text-muted-foreground mt-2">
                              {defaultAddress.city}, {defaultAddress.province}
                            </p>
                          )}
                          <Link href={`/admin/customers/${customer.id}`} className="block mt-3">
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) {
                              ;(el as HTMLButtonElement & { indeterminate: boolean }).indeterminate =
                                !isAllSelected && isSomeSelected
                            }
                          }}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Ready to Ship</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => {
                      const defaultAddress = getDefaultAddress(customer)
                      const readyStatus = getReadyToShipStatus(customer)
                      return (
                        <TableRow
                          key={customer.id}
                          className={selectedIds.has(customer.id) ? 'bg-muted/50' : ''}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(customer.id)}
                              onCheckedChange={() => handleSelectOne(customer.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>
                            <Badge variant={readyStatus.variant}>
                              {readyStatus.icon}
                              {readyStatus.label}
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

      {/* Send Email Dialog */}
      <SendEmailDialog
        open={isSendEmailOpen}
        onOpenChange={setIsSendEmailOpen}
        selectedCustomers={selectedCustomers}
        onSuccess={() => setSelectedIds(new Set())}
      />
    </>
  )
}
