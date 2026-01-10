'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Courier } from '@/lib/types'
import { courierSchema, type CourierFormData } from '@/lib/validations/courier'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface CourierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courier?: Courier | null
  onSubmit: (data: { code?: string; name: string; is_active: boolean }) => Promise<void>
  isSubmitting: boolean
}

export function CourierFormDialog({
  open,
  onOpenChange,
  courier,
  onSubmit,
  isSubmitting,
}: CourierFormDialogProps) {
  const isEditing = !!courier

  const form = useForm<CourierFormData>({
    resolver: zodResolver(courierSchema),
    defaultValues: {
      code: '',
      name: '',
      is_active: true,
    },
  })

  // Reset form when dialog opens/closes or courier changes
  useEffect(() => {
    if (open) {
      if (courier) {
        form.reset({
          code: courier.code,
          name: courier.name,
          is_active: courier.is_active,
        })
      } else {
        form.reset({
          code: '',
          name: '',
          is_active: true,
        })
      }
    }
  }, [open, courier, form])

  const handleSubmit = async (data: CourierFormData) => {
    if (isEditing) {
      await onSubmit({ name: data.name, is_active: data.is_active })
    } else {
      await onSubmit(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Courier' : 'Add Courier'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the courier details below.'
              : 'Add a new courier option for customers to choose from.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., lbc, jrs, ninja_van"
                      {...field}
                      disabled={isEditing}
                      className={isEditing ? 'bg-muted' : ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEditing
                      ? 'Code cannot be changed after creation.'
                      : 'Lowercase letters, numbers, and underscores only.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., LBC, JRS Express" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name shown to customers in dropdown menus.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Inactive couriers are hidden from customer dropdowns.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Courier'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
