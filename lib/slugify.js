/**
 * Generate URL-friendly slug from string
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

/**
 * Generate unique slug by appending number if slug already exists
 * @param {string} baseSlug - Base slug to start with
 * @param {Function} checkExists - Async function that checks if slug exists
 * @returns {Promise<string>} Unique slug
 */
export async function generateUniqueSlug(baseSlug, checkExists) {
  let slug = baseSlug
  let counter = 1

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
