/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return ''

  const d = new Date(date)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  return d.toLocaleDateString('ru-RU', options)
}

/**
 * Format date to relative time (e.g., "2 days ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return ''

  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffYear > 0) return `${diffYear} ${plural(diffYear, 'год', 'года', 'лет')} назад`
  if (diffMonth > 0) return `${diffMonth} ${plural(diffMonth, 'месяц', 'месяца', 'месяцев')} назад`
  if (diffWeek > 0) return `${diffWeek} ${plural(diffWeek, 'неделя', 'недели', 'недель')} назад`
  if (diffDay > 0) return `${diffDay} ${plural(diffDay, 'день', 'дня', 'дней')} назад`
  if (diffHour > 0) return `${diffHour} ${plural(diffHour, 'час', 'часа', 'часов')} назад`
  if (diffMin > 0) return `${diffMin} ${plural(diffMin, 'минуту', 'минуты', 'минут')} назад`
  return 'только что'
}

/**
 * Russian plural helper
 * @param {number} number - Number to determine plural form
 * @param {string} one - Form for 1 (e.g., "день")
 * @param {string} few - Form for 2-4 (e.g., "дня")
 * @param {string} many - Form for 5+ (e.g., "дней")
 * @returns {string} Correct plural form
 */
function plural(number, one, few, many) {
  const n = Math.abs(number) % 100
  const n1 = n % 10

  if (n > 10 && n < 20) return many
  if (n1 > 1 && n1 < 5) return few
  if (n1 === 1) return one
  return many
}

/**
 * Format date for datetime-local input
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTimeLocal(date) {
  if (!date) return ''

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
