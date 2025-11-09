import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess, handlePrismaError } from '@/lib/api-error'
import { validateCategoryOrTag } from '@/lib/validation'
import { slugify } from '@/lib/slugify'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    return handleGetTag(req, res, id)
  }

  if (req.method === 'PUT') {
    return handleUpdateTag(req, res, id)
  }

  if (req.method === 'DELETE') {
    return handleDeleteTag(req, res, id)
  }

  return sendError(res, 405, 'Метод не поддерживается')
}

// GET /api/tags/[id] - Get single tag with posts
async function handleGetTag(req, res, id) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        posts: {
          include: {
            post: {
              where: {
                status: 'PUBLISHED'
              },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!tag) {
      return sendError(res, 404, 'Тег не найден')
    }

    // Format response
    const formattedTag = {
      ...tag,
      posts: tag.posts.map(pt => pt.post).filter(p => p !== null)
    }

    return sendSuccess(res, { tag: formattedTag })

  } catch (error) {
    console.error('Get tag error:', error)
    return sendError(res, 500, 'Ошибка при получении тега')
  }
}

// PUT /api/tags/[id] - Update tag
async function handleUpdateTag(req, res, id) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    let { name, slug } = req.body

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return sendError(res, 404, 'Тег не найден')
    }

    // Auto-generate slug if not provided
    if (!slug && name) {
      slug = slugify(name)
    }

    // Validate
    const validation = validateCategoryOrTag({ name, slug })
    if (!validation.isValid) {
      return sendError(res, 400, 'Ошибка валидации', { errors: validation.errors })
    }

    // Update tag
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.toLowerCase()
      }
    })

    return sendSuccess(res, { tag })

  } catch (error) {
    console.error('Update tag error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при обновлении тега')
  }
}

// DELETE /api/tags/[id] - Delete tag
async function handleDeleteTag(req, res, id) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return sendError(res, 404, 'Тег не найден')
    }

    // Delete tag (cascade will handle relations)
    await prisma.tag.delete({
      where: { id }
    })

    return sendSuccess(res, { message: 'Тег успешно удален' })

  } catch (error) {
    console.error('Delete tag error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при удалении тега')
  }
}
