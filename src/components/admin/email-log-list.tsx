'use client'

import { useState, useEffect } from 'react'
import { EmailLog, EmailStatus } from '@/lib/types'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Eye, Mail, AlertCircle, Clock, Check } from 'lucide-react'
import { toast } from 'sonner'

interface EmailLogWithRelations extends EmailLog {
  template?: { id: string; name: string; display_name: string } | null
  customer?: { id: string; first_name: string; last_name: string; email: string } | null
}

interface Pagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export function EmailLogList() {
  const [logs, setLogs] = useState<EmailLogWithRelations[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  })
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [viewingLog, setViewingLog] = useState<EmailLogWithRelations | null>(null)
  const [dailyCount, setDailyCount] = useState<{ today_count: number; remaining: number; limit: number } | null>(null)

  const fetchLogs = async (page: number = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('per_page', '20')
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/admin/email-logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch logs')

      const data = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch {
      toast.error('Failed to load email logs')
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
      // Silently fail for daily count
    }
  }

  useEffect(() => {
    fetchLogs(1)
    fetchDailyCount()
  }, [statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: EmailStatus) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="default" className="bg-green-600">
            <Check className="mr-1 h-3 w-3" /> Sent
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" /> Scheduled
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline">
            <Mail className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Email History ({pagination.total})</CardTitle>
              <CardDescription>View all sent email notifications</CardDescription>
              {dailyCount && (
                <p className="text-sm text-muted-foreground mt-1">
                  Today: {dailyCount.today_count} sent ({dailyCount.remaining} remaining of{' '}
                  {dailyCount.limit})
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No email logs found.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-4 md:hidden">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{log.recipient_email}</h3>
                        <p className="text-sm text-muted-foreground">
                          {log.customer
                            ? `${log.customer.first_name} ${log.customer.last_name}`
                            : log.recipient_name || 'Unknown'}
                        </p>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {log.subject}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(log.created_at)}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setViewingLog(log)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.recipient_email}</div>
                            <div className="text-sm text-muted-foreground">
                              {log.customer
                                ? `${log.customer.first_name} ${log.customer.last_name}`
                                : log.recipient_name || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                        <TableCell>{log.template?.display_name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{formatDate(log.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.total_pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(pagination.page + 1)}
                      disabled={pagination.page >= pagination.total_pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Log Dialog */}
      <Dialog open={!!viewingLog} onOpenChange={(open) => !open && setViewingLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>Sent to {viewingLog?.recipient_email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Status</h4>
                {viewingLog && getStatusBadge(viewingLog.status)}
              </div>
              <div>
                <h4 className="font-medium mb-1">Template</h4>
                <p className="text-muted-foreground">
                  {viewingLog?.template?.display_name || 'N/A'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Created</h4>
                <p className="text-muted-foreground">
                  {viewingLog && formatDate(viewingLog.created_at)}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Sent At</h4>
                <p className="text-muted-foreground">
                  {viewingLog?.sent_at ? formatDate(viewingLog.sent_at) : 'Not yet sent'}
                </p>
              </div>
            </div>
            {viewingLog?.scheduled_for && (
              <div>
                <h4 className="font-medium mb-1">Scheduled For</h4>
                <p className="text-muted-foreground">{formatDate(viewingLog.scheduled_for)}</p>
              </div>
            )}
            {viewingLog?.error_message && (
              <div>
                <h4 className="font-medium mb-1 text-destructive">Error</h4>
                <p className="text-destructive">{viewingLog.error_message}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-1">Subject</h4>
              <p className="text-muted-foreground">{viewingLog?.subject}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Body</h4>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-md">
                {viewingLog?.body}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
