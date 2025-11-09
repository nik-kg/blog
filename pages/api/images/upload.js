import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess } from '@/lib/api-error'

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Метод не поддерживается')
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Parse form data
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part) => {
        // Generate unique filename
        const timestamp = Date.now()
        const random = Math.floor(Math.random() * 10000)
        return `${timestamp}-${random}${ext}`
      }
    })

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    const uploadedFile = files.image?.[0] || files.file?.[0]

    if (!uploadedFile) {
      return sendError(res, 400, 'Файл не найден')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      // Delete uploaded file
      fs.unlinkSync(uploadedFile.filepath)
      return sendError(res, 400, 'Недопустимый тип файла. Разрешены только изображения.')
    }

    const filename = path.basename(uploadedFile.filepath)
    const url = `/uploads/${filename}`

    // Get postId from fields if provided
    const postId = fields.postId?.[0] || null

    // Save to database
    const image = await prisma.image.create({
      data: {
        url,
        filename,
        postId
      }
    })

    return sendSuccess(res, {
      image,
      message: 'Изображение успешно загружено'
    }, 201)

  } catch (error) {
    console.error('Upload image error:', error)
    return sendError(res, 500, 'Ошибка при загрузке изображения')
  }
}
