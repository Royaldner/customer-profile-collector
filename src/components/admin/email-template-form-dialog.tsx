'use client'

import { useState, useEffect } from 'react'
import { EmailTemplate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EmailTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: EmailTemplate | null
  onSubmit: (data: {
    name: string
    display_name: string
    subject: string
    body: string
    variables: string[]
    is_active: boolean
  }) => Promise<void>
  isSubmitting: boolean
}

export function EmailTemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  isSubmitting,
}: EmailTemplateFormDialogProps) {
  const isEditing = !!template
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [variablesText, setVariablesText] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Reset form when dialog opens/closes or template changes
  useEffect(() => {
    if (open && template) {
      setName(template.name)
      setDisplayName(template.display_name)
      setSubject(template.subject)
      setBody(template.body)
      setVariablesText(template.variables?.join(', ') || '')
      setIsActive(template.is_active)
    } else if (open && !template) {
      setName('')
      setDisplayName('')
      setSubject('')
      setBody('')
      setVariablesText('first_name, last_name, email, update_profile_link, confirm_button')
      setIsActive(true)
    }
  }, [open, template])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Parse variables from comma-separated text
    const variables = variablesText
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)

    await onSubmit({
      name,
      display_name: displayName,
      subject,
      body,
      variables,
      is_active: isActive,
    })
  }

  // Auto-generate name from display name
  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value)
    if (!isEditing) {
      // Only auto-generate for new templates
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100)
      setName(generated)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Create Email Template'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the email template details'
              : 'Create a new email template for customer notifications'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="Pre-Delivery Reminder"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Template ID</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="pre-delivery-reminder"
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
                required
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase with hyphens only. Used as unique identifier.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Your Canada Goodies Order is Arriving Soon!"
              required
            />
            <p className="text-xs text-muted-foreground">
              Supports variables like {'{{first_name}}'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Dear {{first_name}},&#10;&#10;Your order is arriving soon..."
              rows={12}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Plain text email body. Use {'{{variable_name}}'} for dynamic content.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variables">Template Variables</Label>
            <Input
              id="variables"
              value={variablesText}
              onChange={(e) => setVariablesText(e.target.value)}
              placeholder="first_name, last_name, email"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of available variables for this template
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Template'
                  : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
