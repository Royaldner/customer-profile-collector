'use client'

import { useState } from 'react'
import { Courier } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CourierFormDialog } from './courier-form-dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CourierListProps {
  initialCouriers: Courier[]
}

export function CourierList({ initialCouriers }: CourierListProps) {
  const [couriers, setCouriers] = useState<Courier[]>(initialCouriers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null)
  const [deletingCourier, setDeletingCourier] = useState<Courier | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (data: { code?: string; name: string; is_active: boolean }) => {
    if (!data.code) {
      toast.error('Code is required')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create courier')
      }

      const { courier } = await response.json()
      setCouriers((prev) => [...prev, courier].sort((a, b) => a.name.localeCompare(b.name)))
      setIsDialogOpen(false)
      toast.success('Courier created successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create courier')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (data: { name: string; is_active: boolean }) => {
    if (!editingCourier) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/couriers/${editingCourier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update courier')
      }

      const { courier } = await response.json()
      setCouriers((prev) =>
        prev.map((c) => (c.id === courier.id ? courier : c)).sort((a, b) => a.name.localeCompare(b.name))
      )
      setEditingCourier(null)
      toast.success('Courier updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update courier')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCourier) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/couriers/${deletingCourier.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to deactivate courier')
      }

      const { courier } = await response.json()
      setCouriers((prev) => prev.map((c) => (c.id === courier.id ? courier : c)))
      setDeletingCourier(null)
      toast.success('Courier deactivated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate courier')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Couriers ({couriers.length})</CardTitle>
              <CardDescription>Manage delivery courier options for customers</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Courier
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {couriers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No couriers configured yet.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Courier
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-4 md:hidden">
                {couriers.map((courier) => (
                  <div key={courier.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{courier.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{courier.code}</p>
                      </div>
                      <Badge variant={courier.is_active ? 'default' : 'secondary'}>
                        {courier.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {formatDate(courier.created_at)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingCourier(courier)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {courier.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => setDeletingCourier(courier)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {couriers.map((courier) => (
                      <TableRow key={courier.id}>
                        <TableCell className="font-mono">{courier.code}</TableCell>
                        <TableCell className="font-medium">{courier.name}</TableCell>
                        <TableCell>
                          <Badge variant={courier.is_active ? 'default' : 'secondary'}>
                            {courier.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(courier.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingCourier(courier)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {courier.is_active && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingCourier(courier)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CourierFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      {/* Edit Dialog */}
      <CourierFormDialog
        open={!!editingCourier}
        onOpenChange={(open) => !open && setEditingCourier(null)}
        courier={editingCourier}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCourier} onOpenChange={(open) => !open && setDeletingCourier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Courier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate &quot;{deletingCourier?.name}&quot;? This courier will
              no longer appear in dropdown menus, but existing customer data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
