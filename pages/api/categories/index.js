import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess, handlePrismaError } from '@/lib/api-error'
import { validateCategoryOrTag } from '@/lib/validation'
import { slugify } from '@/lib/slugify'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetCategories(req, res)
  }

  if (req.method === 'POST') {
    return handleCreateCategory(req, res)
  }

  return sendError(res, 405, 'Метод не поддерживается')
}

// GET /api/categories - List all categories
async function handleGetCategories(req, res) {
  try {
    const { includeCounts } = req.query

    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      },
      ...(includeCounts === 'true' && {
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      })
    })

    return sendSuccess(res, { categories })

  } catch (error) {
    console.error('Get categories error:', error)
    return sendError(res, 500, 'Ошибка при получении категорий')
  }
}

// POST /api/categories - Create new category
async function handleCreateCategory(req, res) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    let { name, slug } = req.body

    // Auto-generate slug if not provided
    if (!slug) {
      slug = slugify(name)
    }

    // Validate
    const validation = validateCategoryOrTag({ name, slug })
    if (!validation.isValid) {
      return sendError(res, 400, 'Ошибка валидации', { errors: validation.errors })
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.toLowerCase()
      }
    })

    return sendSuccess(res, { category }, 201)

  } catch (error) {
    console.error('Create category error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при создании категории')
  }
}
