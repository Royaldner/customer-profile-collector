'use client'

import { useState } from 'react'
import { EmailTemplate } from '@/lib/types'
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
import { EmailTemplateFormDialog } from './email-template-form-dialog'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EmailTemplateListProps {
  initialTemplates: EmailTemplate[]
}

export function EmailTemplateList({ initialTemplates }: EmailTemplateListProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<EmailTemplate | null>(null)
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (data: {
    name: string
    display_name: string
    subject: string
    body: string
    variables: string[]
    is_active: boolean
  }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create template')
      }

      const { template } = await response.json()
      setTemplates((prev) =>
        [...prev, template].sort((a, b) => a.display_name.localeCompare(b.display_name))
      )
      setIsDialogOpen(false)
      toast.success('Email template created successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create template')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (data: {
    name?: string
    display_name?: string
    subject?: string
    body?: string
    variables?: string[]
    is_active?: boolean
  }) => {
    if (!editingTemplate) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update template')
      }

      const { template } = await response.json()
      setTemplates((prev) =>
        prev
          .map((t) => (t.id === template.id ? template : t))
          .sort((a, b) => a.display_name.localeCompare(b.display_name))
      )
      setEditingTemplate(null)
      toast.success('Email template updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update template')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTemplate) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${deletingTemplate.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to deactivate template')
      }

      const { template } = await response.json()
      setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)))
      setDeletingTemplate(null)
      toast.success('Email template deactivated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate template')
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
              <CardTitle>Email Templates ({templates.length})</CardTitle>
              <CardDescription>
                Manage templates for customer email notifications
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {templates.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No email templates configured yet.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Template
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-4 md:hidden">
                {templates.map((template) => (
                  <div key={template.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{template.display_name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{template.name}</p>
                      </div>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      Subject: {template.subject}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Updated: {formatDate(template.updated_at)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingTemplate(template)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {template.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingTemplate(template)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.display_name}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {template.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                        <TableCell>
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(template.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingTemplate(template)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {template.is_active && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingTemplate(template)}
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
      <EmailTemplateFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      {/* Edit Dialog */}
      <EmailTemplateFormDialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        template={editingTemplate}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />

      {/* View Dialog */}
      <Dialog open={!!viewingTemplate} onOpenChange={(open) => !open && setViewingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingTemplate?.display_name}</DialogTitle>
            <DialogDescription>Template preview</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Subject</h4>
              <p className="text-muted-foreground">{viewingTemplate?.subject}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Variables</h4>
              <div className="flex flex-wrap gap-2">
                {viewingTemplate?.variables?.map((v) => (
                  <Badge key={v} variant="outline">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Body</h4>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-md">
                {viewingTemplate?.body}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => !open && setDeletingTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate &quot;{deletingTemplate?.display_name}&quot;? This
              template will no longer be available for sending emails, but email history will be
              preserved.
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
