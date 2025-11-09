import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess, handlePrismaError } from '@/lib/api-error'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    return handleDeleteImage(req, res, id)
  }

  return sendError(res, 405, 'Метод не поддерживается')
}

// DELETE /api/images/[id] - Delete image
async function handleDeleteImage(req, res, id) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    // Check if image exists
    const image = await prisma.image.findUnique({
      where: { id }
    })

    if (!image) {
      return sendError(res, 404, 'Изображение не найдено')
    }

    // Delete file from filesystem
    const filepath = path.join(process.cwd(), 'public', image.url)
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }

    // Delete from database
    await prisma.image.delete({
      where: { id }
    })

    return sendSuccess(res, { message: 'Изображение успешно удалено' })

  } catch (error) {
    console.error('Delete image error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при удалении изображения')
  }
}
