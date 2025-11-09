import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess, handlePrismaError } from '@/lib/api-error'
import { validateCategoryOrTag } from '@/lib/validation'
import { slugify } from '@/lib/slugify'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetTags(req, res)
  }

  if (req.method === 'POST') {
    return handleCreateTag(req, res)
  }

  return sendError(res, 405, 'Метод не поддерживается')
}

// GET /api/tags - List all tags
async function handleGetTags(req, res) {
  try {
    const { includeCounts } = req.query

    const tags = await prisma.tag.findMany({
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

    return sendSuccess(res, { tags })

  } catch (error) {
    console.error('Get tags error:', error)
    return sendError(res, 500, 'Ошибка при получении тегов')
  }
}

// POST /api/tags - Create new tag
async function handleCreateTag(req, res) {
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

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug: slug.toLowerCase()
      }
    })

    return sendSuccess(res, { tag }, 201)

  } catch (error) {
    console.error('Create tag error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при создании тега')
  }
}
