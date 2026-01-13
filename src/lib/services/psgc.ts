/**
 * PSGC (Philippine Standard Geographic Code) API Client
 *
 * Fetches location data from the official PSGC GitLab API:
 * https://psgc.gitlab.io/api/
 *
 * Features:
 * - Runtime API calls (always up-to-date data)
 * - Memory caching for performance
 * - localStorage persistence for offline support
 */

const PSGC_API_BASE = 'https://psgc.gitlab.io/api'
const CACHE_KEY_PREFIX = 'psgc_'
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// Types matching the PSGC API response structure
export interface PSGCRegion {
  code: string
  name: string
  regionName: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PSGCProvince {
  code: string
  name: string
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PSGCCity {
  code: string
  name: string
  oldName: string
  isCapital: boolean
  provinceCode: string | false
  districtCode: string | false
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PSGCMunicipality {
  code: string
  name: string
  oldName: string
  isCapital: boolean
  provinceCode: string
  districtCode: string | false
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PSGCBarangay {
  code: string
  name: string
  oldName: string
  cityCode?: string
  municipalityCode?: string
  districtCode: string | false
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

// Transformed types for our application
export interface LocationOption {
  code: string
  name: string
  province: string
  provinceCode: string
  region: string
  regionCode: string
  type: 'city' | 'municipality'
}

export interface BarangayOption {
  code: string
  name: string
  parentCode: string
}

// In-memory cache
const memoryCache: Record<string, { data: unknown; timestamp: number }> = {}

/**
 * Get data from cache (memory first, then localStorage)
 */
function getFromCache<T>(key: string): T | null {
  const fullKey = CACHE_KEY_PREFIX + key

  // Check memory cache first
  const memCached = memoryCache[fullKey]
  if (memCached && Date.now() - memCached.timestamp < CACHE_DURATION_MS) {
    return memCached.data as T
  }

  // Check localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(fullKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
          // Restore to memory cache
          memoryCache[fullKey] = parsed
          return parsed.data as T
        } else {
          // Remove expired cache
          localStorage.removeItem(fullKey)
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return null
}

/**
 * Save data to cache (both memory and localStorage)
 */
function saveToCache<T>(key: string, data: T): void {
  const fullKey = CACHE_KEY_PREFIX + key
  const cacheEntry = { data, timestamp: Date.now() }

  // Save to memory cache
  memoryCache[fullKey] = cacheEntry

  // Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(fullKey, JSON.stringify(cacheEntry))
    } catch {
      // Ignore localStorage errors (quota exceeded, etc.)
    }
  }
}

/**
 * Fetch JSON from PSGC API with caching
 */
async function fetchWithCache<T>(endpoint: string, cacheKey: string): Promise<T> {
  // Check cache first
  const cached = getFromCache<T>(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch from API
  const response = await fetch(`${PSGC_API_BASE}${endpoint}`)
  if (!response.ok) {
    throw new Error(`PSGC API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  // Cache the result
  saveToCache(cacheKey, data)

  return data
}

// Cached lookup maps (built once, reused)
let regionsMap: Map<string, PSGCRegion> | null = null
let provincesMap: Map<string, PSGCProvince> | null = null

/**
 * Fetch all regions and build lookup map
 */
async function getRegionsMap(): Promise<Map<string, PSGCRegion>> {
  if (regionsMap) return regionsMap

  const regions = await fetchWithCache<PSGCRegion[]>('/regions.json', 'regions')
  regionsMap = new Map(regions.map(r => [r.code, r]))
  return regionsMap
}

/**
 * Fetch all provinces and build lookup map
 */
async function getProvincesMap(): Promise<Map<string, PSGCProvince>> {
  if (provincesMap) return provincesMap

  const provinces = await fetchWithCache<PSGCProvince[]>('/provinces.json', 'provinces')
  provincesMap = new Map(provinces.map(p => [p.code, p]))
  return provincesMap
}

/**
 * Fetch all cities and municipalities combined
 * Returns a unified list with province and region names resolved
 */
export async function getLocations(): Promise<LocationOption[]> {
  // Check cache first
  const cached = getFromCache<LocationOption[]>('locations')
  if (cached) {
    return cached
  }

  // Fetch all data in parallel
  const [cities, municipalities, regionsMap, provincesMap] = await Promise.all([
    fetchWithCache<PSGCCity[]>('/cities.json', 'cities'),
    fetchWithCache<PSGCMunicipality[]>('/municipalities.json', 'municipalities'),
    getRegionsMap(),
    getProvincesMap(),
  ])

  // Transform cities
  const cityLocations: LocationOption[] = cities.map(city => {
    const province = city.provinceCode ? provincesMap.get(city.provinceCode) : null
    const region = regionsMap.get(city.regionCode)

    return {
      code: city.code,
      name: city.name.replace(/^City of /, ''), // Normalize "City of X" to "X"
      province: province?.name || 'Metro Manila', // NCR cities don't have province
      provinceCode: city.provinceCode || '',
      region: region?.regionName || region?.name || '',
      regionCode: city.regionCode,
      type: 'city' as const,
    }
  })

  // Transform municipalities
  const municipalityLocations: LocationOption[] = municipalities.map(mun => {
    const province = provincesMap.get(mun.provinceCode)
    const region = regionsMap.get(mun.regionCode)

    return {
      code: mun.code,
      name: mun.name,
      province: province?.name || '',
      provinceCode: mun.provinceCode,
      region: region?.regionName || region?.name || '',
      regionCode: mun.regionCode,
      type: 'municipality' as const,
    }
  })

  // Combine and sort alphabetically
  const allLocations = [...cityLocations, ...municipalityLocations]
    .sort((a, b) => a.name.localeCompare(b.name))

  // Cache the combined result
  saveToCache('locations', allLocations)

  return allLocations
}

/**
 * Search locations by name (client-side filtering)
 */
export async function searchLocations(query: string, limit = 20): Promise<LocationOption[]> {
  const locations = await getLocations()

  if (!query.trim()) {
    return locations.slice(0, limit)
  }

  const normalizedQuery = query.toLowerCase().trim()

  return locations
    .filter(loc =>
      loc.name.toLowerCase().includes(normalizedQuery) ||
      loc.province.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, limit)
}

/**
 * Get a specific location by code
 */
export async function getLocationByCode(code: string): Promise<LocationOption | null> {
  const locations = await getLocations()
  return locations.find(loc => loc.code === code) || null
}

/**
 * Fetch barangays for a city or municipality
 */
export async function getBarangays(locationCode: string): Promise<BarangayOption[]> {
  const cacheKey = `barangays_${locationCode}`

  // Check cache first
  const cached = getFromCache<BarangayOption[]>(cacheKey)
  if (cached) {
    return cached
  }

  // Determine if it's a city or municipality based on code
  // City codes have a different pattern, but we can try both endpoints
  let barangays: PSGCBarangay[] = []

  try {
    // Try city endpoint first
    barangays = await fetchWithCache<PSGCBarangay[]>(
      `/cities/${locationCode}/barangays.json`,
      `city_barangays_${locationCode}`
    )
  } catch {
    try {
      // Fall back to municipality endpoint
      barangays = await fetchWithCache<PSGCBarangay[]>(
        `/municipalities/${locationCode}/barangays.json`,
        `mun_barangays_${locationCode}`
      )
    } catch {
      // No barangays found for this location
      return []
    }
  }

  // Transform to our format
  const options: BarangayOption[] = barangays.map(b => ({
    code: b.code,
    name: b.name,
    parentCode: locationCode,
  }))

  // Cache the result
  saveToCache(cacheKey, options)

  return options
}

/**
 * Clear all PSGC cache (useful for debugging or forcing refresh)
 */
export function clearPSGCCache(): void {
  // Clear memory cache
  Object.keys(memoryCache).forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      delete memoryCache[key]
    }
  })

  // Clear localStorage cache
  if (typeof window !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }

  // Reset lookup maps
  regionsMap = null
  provincesMap = null
}
