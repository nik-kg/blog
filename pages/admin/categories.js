import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { withAuth } from '@/lib/withAuth'
import prisma from '@/lib/prisma'
import styles from '@/styles/AdminTaxonomy.module.css'

function AdminCategories({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories)
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || 'Ошибка при сохранении категории')
        setLoading(false)
        return
      }

      if (editingId) {
        setCategories(categories.map(c => c.id === editingId ? data.data.category : c))
        alert('Категория успешно обновлена')
      } else {
        setCategories([...categories, data.data.category])
        alert('Категория успешно создана')
      }

      setFormData({ name: '', slug: '' })
      setEditingId(null)
      setLoading(false)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Ошибка при сохранении категории')
      setLoading(false)
    }
  }

  const handleEdit = (category) => {
    setFormData({ name: category.name, slug: category.slug })
    setEditingId(category.id)
    setError('')
  }

  const handleCancelEdit = () => {
    setFormData({ name: '', slug: '' })
    setEditingId(null)
    setError('')
  }

  const handleDelete = async (categoryId) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию? Она будет удалена из всех постов.')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== categoryId))
        alert('Категория успешно удалена')
      } else {
        const data = await response.json()
        alert(data.error?.message || 'Ошибка при удалении категории')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении категории')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Управление категориями - Админ панель</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Управление категориями</h1>
          <Link href="/admin" className={styles.backLink}>
            ← Назад к панели
          </Link>
        </header>

        <main className={styles.main}>
          <div className={styles.grid}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                {editingId ? 'Редактировать категорию' : 'Создать категорию'}
              </h2>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Название *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Технологии"
                    required
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="slug" className={styles.label}>
                    Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="technology (опционально, создастся автоматически)"
                    className={styles.input}
                    disabled={loading}
                  />
                  <p className={styles.hint}>
                    Slug используется в URL. Оставьте пустым для автоматической генерации.
                  </p>
                </div>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? 'Сохранение...' : (editingId ? 'Обновить' : 'Создать')}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={styles.cancelButton}
                      disabled={loading}
                    >
                      Отмена
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className={styles.listSection}>
              <h2 className={styles.sectionTitle}>
                Все категории ({categories.length})
              </h2>

              {categories.length === 0 ? (
                <div className={styles.empty}>
                  <p>Нет категорий</p>
                </div>
              ) : (
                <div className={styles.list}>
                  {categories.map(category => (
                    <div key={category.id} className={styles.item}>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>{category.name}</h3>
                        <p className={styles.itemSlug}>/{category.slug}</p>
                        {category._count && (
                          <p className={styles.itemCount}>
                            {category._count.posts} {pluralize(category._count.posts, 'пост', 'поста', 'постов')}
                          </p>
                        )}
                      </div>
                      <div className={styles.itemActions}>
                        <button
                          onClick={() => handleEdit(category)}
                          className={styles.editButton}
                          disabled={loading}
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className={styles.deleteButton}
                          disabled={loading}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default withAuth(AdminCategories)

export async function getServerSideProps() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return {
      props: {
        initialCategories: categories
      }
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return {
      props: {
        initialCategories: []
      }
    }
  }
}

function pluralize(number, one, few, many) {
  const n = Math.abs(number) % 100
  const n1 = n % 10

  if (n > 10 && n < 20) return many
  if (n1 > 1 && n1 < 5) return few
  if (n1 === 1) return one
  return many
}
