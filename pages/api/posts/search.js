import prisma from '@/lib/prisma'
import { sendError, sendSuccess } from '@/lib/api-error'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Метод не поддерживается')
  }

  try {
    const { q, page = 1, limit = 10 } = req.query

    if (!q || q.trim().length === 0) {
      return sendError(res, 400, 'Поисковый запрос не может быть пустым')
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const searchQuery = q.trim()

    // Build where clause for search
    const where = {
      status: 'PUBLISHED', // Only search published posts
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          excerpt: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Get total count
    const total = await prisma.post.count({ where })

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: {
        publishedAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Format response
    const formattedPosts = posts.map(post => ({
      ...post,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag)
    }))

    return sendSuccess(res, {
      posts: formattedPosts,
      query: searchQuery,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / take)
      }
    })

  } catch (error) {
    console.error('Search posts error:', error)
    return sendError(res, 500, 'Ошибка при поиске постов')
  }
}
