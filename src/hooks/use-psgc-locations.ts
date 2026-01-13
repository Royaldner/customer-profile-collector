'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getLocations, getBarangays, type LocationOption, type BarangayOption } from '@/lib/services/psgc'

interface UsePSGCLocationsReturn {
  locations: LocationOption[]
  isLoading: boolean
  error: string | null
  searchLocations: (query: string) => LocationOption[]
  getLocationByCode: (code: string) => LocationOption | undefined
}

/**
 * Hook to load and search PSGC locations (cities + municipalities)
 */
export function usePSGCLocations(): UsePSGCLocationsReturn {
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadLocations() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getLocations()
        if (!cancelled) {
          setLocations(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load locations')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadLocations()

    return () => {
      cancelled = true
    }
  }, [])

  const searchLocations = useCallback((query: string): LocationOption[] => {
    if (!query.trim()) {
      return locations.slice(0, 20)
    }

    const normalizedQuery = query.toLowerCase().trim()
    return locations
      .filter(loc =>
        loc.name.toLowerCase().includes(normalizedQuery) ||
        loc.province.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 20)
  }, [locations])

  const getLocationByCode = useCallback((code: string): LocationOption | undefined => {
    return locations.find(loc => loc.code === code)
  }, [locations])

  return {
    locations,
    isLoading,
    error,
    searchLocations,
    getLocationByCode,
  }
}

interface UseBarangaysReturn {
  barangays: BarangayOption[]
  isLoading: boolean
  error: string | null
  loadBarangays: (locationCode: string) => Promise<void>
  clearBarangays: () => void
}

/**
 * Hook to load barangays for a specific city/municipality
 */
export function useBarangays(): UseBarangaysReturn {
  const [barangays, setBarangays] = useState<BarangayOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBarangays = useCallback(async (locationCode: string) => {
    if (!locationCode) {
      setBarangays([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await getBarangays(locationCode)
      setBarangays(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load barangays')
      setBarangays([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearBarangays = useCallback(() => {
    setBarangays([])
    setError(null)
  }, [])

  return {
    barangays,
    isLoading,
    error,
    loadBarangays,
    clearBarangays,
  }
}

/**
 * Convert LocationOption to combobox format
 */
export function locationToComboboxOption(location: LocationOption) {
  return {
    value: location.code,
    label: location.name,
    description: `${location.province}, ${location.region}`,
  }
}

/**
 * Convert BarangayOption to combobox format
 */
export function barangayToComboboxOption(barangay: BarangayOption) {
  return {
    value: barangay.code,
    label: barangay.name,
  }
}
