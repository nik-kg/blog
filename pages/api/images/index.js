import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess } from '@/lib/api-error'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Метод не поддерживается')
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const { postId, page = 1, limit = 20 } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const where = {}
    if (postId) {
      where.postId = postId
    }

    // Get total count
    const total = await prisma.image.count({ where })

    // Get images
    const images = await prisma.image.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return sendSuccess(res, {
      images,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / take)
      }
    })

  } catch (error) {
    console.error('Get images error:', error)
    return sendError(res, 500, 'Ошибка при получении изображений')
  }
}
