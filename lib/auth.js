import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import bcrypt from 'bcryptjs'

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Passwords match
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

/**
 * Get current session on server side
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Session|null>} User session or null
 */
export async function getSession(req, res) {
  return await getServerSession(req, res, authOptions)
}

/**
 * Check if user is authenticated
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<boolean>} Is authenticated
 */
export async function isAuthenticated(req, res) {
  const session = await getSession(req, res)
  return !!session
}

/**
 * Get current user ID from session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<string|null>} User ID or null
 */
export async function getCurrentUserId(req, res) {
  const session = await getSession(req, res)
  return session?.user?.id || null
}

/**
 * Require authentication for API route
 * Returns session if authenticated, sends error response if not
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Session|null>} Session or null (with error sent)
 */
export async function requireAuth(req, res) {
  const session = await getSession(req, res)

  if (!session) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Требуется авторизация'
      }
    })
    return null
  }

  return session
}
