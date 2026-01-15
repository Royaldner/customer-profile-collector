'use client'

import { useState, useEffect } from 'react'
import { Customer, EmailTemplate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { AlertCircle, Mail, Clock } from 'lucide-react'

interface SendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCustomers: Customer[]
  onSuccess: () => void
}

export function SendEmailDialog({
  open,
  onOpenChange,
  selectedCustomers,
  onSuccess,
}: SendEmailDialogProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [scheduledFor, setScheduledFor] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [dailyCount, setDailyCount] = useState<{
    today_count: number
    remaining: number
    limit: number
  } | null>(null)

  // Fetch templates and daily count when dialog opens
  useEffect(() => {
    if (open) {
      fetchTemplates()
      fetchDailyCount()
    }
  }, [open])

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/email-templates?active=true')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
        // Auto-select first template if only one
        if (data.templates.length === 1) {
          setSelectedTemplateId(data.templates[0].id)
        }
      }
    } catch {
      toast.error('Failed to load email templates')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDailyCount = async () => {
    try {
      const response = await fetch('/api/admin/email-logs/daily-count')
      if (response.ok) {
        const data = await response.json()
        setDailyCount(data)
      }
    } catch {
      // Silently fail
    }
  }

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select an email template')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_ids: selectedCustomers.map((c) => c.id),
          template_id: selectedTemplateId,
          scheduled_for: scheduledFor || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send emails')
      }

      toast.success(data.message)
      onOpenChange(false)
      onSuccess()

      // Reset form
      setSelectedTemplateId('')
      setScheduledFor('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send emails')
    } finally {
      setIsSending(false)
    }
  }

  const willExceedLimit = dailyCount
    ? dailyCount.today_count + selectedCustomers.length > dailyCount.limit
    : false

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Send email notification to {selectedCustomers.length} selected customer
            {selectedCustomers.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Daily limit warning */}
          {dailyCount && (
            <Alert variant={willExceedLimit ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Daily limit: {dailyCount.today_count}/{dailyCount.limit} sent today.{' '}
                {willExceedLimit
                  ? `Cannot send ${selectedCustomers.length} more emails.`
                  : `${dailyCount.remaining} remaining.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Template selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading templates...</p>
            ) : templates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No email templates available. Please create one first.
              </p>
            ) : (
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Template preview */}
          {selectedTemplate && (
            <div className="space-y-2">
              <Label>Subject Preview</Label>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {selectedTemplate.subject}
              </p>
            </div>
          )}

          {/* Schedule option */}
          <div className="space-y-2">
            <Label htmlFor="scheduled_for">Schedule (Optional)</Label>
            <Input
              id="scheduled_for"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to send immediately
            </p>
          </div>

          {/* Recipients summary */}
          <div className="space-y-2">
            <Label>Recipients ({selectedCustomers.length})</Label>
            <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground bg-muted p-2 rounded">
              {selectedCustomers.slice(0, 10).map((c) => (
                <div key={c.id}>
                  {c.first_name} {c.last_name} ({c.email})
                </div>
              ))}
              {selectedCustomers.length > 10 && (
                <div className="text-muted-foreground">
                  ...and {selectedCustomers.length - 10} more
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              isSending || isLoading || templates.length === 0 || !selectedTemplateId || willExceedLimit
            }
          >
            {isSending ? (
              'Sending...'
            ) : scheduledFor ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Schedule
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
