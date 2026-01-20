'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Link, Loader2, User, Mail, Building } from 'lucide-react'
import type { ZohoContact } from '@/lib/types/zoho'

interface ZohoLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
  customerEmail: string
  onSuccess: () => void
}

export function ZohoLinkDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  customerEmail,
  onSuccess,
}: ZohoLinkDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState<ZohoContact[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ZohoContact | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery(customerEmail || customerName)
      setContacts([])
      setSelectedContact(null)
      setHasSearched(false)
    }
  }, [open, customerEmail, customerName])

  // Debounced search
  const searchContacts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setContacts([])
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/zoho/contacts?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search contacts')
      }

      setContacts(data.contacts || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to search contacts')
      setContacts([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearch = () => {
    searchContacts(searchQuery)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleLink = async () => {
    if (!selectedContact) {
      toast.error('Please select a contact')
      return
    }

    setIsLinking(true)

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/zoho-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoho_contact_id: selectedContact.contact_id,
          zoho_contact_name: selectedContact.contact_name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link customer')
      }

      toast.success('Customer linked to Zoho contact')
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to link customer')
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Link to Zoho Books</DialogTitle>
          <DialogDescription>
            Search for a Zoho Books contact to link with {customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Contacts</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleSearch}
                disabled={isSearching || searchQuery.length < 2}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Search results */}
          <div className="space-y-2">
            <Label>
              {hasSearched
                ? `Results (${contacts.length})`
                : 'Search to find contacts'}
            </Label>
            <div className="max-h-64 overflow-y-auto border rounded-md">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {hasSearched
                    ? 'No contacts found. Try a different search term.'
                    : 'Enter a search term and click Search'}
                </div>
              ) : (
                <div className="divide-y">
                  {contacts.map((contact) => (
                    <button
                      key={contact.contact_id}
                      type="button"
                      className={`w-full p-3 text-left hover:bg-muted transition-colors ${
                        selectedContact?.contact_id === contact.contact_id
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">
                              {contact.contact_name}
                            </span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground truncate">
                                {contact.email}
                              </span>
                            </div>
                          )}
                          {contact.company_name && (
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground truncate">
                                {contact.company_name}
                              </span>
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            contact.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {contact.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected contact preview */}
          {selectedContact && (
            <div className="p-3 bg-muted rounded-md">
              <Label className="text-xs text-muted-foreground">Selected Contact</Label>
              <div className="mt-1 font-medium">{selectedContact.contact_name}</div>
              {selectedContact.email && (
                <div className="text-sm text-muted-foreground">{selectedContact.email}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                ID: {selectedContact.contact_id}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={isLinking || !selectedContact}>
            {isLinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Link Contact
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
