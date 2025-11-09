/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validatePassword(password) {
  const errors = []

  if (!password || password.length < 6) {
    errors.push('Пароль должен содержать минимум 6 символов')
  }

  if (password && password.length > 100) {
    errors.push('Пароль слишком длинный')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate post data
 * @param {Object} data - Post data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validatePost(data) {
  const errors = {}

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Заголовок обязателен'
  }

  if (data.title && data.title.length > 200) {
    errors.title = 'Заголовок слишком длинный (максимум 200 символов)'
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.content = 'Содержание обязательно'
  }

  if (data.excerpt && data.excerpt.length > 500) {
    errors.excerpt = 'Краткое описание слишком длинное (максимум 500 символов)'
  }

  if (data.status && !['DRAFT', 'PUBLISHED'].includes(data.status)) {
    errors.status = 'Недопустимый статус'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate category/tag data
 * @param {Object} data - Category or tag data
 * @returns {Object} Validation result
 */
export function validateCategoryOrTag(data) {
  const errors = {}

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Название обязательно'
  }

  if (data.name && data.name.length > 50) {
    errors.name = 'Название слишком длинное (максимум 50 символов)'
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.slug = 'Slug обязателен'
  }

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug может содержать только строчные буквы, цифры и дефисы'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Sanitize HTML to prevent XSS (basic sanitization)
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html) return ''

  // This is a basic sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
}
