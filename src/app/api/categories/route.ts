import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// In-memory cache for categories
interface CategoryCache {
  data: Array<{
    id: number
    name: string
    icon: string | null
    sortOrder: number
  }>
  timestamp: number
}

let categoryCache: CategoryCache | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
  if (!categoryCache) return false
  const now = Date.now()
  return now - categoryCache.timestamp < CACHE_TTL
}

/**
 * GET /api/categories
 * Get all active categories sorted by sortOrder
 * Public endpoint - no authentication required
 * Cached for 5 minutes
 */
export async function GET(_request: NextRequest) {
  try {
    // Return cached data if still valid
    if (isCacheValid() && categoryCache) {
      return NextResponse.json(categoryCache.data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes
          'X-Cache': 'HIT',
        },
      })
    }

    // Fetch from database
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        icon: true,
        sortOrder: true,
      },
    })

    // Update cache
    categoryCache = {
      data: categories,
      timestamp: Date.now(),
    }

    return NextResponse.json(categories, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
