import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { isValidEmail, validatePassword } from '@/lib/validation'
import { sendError, sendSuccess, handlePrismaError } from '@/lib/api-error'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Метод не поддерживается')
  }

  try {
    const { email, password, name } = req.body

    // Validate email
    if (!email || !isValidEmail(email)) {
      return sendError(res, 400, 'Некорректный email адрес')
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return sendError(res, 400, passwordValidation.errors[0])
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return sendError(res, 400, 'Пользователь с таким email уже существует')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    return sendSuccess(res, {
      message: 'Пользователь успешно создан',
      user
    }, 201)

  } catch (error) {
    console.error('Registration error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при создании пользователя')
  }
}
