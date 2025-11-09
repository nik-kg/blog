/**
 * Standard API error response
 * @param {Response} res - Next.js response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 */
export function sendError(res, status, message, details = {}) {
  return res.status(status).json({
    success: false,
    error: {
      message,
      ...details
    }
  })
}

/**
 * Standard API success response
 * @param {Response} res - Next.js response object
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 */
export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data
  })
}

/**
 * Handle Prisma errors and convert to user-friendly messages
 * @param {Error} error - Prisma error
 * @returns {Object} Error details with message
 */
export function handlePrismaError(error) {
  // Unique constraint violation
  if (error.code === 'P2002') {
    return {
      status: 400,
      message: 'Запись с такими данными уже существует',
      field: error.meta?.target?.[0] || 'unknown'
    }
  }

  // Record not found
  if (error.code === 'P2025') {
    return {
      status: 404,
      message: 'Запись не найдена'
    }
  }

  // Foreign key constraint failed
  if (error.code === 'P2003') {
    return {
      status: 400,
      message: 'Связанная запись не найдена'
    }
  }

  // Default error
  return {
    status: 500,
    message: 'Ошибка базы данных'
  }
}
