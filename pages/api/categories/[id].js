import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess, handlePrismaError } from '@/lib/api-error'
import { validateCategoryOrTag } from '@/lib/validation'
import { slugify } from '@/lib/slugify'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    return handleGetCategory(req, res, id)
  }

  if (req.method === 'PUT') {
    return handleUpdateCategory(req, res, id)
  }

  if (req.method === 'DELETE') {
    return handleDeleteCategory(req, res, id)
  }

  return sendError(res, 405, 'Метод не поддерживается')
}

// GET /api/categories/[id] - Get single category with posts
async function handleGetCategory(req, res, id) {
  try {
    const category = await prisma.category.findUnique({
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

    if (!category) {
      return sendError(res, 404, 'Категория не найдена')
    }

    // Format response
    const formattedCategory = {
      ...category,
      posts: category.posts.map(pc => pc.post).filter(p => p !== null)
    }

    return sendSuccess(res, { category: formattedCategory })

  } catch (error) {
    console.error('Get category error:', error)
    return sendError(res, 500, 'Ошибка при получении категории')
  }
}

// PUT /api/categories/[id] - Update category
async function handleUpdateCategory(req, res, id) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    let { name, slug } = req.body

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return sendError(res, 404, 'Категория не найдена')
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

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.toLowerCase()
      }
    })

    return sendSuccess(res, { category })

  } catch (error) {
    console.error('Update category error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при обновлении категории')
  }
}

// DELETE /api/categories/[id] - Delete category
async function handleDeleteCategory(req, res, id) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return sendError(res, 404, 'Категория не найдена')
    }

    // Delete category (cascade will handle relations)
    await prisma.category.delete({
      where: { id }
    })

    return sendSuccess(res, { message: 'Категория успешно удалена' })

  } catch (error) {
    console.error('Delete category error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при удалении категории')
  }
}
