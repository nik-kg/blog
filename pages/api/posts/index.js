import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess, handlePrismaError } from '@/lib/api-error'
import { validatePost } from '@/lib/validation'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetPosts(req, res)
  }

  if (req.method === 'POST') {
    return handleCreatePost(req, res)
  }

  return sendError(res, 405, 'Метод не поддерживается')
}

// GET /api/posts - List posts with pagination and filters
async function handleGetPosts(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      categoryId,
      tagId,
      authorId,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    // Build where clause
    const where = {}

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId
        }
      }
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId
        }
      }
    }

    if (authorId) {
      where.authorId = authorId
    }

    // Get total count
    const total = await prisma.post.count({ where })

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: order
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
        },
        _count: {
          select: {
            images: true
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
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / take)
      }
    })

  } catch (error) {
    console.error('Get posts error:', error)
    return sendError(res, 500, 'Ошибка при получении постов')
  }
}

// POST /api/posts - Create new post
async function handleCreatePost(req, res) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const { title, content, excerpt, status, categoryIds = [], tagIds = [] } = req.body

    // Validate post data
    const validation = validatePost({ title, content, excerpt, status })
    if (!validation.isValid) {
      return sendError(res, 400, 'Ошибка валидации', { errors: validation.errors })
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content,
        excerpt: excerpt?.trim() || null,
        status: status || 'DRAFT',
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId: session.user.id,
        categories: {
          create: categoryIds.map(categoryId => ({ categoryId }))
        },
        tags: {
          create: tagIds.map(tagId => ({ tagId }))
        }
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
    const formattedPost = {
      ...post,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag)
    }

    return sendSuccess(res, { post: formattedPost }, 201)

  } catch (error) {
    console.error('Create post error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при создании поста')
  }
}
